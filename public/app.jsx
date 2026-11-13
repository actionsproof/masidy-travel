import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

/*
 * MASIDY TRAVEL - PHASES 1-7
 * SPA entry. Auth, roles, marketplace, bookings, payments,
 * supplier connectors, AI assistant, i18n, multi-currency.
 */

// --- Icons ---
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IconBriefcase = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconDollar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconFilter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconGlobe = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IconMoon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const AlertCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const Trash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const More = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const Edit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const Sparkles = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M5 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>;
const Plane = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M13 2.5l6 9.5-6 9.5"/><path d="M11 21.5l-6-9.5 6-9.5"/><path d="M7 12h10"/></svg>;
const Bed = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M6 20h12"/></svg>;
const CardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const BoxStack = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;

// --- i18n ---
const DICT = {
  en: {
    appName: 'Masidy Travel', tagline: 'Travel marketplace',
    signIn: 'Sign in', signUp: 'Sign up', email: 'Email', password: 'Password', name: 'Full name',
    forgot: 'Forgot?', noAccount: 'No account?', haveAccount: 'Already have an account?',
    role: 'I am a', traveler: 'Traveler', seller: 'Seller', company: 'Company', supplier: 'Supplier',
    continue: 'Continue', save: 'Save changes', create: 'Create', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    search: 'Search', dashboard: 'Dashboard', companies: 'Companies', products: 'Products', bookings: 'Bookings',
    sellers: 'Sellers', ledger: 'Ledger', payouts: 'Payouts', customers: 'Customers', reports: 'Reports',
    settings: 'Settings', support: 'Support', logout: 'Log out', marketplace: 'Marketplace',
    categories: 'Categories', all: 'All', filters: 'Filters', price: 'Price', perPerson: 'per person',
    type: 'Type', location: 'Location', duration: 'Duration', availability: 'Availability',
    addProduct: 'Add product', productTypes: { tour: 'Tour', hotel: 'Hotel', package: 'Package', transfer: 'Transfer', car: 'Car rental' },
    status: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' },
    moneySplit: 'Money split', basePrice: 'Base price', sellerCommission: 'Seller commission', platformFee: 'Platform fee', companyShare: 'Company share',
    amount: 'Amount', requestPayout: 'Request payout', markPaid: 'Mark paid', approved: 'Paid', pendingApproval: 'Requested',
    approve: 'Approve', reject: 'Reject', emptyProducts: 'No products yet', emptyProductsHint: 'Add your first tour, hotel or package to start receiving bookings.',
    emptyBookings: 'No bookings yet', emptyBookingsHint: 'Bookings will appear here once travelers reserve your products.',
    emptySellers: 'No sellers yet', emptySellersHint: 'Invite independent sellers to resell your products and earn commissions.',
    emptyLedger: 'No ledger entries', emptyLedgerHint: 'Completed bookings will create available balances.',
    emptyPayouts: 'No payouts yet', emptyPayoutsHint: 'Request a payout once you have an available balance.',
    linkCopied: 'Tracking link copied', visits: 'Visits', bookingsCount: 'Bookings', earnings: 'Earnings',
    confirm: 'Confirm', complete: 'Complete', cancel: 'Cancel booking', changeStatus: 'Change status',
    invalidTransition: 'Invalid status transition', welcomeTitle: 'Welcome back', welcomeSubtitle: 'Here is what is happening in your marketplace.',
    totalBookings: 'Total bookings', revenue: 'Revenue', availableBalance: 'Available balance', activeProducts: 'Active products',
    language: 'Language', theme: 'Theme', currency: 'Currency', light: 'Light', dark: 'Dark', system: 'System',
    companyName: 'Company name', taxId: 'Tax / registration ID', phone: 'Phone', website: 'Website', bio: 'About',
    sellerCode: 'Seller code', link: 'Link', copy: 'Copy', commission: 'Commission',
    percent: 'Percent', fixedPerPerson: 'Fixed per person', bookingForm: 'Booking details', travelers: 'Travelers',
    notes: 'Notes', bookNow: 'Book now', view: 'View', back: 'Back', noResults: 'No results', clearFilters: 'Clear filters',
    from: 'From', to: 'To', apply: 'Apply', date: 'Date', guestCount: 'Guests', startDate: 'Start date', endDate: 'End date',
    supplierConnector: 'Supplier connectors', connectorHint: 'Connect external hotel or transport suppliers.',
    adminPanel: 'Admin panel', users: 'Users', complaints: 'Complaints', adminOverview: 'Admin overview',
    onboardWelcome: 'Travel together, grow together.', onboardSubtitle: 'Sign up free, list your products, invite sellers, and accept bookings from travelers around the world.',
    needApproval: 'Account awaiting approval', approvalHint: 'An admin will review your account shortly.',
    checkout: 'Checkout', payNow: 'Pay now', paymentSuccess: 'Payment successful', bookingPaid: 'Booking paid',
    simulatedCard: 'Test card', cardNumber: 'Card number', expiry: 'Expiry', cvc: 'CVC', processPayment: 'Process payment',
    paymentFailed: 'Payment failed', retry: 'Retry', youPaid: 'You paid', orderTracking: 'Order tracking', orders: 'Orders',
    thanksForBooking: 'Thank you for your booking', paymentMethod: 'Payment method', paymentPending: 'Payment pending',
    paymentCaptured: 'Captured', completeCapture: 'Complete & capture', aiAssistant: 'AI Assistant', tripPlanner: 'Trip planner',
    destination: 'Destination', days: 'Days', budget: 'Budget', generatePlan: 'Generate plan', aiPlanTitle: 'Your trip plan',
    offerFinder: 'Offer finder', topOffers: 'Top offers', estimatedProfit: 'Est. profit per booking', noOffers: 'No offers match. Try another destination or category.',
    writeWithAI: 'Write with AI', productWriter: 'Product writer', translate: 'Translate', originalText: 'Original text',
    translatedText: 'Translation', generate: 'Generate', translateNow: 'Translate now', aiTools: 'AI tools',
    connectors: 'Connectors', connectorName: 'Connector name', provider: 'Provider', config: 'Config JSON', addConnector: 'Add connector',
    testConnector: 'Test connector', searchResults: 'Search results', noConnectors: 'No connectors yet', connectorTypes: 'Connector types',
    testSearch: 'Test search', active: 'Active', inactive: 'Inactive', testCardHint: 'This is a simulated payment. No real card is charged.',
    processing: 'Processing…', updated: 'Updated', saved: 'Saved', connect: 'Connect', searchSuppliers: 'Search suppliers',
    link: 'Link', getLink: 'Get tracking link', copyLink: 'Copy tracking link', linkReady: 'Your tracking link is ready'
  },
  ar: {
    appName: 'مسيدي ترافل', tagline: 'سوق السفر', signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', name: 'الاسم الكامل',
    forgot: 'نسيت؟', noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب؟',
    role: 'أنا', traveler: 'مسافر', seller: 'بائع', company: 'شركة', supplier: 'مورّد',
    continue: 'متابعة', save: 'حفظ التغييرات', create: 'إنشاء', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
    search: 'بحث', dashboard: 'لوحة التحكم', companies: 'الشركات', products: 'المنتجات', bookings: 'الحجوزات',
    sellers: 'البائعون', ledger: 'السجل', payouts: 'المدفوعات', customers: 'العملاء', reports: 'التقارير',
    settings: 'الإعدادات', support: 'الدعم', logout: 'خروج', marketplace: 'السوق',
    categories: 'الفئات', all: 'الكل', filters: 'التصفية', price: 'السعر', perPerson: 'للشخص',
    type: 'النوع', location: 'الموقع', duration: 'المدة', availability: 'التوفر',
    addProduct: 'إضافة منتج', productTypes: { tour: 'جولة', hotel: 'فندق', package: 'باقة', transfer: 'مواصلات', car: 'تأجير سيارة' },
    status: { pending: 'معلّق', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغى' },
    moneySplit: 'توزيع المال', basePrice: 'السعر الأساسي', sellerCommission: 'عمولة البائع', platformFee: 'رسوم المنصة', companyShare: 'حصة الشركة',
    amount: 'المبلغ', requestPayout: 'طلب دفع', markPaid: 'تعليم كمدفوع', approved: 'مدفوع', pendingApproval: 'مطلوب',
    approve: 'موافقة', reject: 'رفض', emptyProducts: 'لا يوجد منتجات بعد', emptyProductsHint: 'أضف جولتك أو فندقك أو باقتك الأولى لاستقبال الحجوزات.',
    emptyBookings: 'لا يوجد حجوزات بعد', emptyBookingsHint: 'تظهر الحجوزات هنا عندما يحجز المسافرون منتجاتك.',
    emptySellers: 'لا يوجد بائعون بعد', emptySellersHint: 'ادعُ بائعين مستقلين لإعادة بيع منتجاتك مقابل عمولة.',
    emptyLedger: 'لا يوجد قيود محاسبية', emptyLedgerHint: 'الحجوزات المكتملة تنشئ رصيداً متاحاً.',
    emptyPayouts: 'لا يوجد مدفوعات بعد', emptyPayoutsHint: 'اطلب دفعاً بمجرد توفر رصيد.',
    linkCopied: 'تم نسخ الرابط', visits: 'الزيارات', bookingsCount: 'الحجوزات', earnings: 'الأرباح',
    confirm: 'تأكيد', complete: 'إكمال', cancel: 'إلغاء الحجز', changeStatus: 'تغيير الحالة',
    invalidTransition: 'انتقال الحالة غير صالح', welcomeTitle: 'أهلاً بعودتك', welcomeSubtitle: 'إليك ما يحدث في سوقك.',
    totalBookings: 'إجمالي الحجوزات', revenue: 'الإيرادات', availableBalance: 'الرصيد المتاح', activeProducts: 'المنتجات النشطة',
    language: 'اللغة', theme: 'المظهر', currency: 'العملة', light: 'فاتح', dark: 'داكن', system: 'النظام',
    companyName: 'اسم الشركة', taxId: 'الرقم الضريبي', phone: 'الهاتف', website: 'الموقع الإلكتروني', bio: 'نبذة',
    sellerCode: 'رمز البائع', link: 'رابط', copy: 'نسخ', commission: 'العمولة',
    percent: 'نسبة مئوية', fixedPerPerson: 'مبلغ ثابت للشخص', bookingForm: 'تفاصيل الحجز', travelers: 'المسافرون',
    notes: 'ملاحظات', bookNow: 'احجز الآن', view: 'عرض', back: 'رجوع', noResults: 'لا توجد نتائج', clearFilters: 'مسح الفلاتر',
    from: 'من', to: 'إلى', apply: 'تطبيق', date: 'التاريخ', guestCount: 'الضيوف', startDate: 'تاريخ البدء', endDate: 'تاريخ الانتهاء',
    supplierConnector: 'موصلات الموردين', connectorHint: 'اربط موردي فنادق أو نقل خارجيين.',
    adminPanel: 'لوحة المشرف', users: 'المستخدمون', complaints: 'الشكاوى', adminOverview: 'نظرة مشرف',
    onboardWelcome: 'سافر معاً، انمو معاً.', onboardSubtitle: 'سجّل مجاناً، ادرج منتجاتك، ادعُ بائعين، واستقبل حجوزات من مسافرين حول العالم.',
    needApproval: 'الحساب بانتظار الموافقة', approvalHint: 'سيراجع المشرف حسابك قريباً.',
    checkout: 'الدفع', payNow: 'ادفع الآن', paymentSuccess: 'تم الدفع بنجاح', bookingPaid: 'تم دفع الحجز',
    simulatedCard: 'بطاقة تجريبية', cardNumber: 'رقم البطاقة', expiry: 'تاريخ الانتهاء', cvc: 'CVC', processPayment: 'معالجة الدفع',
    paymentFailed: 'فشل الدفع', retry: 'إعادة المحاولة', youPaid: 'دفعت', orderTracking: 'تتبع الطلب', orders: 'طلباتي',
    thanksForBooking: 'شكراً لحجزك', paymentMethod: 'طريقة الدفع', paymentPending: 'بانتظار الدفع',
    paymentCaptured: 'مستلمة', completeCapture: 'إكمال وتحصيل', aiAssistant: 'المساعد الذكي', tripPlanner: 'مخطّط الرحلات',
    destination: 'الوجهة', days: 'الأيام', budget: 'الميزانية', generatePlan: 'إنشاء الخطة', aiPlanTitle: 'خطتك للرحلة',
    offerFinder: 'الباحث عن العروض', topOffers: 'أفضل العروض', estimatedProfit: 'الربح المتوقع للحجز', noOffers: 'لا توجد عروض مطابقة. جرّب وجهة أو فئة أخرى.',
    writeWithAI: 'كتابة بالذكاء الاصطناعي', productWriter: 'كاتب المنتجات', translate: 'ترجمة', originalText: 'النص الأصلي',
    translatedText: 'الترجمة', generate: 'إنشاء', translateNow: 'ترجم الآن', aiTools: 'أدوات الذكاء الاصطناعي',
    connectors: 'موصلات الموردين', connectorName: 'اسم الموصل', provider: 'المزوّد', config: 'إعدادات JSON', addConnector: 'إضافة موصل',
    testConnector: 'اختبار الموصل', searchResults: 'نتائج البحث', noConnectors: 'لا توجد موصلات بعد', connectorTypes: 'أنواع الموصلات',
    testSearch: 'بحث تجريبي', active: 'نشط', inactive: 'غير نشط', testCardHint: 'هذا دفع محاكى. لا يتم خصم أي مبلغ حقيقي.',
    processing: 'جاري المعالجة…', updated: 'تم التحديث', saved: 'تم الحفظ', connect: 'اتصال', searchSuppliers: 'البحث في الموردين',
    link: 'رابط', getLink: 'احصل على رابط التتبع', copyLink: 'نسخ رابط التتبع', linkReady: 'رابط التتبع جاهز'
  },
  it: {
    appName: 'Masidy Travel', tagline: 'Marketplace di viaggi', signIn: 'Accedi', signUp: 'Registrati',
    email: 'Email', password: 'Password', name: 'Nome completo', forgot: 'Dimenticata?', noAccount: 'Non hai un account?', haveAccount: 'Hai già un account?',
    role: 'Sono un', traveler: 'Viaggiatore', seller: 'Venditore', company: 'Azienda', supplier: 'Fornitore',
    continue: 'Continua', save: 'Salva modifiche', create: 'Crea', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica',
    search: 'Cerca', dashboard: 'Dashboard', companies: 'Aziende', products: 'Prodotti', bookings: 'Prenotazioni', sellers: 'Venditori',
    ledger: 'Libro mastro', payouts: 'Pagamenti', customers: 'Clienti', reports: 'Report', settings: 'Impostazioni', support: 'Supporto',
    logout: 'Esci', marketplace: 'Marketplace', categories: 'Categorie', all: 'Tutti', filters: 'Filtri', price: 'Prezzo', perPerson: 'a persona',
    type: 'Tipo', location: 'Località', duration: 'Durata', availability: 'Disponibilità',
    addProduct: 'Aggiungi prodotto', productTypes: { tour: 'Tour', hotel: 'Hotel', package: 'Pacchetto', transfer: 'Transfer', car: 'Autonoleggio' },
    status: { pending: 'In attesa', confirmed: 'Confermata', completed: 'Completata', cancelled: 'Annullata' },
    moneySplit: 'Suddivisione importi', basePrice: 'Prezzo base', sellerCommission: 'Commissione venditore', platformFee: 'Commissione piattaforma', companyShare: 'Quota azienda',
    amount: 'Importo', requestPayout: 'Richiedi pagamento', markPaid: 'Segna pagato', approved: 'Pagato', pendingApproval: 'Richiesto',
    approve: 'Approva', reject: 'Rifiuta', emptyProducts: 'Nessun prodotto', emptyProductsHint: 'Aggiungi il tuo primo tour, hotel o pacchetto per ricevere prenotazioni.',
    emptyBookings: 'Nessuna prenotazione', emptyBookingsHint: 'Le prenotazioni appariranno quando i viaggiatori prenoteranno i tuoi prodotti.',
    emptySellers: 'Nessun venditore', emptySellersHint: 'Invita venditori indipendenti a rivendere i tuoi prodotti su commissione.',
    emptyLedger: 'Nessuna voce contabile', emptyLedgerHint: 'Le prenotazioni completate genereranno un saldo disponibile.',
    emptyPayouts: 'Nessun pagamento', emptyPayoutsHint: 'Richiedi un pagamento quando hai un saldo disponibile.',
    linkCopied: 'Link di tracciamento copiato', visits: 'Visite', bookingsCount: 'Prenotazioni', earnings: 'Guadagni',
    confirm: 'Conferma', complete: 'Completa', cancel: 'Annulla prenotazione', changeStatus: 'Cambia stato',
    invalidTransition: 'Transizione di stato non valida', welcomeTitle: 'Bentornato', welcomeSubtitle: 'Ecco cosa sta succedendo nel tuo marketplace.',
    totalBookings: 'Prenotazioni totali', revenue: 'Ricavi', availableBalance: 'Saldo disponibile', activeProducts: 'Prodotti attivi',
    language: 'Lingua', theme: 'Tema', currency: 'Valuta', light: 'Chiaro', dark: 'Scuro', system: 'Sistema',
    companyName: 'Nome azienda', taxId: 'Partita IVA', phone: 'Telefono', website: 'Sito web', bio: 'Descrizione',
    sellerCode: 'Codice venditore', link: 'Link', copy: 'Copia', commission: 'Commissione',
    percent: 'Percentuale', fixedPerPerson: 'Fisso a persona', bookingForm: 'Dettagli prenotazione', travelers: 'Viaggiatori',
    notes: 'Note', bookNow: 'Prenota ora', view: 'Vedi', back: 'Indietro', noResults: 'Nessun risultato', clearFilters: 'Azzera filtri',
    from: 'Da', to: 'A', apply: 'Applica', date: 'Data', guestCount: 'Ospiti', startDate: 'Data inizio', endDate: 'Data fine',
    supplierConnector: 'Connettori fornitori', connectorHint: 'Collega fornitori esterni di hotel o trasporti.',
    adminPanel: 'Pannello admin', users: 'Utenti', complaints: 'Reclami', adminOverview: 'Panoramica admin',
    onboardWelcome: 'Viaggiare insieme, crescere insieme.', onboardSubtitle: 'Registrati gratis, pubblica i tuoi prodotti, invita venditori e accetta prenotazioni da viaggiatori in tutto il mondo.',
    needApproval: 'Account in attesa di approvazione', approvalHint: 'Un admin revisionerà presto il tuo account.',
    checkout: 'Checkout', payNow: 'Paga ora', paymentSuccess: 'Pagamento riuscito', bookingPaid: 'Prenotazione pagata',
    simulatedCard: 'Carta di test', cardNumber: 'Numero carta', expiry: 'Scadenza', cvc: 'CVC', processPayment: 'Elabora pagamento',
    paymentFailed: 'Pagamento fallito', retry: 'Riprova', youPaid: 'Hai pagato', orderTracking: 'Tracciamento ordine', orders: 'I miei ordini',
    thanksForBooking: 'Grazie per la tua prenotazione', paymentMethod: 'Metodo di pagamento', paymentPending: 'In attesa di pagamento',
    paymentCaptured: 'Riscosso', completeCapture: 'Completa e riscuoti', aiAssistant: 'Assistente AI', tripPlanner: 'Pianificatore viaggi',
    destination: 'Destinazione', days: 'Giorni', budget: 'Budget', generatePlan: 'Genera piano', aiPlanTitle: 'Il tuo piano di viaggio',
    offerFinder: 'Trova offerte', topOffers: 'Migliori offerte', estimatedProfit: 'Profitto stimato a prenotazione', noOffers: 'Nessuna offerta corrispondente. Prova un\'altra destinazione o categoria.',
    writeWithAI: 'Scrivi con AI', productWriter: 'Scrittore prodotti', translate: 'Traduci', originalText: 'Testo originale',
    translatedText: 'Traduzione', generate: 'Genera', translateNow: 'Traduci ora', aiTools: 'Strumenti AI',
    connectors: 'Connettori fornitori', connectorName: 'Nome connettore', provider: 'Provider', config: 'Config JSON', addConnector: 'Aggiungi connettore',
    testConnector: 'Testa connettore', searchResults: 'Risultati ricerca', noConnectors: 'Nessun connettore', connectorTypes: 'Tipi di connettore',
    testSearch: 'Ricerca di test', active: 'Attivo', inactive: 'Inattivo', testCardHint: 'Questo è un pagamento simulato. Nessuna carta reale viene addebitata.',
    processing: 'Elaborazione…', updated: 'Aggiornato', saved: 'Salvato', connect: 'Connetti', searchSuppliers: 'Cerca fornitori',
    link: 'Link', getLink: 'Ottieni link tracciato', copyLink: 'Copia link tracciato', linkReady: 'Il tuo link tracciato è pronto'
  }
};

const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  AED: { symbol: 'AED', rate: 3.67 },
  SAR: { symbol: 'SAR', rate: 3.75 },
  TRY: { symbol: '₺', rate: 32 },
  EGP: { symbol: 'E£', rate: 47 }
};

function t(lang, key, dict = DICT) {
  const k = String(key).split('.');
  let v = dict[lang] || dict.en;
  for (const part of k) { v = v?.[part]; }
  return v ?? dict.en[key] ?? String(key);
}

function formatMoney(cents, currency, lang = 'en') {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const value = Math.round(cents * c.rate) / 100;
  const locale = lang === 'ar' ? 'ar' : lang === 'it' ? 'it' : 'en';
  const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (['AED', 'SAR'].includes(c.symbol)) return `${c.symbol} ${nf.format(value)}`;
  return `${c.symbol}${nf.format(value)}`;
}

function formatDate(iso, lang) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'it' ? 'it' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

// --- API helpers ---
async function api(path, options = {}) {
  const res = await fetch('./api' + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'same-origin',
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

function useFetch(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    api(path)
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ data: null, loading: false, error: err }); });
    return () => { cancelled = true; };
  }, deps);
  return [state, () => api(path).then(d => { setState({ data: d, loading: false, error: null }); return d; })];
}

// --- Global context ---
const GlobalCtx = React.createContext({});
function useGlobal() {
  const [lang, setLang] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('lang');
      if (stored) return stored;
    }
    return typeof window !== 'undefined' && window.__MASIDY_LANG__ ? window.__MASIDY_LANG__ : 'en';
  });
  const [currency, setCurrency] = useState(() => typeof localStorage !== 'undefined' ? localStorage.getItem('currency') || 'USD' : 'USD');
  const [theme, setTheme] = useState(() => typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'system' : 'system');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
  }, [lang]);
  useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const dark = matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return { lang, setLang, currency, setCurrency, theme, setTheme };
}

// --- UI primitives ---
function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '', full = false, left, right }) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, full ? 'btn--full' : '', className].join(' ');
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{left && <span className="btn__icon">{left}</span>}<span>{children}</span>{right && <span className="btn__icon">{right}</span>}</button>;
}
function Input({ label, type = 'text', value, onChange, placeholder, required, error, hint, name, id, min, max, step, rows, as = 'input', readOnly }) {
  const El = as;
  return (
    <div className="field">
      {label && <label htmlFor={id || name} className="field__label">{label}</label>}
      <El id={id || name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} max={max} step={step} rows={rows} readOnly={readOnly}
        className={`field__input ${error ? 'field__input--error' : ''}`} />
      {error && <span className="field__error"><AlertCircle /> {error}</span>}
      {hint && !error && <span className="field__hint">{hint}</span>}
    </div>
  );
}
function Select({ label, value, onChange, options, required, error, id, name }) {
  return (
    <div className="field">
      {label && <label htmlFor={id || name} className="field__label">{label}</label>}
      <div className="select-wrap">
        <select id={id || name} name={name} value={value} onChange={onChange} required={required} className={`field__input field__input--select ${error ? 'field__input--error' : ''}`}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="select-chevron"><IconChevronDown /></span>
      </div>
    </div>
  );
}
function Textarea({ label, value, onChange, placeholder, rows = 4, required, id, name }) {
  return (
    <div className="field">
      {label && <label htmlFor={id || name} className="field__label">{label}</label>}
      <textarea id={id || name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows} className="field__input" />
    </div>
  );
}
function Badge({ children, tone = 'neutral', dot }) {
  return <span className={`badge badge--${tone}`}>{dot && <span className="badge__dot" />} {children}</span>;
}
function Card({ children, className = '', title, actions, subtitle }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions || subtitle) && (
        <div className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
function Empty({ icon, title, hint, actions }) {
  const I = icon || (() => <IconMap />);
  return (
    <div className="empty">
      <div className="empty__icon"><I /></div>
      <h4 className="empty__title">{title}</h4>
      {hint && <p className="empty__hint">{hint}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}
function Table({ columns, rows, renderCell, loading, empty }) {
  if (loading) return <div className="skeleton skeleton--block" />;
  if (!rows || !rows.length) return empty || <Empty title="No data" />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{columns.map((c, i) => <th key={i} className={c.numeric ? 'num' : ''}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri}>{columns.map((c, ci) => <td key={ci} className={c.numeric ? 'num' : ''}>{renderCell ? renderCell(row, c.key) : row[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function Spinner() {
  return <span className="spinner" aria-label="loading" />;
}
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast"><IconCheck /> {message}</div>;
}
function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}><IconPlus /></button>
        </div>
        <div className="modal__body">{children}</div>
        {actions && <div className="modal__footer">{actions}</div>}
      </div>
    </div>
  );
}

// --- Auth ---
function AuthRaw({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang, setLang, theme, setTheme } = React.useContext(GlobalCtx);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api('/auth/login', { method: 'POST', body: { email, password } });
        onLogin(data);
      } else {
        const data = await api('/auth/register', { method: 'POST', body: { email, password, name, role } });
        onLogin(data);
      }
    } catch (err) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">M</div>
        <h1 className="auth__title">{lang === 'ar' ? 'مسيدي ترافل' : 'Masidy Travel'}</h1>
        <p className="auth__subtitle">{t(lang, 'tagline')}</p>
        {error && <div className="auth__error"><AlertCircle /> {error}</div>}
        <form onSubmit={submit} className="auth__form">
          {mode === 'register' && (
            <>
              <Input label={t(lang, 'name')} value={name} onChange={e => setName(e.target.value)} required />
              <Select label={t(lang, 'role')} value={role} onChange={e => setRole(e.target.value)} options={[
                { value: 'traveler', label: t(lang, 'traveler') },
                { value: 'seller', label: t(lang, 'seller') },
                { value: 'company', label: t(lang, 'company') },
                { value: 'supplier', label: t(lang, 'supplier') },
                { value: 'admin', label: 'Admin' }
              ]} />
            </>
          )}
          <Input label={t(lang, 'email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label={t(lang, 'password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button variant="primary" full type="submit" disabled={loading}>{loading ? <Spinner /> : (mode === 'login' ? t(lang, 'signIn') : t(lang, 'signUp'))}</Button>
        </form>
        <div className="auth__toggle">
          {mode === 'login' ? <>{t(lang, 'noAccount')} <button onClick={() => setMode('register')} className="auth__link">{t(lang, 'signUp')}</button></> : <>{t(lang, 'haveAccount')} <button onClick={() => setMode('login')} className="auth__link">{t(lang, 'signIn')}</button></>}
        </div>
        <div className="auth__footer">
          <button className="lang-chip" onClick={() => setLang(l => l === 'en' ? 'ar' : l === 'ar' ? 'it' : 'en')}>{lang.toUpperCase()}</button>
          <button className="theme-chip" onClick={() => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system')}>
            {theme === 'dark' ? <IconMoon /> : theme === 'light' ? <IconSun /> : <IconGlobe />}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Router ---
function useRouter(initial = '/') {
  const [path, setPath] = useState(() => typeof location !== 'undefined' ? (location.hash.slice(1) || window.__MASIDY_PATH__ || initial) : initial);
  useEffect(() => {
    const handler = () => setPath(location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const params = useMemo(() => {
    const [base, qs] = path.split('?');
    const search = new URLSearchParams(qs || '');
    const parts = base.split('/').filter(Boolean);
    return { path: base, search, parts };
  }, [path]);
  return { path, push: (p) => { location.hash = p; }, params };
}

// --- Shell ---
function Shell({ user, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, currency, setCurrency, theme, setTheme } = React.useContext(GlobalCtx);

  function nav(role) {
    const common = [
      { k: 'dashboard', icon: IconHome, href: '#/' },
      { k: 'marketplace', icon: IconMap, href: '#/marketplace' },
    ];
    const company = [
      { k: 'products', icon: IconBriefcase, href: '#/products' },
      { k: 'bookings', icon: IconCalendar, href: '#/bookings' },
      { k: 'sellers', icon: IconUsers, href: '#/sellers' },
      { k: 'ledger', icon: IconDollar, href: '#/ledger' },
      { k: 'payouts', icon: IconDollar, href: '#/payouts' },
      { k: 'aiTools', icon: Sparkles, href: '#/ai-tools' },
    ];
    const supplier = [
      { k: 'products', icon: IconBriefcase, href: '#/products' },
      { k: 'connectors', icon: BoxStack, href: '#/connectors' },
      { k: 'bookings', icon: IconCalendar, href: '#/bookings' },
      { k: 'sellers', icon: IconUsers, href: '#/sellers' },
      { k: 'ledger', icon: IconDollar, href: '#/ledger' },
      { k: 'payouts', icon: IconDollar, href: '#/payouts' },
      { k: 'aiTools', icon: Sparkles, href: '#/ai-tools' },
    ];
    const seller = [
      { k: 'products', icon: IconBriefcase, href: '#/products' },
      { k: 'earnings', icon: IconDollar, href: '#/ledger' },
      { k: 'aiAssistant', icon: Sparkles, href: '#/seller/ai' },
    ];
    const traveler = [
      { k: 'marketplace', icon: IconMap, href: '#/marketplace' },
      { k: 'orders', icon: IconCalendar, href: '#/orders' },
      { k: 'tripPlanner', icon: Plane, href: '#/trip-planner' },
      { k: 'settings', icon: IconSettings, href: '#/settings' },
    ];
    const admin = [
      { k: 'companies', icon: IconBriefcase, href: '#/admin/companies' },
      { k: 'users', icon: IconUsers, href: '#/admin/users' },
      { k: 'bookings', icon: IconCalendar, href: '#/admin/bookings' },
      { k: 'payouts', icon: IconDollar, href: '#/admin/payouts' },
      { k: 'connectors', icon: BoxStack, href: '#/connectors' },
    ];
    if (role === 'admin') return [...common, ...admin];
    if (role === 'company') return [...common, ...company];
    if (role === 'supplier') return [...common, ...supplier];
    if (role === 'seller') return [...common, ...seller];
    return [...common, ...traveler];
  }

  const items = nav(user.role);

  function SidebarContent() {
    return (
      <>
        <div className="shell__brand">
          <span className="logo">M</span>
          <span className="shell__brand-text">{t(lang, 'appName')}</span>
          <button className="shell__close" onClick={() => setMobileOpen(false)}><IconPlus /></button>
        </div>
        <nav className="shell__nav">
          {items.map(item => (
            <a key={item.k} href={item.href} className="shell__nav-item" onClick={() => setMobileOpen(false)}>
              <item.icon /> <span>{t(lang, item.k)}</span>
            </a>
          ))}
        </nav>
        <div className="shell__footer">
          <button className="shell__user" onClick={() => { }}>
            <span>{user.name}</span>
            <span className="shell__role">{user.role}</span>
          </button>
          <button className="shell__logout" onClick={onLogout}><IconLogout /> <span>{t(lang, 'logout')}</span></button>
        </div>
      </>
    );
  }

  return (
    <div className="shell">
      <aside className={`shell__sidebar ${mobileOpen ? 'shell__sidebar--open' : ''}`}><SidebarContent /></aside>
      {mobileOpen && <div className="shell__overlay" onClick={() => setMobileOpen(false)} />}
      <main className="shell__main">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setMobileOpen(o => !o)}><IconMenu /></button>
          <div className="topbar__spacer" />
          <div className="topbar__controls">
            <select className="topbar__select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="topbar__icon" onClick={() => setLang(l => l === 'en' ? 'ar' : l === 'ar' ? 'it' : 'en')} title={lang.toUpperCase()}>{lang.toUpperCase()}</button>
            <button className="topbar__icon" onClick={() => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system')}>
              {theme === 'dark' ? <IconMoon /> : <IconSun />}
            </button>
          </div>
        </header>
        <div className="shell__content">{children}</div>
      </main>
    </div>
  );
}

// --- Pages ---
function Dashboard({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data, loading }] = useFetch('/stats');
  const s = data || {};
  if (loading) return <div className="skeleton skeleton--block" />;
  return (
    <div>
      <h1 className="page-title">{t(lang, 'welcomeTitle')}</h1>
      <p className="page-subtitle">{t(lang, 'welcomeSubtitle')}</p>
      <div className="kpi-grid">
        <Card title={t(lang, 'totalBookings')}><div className="kpi-value">{s.totalBookings ?? 0}</div></Card>
        <Card title={t(lang, 'revenue')}><div className="kpi-value">{formatMoney(s.revenueCents ?? 0, currency, lang)}</div></Card>
        <Card title={t(lang, 'availableBalance')}><div className="kpi-value">{formatMoney(s.availableBalanceCents ?? 0, currency, lang)}</div></Card>
        <Card title={t(lang, 'activeProducts')}><div className="kpi-value">{s.activeProducts ?? 0}</div></Card>
      </div>
      {user.role === 'company' && user.companyStatus === 'pending' && (
        <Card className="notice" subtitle={t(lang, 'approvalHint')}><Badge tone="warning" dot>{t(lang, 'needApproval')}</Badge></Card>
      )}
      {user.role === 'seller' && (
        <Card className="notice" subtitle={t(lang, 'onboardSubtitle')}>
          <h3>{t(lang, 'onboardWelcome')}</h3>
        </Card>
      )}
    </div>
  );
}

function Marketplace({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [{ data, loading }, reload] = useFetch('/products');

  useEffect(() => {
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    const ref = qs.get('ref');
    if (ref) api('/links/visit', { method: 'POST', body: { code: ref } }).catch(() => {});
  }, []);

  const products = data?.products || [];
  const filtered = products.filter(p => {
    const okSearch = !search || [p.title, p.location, p.description, p.tags].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()));
    const okType = type === 'all' || p.type === type;
    const okLoc = !location || (p.location || '').toLowerCase().includes(location.toLowerCase());
    const price = (p.travelerPriceCents ?? p.priceCents);
    const okMin = !minPrice || price >= Number(minPrice) * 100;
    const okMax = !maxPrice || price <= Number(maxPrice) * 100;
    return okSearch && okType && okLoc && okMin && okMax && p.status === 'active';
  });

  return (
    <div>
      <h1 className="page-title">{t(lang, 'marketplace')}</h1>
      <div className="filters">
        <div className="filters__row">
          <div className="filters__search"><IconSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} /></div>
          <Select value={type} onChange={e => setType(e.target.value)} options={[{ value: 'all', label: t(lang, 'all') }, ...Object.keys(DICT.en.productTypes).map(k => ({ value: k, label: t(lang, `productTypes.${k}`) }))]} />
          <input className="field__input" value={location} onChange={e => setLocation(e.target.value)} placeholder={t(lang, 'location')} />
          <div className="filters__price">
            <input className="field__input" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" />
            <span>-</span>
            <input className="field__input" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" />
          </div>
        </div>
      </div>
      {loading ? <div className="skeleton skeleton--grid" /> : (
        filtered.length === 0 ? <Empty title={t(lang, 'noResults')} hint={t(lang, 'clearFilters')} /> : (
          <div className="product-grid">
            {filtered.map(p => (
              <a key={p.id} href={`#/products/${p.id}${user?.sellerCode ? `?ref=${user.sellerCode}` : ''}`} className="product-card" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6)), url(${p.imageUrl || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80'})` }}>
                <div className="product-card__meta">
                  <Badge tone="brand">{t(lang, `productTypes.${p.type}`)}</Badge>
                  <span className="product-card__price">{formatMoney(p.travelerPriceCents ?? p.priceCents, currency, lang)}</span>
                </div>
                <h3 className="product-card__title">{p.title}</h3>
                <p className="product-card__loc">{p.location}</p>
              </a>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ProductDetail({ id, user, navigate }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data, loading }, reload] = useFetch(`/products/${id}`);
  const [guests, setGuests] = useState(1);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    const ref = qs.get('ref');
    if (ref) api('/links/visit', { method: 'POST', body: { code: ref } }).catch(() => {});
  }, []);

  if (loading || !data) return <div className="skeleton skeleton--block" />;
  const p = data.product;

  async function book(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const search = new URLSearchParams(location.hash.split('?')[1] || '');
      const res = await api('/bookings', { method: 'POST', body: { productId: p.id, guests: Number(guests), startDate: start || null, endDate: end || null, notes, sellerCode: search.get('ref') || null } });
      navigate(`/checkout/${res.booking.id}`);
    } catch (err) { setError(err.message || 'Error'); setCreating(false); }
  }

  return (
    <div className="product-detail">
      <Button variant="ghost" left={<span>{t(lang, 'back')}</span>} onClick={() => navigate('/marketplace')} />
      <div className="product-detail__hero" style={{ backgroundImage: `url(${p.imageUrl || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&q=80'})` }} />
      <h1 className="page-title">{p.title}</h1>
      <div className="product-detail__meta">
        <Badge tone="brand">{t(lang, `productTypes.${p.type}`)}</Badge>
        <span>{p.location}</span>
        <span>{formatMoney(p.travelerPriceCents ?? p.priceCents, currency, lang)} / {t(lang, 'perPerson')}</span>
      </div>
      <p className="product-detail__desc">{p.description}</p>
      <Card title={t(lang, 'bookingForm')}>
        {error && <div className="form-error"><AlertCircle /> {error}</div>}
        <form onSubmit={book} className="booking-form">
          <div className="booking-form__row">
            <Input label={t(lang, 'guestCount')} type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} required />
            <Input label={t(lang, 'startDate')} type="date" value={start} onChange={e => setStart(e.target.value)} />
            <Input label={t(lang, 'endDate')} type="date" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <Input as="textarea" label={t(lang, 'notes')} rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="booking-form__total">
            <span>{t(lang, 'amount')}</span>
            <strong>{formatMoney((p.travelerPriceCents ?? p.priceCents) * guests, currency, lang)}</strong>
          </div>
          <Button full variant="primary" type="submit" disabled={creating}>{creating ? <Spinner /> : t(lang, 'bookNow')}</Button>
        </form>
      </Card>
    </div>
  );
}

function CheckoutPage({ id, navigate }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data, loading }, reload] = useFetch(`/bookings/${id}`);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.paymentIntent) setSuccess(data.paymentIntent.status === 'succeeded' || data.paymentIntent.status === 'captured');
  }, [data]);

  async function createPayment() {
    const res = await api('/payments', { method: 'POST', body: { bookingId: Number(id), currency } });
    return res.paymentIntent;
  }

  async function pay() {
    setError('');
    setProcessing(true);
    try {
      let pi = data?.paymentIntent;
      if (!pi) pi = await createPayment();
      await api(`/payments/${pi.id}/confirm`, { method: 'POST', body: { paymentMethod: 'card •••• 4242' } });
      reload();
      setSuccess(true);
    } catch (err) { setError(err.message || 'Error'); }
    finally { setProcessing(false); }
  }

  if (loading || !data) return <div className="skeleton skeleton--block" />;
  const booking = data.booking;
  const product = data.product;

  if (success) return (
    <Card className="booking-confirm">
      <div className="booking-confirm__check"><IconCheck /></div>
      <h2>{t(lang, 'paymentSuccess')}</h2>
      <p>{t(lang, 'thanksForBooking')}</p>
      <div className="booking-form__total"><span>{t(lang, 'youPaid')}</span><strong>{formatMoney(booking.travelerPriceCents, currency, lang)}</strong></div>
      <div className="row-actions" style={{ justifyContent: 'center' }}>
        <Button variant="secondary" onClick={() => navigate('/orders')}>{t(lang, 'orders')}</Button>
        <Button onClick={() => navigate('/marketplace')}>{t(lang, 'marketplace')}</Button>
      </div>
    </Card>
  );

  return (
    <div>
      <h1 className="page-title">{t(lang, 'checkout')}</h1>
      <div className="checkout-grid">
        <Card title={t(lang, 'bookingForm')} subtitle={product?.title}>
          {error && <div className="form-error"><AlertCircle /> {error}</div>}
          <div className="checkout-summary">
            <div className="checkout-line"><span>{t(lang, 'guestCount')}</span><span>{booking.guests}</span></div>
            <div className="checkout-line"><span>{t(lang, 'basePrice')}</span><span>{formatMoney(booking.basePriceCents, currency, lang)}</span></div>
            {booking.sellerCommissionCents > 0 && <div className="checkout-line"><span>{t(lang, 'sellerCommission')}</span><span>{formatMoney(booking.sellerCommissionCents, currency, lang)}</span></div>}
            <div className="checkout-line checkout-line--total"><span>{t(lang, 'amount')}</span><strong>{formatMoney(booking.travelerPriceCents, currency, lang)}</strong></div>
          </div>
          <div className="payment-form">
            <Input label={t(lang, 'cardNumber')} value="4242 4242 4242 4242" readOnly />
            <div className="form-row">
              <Input label={t(lang, 'expiry')} value="12 / 30" readOnly />
              <Input label={t(lang, 'cvc')} value="123" readOnly />
            </div>
            <p className="field__hint"><CardIcon /> {t(lang, 'testCardHint')}</p>
            <Button full variant="primary" onClick={pay} disabled={processing}>{processing ? <Spinner /> : t(lang, 'payNow')}</Button>
          </div>
        </Card>
        <Card title={t(lang, 'moneySplit')}>
          <div className="checkout-summary">
            <div className="checkout-line"><span>{t(lang, 'basePrice')}</span><span>{formatMoney(booking.basePriceCents, currency, lang)}</span></div>
            <div className="checkout-line"><span>{t(lang, 'platformFee')} (5%)</span><span>{formatMoney(booking.platformFeeCents, currency, lang)}</span></div>
            <div className="checkout-line"><span>{t(lang, 'companyShare')}</span><span>{formatMoney(booking.companyShareCents, currency, lang)}</span></div>
            {booking.sellerCommissionCents > 0 && <div className="checkout-line"><span>{t(lang, 'sellerCommission')}</span><span>{formatMoney(booking.sellerShareCents, currency, lang)}</span></div>}
            <div className="checkout-line checkout-line--total"><span>{t(lang, 'amount')}</span><strong>{formatMoney(booking.travelerPriceCents, currency, lang)}</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OrdersPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/orders');
  const orders = data?.orders || [];
  const [action, setAction] = useState(null);

  async function cancel(id) {
    setAction(id);
    try { await api(`/bookings/${id}/status`, { method: 'POST', body: { status: 'cancelled' } }); reload(); }
    catch (e) { alert(e.message); }
    finally { setAction(null); }
  }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'orders')}</h1>
      {orders.length === 0 ? <Empty icon={IconCalendar} title={t(lang, 'emptyBookings')} hint={t(lang, 'emptyBookingsHint')} /> : (
        <div className="orders-list">
          {orders.map(b => (
            <Card key={b.id} title={`#${b.id} · ${b.productTitle}`} subtitle={b.companyName}>
              <div className="order-meta">
                <div><span>{formatDate(b.startDate, lang)}</span></div>
                <div className="order-price">{formatMoney(b.travelerPriceCents, currency, lang)}</div>
                <div><Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'completed' ? 'brand' : b.status === 'cancelled' ? 'error' : 'warning'} dot>{t(lang, `status.${b.status}`)}</Badge></div>
              </div>
              {b.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => cancel(b.id)} disabled={action === b.id}>{t(lang, 'cancel')}</Button>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/products?owned=1');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'tour', description: '', location: '', priceCents: '', commissionPercent: '10', commissionFixedCents: '0', imageUrl: '', duration: '', availability: 'daily', tags: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function reset() { setForm({ title: '', type: 'tour', description: '', location: '', priceCents: '', commissionPercent: '10', commissionFixedCents: '0', imageUrl: '', duration: '', availability: 'daily', tags: '' }); setEditing(null); setError(''); }

  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api(`/products/${editing}`, { method: 'PATCH', body: { ...form, priceCents: form.priceCents ? Math.round(Number(form.priceCents) * 100) : undefined, commissionPercent: form.commissionPercent ? Number(form.commissionPercent) : undefined, commissionFixedCents: form.commissionFixedCents ? Math.round(Number(form.commissionFixedCents) * 100) : undefined } });
        setToast(t(lang, 'updated'));
      } else {
        await api('/products', { method: 'POST', body: { ...form, priceCents: Math.round(Number(form.priceCents) * 100), commissionPercent: Number(form.commissionPercent), commissionFixedCents: Math.round(Number(form.commissionFixedCents) * 100) } });
        setToast(t(lang, 'saved'));
      }
      setOpen(false); reset(); reload();
    } catch (err) { setError(err.message || 'Error'); }
  }

  async function del(id) {
    if (!confirm(t(lang, 'delete'))) return;
    await api(`/products/${id}`, { method: 'DELETE' }); reload(); setToast(t(lang, 'updated'));
  }

  function startEdit(p) {
    setEditing(p.id);
    setForm({ title: p.title, type: p.type, description: p.description || '', location: p.location || '', priceCents: (p.priceCents / 100).toString(), commissionPercent: String(p.commissionPercent), commissionFixedCents: (p.commissionFixedCents / 100).toString(), imageUrl: p.imageUrl || '', duration: p.duration || '', availability: p.availability || 'daily', tags: p.tags || '' });
    setOpen(true);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t(lang, 'products')}</h1>
          <p className="page-subtitle">{t(lang, 'addProduct')}</p>
        </div>
        <div className="row-actions">
          <Button variant="secondary" onClick={() => setAiOpen(true)} left={<Sparkles />}>{t(lang, 'writeWithAI')}</Button>
          {user.role === 'company' && <Button onClick={() => { reset(); setOpen(true); }} left={<IconPlus />}>{t(lang, 'addProduct')}</Button>}
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t(lang, 'edit') : t(lang, 'addProduct')} actions={<><Button variant="secondary" onClick={() => setOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={create}>{editing ? t(lang, 'save') : t(lang, 'create')}</Button></>}>
        <form onSubmit={create} className="product-form">
          {error && <div className="form-error"><AlertCircle /> {error}</div>}
          <div className="form-row">
            <Input label={t(lang, 'companyName')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <Select label={t(lang, 'type')} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={Object.keys(DICT.en.productTypes).map(k => ({ value: k, label: t(lang, `productTypes.${k}`) }))} />
          </div>
          <Input label={t(lang, 'location')} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
          <Textarea label={t(lang, 'bio')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="form-row">
            <Input label={t(lang, 'price')} type="number" value={form.priceCents} onChange={e => setForm({ ...form, priceCents: e.target.value })} required />
            <Input label={t(lang, 'duration')} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div className="form-row">
            <Input label={t(lang, 'commission') + ' %'} type="number" min="0" max="50" value={form.commissionPercent} onChange={e => setForm({ ...form, commissionPercent: e.target.value })} />
            <Input label={t(lang, 'commission') + ' ' + t(lang, 'fixedPerPerson')} type="number" value={form.commissionFixedCents} onChange={e => setForm({ ...form, commissionFixedCents: e.target.value })} />
          </div>
          <Input label="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          <Input label={t(lang, 'tags')} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} hint="Comma separated" />
        </form>
      </Modal>
      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title={t(lang, 'writeWithAI')}>
        <ProductAICreator onApply={(o) => { setForm(f => ({ ...f, ...o, priceCents: (o.priceCents ? o.priceCents / 100 : f.priceCents) })); setAiOpen(false); }} />
      </Modal>
      {!data?.products?.length ? <Empty icon={IconBriefcase} title={t(lang, 'emptyProducts')} hint={t(lang, 'emptyProductsHint')} actions={user.role === 'company' && <Button onClick={() => { reset(); setOpen(true); }}>{t(lang, 'addProduct')}</Button>} /> : (
        <Table columns={[{ label: t(lang, 'companyName'), key: 'title' }, { label: t(lang, 'type'), key: 'type' }, { label: t(lang, 'location'), key: 'location' }, { label: t(lang, 'price'), numeric: true, key: 'price' }, { label: t(lang, 'commission'), numeric: true, key: 'commission' }, { label: '', key: 'actions' }]}
          rows={data.products} renderCell={(row, key) => {
            if (key === 'price') return formatMoney(row.priceCents, currency, lang);
            if (key === 'commission') return row.commissionPercent ? `${row.commissionPercent}%` : formatMoney(row.commissionFixedCents, currency, lang);
            if (key === 'type') return t(lang, `productTypes.${row.type}`);
            if (key === 'actions') return <div className="row-actions"><Button size="sm" variant="ghost" onClick={() => startEdit(row)}><Edit /></Button><Button size="sm" variant="destructive" onClick={() => del(row.id)}><Trash /></Button></div>;
            return row[key];
          }} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function ProductAICreator({ onApply }) {
  const { lang } = React.useContext(GlobalCtx);
  const [type, setType] = useState('tour');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [highlights, setHighlights] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true); setError(''); setOutput(null);
    try {
      const data = await api('/ai/product-write', { method: 'POST', body: { type, location, priceCents: Math.round(Number(price || 0) * 100), duration, highlights, lang } });
      setOutput(data.parsed || data.text);
    } catch (err) { setError(err.message || 'AI error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="ai-form">
      {error && <div className="form-error"><AlertCircle /> {error}</div>}
      <Select label={t(lang, 'type')} value={type} onChange={e => setType(e.target.value)} options={Object.keys(DICT.en.productTypes).map(k => ({ value: k, label: t(lang, `productTypes.${k}`) }))} />
      <Input label={t(lang, 'location')} value={location} onChange={e => setLocation(e.target.value)} />
      <Input label={t(lang, 'price')} type="number" value={price} onChange={e => setPrice(e.target.value)} />
      <Input label={t(lang, 'duration')} value={duration} onChange={e => setDuration(e.target.value)} />
      <Textarea label={t(lang, 'bio')} value={highlights} onChange={e => setHighlights(e.target.value)} />
      <Button onClick={generate} disabled={loading}>{loading ? <Spinner /> : t(lang, 'generate')}</Button>
      {output && (
        <div className="ai-output">
          <h4>{output.title}</h4>
          <p>{output.description}</p>
          <div className="row-actions">
            <Button size="sm" onClick={() => onApply({ title: output.title, description: output.description, tags: output.tags, type, location, priceCents: Math.round(Number(price || 0) * 100), duration })}>{t(lang, 'apply')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/bookings');
  const [updating, setUpdating] = useState(null);

  async function changeStatus(id, status) {
    setUpdating(id + status);
    try { await api(`/bookings/${id}/status`, { method: 'POST', body: { status } }); reload(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  }

  async function capturePayment(b) {
    if (!b.paymentIntentId) return;
    setUpdating('cap' + b.id);
    try { await api(`/payments/${b.paymentIntentId}/capture`, { method: 'POST' }); reload(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  }

  const columns = user.role === 'admin' ? [
    { label: 'ID' }, { label: t(lang, 'products') }, { label: t(lang, 'companyName') }, { label: t(lang, 'amount'), numeric: true }, { label: t(lang, 'status') }, { label: '' }
  ] : [
    { label: 'ID' }, { label: t(lang, 'products') }, { label: t(lang, 'amount'), numeric: true }, { label: t(lang, 'status') }, { label: '' }
  ];

  return (
    <div>
      <h1 className="page-title">{t(lang, 'bookings')}</h1>
      {!data?.bookings?.length ? <Empty icon={IconCalendar} title={t(lang, 'emptyBookings')} hint={t(lang, 'emptyBookingsHint')} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{columns.map(c => <th key={c.label} className={c.numeric ? 'num' : ''}>{c.label}</th>)}</tr></thead>
            <tbody>{data.bookings.map(b => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.productTitle}</td>
                {user.role === 'admin' && <td>{b.companyName}</td>}
                <td className="num">{formatMoney(b.travelerPriceCents, currency, lang)}</td>
                <td><Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'completed' ? 'brand' : b.status === 'cancelled' ? 'error' : 'warning'} dot>{t(lang, `status.${b.status}`)}</Badge></td>
                <td>
                  <div className="row-actions">
                    {(user.role === 'company' || user.role === 'admin' || user.role === 'supplier') && b.status !== 'cancelled' && (
                      <>
                        {b.status === 'pending' && <Button size="sm" onClick={() => changeStatus(b.id, 'confirmed')} disabled={updating === b.id + 'confirmed'}>{t(lang, 'confirm')}</Button>}
                        {b.status === 'confirmed' && <Button size="sm" onClick={() => changeStatus(b.id, 'completed')} disabled={updating === b.id + 'completed'}>{t(lang, 'complete')}</Button>}
                        {b.status === 'confirmed' && b.paymentIntentStatus === 'succeeded' && <Button size="sm" variant="primary" onClick={() => capturePayment(b)} disabled={updating === 'cap' + b.id}>{t(lang, 'completeCapture')}</Button>}
                        {b.status !== 'completed' && b.status !== 'cancelled' && <Button size="sm" variant="destructive" onClick={() => changeStatus(b.id, 'cancelled')} disabled={updating === b.id + 'cancelled'}>{t(lang, 'cancel')}</Button>}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {updating && <div className="overlay"><Spinner /></div>}
    </div>
  );
}

function SellersPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/sellers');
  const [toast, setToast] = useState('');
  if (user.role !== 'company' && user.role !== 'admin') return <Empty title={t(lang, 'noResults')} />;
  return (
    <div>
      <h1 className="page-title">{t(lang, 'sellers')}</h1>
      {!data?.sellers?.length ? <Empty icon={IconUsers} title={t(lang, 'emptySellers')} hint={t(lang, 'emptySellersHint')} /> : (
        <Table columns={[{ label: t(lang, 'name'), key: 'name' }, { label: t(lang, 'email'), key: 'email' }, { label: t(lang, 'sellerCode'), key: 'code' }, { label: t(lang, 'bookingsCount'), key: 'bookingsCount' }, { label: t(lang, 'earnings'), numeric: true, key: 'earnings' }]}
          rows={data.sellers} renderCell={(row, key) => {
            if (key === 'code') return <button className="link" onClick={async () => { await navigator.clipboard.writeText(`${location.origin}${location.pathname}#/marketplace?ref=${row.code}`); setToast(t(lang, 'linkCopied')); }}>{row.code}</button>;
            if (key === 'earnings') return formatMoney(row.earningsCents, currency, lang);
            return row[key];
          }} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function LedgerPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }] = useFetch('/ledger');
  return (
    <div>
      <h1 className="page-title">{t(lang, 'ledger')}</h1>
      {!data?.ledger?.length ? <Empty icon={IconDollar} title={t(lang, 'emptyLedger')} hint={t(lang, 'emptyLedgerHint')} /> : (
        <Table columns={[{ label: t(lang, 'date'), key: 'date' }, { label: t(lang, 'bookings'), key: 'booking' }, { label: t(lang, 'amount'), numeric: true, key: 'amount' }, { label: t(lang, 'status'), key: 'status' }]}
          rows={data.ledger} renderCell={(row, key) => {
            if (key === 'date') return formatDate(row.createdAt, lang);
            if (key === 'amount') return formatMoney(row.amountCents, currency, lang);
            if (key === 'status') return <Badge tone={row.status === 'available' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral'} dot>{row.status}</Badge>;
            return row.bookingId ? `#${row.bookingId}` : '-';
          }} />
      )}
    </div>
  );
}

function PayoutsPage({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/payouts');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  async function request(e) {
    e.preventDefault();
    setError('');
    try { await api('/payouts', { method: 'POST', body: { amountCents: Math.round(Number(amount) * 100) } }); setAmount(''); reload(); }
    catch (e) { setError(e.message); }
  }

  async function markPaid(id) { await api(`/payouts/${id}/paid`, { method: 'POST' }); reload(); }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'payouts')}</h1>
      {(user.role === 'company' || user.role === 'seller' || user.role === 'supplier') && (
        <Card title={t(lang, 'requestPayout')} className="mb-4">
          {error && <div className="form-error"><AlertCircle /> {error}</div>}
          <form onSubmit={request} className="payout-form">
            <Input label={t(lang, 'amount')} type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            <Button type="submit">{t(lang, 'requestPayout')}</Button>
          </form>
        </Card>
      )}
      {!data?.payouts?.length ? <Empty icon={IconDollar} title={t(lang, 'emptyPayouts')} hint={t(lang, 'emptyPayoutsHint')} /> : (
        <Table columns={[{ label: t(lang, 'date'), key: 'date' }, { label: t(lang, 'amount'), numeric: true, key: 'amount' }, { label: t(lang, 'status'), key: 'status' }, { label: '', key: 'actions' }]}
          rows={data.payouts} renderCell={(row, key) => {
            if (key === 'date') return formatDate(row.createdAt, lang);
            if (key === 'amount') return formatMoney(row.amountCents, currency, lang);
            if (key === 'status') return <Badge tone={row.status === 'paid' ? 'success' : 'warning'} dot>{row.status === 'paid' ? t(lang, 'approved') : t(lang, 'pendingApproval')}</Badge>;
            if (user.role === 'admin' && row.status === 'requested') return <Button size="sm" onClick={() => markPaid(row.id)}>{t(lang, 'markPaid')}</Button>;
            return null;
          }} />
      )}
    </div>
  );
}

function SettingsPage({ user, onUpdate }) {
  const { lang } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/me');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user.name, companyName: '', taxId: '', phone: '', website: '', bio: '' });
  const [toast, setToast] = useState('');

  useEffect(() => { if (data?.profile) setForm(f => ({ ...f, ...data.profile })); }, [data]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    await api('/me', { method: 'POST', body: form });
    setSaving(false);
    setToast(t(lang, 'saved'));
    onUpdate({ ...user, name: form.name });
  }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'settings')}</h1>
      <Card>
        <form onSubmit={save} className="settings-form">
          <Input label={t(lang, 'name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          {(user.role === 'company' || user.role === 'supplier') && (
            <>
              <Input label={t(lang, 'companyName')} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <Input label={t(lang, 'taxId')} value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} />
              <Input label={t(lang, 'phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label={t(lang, 'website')} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              <Textarea label={t(lang, 'bio')} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </>
          )}
          <Button type="submit" disabled={saving}>{saving ? <Spinner /> : t(lang, 'save')}</Button>
        </form>
      </Card>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function SellerProducts({ user }) {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [{ data }] = useFetch('/products');
  const [links, setLinks] = useState({});
  const [toast, setToast] = useState('');
  const products = data?.products || [];

  async function getLink(p) {
    const res = await api(`/products/${p.id}/link`, { method: 'POST' });
    setLinks(l => ({ ...l, [p.id]: res.link }));
    await navigator.clipboard.writeText(res.link);
    setToast(t(lang, 'linkCopied'));
  }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'products')}</h1>
      <div className="product-grid product-grid--compact">
        {products.map(p => (
          <Card key={p.id} title={p.title} subtitle={p.companyName} actions={
            <Button size="sm" onClick={() => getLink(p)}>{links[p.id] ? t(lang, 'copyLink') : t(lang, 'getLink')}</Button>
          }>
            <p>{formatMoney((p.travelerPriceCents ?? p.priceCents), currency, lang)} / {t(lang, 'perPerson')}</p>
            <p>{p.location}</p>
            {links[p.id] && <p className="field__hint"><a className="link" href={links[p.id]}>{links[p.id]}</a></p>}
          </Card>
        ))}
      </div>
      {!products.length && <Empty icon={IconBriefcase} title={t(lang, 'noResults')} hint={t(lang, 'emptyProductsHint')} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function SellerAIPage() {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [category, setCategory] = useState('all');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const catOptions = [{ value: 'all', label: t(lang, 'all') }, ...Object.keys(DICT.en.productTypes).map(k => ({ value: k, label: t(lang, `productTypes.${k}`) }))];

  async function search() {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api('/ai/seller-offer', { method: 'POST', body: { category: category === 'all' ? undefined : category, destination, lang } });
      setResult(data);
    } catch (err) { setError(err.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'offerFinder')}</h1>
      <Card>
        <div className="filters__row">
          <Select value={category} onChange={e => setCategory(e.target.value)} options={catOptions} />
          <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder={t(lang, 'location')} />
          <Button onClick={search} disabled={loading}>{loading ? <Spinner /> : t(lang, 'search')}</Button>
        </div>
        {error && <div className="form-error"><AlertCircle /> {error}</div>}
      </Card>
      {result?.aiText && <Card className="ai-card" title={t(lang, 'aiAssistant')}><div className="ai-text">{result.aiText}</div></Card>}
      {result && (
        <>
          <h3 className="page-subtitle">{t(lang, 'topOffers')}</h3>
          {result.products.length === 0 ? <Empty title={t(lang, 'noOffers')} /> : (
            <div className="product-grid product-grid--compact">
              {result.products.map(p => (
                <Card key={p.id} title={p.title} subtitle={`${p.companyName} · ${p.location}`}>
                  <p>{formatMoney(p.travelerPriceCents, currency, lang)} / {t(lang, 'perPerson')}</p>
                  <Badge tone="success">{t(lang, 'estimatedProfit')}: {formatMoney(p.profitPerBookingCents, currency, lang)}</Badge>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TripPlannerPage() {
  const { lang, currency } = React.useContext(GlobalCtx);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true); setPlan(''); setError('');
    try {
      const data = await api('/ai/trip-plan', { method: 'POST', body: { destination, days: Number(days), budgetCents: budget ? Math.round(Number(budget) * 100) : undefined, currency, lang } });
      setPlan(data.text);
    } catch (err) { setError(err.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className="page-title">{t(lang, 'tripPlanner')}</h1>
      <Card>
        <div className="filters__row">
          <Input label={t(lang, 'destination')} value={destination} onChange={e => setDestination(e.target.value)} />
          <Input label={t(lang, 'days')} type="number" min="1" max="14" value={days} onChange={e => setDays(e.target.value)} />
          <Input label={t(lang, 'budget')} type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder={currency} />
          <Button onClick={generate} disabled={loading || !destination}>{loading ? <Spinner /> : t(lang, 'generatePlan')}</Button>
        </div>
        {error && <div className="form-error"><AlertCircle /> {error}</div>}
      </Card>
      {plan && <Card title={t(lang, 'aiPlanTitle')}><div className="ai-text">{plan}</div></Card>}
    </div>
  );
}

function AIToolsPage() {
  const { lang } = React.useContext(GlobalCtx);
  const [tab, setTab] = useState('writer');
  return (
    <div>
      <h1 className="page-title">{t(lang, 'aiTools')}</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'writer' ? 'tab--active' : ''}`} onClick={() => setTab('writer')}>{t(lang, 'productWriter')}</button>
        <button className={`tab ${tab === 'translate' ? 'tab--active' : ''}`} onClick={() => setTab('translate')}>{t(lang, 'translate')}</button>
      </div>
      {tab === 'writer' ? <ProductAICreator onApply={() => {}} /> : <Translator />}
    </div>
  );
}

function Translator() {
  const { lang } = React.useContext(GlobalCtx);
  const [text, setText] = useState('');
  const [target, setTarget] = useState('ar');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function translate() {
    setLoading(true); setResult(''); setError('');
    try {
      const data = await api('/ai/translate', { method: 'POST', body: { text, targetLang: target } });
      setResult(data.text);
    } catch (err) { setError(err.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <Card>
      <div className="ai-form">
        <Select label={t(lang, 'language')} value={target} onChange={e => setTarget(e.target.value)} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }, { value: 'it', label: 'Italiano' }]} />
        <Textarea label={t(lang, 'originalText')} value={text} onChange={e => setText(e.target.value)} />
        <Button onClick={translate} disabled={loading || !text}>{loading ? <Spinner /> : t(lang, 'translateNow')}</Button>
        {error && <div className="form-error"><AlertCircle /> {error}</div>}
        {result && <Textarea label={t(lang, 'translatedText')} value={result} readOnly onChange={() => {}} />}
      </div>
    </Card>
  );
}

function ConnectorsPage({ user }) {
  const { lang } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/connectors');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'hotel', provider: 'sandbox', config: '{}' });
  const [testing, setTesting] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [toast, setToast] = useState('');

  async function add(e) {
    e.preventDefault();
    await api('/connectors', { method: 'POST', body: form });
    setOpen(false); reload(); setToast(t(lang, 'saved'));
  }

  async function del(id) { if (confirm(t(lang, 'delete'))) { await api(`/connectors/${id}`, { method: 'DELETE' }); reload(); setToast(t(lang, 'updated')); } }

  async function test(c) {
    setTesting(c.id);
    const res = await api(`/connectors/${c.id}/search`, { method: 'POST', body: { destination: 'Rome', guests: 2 } });
    setTestResults(res.results); setTesting(null);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t(lang, 'connectors')}</h1>
          <p className="page-subtitle">{t(lang, 'connectorHint')}</p>
        </div>
        {(user.role === 'supplier' || user.role === 'company') && <Button onClick={() => setOpen(true)} left={<IconPlus />}>{t(lang, 'addConnector')}</Button>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={t(lang, 'addConnector')} actions={<><Button variant="secondary" onClick={() => setOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={add}>{t(lang, 'create')}</Button></>}>
        <div className="product-form">
          <Input label={t(lang, 'connectorName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Select label={t(lang, 'type')} value={form.type} onChange={e => setForm({ ...form, type: e.target.value, provider: data?.providers[e.target.value]?.[0] || 'sandbox' })} options={(data?.types || ['hotel','flight','transport','activity']).map(k => ({ value: k, label: t(lang, `productTypes.${k}`) || k }))} />
          {form.type && <Select label={t(lang, 'provider')} value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} options={(data?.providers?.[form.type] || ['sandbox']).map(p => ({ value: p, label: p }))} />}
          <Textarea label={t(lang, 'config')} value={form.config} onChange={e => setForm({ ...form, config: e.target.value })} />
        </div>
      </Modal>
      {testResults && (
        <Modal open={!!testResults} onClose={() => setTestResults(null)} title={t(lang, 'searchResults')}>
          <div className="connector-results">
            {testResults.results.map(r => (
              <Card key={r.id} title={r.title}>
                <p>{r.location}</p>
                <Badge tone="brand">{formatMoney(r.priceCents, 'USD')}</Badge>
              </Card>
            ))}
          </div>
        </Modal>
      )}
      {!data?.connectors?.length ? <Empty icon={BoxStack} title={t(lang, 'noConnectors')} hint={t(lang, 'connectorHint')} actions={(user.role === 'supplier' || user.role === 'company') && <Button onClick={() => setOpen(true)}>{t(lang, 'addConnector')}</Button>} /> : (
        <div className="product-grid product-grid--compact">
          {data.connectors.map(c => (
            <Card key={c.id} title={c.name} subtitle={`${c.type} · ${c.provider}`} actions={
              <div className="row-actions">
                <Button size="sm" variant="secondary" onClick={() => test(c)} disabled={testing === c.id}>{testing === c.id ? <Spinner /> : t(lang, 'testConnector')}</Button>
                {(user.role === 'admin' || user.role === 'supplier' || user.role === 'company') && <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash /></Button>}
              </div>
            }>
              <Badge tone={c.status === 'active' ? 'success' : 'neutral'} dot>{t(lang, c.status)}</Badge>
            </Card>
          ))}
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function AdminCompanies() {
  const { lang } = React.useContext(GlobalCtx);
  const [{ data }, reload] = useFetch('/admin/companies');
  async function approve(id) { await api(`/admin/companies/${id}/approve`, { method: 'POST' }); reload(); }
  async function reject(id) { await api(`/admin/companies/${id}/reject`, { method: 'POST' }); reload(); }
  return (
    <div>
      <h1 className="page-title">{t(lang, 'companies')}</h1>
      {!data?.companies?.length ? <Empty title={t(lang, 'noResults')} /> : (
        <Table columns={[{ label: t(lang, 'companyName'), key: 'name' }, { label: t(lang, 'email'), key: 'email' }, { label: t(lang, 'status'), key: 'status' }, { label: '', key: 'actions' }]}
          rows={data.companies} renderCell={(row, key) => {
            if (key === 'status') return <Badge tone={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'} dot>{row.status}</Badge>;
            if (key === 'actions') return row.status === 'pending' ? <><Button size="sm" onClick={() => approve(row.id)}>{t(lang, 'approve')}</Button> <Button size="sm" variant="destructive" onClick={() => reject(row.id)}>{t(lang, 'reject')}</Button></> : null;
            return row[key];
          }} />
      )}
    </div>
  );
}

function AdminUsers() {
  const { lang } = React.useContext(GlobalCtx);
  const [{ data }] = useFetch('/admin/users');
  return (
    <div>
      <h1 className="page-title">{t(lang, 'users')}</h1>
      <Table columns={[{ label: t(lang, 'name'), key: 'name' }, { label: t(lang, 'email'), key: 'email' }, { label: t(lang, 'role'), key: 'role' }, { label: t(lang, 'sellerCode'), key: 'sellerCode' }]}
        rows={data?.users || []} renderCell={(row, key) => row[key]} />
    </div>
  );
}

// --- App ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const global = useGlobal();
  const { lang } = global;
  const router = useRouter('/');

  useEffect(() => {
    api('/me')
      .then(d => { setUser(d.user); setLoading(false); setReady(true); })
      .catch(() => { setUser(null); setLoading(false); setReady(true); });
  }, []);

  function onLogin(data) { setUser(data.user); location.hash = '#/'; }

  const { path, push, params } = router;
  let content;
  if (!ready || loading) content = <div className="splash"><Spinner /></div>;
  else if (!user) content = <AuthRaw onLogin={onLogin} />;
  else {
    const first = params.parts[0] || '';
    if (first === 'marketplace') content = <Marketplace user={user} />;
    else if (path === '/') content = <Dashboard user={user} />;
    else if (first === 'products') {
      if (params.parts[1]) content = <ProductDetail id={params.parts[1]} user={user} navigate={push} />;
      else if (user.role === 'seller') content = <SellerProducts user={user} />;
      else content = <ProductsPage user={user} />;
    }
    else if (first === 'checkout' && params.parts[1]) content = <CheckoutPage id={params.parts[1]} navigate={push} />;
    else if (first === 'orders') content = <OrdersPage user={user} />;
    else if (first === 'bookings') content = <BookingsPage user={user} />;
    else if (first === 'sellers') content = <SellersPage user={user} />;
    else if (first === 'ledger') content = <LedgerPage user={user} />;
    else if (first === 'payouts') content = <PayoutsPage user={user} />;
    else if (first === 'settings') content = <SettingsPage user={user} onUpdate={u => setUser(u)} />;
    else if (first === 'connectors') content = <ConnectorsPage user={user} />;
    else if (first === 'trip-planner') content = <TripPlannerPage />;
    else if (first === 'seller' && params.parts[1] === 'products') content = <SellerProducts user={user} />;
    else if (first === 'seller' && params.parts[1] === 'ai') content = <SellerAIPage />;
    else if (first === 'ai-tools') content = <AIToolsPage />;
    else if (first === 'admin') {
      if (params.parts[1] === 'companies') content = <AdminCompanies />;
      else if (params.parts[1] === 'users') content = <AdminUsers />;
      else if (params.parts[1] === 'bookings') content = <BookingsPage user={user} />;
      else if (params.parts[1] === 'payouts') content = <PayoutsPage user={user} />;
      else content = <AdminCompanies />;
    }
    else content = <Dashboard user={user} />;
  }

  return (
    <GlobalCtx.Provider value={global}>
      {user ? <Shell user={user} onLogout={() => api('/auth/logout', { method: 'POST' }).then(() => setUser(null))}>
        <div className="page">{content}</div>
      </Shell> : content}
    </GlobalCtx.Provider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
