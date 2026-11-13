import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";

/*
 * MASIDY TRAVEL API
 * Phases 1-7: auth, roles, companies, sellers, products, bookings,
 * commissions, ledger, payments/payouts, supplier connectors, languages,
 * currencies and AI assistant.
 * Runs as an App DurableObject with SQLite state.
 */

type UserRole = 'admin' | 'company' | 'seller' | 'supplier' | 'traveler';

interface Ai { run(model: string, inputs: any, options?: any): Promise<any>; }
type Env = { AI: Ai };

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  sellerCode: string | null;
  createdAt: string;
}

interface Company {
  id: number;
  userId: number;
  name: string;
  taxId: string;
  phone: string;
  website: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// --- DB helpers ---
function initSchema(sql: SqlStorage) {
  sql.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      seller_code TEXT UNIQUE,
      stripe_account_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_seller_code ON users(seller_code);

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tax_id TEXT,
      phone TEXT,
      website TEXT,
      bio TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      duration TEXT,
      availability TEXT,
      image_url TEXT,
      price_cents INTEGER NOT NULL,
      commission_percent INTEGER NOT NULL DEFAULT 0,
      commission_fixed_cents INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
    CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      code TEXT UNIQUE NOT NULL,
      visits INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(seller_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      seller_id INTEGER,
      traveler_id INTEGER,
      traveler_name TEXT,
      traveler_email TEXT,
      guests INTEGER NOT NULL DEFAULT 1,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      base_price_cents INTEGER NOT NULL,
      seller_commission_cents INTEGER NOT NULL DEFAULT 0,
      platform_fee_cents INTEGER NOT NULL DEFAULT 0,
      company_share_cents INTEGER NOT NULL,
      seller_share_cents INTEGER NOT NULL DEFAULT 0,
      traveler_price_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_seller ON bookings(seller_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_traveler ON bookings(traveler_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

    CREATE TABLE IF NOT EXISTS payment_intents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'requires_confirmation',
      client_secret TEXT NOT NULL,
      payment_method_text TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
    CREATE INDEX IF NOT EXISTS idx_payment_intents_booking ON payment_intents(booking_id);
    CREATE INDEX IF NOT EXISTS idx_payment_intents_secret ON payment_intents(client_secret);

    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      booking_id INTEGER,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
    CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id);

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);

    CREATE TABLE IF NOT EXISTS supplier_connectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT,
      config TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE INDEX IF NOT EXISTS idx_supplier_connectors_company ON supplier_connectors(company_id);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);
}

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function generateCode() { return nanoid(8).toUpperCase(); }
function generateClientSecret() { return 'pi_secret_' + nanoid(16); }
function moneySplit(basePerPersonCents: number, guests: number, commissionPercent: number, commissionFixedCents: number, sellerId: number | null) {
  const baseTotal = basePerPersonCents * guests;
  const platformFee = Math.round(baseTotal * 0.05);
  let sellerCommission = 0;
  if (sellerId) {
    sellerCommission = Math.round(baseTotal * (commissionPercent / 100)) + (commissionFixedCents * guests);
  }
  const travelerPrice = baseTotal + sellerCommission;
  const companyShare = baseTotal - platformFee;
  const sellerShare = sellerCommission;
  return { baseTotal, platformFee, sellerCommission, travelerPrice, companyShare, sellerShare };
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: ['cancelled'],
  cancelled: []
};

const CONNECTOR_TYPES = ['hotel', 'flight', 'transport', 'activity'];
const CONNECTOR_PROVIDERS: Record<string, string[]> = {
  hotel: ['hotelbeds', 'booking.com', 'expedia', 'sandbox'],
  flight: ['amadeus', 'duffel', 'kiwi', 'sandbox'],
  transport: ['mozio', 'resrobot', 'sandbox'],
  activity: ['viator', 'getyourguide', 'sandbox']
};

// --- App class ---
export class App extends DurableObject<Env> {
  private app = new Hono<{ Bindings: Env }>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.app.use('*', async (c, next) => {
      initSchema(this.ctx.storage.sql);
      await next();
    });

    // Auth
    this.app.post('/api/auth/register', async (c) => {
      const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1), role: z.enum(['admin','company','seller','supplier','traveler']) });
      const body = schema.safeParse(await c.req.json());
      if (!body.success) return c.json({ message: 'Invalid input' }, 400);
      const { email, password, name, role } = body.data;
      const sql = this.ctx.storage.sql;
      const existing = sql.exec('SELECT id FROM users WHERE email = ?', email).one();
      if (existing) return c.json({ message: 'Email already in use' }, 409);
      const passwordHash = await hashPassword(password);
      const sellerCode = role === 'seller' ? generateCode() : null;
      const result = sql.exec('INSERT INTO users (email, name, role, password_hash, seller_code) VALUES (?, ?, ?, ?, ?)', email, name, role, passwordHash, sellerCode);
      const userId = result.lastRowId as number;
      if (role === 'company' || role === 'supplier') {
        sql.exec('INSERT INTO companies (user_id, name, status) VALUES (?, ?, ?)', userId, name, role === 'supplier' ? 'approved' : 'pending');
      }
      const sess = this.createSession(userId);
      const user = this.userById(userId);
      c.header('Set-Cookie', `session=${sess}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return c.json({ user: this.sanitizeUser(user!, this.companyFor(userId)) });
    });

    this.app.post('/api/auth/login', async (c) => {
      const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
      const body = schema.safeParse(await c.req.json());
      if (!body.success) return c.json({ message: 'Invalid input' }, 400);
      const { email, password } = body.data;
      const user = this.userByEmail(email);
      if (!user || user.passwordHash !== await hashPassword(password)) return c.json({ message: 'Invalid credentials' }, 401);
      const sess = this.createSession(user.id);
      c.header('Set-Cookie', `session=${sess}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return c.json({ user: this.sanitizeUser(user, this.companyFor(user.id)) });
    });

    this.app.post('/api/auth/logout', async (c) => {
      const sid = this.getSessionId(c.req.raw.headers.get('Cookie') || '');
      if (sid) this.ctx.storage.sql.exec('DELETE FROM sessions WHERE id = ?', sid);
      c.header('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return c.json({ ok: true });
    });

    // Current user
    this.app.get('/api/me', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      return c.json({ user: this.sanitizeUser(u, this.companyFor(u.id)), profile: this.profileFor(u.id) });
    });

    this.app.post('/api/me', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const body = z.object({ name: z.string().optional(), companyName: z.string().optional(), taxId: z.string().optional(), phone: z.string().optional(), website: z.string().optional(), bio: z.string().optional() }).passthrough().parse(await c.req.json());
      const sql = this.ctx.storage.sql;
      if (body.name) sql.exec('UPDATE users SET name = ? WHERE id = ?', body.name, u.id);
      const company = this.companyFor(u.id);
      if (company && (body.companyName || body.taxId || body.phone || body.website || body.bio)) {
        sql.exec('UPDATE companies SET name = ?, tax_id = ?, phone = ?, website = ?, bio = ? WHERE id = ?',
          body.companyName || company.name, body.taxId ?? company.taxId, body.phone ?? company.phone, body.website ?? company.website, body.bio ?? company.bio, company.id);
      }
      return c.json({ ok: true });
    });

    // Stats
    this.app.get('/api/stats', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const sql = this.ctx.storage.sql;
      let where = '';
      const params: any[] = [];
      const company = this.companyFor(u.id);
      if (company) { where = 'WHERE company_id = ?'; params.push(company.id); }
      else if (u.role === 'seller') { where = 'WHERE seller_id = ?'; params.push(u.id); }
      else if (u.role === 'traveler') { where = 'WHERE traveler_id = ?'; params.push(u.id); }
      const totalBookings = sql.exec(`SELECT COUNT(*) as c FROM bookings ${where}`, ...params).one().c as number;
      const revenue = sql.exec(`SELECT COALESCE(SUM(traveler_price_cents),0) as c FROM bookings ${where} AND status != 'cancelled'`, ...params).one().c as number;
      const available = sql.exec(`SELECT COALESCE(SUM(amount_cents),0) as c FROM ledger WHERE status = 'available' AND user_id = ?`, u.id).one().c as number;
      const activeProducts = sql.exec(`SELECT COUNT(*) as c FROM products WHERE status = 'active' ${company ? 'AND company_id = ?' : ''}`, ...(company ? [company.id] : [])).one().c as number;
      return c.json({ totalBookings, revenueCents: revenue, availableBalanceCents: available, activeProducts });
    });

    // Products
    this.app.get('/api/products', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const sql = this.ctx.storage.sql;
      const owned = c.req.query('owned');
      const q = c.req.query('q')?.toLowerCase();
      const type = c.req.query('type');
      const loc = c.req.query('location')?.toLowerCase();
      const minCents = c.req.query('minCents');
      const maxCents = c.req.query('maxCents');
      const company = this.companyFor(u.id);
      let query = `SELECT p.*, c.name as company_name FROM products p LEFT JOIN companies c ON p.company_id = c.id WHERE p.status = 'active'`;
      const params: any[] = [];
      if (owned && (u.role === 'company' || u.role === 'supplier') && company) { query += ' AND p.company_id = ?'; params.push(company.id); }
      if (type) { query += ' AND p.type = ?'; params.push(type); }
      if (loc) { query += ' AND lower(p.location) LIKE ?'; params.push('%' + loc + '%'); }
      if (minCents) { query += ' AND p.price_cents >= ?'; params.push(Number(minCents)); }
      if (maxCents) { query += ' AND p.price_cents <= ?'; params.push(Number(maxCents)); }
      if (q) {
        query += ' AND (lower(p.title) LIKE ? OR lower(p.location) LIKE ? OR lower(p.description) LIKE ? OR lower(p.tags) LIKE ?)';
        const like = '%' + q + '%';
        params.push(like, like, like, like);
      }
      query += ' ORDER BY p.created_at DESC';
      const rows = sql.exec(query, ...params).toArray();
      const products = rows.map(r => {
        const tpc = Number(r.price_cents) + (Number(r.commission_percent) ? Math.round(Number(r.price_cents) * (Number(r.commission_percent) / 100)) : 0) + Number(r.commission_fixed_cents);
        return { ...this.mapProduct(r), travelerPriceCents: tpc, companyName: r.company_name };
      });
      return c.json({ products });
    });

    this.app.get('/api/products/:id', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const p = this.productById(id);
      if (!p) return c.json({ message: 'Not found' }, 404);
      let linkCode: string | null = null;
      if (u.role === 'seller') {
        const row = this.ctx.storage.sql.exec('SELECT code FROM links WHERE seller_id = ? AND product_id = ?', u.id, id).one();
        if (row) linkCode = String(row.code);
      }
      const tpc = Number(p.price_cents) + (Number(p.commission_percent) ? Math.round(Number(p.price_cents) * (Number(p.commission_percent) / 100)) : 0) + Number(p.commission_fixed_cents);
      return c.json({ product: { ...this.mapProduct(p), travelerPriceCents: tpc, companyName: this.companyName(p.company_id) }, linkCode });
    });

    this.app.post('/api/products', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      if (!company) return c.json({ message: 'No company' }, 403);
      const body = z.object({ title: z.string(), type: z.string(), description: z.string().optional(), location: z.string().optional(), priceCents: z.number().int().min(0), commissionPercent: z.number().int().min(0).max(50).optional(), commissionFixedCents: z.number().int().min(0).optional(), duration: z.string().optional(), availability: z.string().optional(), imageUrl: z.string().optional(), tags: z.string().optional() }).passthrough().parse(await c.req.json());
      const result = this.ctx.storage.sql.exec(
        'INSERT INTO products (company_id, type, title, description, location, price_cents, commission_percent, commission_fixed_cents, duration, availability, image_url, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        company.id, body.type, body.title, body.description || '', body.location || '', body.priceCents, body.commissionPercent ?? 0, body.commissionFixedCents ?? 0, body.duration || '', body.availability || 'daily', body.imageUrl || '', body.tags || ''
      );
      return c.json({ id: result.lastRowId, ok: true });
    });

    this.app.patch('/api/products/:id', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const id = Number(c.req.param('id'));
      const p = this.productById(id);
      if (!p) return c.json({ message: 'Not found' }, 404);
      if (u.role !== 'admin' && (!company || Number(p.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      const body = z.object({ title: z.string().optional(), description: z.string().optional(), location: z.string().optional(), priceCents: z.number().int().min(0).optional(), commissionPercent: z.number().int().min(0).max(50).optional(), commissionFixedCents: z.number().int().min(0).optional(), duration: z.string().optional(), availability: z.string().optional(), imageUrl: z.string().optional(), status: z.enum(['active','inactive']).optional(), tags: z.string().optional() }).passthrough().parse(await c.req.json());
      const sql = this.ctx.storage.sql;
      sql.exec(`UPDATE products SET title = COALESCE(?, title), description = COALESCE(?, description), location = COALESCE(?, location), price_cents = COALESCE(?, price_cents), commission_percent = COALESCE(?, commission_percent), commission_fixed_cents = COALESCE(?, commission_fixed_cents), duration = COALESCE(?, duration), availability = COALESCE(?, availability), image_url = COALESCE(?, image_url), status = COALESCE(?, status), tags = COALESCE(?, tags) WHERE id = ?`,
        body.title ?? null, body.description ?? null, body.location ?? null, body.priceCents ?? null, body.commissionPercent ?? null, body.commissionFixedCents ?? null, body.duration ?? null, body.availability ?? null, body.imageUrl ?? null, body.status ?? null, body.tags ?? null, id);
      return c.json({ ok: true });
    });

    this.app.delete('/api/products/:id', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const id = Number(c.req.param('id'));
      const p = this.productById(id);
      if (!p) return c.json({ message: 'Not found' }, 404);
      if (u.role !== 'admin' && (!company || Number(p.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      this.ctx.storage.sql.exec('DELETE FROM products WHERE id = ?', id);
      return c.json({ ok: true });
    });

    // Tracking links (sellers bookmark products)
    this.app.post('/api/products/:id/link', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'seller' && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const productId = Number(c.req.param('id'));
      const p = this.productById(productId);
      if (!p) return c.json({ message: 'Not found' }, 404);
      const sql = this.ctx.storage.sql;
      const existing = sql.exec('SELECT code FROM links WHERE seller_id = ? AND product_id = ?', u.id, productId).one();
      if (existing) return c.json({ code: existing.code, link: `/#/products/${productId}?ref=${existing.code}` });
      const code = u.sellerCode || generateCode();
      if (!u.sellerCode) {
        sql.exec('UPDATE users SET seller_code = ? WHERE id = ?', code, u.id);
      }
      sql.exec('INSERT INTO links (seller_id, product_id, code) VALUES (?, ?, ?)', u.id, productId, code);
      return c.json({ code, link: `/#/products/${productId}?ref=${code}` });
    });

    this.app.post('/api/links/visit', async (c) => {
      const body = z.object({ code: z.string() }).safeParse(await c.req.json());
      if (!body.success) return c.json({ message: 'Invalid input' }, 400);
      const sql = this.ctx.storage.sql;
      sql.exec('UPDATE links SET visits = visits + 1 WHERE code = ?', body.data.code);
      const row = sql.exec('SELECT l.*, p.title, p.type, p.company_id, p.id as product_id FROM links l JOIN products p ON l.product_id = p.id WHERE l.code = ?', body.data.code).one();
      if (!row) return c.json({ message: 'Not found' }, 404);
      return c.json({ link: this.mapLink(row), product: this.mapProduct(row) });
    });

    // Bookings
    this.app.get('/api/bookings', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const sql = this.ctx.storage.sql;
      let query = `SELECT b.*, p.title as product_title, p.type as product_type, c.name as company_name FROM bookings b JOIN products p ON b.product_id = p.id JOIN companies c ON b.company_id = c.id`;
      const params: any[] = [];
      if (u.role === 'admin') { /* all */ }
      else if (company) { query += ' WHERE b.company_id = ?'; params.push(company.id); }
      else if (u.role === 'seller') { query += ' WHERE b.seller_id = ?'; params.push(u.id); }
      else if (u.role === 'traveler') { query += ' WHERE 1=0'; }
      query += ' ORDER BY b.created_at DESC';
      const rows = sql.exec(query, ...params).toArray();
      return c.json({ bookings: rows.map(this.mapBooking) });
    });

    this.app.get('/api/orders', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const sql = this.ctx.storage.sql;
      const rows = sql.exec(`SELECT b.*, p.title as product_title, p.type as product_type, c.name as company_name FROM bookings b JOIN products p ON b.product_id = p.id JOIN companies c ON b.company_id = c.id WHERE b.traveler_id = ? ORDER BY b.created_at DESC`, u.id).toArray();
      return c.json({ orders: rows.map(this.mapBooking) });
    });

    this.app.post('/api/bookings', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const body = z.object({ productId: z.number().int(), guests: z.number().int().min(1), startDate: z.string().optional().nullable(), endDate: z.string().optional().nullable(), notes: z.string().optional(), sellerCode: z.string().optional().nullable() }).passthrough().parse(await c.req.json());
      const p = this.productById(body.productId);
      if (!p) return c.json({ message: 'Product not found' }, 404);
      if (p.status !== 'active') return c.json({ message: 'Product not available' }, 400);
      const sellerRow = body.sellerCode ? this.userBySellerCode(body.sellerCode) : null;
      let sellerId = sellerRow?.id ?? null;
      if (sellerRow && sellerRow.id === u.id && u.role === 'seller') sellerId = u.id;
      const split = moneySplit(Number(p.price_cents), body.guests, Number(p.commission_percent), Number(p.commission_fixed_cents), sellerId);
      const result = this.ctx.storage.sql.exec(
        'INSERT INTO bookings (product_id, company_id, seller_id, traveler_id, traveler_name, traveler_email, guests, start_date, end_date, notes, base_price_cents, seller_commission_cents, platform_fee_cents, company_share_cents, seller_share_cents, traveler_price_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p.id, p.company_id, sellerId, u.id, u.name, u.email, body.guests, body.startDate, body.endDate, body.notes || '',
        split.baseTotal, split.sellerCommission, split.platformFee, split.companyShare, split.sellerShare, split.travelerPrice
      );
      const bookingId = result.lastRowId as number;
      const b = this.bookingById(bookingId);
      return c.json({ booking: this.mapBooking(b!) }, 201);
    });

    this.app.get('/api/bookings/:id', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const b = this.bookingById(id);
      if (!b) return c.json({ message: 'Not found' }, 404);
      const company = this.companyFor(u.id);
      if (u.role !== 'admin' && Number(b.company_id) !== (company?.id ?? -1) && Number(b.seller_id) !== u.id && Number(b.traveler_id) !== u.id) return c.json({ message: 'Forbidden' }, 403);
      const p = this.productById(Number(b.product_id));
      const pi = this.paymentIntentByBookingId(id);
      return c.json({ booking: this.mapBooking(b), product: p ? this.mapProduct(p) : null, paymentIntent: pi ? this.mapPaymentIntent(pi) : null });
    });

    this.app.post('/api/bookings/:id/status', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const body = z.object({ status: z.enum(['pending','confirmed','completed','cancelled']) }).parse(await c.req.json());
      const b = this.bookingById(id);
      if (!b) return c.json({ message: 'Not found' }, 404);
      const company = this.companyFor(u.id);
      if (u.role !== 'admin' && (!company || Number(b.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      if (!STATUS_TRANSITIONS[String(b.status)]?.includes(body.status)) return c.json({ message: 'Invalid status transition' }, 400);
      this.ctx.storage.sql.exec('UPDATE bookings SET status = ? WHERE id = ?', body.status, id);
      this.updateLedgerForBooking(id, body.status);
      return c.json({ ok: true });
    });

    // Payments / split payments (Stripe-like without SDK)
    this.app.post('/api/payments', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const body = z.object({ bookingId: z.number().int(), currency: z.string().max(3).default('USD') }).parse(await c.req.json());
      const sql = this.ctx.storage.sql;
      const b = this.bookingById(body.bookingId);
      if (!b) return c.json({ message: 'Booking not found' }, 404);
      if (Number(b.traveler_id) !== u.id && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const existing = sql.exec('SELECT id FROM payment_intents WHERE booking_id = ?', body.bookingId).one();
      if (existing) return c.json({ paymentIntent: this.mapPaymentIntent(sql.exec('SELECT * FROM payment_intents WHERE id = ?', existing.id).one()) });
      const result = sql.exec('INSERT INTO payment_intents (booking_id, amount_cents, currency, client_secret) VALUES (?, ?, ?, ?)', body.bookingId, b.traveler_price_cents, body.currency.toUpperCase(), generateClientSecret());
      const pi = sql.exec('SELECT * FROM payment_intents WHERE id = ?', result.lastRowId).one();
      return c.json({ paymentIntent: this.mapPaymentIntent(pi) });
    });

    this.app.get('/api/payments/:id', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const pi = this.ctx.storage.sql.exec('SELECT * FROM payment_intents WHERE id = ?', id).one();
      if (!pi) return c.json({ message: 'Not found' }, 404);
      const b = this.bookingById(Number(pi.booking_id));
      if (!b) return c.json({ message: 'Not found' }, 404);
      if (Number(b.traveler_id) !== u.id && u.role !== 'admin' && Number(b.company_id) !== (this.companyFor(u.id)?.id ?? -1)) return c.json({ message: 'Forbidden' }, 403);
      return c.json({ paymentIntent: this.mapPaymentIntent(pi) });
    });

    this.app.post('/api/payments/:id/confirm', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const body = z.object({ paymentMethod: z.string().optional() }).passthrough().parse(await c.req.json());
      const sql = this.ctx.storage.sql;
      const pi = sql.exec('SELECT * FROM payment_intents WHERE id = ?', id).one();
      if (!pi) return c.json({ message: 'Not found' }, 404);
      const b = this.bookingById(Number(pi.booking_id));
      if (!b) return c.json({ message: 'Booking not found' }, 404);
      if (Number(b.traveler_id) !== u.id && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      if (pi.status !== 'requires_confirmation') return c.json({ message: 'Payment already processed' }, 400);
      sql.exec('UPDATE payment_intents SET status = "succeeded", payment_method_text = ? WHERE id = ?', body.paymentMethod || 'card •••• 4242', id);
      sql.exec('UPDATE bookings SET status = "confirmed" WHERE id = ?', pi.booking_id);
      this.updateLedgerForBooking(Number(pi.booking_id), 'confirmed');
      return c.json({ ok: true, paymentIntent: this.mapPaymentIntent(sql.exec('SELECT * FROM payment_intents WHERE id = ?', id).one()) });
    });

    this.app.post('/api/payments/:id/capture', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const sql = this.ctx.storage.sql;
      const pi = sql.exec('SELECT * FROM payment_intents WHERE id = ?', id).one();
      if (!pi) return c.json({ message: 'Not found' }, 404);
      const b = this.bookingById(Number(pi.booking_id));
      if (!b) return c.json({ message: 'Booking not found' }, 404);
      const company = this.companyFor(u.id);
      if (u.role !== 'admin' && (!company || Number(b.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      if (pi.status !== 'succeeded') return c.json({ message: 'Payment not confirmed yet' }, 400);
      sql.exec('UPDATE payment_intents SET status = "captured" WHERE id = ?', id);
      sql.exec('UPDATE bookings SET status = "completed" WHERE id = ?', pi.booking_id);
      this.updateLedgerForBooking(Number(pi.booking_id), 'completed');
      return c.json({ ok: true });
    });

    this.app.post('/api/payments/:id/cancel', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const id = Number(c.req.param('id'));
      const sql = this.ctx.storage.sql;
      const pi = sql.exec('SELECT * FROM payment_intents WHERE id = ?', id).one();
      if (!pi) return c.json({ message: 'Not found' }, 404);
      const b = this.bookingById(Number(pi.booking_id));
      if (!b) return c.json({ message: 'Booking not found' }, 404);
      if (Number(b.traveler_id) !== u.id && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      if (pi.status === 'captured') return c.json({ message: 'Payment already captured' }, 400);
      sql.exec('UPDATE payment_intents SET status = "canceled" WHERE id = ?', id);
      sql.exec('UPDATE bookings SET status = "cancelled" WHERE id = ?', pi.booking_id);
      this.updateLedgerForBooking(Number(pi.booking_id), 'cancelled');
      return c.json({ ok: true });
    });

    // Sellers
    this.app.get('/api/sellers', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const sql = this.ctx.storage.sql;
      if (!company && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      let query = `SELECT DISTINCT u.id, u.name, u.email, u.seller_code, COALESCE(lk.code, '') as code FROM users u LEFT JOIN links lk ON lk.seller_id = u.id LEFT JOIN products p ON lk.product_id = p.id WHERE u.role = 'seller'`;
      const params: any[] = [];
      if (u.role === 'company' && company) { query += ' AND p.company_id = ?'; params.push(company.id); }
      const rows = sql.exec(query, ...params).toArray();
      const sellers = rows.map(r => {
        const bookings = sql.exec('SELECT COUNT(*) as c, COALESCE(SUM(seller_share_cents),0) as e FROM bookings WHERE seller_id = ? AND status = "completed"', r.id).one();
        return { id: r.id, name: r.name, email: r.email, code: r.seller_code || r.code, link: `${r.seller_code || r.code}`, bookingsCount: bookings.c, earningsCents: bookings.e };
      });
      return c.json({ sellers });
    });

    // Ledger
    this.app.get('/api/ledger', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const rows = this.ctx.storage.sql.exec('SELECT * FROM ledger WHERE user_id = ? ORDER BY created_at DESC', u.id).toArray();
      return c.json({ ledger: rows });
    });

    // Payouts
    this.app.get('/api/payouts', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      let rows;
      if (u.role === 'admin') rows = this.ctx.storage.sql.exec('SELECT pt.*, u.name FROM payouts pt JOIN users u ON pt.user_id = u.id ORDER BY created_at DESC').toArray();
      else rows = this.ctx.storage.sql.exec('SELECT * FROM payouts WHERE user_id = ? ORDER BY created_at DESC', u.id).toArray();
      return c.json({ payouts: rows });
    });

    this.app.post('/api/payouts', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const body = z.object({ amountCents: z.number().int().min(1) }).parse(await c.req.json());
      const available = this.ctx.storage.sql.exec('SELECT COALESCE(SUM(amount_cents),0) as c FROM ledger WHERE user_id = ? AND status = "available"', u.id).one().c as number;
      const paid = this.ctx.storage.sql.exec('SELECT COALESCE(SUM(amount_cents),0) as c FROM payouts WHERE user_id = ? AND status = "paid"', u.id).one().c as number;
      if (body.amountCents > available - paid) return c.json({ message: 'Insufficient available balance' }, 400);
      const result = this.ctx.storage.sql.exec('INSERT INTO payouts (user_id, amount_cents) VALUES (?, ?)', u.id, body.amountCents);
      return c.json({ id: result.lastRowId, ok: true });
    });

    this.app.post('/api/payouts/:id/paid', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const id = Number(c.req.param('id'));
      this.ctx.storage.sql.exec('UPDATE payouts SET status = "paid", paid_at = datetime("now") WHERE id = ?', id);
      return c.json({ ok: true });
    });

    // Supplier connectors
    this.app.get('/api/connectors', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      if (!company && u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const sql = this.ctx.storage.sql;
      let rows;
      if (u.role === 'admin') rows = sql.exec('SELECT cn.*, c.name as company_name FROM supplier_connectors cn JOIN companies c ON cn.company_id = c.id ORDER BY created_at DESC').toArray();
      else rows = sql.exec('SELECT cn.*, c.name as company_name FROM supplier_connectors cn JOIN companies c ON cn.company_id = c.id WHERE cn.company_id = ? ORDER BY created_at DESC', company.id).toArray();
      return c.json({ connectors: rows.map(this.mapConnector), types: CONNECTOR_TYPES, providers: CONNECTOR_PROVIDERS });
    });

    this.app.post('/api/connectors', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      if (!company) return c.json({ message: 'Forbidden' }, 403);
      const body = z.object({ name: z.string().min(1), type: z.enum(['hotel','flight','transport','activity']), provider: z.string().optional(), config: z.string().optional(), status: z.enum(['active','inactive']).optional() }).passthrough().parse(await c.req.json());
      const result = this.ctx.storage.sql.exec('INSERT INTO supplier_connectors (company_id, name, type, provider, config, status) VALUES (?, ?, ?, ?, ?, ?)', company.id, body.name, body.type, body.provider || 'sandbox', body.config || '{}', body.status || 'active');
      return c.json({ id: result.lastRowId, ok: true });
    });

    this.app.patch('/api/connectors/:id', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const id = Number(c.req.param('id'));
      const cn = this.ctx.storage.sql.exec('SELECT * FROM supplier_connectors WHERE id = ?', id).one();
      if (!cn) return c.json({ message: 'Not found' }, 404);
      if (u.role !== 'admin' && (!company || Number(cn.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      const body = z.object({ name: z.string().optional(), provider: z.string().optional(), config: z.string().optional(), status: z.enum(['active','inactive']).optional() }).passthrough().parse(await c.req.json());
      this.ctx.storage.sql.exec('UPDATE supplier_connectors SET name = COALESCE(?, name), provider = COALESCE(?, provider), config = COALESCE(?, config), status = COALESCE(?, status) WHERE id = ?', body.name ?? null, body.provider ?? null, body.config ?? null, body.status ?? null, id);
      return c.json({ ok: true });
    });

    this.app.delete('/api/connectors/:id', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const id = Number(c.req.param('id'));
      const cn = this.ctx.storage.sql.exec('SELECT * FROM supplier_connectors WHERE id = ?', id).one();
      if (!cn) return c.json({ message: 'Not found' }, 404);
      if (u.role !== 'admin' && (!company || Number(cn.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      this.ctx.storage.sql.exec('DELETE FROM supplier_connectors WHERE id = ?', id);
      return c.json({ ok: true });
    });

    this.app.post('/api/connectors/:id/search', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const company = this.companyFor(u.id);
      const id = Number(c.req.param('id'));
      const cn = this.ctx.storage.sql.exec('SELECT * FROM supplier_connectors WHERE id = ?', id).one();
      if (!cn) return c.json({ message: 'Not found' }, 404);
      if (u.role !== 'admin' && (!company || Number(cn.company_id) !== company.id)) return c.json({ message: 'Forbidden' }, 403);
      const body = z.object({ destination: z.string().optional(), date: z.string().optional(), guests: z.number().int().min(1).optional() }).passthrough().parse(await c.req.json());
      const results = this.mockSupplierSearch(String(cn.type), String(cn.provider), body);
      return c.json({ results });
    });

    // AI assistant
    this.app.post('/api/ai/trip-plan', this.withUser.bind(this), async (c) => {
      const body = z.object({ destination: z.string().min(1), days: z.number().int().min(1).max(14), budgetCents: z.number().int().min(0).optional(), currency: z.string().default('USD'), lang: z.enum(['en','ar','it']).default('en') }).parse(await c.req.json());
      const prompt = buildTripPlanPrompt(body.destination, body.days, body.budgetCents, body.currency, body.lang);
      return this.runAi(c.env.AI, prompt, body.lang);
    });

    this.app.post('/api/ai/seller-offer', this.withUser.bind(this), async (c) => {
      const u = c.get('user') as User;
      const body = z.object({ category: z.string().optional(), destination: z.string().optional(), lang: z.enum(['en','ar','it']).default('en') }).parse(await c.req.json());
      const products = this.suggestProductsForSeller(body.category, body.destination);
      const prompt = buildSellerOfferPrompt(products, body.lang);
      const aiResult = await this.runAiInternal(c.env.AI, prompt, body.lang);
      return c.json({ products, aiText: aiResult.text });
    });

    this.app.post('/api/ai/product-write', this.withUser.bind(this), async (c) => {
      const body = z.object({ type: z.string(), location: z.string().optional(), priceCents: z.number().int().min(0), duration: z.string().optional(), highlights: z.string().optional(), lang: z.enum(['en','ar','it']).default('en') }).parse(await c.req.json());
      const prompt = buildProductWritePrompt(body.type, body.location, body.priceCents, body.duration, body.highlights, body.lang);
      const aiResult = await this.runAiInternal(c.env.AI, prompt, body.lang);
      let parsed = null;
      try { parsed = JSON.parse(aiResult.text || '{}'); } catch {}
      return c.json({ text: aiResult.text, parsed });
    });

    this.app.post('/api/ai/translate', this.withUser.bind(this), async (c) => {
      const body = z.object({ text: z.string().min(1), targetLang: z.enum(['en','ar','it']) }).parse(await c.req.json());
      const prompt = buildTranslatePrompt(body.text, body.targetLang);
      return this.runAi(c.env.AI, prompt, body.targetLang);
    });

    // Admin
    this.app.get('/api/admin/companies', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const rows = this.ctx.storage.sql.exec('SELECT c.*, u.email FROM companies c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC').toArray();
      return c.json({ companies: rows });
    });

    this.app.post('/api/admin/companies/:id/approve', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      this.ctx.storage.sql.exec('UPDATE companies SET status = "approved" WHERE id = ?', Number(c.req.param('id')));
      return c.json({ ok: true });
    });

    this.app.post('/api/admin/companies/:id/reject', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      this.ctx.storage.sql.exec('UPDATE companies SET status = "rejected" WHERE id = ?', Number(c.req.param('id')));
      return c.json({ ok: true });
    });

    this.app.get('/api/admin/users', this.withUser.bind(this), (c) => {
      const u = c.get('user') as User;
      if (u.role !== 'admin') return c.json({ message: 'Forbidden' }, 403);
      const rows = this.ctx.storage.sql.exec('SELECT id, name, email, role, seller_code, created_at FROM users ORDER BY created_at DESC').toArray();
      return c.json({ users: rows });
    });

    // Fallback
    this.app.get('*', (c) => c.notFound());
  }

  // --- Helpers ---
  async withUser(c: any, next: any) {
    const cookie = c.req.raw.headers.get('Cookie') || '';
    const sid = this.getSessionId(cookie);
    if (!sid) return c.json({ message: 'Unauthorized' }, 401);
    const row = this.ctx.storage.sql.exec('SELECT user_id, expires_at FROM sessions WHERE id = ?', sid).one();
    if (!row || Date.now() > Number(row.expires_at)) return c.json({ message: 'Session expired' }, 401);
    const user = this.userById(Number(row.user_id));
    if (!user) return c.json({ message: 'User not found' }, 401);
    c.set('user', user);
    await next();
  }

  getSessionId(cookie: string) {
    const m = cookie.match(/session=([^;]+)/);
    return m ? m[1] : null;
  }

  createSession(userId: number) {
    const sid = nanoid();
    this.ctx.storage.sql.exec('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)', sid, userId, Date.now() + 86400_000);
    return sid;
  }

  userById(id: number): User | null {
    return this.ctx.storage.sql.exec('SELECT * FROM users WHERE id = ?', id).one() as User | null;
  }
  userByEmail(email: string): User | null {
    return this.ctx.storage.sql.exec('SELECT * FROM users WHERE email = ?', email).one() as User | null;
  }
  userBySellerCode(code: string): User | null {
    return this.ctx.storage.sql.exec('SELECT * FROM users WHERE seller_code = ?', code).one() as User | null;
  }
  companyFor(userId: number): any | null {
    return this.ctx.storage.sql.exec('SELECT * FROM companies WHERE user_id = ?', userId).one() || null;
  }
  companyName(id: number) {
    return (this.ctx.storage.sql.exec('SELECT name FROM companies WHERE id = ?', id).one()?.name as string) || '';
  }
  productById(id: number) {
    return this.ctx.storage.sql.exec('SELECT * FROM products WHERE id = ?', id).one();
  }
  bookingById(id: number) {
    return this.ctx.storage.sql.exec('SELECT * FROM bookings WHERE id = ?', id).one();
  }
  paymentIntentByBookingId(id: number) {
    return this.ctx.storage.sql.exec('SELECT * FROM payment_intents WHERE booking_id = ?', id).one();
  }
  profileFor(userId: number) {
    const company = this.companyFor(userId);
    return company ? { companyName: company.name, taxId: company.taxId, phone: company.phone, website: company.website, bio: company.bio } : {};
  }

  sanitizeUser(user: User, company: any) {
    return {
      id: user.id, email: user.email, name: user.name, role: user.role,
      sellerCode: user.sellerCode, companyStatus: company?.status || null,
      companyId: company?.id || null
    };
  }

  mapProduct(r: any) {
    return {
      id: r.id, companyId: r.company_id, type: r.type, title: r.title, description: r.description,
      location: r.location, duration: r.duration, availability: r.availability, imageUrl: r.image_url,
      priceCents: r.price_cents, commissionPercent: r.commission_percent, commissionFixedCents: r.commission_fixed_cents,
      tags: r.tags, status: r.status, createdAt: r.created_at
    };
  }

  mapBooking(r: any) {
    return {
      id: r.id, productId: r.product_id, companyId: r.company_id, sellerId: r.seller_id, travelerId: r.traveler_id,
      productTitle: r.product_title, productType: r.product_type, companyName: r.company_name,
      guests: r.guests, startDate: r.start_date, endDate: r.end_date, notes: r.notes, status: r.status,
      basePriceCents: r.base_price_cents, sellerCommissionCents: r.seller_commission_cents,
      platformFeeCents: r.platform_fee_cents, companyShareCents: r.company_share_cents,
      sellerShareCents: r.seller_share_cents, travelerPriceCents: r.traveler_price_cents,
      createdAt: r.created_at
    };
  }

  mapPaymentIntent(r: any) {
    return {
      id: r.id, bookingId: r.booking_id, amountCents: r.amount_cents, currency: r.currency,
      status: r.status, clientSecret: r.client_secret, paymentMethodText: r.payment_method_text,
      createdAt: r.created_at
    };
  }

  mapLink(r: any) {
    return { id: r.id, sellerId: r.seller_id, productId: r.product_id || r.product_id, code: r.code, visits: r.visits, createdAt: r.created_at };
  }

  mapConnector(r: any) {
    return { id: r.id, companyId: r.company_id, companyName: r.company_name, name: r.name, type: r.type, provider: r.provider, config: r.config, status: r.status, createdAt: r.created_at };
  }

  updateLedgerForBooking(bookingId: number, status: string) {
    const sql = this.ctx.storage.sql;
    const b = this.bookingById(bookingId);
    if (!b) return;
    if (status === 'confirmed') {
      const exists = Number(sql.exec('SELECT COUNT(*) as c FROM ledger WHERE booking_id = ?', bookingId).one().c) > 0;
      if (!exists) {
        sql.exec('INSERT INTO ledger (user_id, booking_id, amount_cents, status) VALUES (?, ?, ?, ?)', b.company_id, bookingId, b.company_share_cents, 'pending');
        if (b.seller_id) sql.exec('INSERT INTO ledger (user_id, booking_id, amount_cents, status) VALUES (?, ?, ?, ?)', b.seller_id, bookingId, b.seller_share_cents, 'pending');
      } else {
        sql.exec('UPDATE ledger SET status = "pending" WHERE booking_id = ? AND status != "available"', bookingId);
      }
    } else if (status === 'completed') {
      sql.exec('UPDATE ledger SET status = "available" WHERE booking_id = ?', bookingId);
    } else if (status === 'cancelled') {
      sql.exec('UPDATE ledger SET status = "voided" WHERE booking_id = ?', bookingId);
    } else if (status === 'pending') {
      sql.exec('DELETE FROM ledger WHERE booking_id = ?', bookingId);
    }
  }

  suggestProductsForSeller(category?: string, destination?: string) {
    const sql = this.ctx.storage.sql;
    let query = 'SELECT p.*, c.name as company_name FROM products p JOIN companies c ON p.company_id = c.id WHERE p.status = "active" AND c.status = "approved"';
    const params: any[] = [];
    if (category) { query += ' AND p.type = ?'; params.push(category); }
    if (destination) { query += ' AND lower(p.location) LIKE ?'; params.push('%' + destination.toLowerCase() + '%'); }
    query += ' ORDER BY p.created_at DESC LIMIT 12';
    const rows = sql.exec(query, ...params).toArray();
    return rows.map(r => {
      const tpc = Number(r.price_cents) + (Number(r.commission_percent) ? Math.round(Number(r.price_cents) * (Number(r.commission_percent) / 100)) : 0) + Number(r.commission_fixed_cents);
      const profitPerBooking = tpc - Number(r.price_cents);
      return { ...this.mapProduct(r), travelerPriceCents: tpc, companyName: r.company_name, profitPerBookingCents: profitPerBooking };
    });
  }

  mockSupplierSearch(type: string, provider: string, params: any) {
    const base = [
      { id: 'ext-1', title: `${provider} ${type} option A`, location: params.destination || 'Rome', priceCents: 12000, provider },
      { id: 'ext-2', title: `${provider} ${type} option B`, location: params.destination || 'Rome', priceCents: 18500, provider },
      { id: 'ext-3', title: `${provider} ${type} option C`, location: params.destination || 'Rome', priceCents: 23000, provider },
    ];
    return { count: base.length, source: provider, type, results: base };
  }

  async runAi(ai: Ai, prompt: any, lang: string) {
    try {
      const result = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
        messages: [
          { role: "system", content: aiSystemPrompt(lang) },
          { role: "user", content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt) }
        ],
        max_tokens: 900,
      });
      const text = (result?.response || result?.text || '').trim();
      return { ok: true, text };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI inference failed';
      return { ok: false, error: 'AI inference failed', details: message };
    }
  }

  async runAiInternal(ai: Ai, prompt: any, lang: string) {
    const res = await this.runAi(ai, prompt, lang);
    if (!res.ok) throw new Error(res.details || res.error);
    return { text: res.text };
  }

  async fetch(request: Request): Promise<Response> {
    return this.app.fetch(request);
  }
}

// --- AI prompts ---
function aiSystemPrompt(lang: string) {
  if (lang === 'ar') return 'أنت مساعد سوق السفر "مسيدي ترافل". أجب بلغة عربية فصحى واضحة وموجزة.';
  if (lang === 'it') return 'Sei l\'assistente AI di Masidy Travel. Rispondi in italiano chiaro e conciso.';
  return 'You are Masidy Travel\'s AI assistant. Answer in clear, concise English.';
}

function buildTripPlanPrompt(destination: string, days: number, budgetCents?: number, currency = 'USD', lang = 'en') {
  const budgetText = budgetCents ? `Budget: ${(budgetCents / 100).toFixed(0)} ${currency}` : 'No fixed budget';
  if (lang === 'ar') return `خطّط رحلة إلى ${destination} لمدة ${days} أيام. ${budgetText}. قدّم جدولاً يومياً مختصراً، وأفضل وقت للزيارة، ونصائح للتوفير، واقتراحات مناسبة للعائلات.`;
  if (lang === 'it') return `Pianifica un viaggio a ${destination} per ${days} giorni. ${budgetText}. Fornisci un itinerario giornaliero breve, il miglior periodo per visitare, consigli per risparmiare e attività adatte alle famiglie.`;
  return `Plan a trip to ${destination} for ${days} days. ${budgetText}. Provide a brief day-by-day itinerary, best time to visit, money-saving tips, and family-friendly suggestions.`;
}

function buildSellerOfferPrompt(products: any[], lang = 'en') {
  const list = products.slice(0, 6).map(p => `- ${p.title} (${p.type}) in ${p.location}: base ${(p.priceCents / 100).toFixed(2)}, seller profit ${(p.profitPerBookingCents / 100).toFixed(2)}`).join('\n');
  if (lang === 'ar') return `اقترح أفضل ثلاث منتجات للبائع من القائمة التالية مع شرح موجز لكل اختيار (لغة وجهة، سعر منافس، عمولة مرتفعة):\n${list}`;
  if (lang === 'it') return `Suggerisci i tre migliori prodotti per il venditore dalla lista seguente, spiegando brevemente ogni scelta (lingua della destinazione, prezzo competitivo, commissione alta):\n${list}`;
  return `Suggest the top three products for a seller from the list below, briefly explaining each choice (destination language, competitive pricing, high commission):\n${list}`;
}

function buildProductWritePrompt(type: string, location?: string, priceCents?: number, duration?: string, highlights?: string, lang = 'en') {
  const loc = location || 'a popular destination';
  const price = priceCents != null ? (priceCents / 100).toFixed(2) : 'market price';
  if (lang === 'ar') return `اكتب عنواناً قصيراً وجذّاباً ووصفاً تسويقياً (3-5 جمل) لـ ${type} في ${loc} بسعر ${price}. المميزات: ${highlights || 'تجربة فريدة'}. أعد النتيجة بتنسيق JSON فقط: {"title":"...","description":"...","tags":"..."}.`;
  if (lang === 'it') return `Scrivi un titolo breve e accattivante e una descrizione marketing (3-5 frasi) per un ${type} a ${loc} al prezzo di ${price}. Punti di forza: ${highlights || 'esperienza unica'}. Restituisci SOLO JSON: {"title":"...","description":"...","tags":"..."}.`;
  return `Write a short, catchy title and a 3-5 sentence marketing description for a ${type} in ${loc} priced ${price}. Highlights: ${highlights || 'unique experience'}. Return ONLY JSON: {"title":"...","description":"...","tags":"..."}.`;
}

function buildTranslatePrompt(text: string, targetLang: string) {
  const names: Record<string, string> = { en: 'English', ar: 'Arabic', it: 'Italian' };
  return `Translate the following text to ${names[targetLang]}. Keep it natural and concise. Return only the translation:\n\n${text}`;
}
