import { Broker } from '../types';

export const MOCK_BROKERS: Broker[] = [
  {
    id: '1',
    brokerName: 'أحمد محمود',
    companyName: 'النيل للعقارات',
    email: 'ahmed@nile.com',
    phone: '01012345678',
    notes: 'مهتم بمشروع العاصمة الإدارية',
    source: 'website',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    brokerName: 'سارة علي',
    companyName: 'إيجيبت هومز',
    email: 'sara@homes.com',
    phone: '01122334455',
    notes: 'شريك استراتيجي',
    source: 'excel_import',
    status: 'VIP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    brokerName: 'محمد حسن',
    companyName: 'الرواد العقارية',
    email: 'hassan@roaad.com',
    phone: '01234567890',
    notes: 'جديد',
    source: 'google_sheet_import',
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    brokerName: 'خالد عبد الرحمن',
    companyName: 'العقارية الدولية',
    email: 'khalid@intl-realestate.com',
    phone: '01555667788',
    notes: 'خبير في مشروعات الشيخ زايد',
    source: 'excel_import',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    brokerName: 'ليلى يوسف',
    companyName: 'بريميير للاستثمار',
    email: 'layla@premier.com',
    phone: '01099887766',
    notes: 'عملاء VIP فقط',
    source: 'website',
    status: 'VIP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
