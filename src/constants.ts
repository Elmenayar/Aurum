import { Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    titleAr: 'أورم نيو كابيتال',
    titleEn: 'AURUM New Capital',
    locationAr: 'العاصمة الإدارية الجديدة - منطقة R7',
    locationEn: 'New Administrative Capital - R7',
    price: 'تبدأ من 4,500,000 ج.م',
    type: 'residential',
    image: 'https://picsum.photos/seed/aurum1/1200/800',
    gallery: [
      'https://picsum.photos/seed/aurum1_1/1200/800',
      'https://picsum.photos/seed/aurum1_2/1200/800',
      'https://picsum.photos/seed/aurum1_3/1200/800',
      'https://picsum.photos/seed/aurum1_4/1200/800'
    ],
    descriptionAr: 'تجربة سكنية فريدة تجمع بين الرقي والتصاميم العصرية في قلب العاصمة الإدارية الجديدة.',
    paymentPlanAr: 'مقدم 10% وتقسيط حتى 8 سنوات.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    brochureUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coordinates: { lat: 30.0131, lng: 31.7454 }
  },
  {
    id: '2',
    titleAr: 'أورم بيزنس بارك',
    titleEn: 'AURUM Business Park',
    locationAr: 'القاهرة الجديدة - التجمع الخامس',
    locationEn: 'New Cairo - 5th Settlement',
    price: 'تبدأ من 3,500,000 ج.م',
    type: 'office',
    image: 'https://picsum.photos/seed/aurum2/1200/800',
    gallery: [
      'https://picsum.photos/seed/aurum2_1/1200/800',
      'https://picsum.photos/seed/aurum2_2/1200/800',
      'https://picsum.photos/seed/aurum2_3/1200/800'
    ],
    descriptionAr: 'مكاتب إدارية فاخرة بتصاميم عصرية مجهزة بأحدث التقنيات لضمان بيئة عمل مثالية وإنتاجية عالية.',
    paymentPlanAr: 'مقدم 10% وتقسيط حتى 7 سنوات.',
    coordinates: { lat: 30.0299, lng: 31.4748 }
  },
  {
    id: '3',
    titleAr: 'أورم ووك مول',
    titleEn: 'AURUM Walk Mall',
    locationAr: 'الشيخ زايد - طريق وصلة دهشور',
    locationEn: 'Sheikh Zayed - Waslet Dahshur Road',
    price: 'تبدأ من 2,800,000 ج.م',
    type: 'retail',
    image: 'https://picsum.photos/seed/aurum3/1200/800',
    gallery: [
      'https://picsum.photos/seed/aurum3_1/1200/800',
      'https://picsum.photos/seed/aurum3_2/1200/800',
      'https://picsum.photos/seed/aurum3_3/1200/800',
      'https://picsum.photos/seed/aurum3_4/1200/800',
      'https://picsum.photos/seed/aurum3_5/1200/800'
    ],
    descriptionAr: 'وجهة تسوق عالمية تضم أرقى العلامات التجارية والمطاعم الفاخرة.',
    paymentPlanAr: 'مقدم 20% وتقسيط حتى 5 سنوات.',
    coordinates: { lat: 30.0460, lng: 31.0020 }
  },
  {
    id: '4',
    titleAr: 'أورم ريزيدنس - تحت الإنشاء',
    titleEn: 'AURUM Residence - Under Construction',
    locationAr: 'الشيخ زايد - التوسعات الشرقية',
    locationEn: 'Sheikh Zayed - Eastern Expansions',
    price: 'تبدأ من 3,800,000 ج.م',
    type: 'residential',
    image: 'https://picsum.photos/seed/aurum-const/1200/800',
    gallery: [
      'https://picsum.photos/seed/aurum-const1/1200/800',
      'https://picsum.photos/seed/aurum-const2/1200/800'
    ],
    descriptionAr: 'مشروع سكني متكامل يجمع بين الخصوصية والرقي في أحد أميز مواقع الشيخ زايد، جاري العمل حالياً على التنفيذ بأعلى المعايير.',
    paymentPlanAr: 'مقدم 5% وتقسيط حتى 10 سنوات بمناسبة فترة الإنشاء.',
    isUnderConstruction: true
  }
];
