import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Star, ShieldCheck, Trophy, Users, Image as ImageIcon, Building2, ExternalLink } from 'lucide-react';
import ProjectCard from '@/src/components/ui/ProjectCard';
import { PROJECTS as STATIC_PROJECTS } from '@/src/constants';
import { Project } from '@/src/types';
import { projectService } from '@/src/services/projectService';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { EditableImage } from '@/src/components/ui/EditableImage';
import { EditableText } from '@/src/components/ui/EditableText';
import { useAdmin } from '@/src/services/adminHook';
import { cmsService } from '@/src/services/cmsService';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Home() {
  const { isAdmin } = useAdmin();
  const { language, t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState('/api/attachment/input_file_0.png');
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);

  useEffect(() => {
    // CMS Global sync for Logo
    const unsubscribeCMS = cmsService.subscribeToContent('site_logo', (value) => {
      if (value) setLogoUrl(value);
    });

    // Real-time projects
    const unsubscribeProjects = projectService.subscribeToProjects((data) => {
      if (data.length > 0) setProjects(data);
    });

    return () => {
      unsubscribeCMS();
      unsubscribeProjects();
    };
  }, []);

  const featuredProjects = projects.slice(0, 3);

  const handleLogoChange = async () => {
    const newUrl = prompt(t('يرجى إدخال رابط اللوجو الجديد:', 'Please enter new logo URL:'), logoUrl);
    if (newUrl && newUrl !== logoUrl) {
      try {
        await cmsService.saveContent('site_logo', newUrl);
        setLogoUrl(newUrl);
      } catch (err) {
        console.error("Failed to update logo", err);
        alert(t("حدث خطأ أثناء تحديث اللوجو", "Error updating logo"));
      }
    }
  };

  const stats = [
    { labelAr: 'مشروع منفذ', labelEn: 'Completed Projects', key: 'stat_projects', value: '+١٥', icon: Building2 },
    { labelAr: 'عميل سعيد', labelEn: 'Happy Clients', key: 'stat_clients', value: '+٢٠٠٠', icon: Users },
    { labelAr: 'سنوات خبرة', labelEn: 'Years Experience', key: 'stat_years', value: '+١٠', icon: Trophy },
    { labelAr: 'موقع استراتيجي', labelEn: 'Strategic Locations', key: 'stat_locations', value: '٥٠', icon: ShieldCheck },
  ];

  const benefits = [
    { ar: 'تصاميم معمارية عالمية ومعايير جودة فائقة', en: 'World-class architectural designs and superior quality standards', key: 'benefit_1' },
    { ar: 'مواقع استراتيجية في أهم مناطق القاهرة والمناطق الحيوية', en: 'Strategic locations in Cairo\'s most important and vital areas', key: 'benefit_2' },
    { ar: 'أنظمة سداد مرنة تصل لـ ٨ سنوات بدون فوائد', en: 'Flexible payment systems up to 8 years without interest', key: 'benefit_3' },
    { ar: 'خدمة ما بعد البيع وإدارة متميزة للمشروعات', en: 'Outstanding after-sales service and project management', key: 'benefit_4' },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EditableImage 
            contentKey="home_hero_bg"
            defaultImage="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1920"
            className="w-full h-full brightness-[0.3]"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
          <div className="relative group overflow-visible">
            <motion.div 
              animate={{
                boxShadow: ["0 0 50px rgba(255,255,255,0.2)", "0 0 80px rgba(212,175,55,0.4)", "0 0 50px rgba(255,255,255,0.2)"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ 
                scale: 1.02,
                rotateY: 8,
                rotateX: -4,
                z: 30,
                boxShadow: "0 25px 80px rgba(212,175,55,0.5)"
              }}
              className="p-6 md:p-10 rounded-[3rem] mb-12 transform transition-all duration-700 cursor-pointer bg-transparent"
              style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
            >
              <EditableImage 
                contentKey="site_logo"
                defaultImage={logoUrl}
                aspectRatio="logo"
                className="h-48 md:h-80 w-auto drop-shadow-2xl"
                style={{ mixBlendMode: 'multiply' }}
              />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            <EditableText 
              contentKey="home_hero_title" 
              defaultText={t("شركة أورم للتطوير العقاري", "AURUM Real Estate Development")} 
            />
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-aurum-gold mb-10 font-light"
          >
            <EditableText 
              contentKey="home_hero_sub" 
              defaultText={t("نصنع الفخامة في كل تفصيلة - مشروعاتنا وجهتك الأمثل للسكن والاستثمار", "Crafting luxury in every detail - our projects are your ideal destination for living and investment")} 
            />
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button 
              as={Link}
              to="/projects" 
              variant="gold"
              size="xl"
            >
              {t("تصفح المشاريع", "Browse Projects")}
            </Button>
            <Button 
              as={Link}
              to="/broker-register"
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white hover:text-aurum-navy"
            >
              {t("تسجيل بروكر", "Broker Registration")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 border border-aurum-gold/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex p-3 rounded-xl bg-aurum-cream text-aurum-gold mb-4">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-bold text-aurum-navy mb-1">
                <EditableText contentKey={stat.key} defaultText={stat.value} />
              </div>
              <div className="text-gray-500 text-sm">
                <EditableText contentKey={`${stat.key}_label`} defaultText={language === 'ar' ? stat.labelAr : stat.labelEn} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-aurum-navy mb-4">
            <EditableText contentKey="home_projects_title" defaultText={t("أبرز المشاريع", "Featured Projects")} />
          </h2>
          <div className="h-1.5 w-24 bg-aurum-gold mx-auto rounded-full mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            <EditableText 
              contentKey="home_projects_sub" 
              defaultText={t("نقدم باقة من أرقى المشاريع العقارية المصممة بعناية لتلبي طموحات عملائنا في السكن العصري والاستثمار الناجح.", "We offer a range of the finest real estate projects carefully designed to meet our clients' ambitions for modern housing and successful investment.")} 
            />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/projects" className="inline-flex items-center gap-2 text-aurum-gold font-bold hover:underline">
            {t("عرض كافة المشاريع", "View All Projects")}
            <ExternalLink size={20} className="rtl:rotate-0 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-aurum-navy text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-serif font-bold mb-8">
              <EditableText contentKey="home_why_title" defaultText={t("لماذا تختار أورم؟", "Why Choose AURUM?")} />
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-aurum-gold/20 p-1.5 rounded-full mt-1">
                    <CheckCircle2 className="text-aurum-gold w-5 h-5" />
                  </div>
                  <div className="text-lg text-white/90 leading-relaxed font-light">
                    <EditableText contentKey={benefit.key} defaultText={language === 'ar' ? benefit.ar : benefit.en} />
                  </div>
                </motion.div>
              ))}
            </div>
            <Button 
              as={Link}
              to="/about"
              variant="gold"
            >
               {t("اعرف المزيد عنا", "Learn More About Us")}
            </Button>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -inset-4 border border-aurum-gold/30 rounded-2xl transform rotate-3" />
            <EditableImage 
              contentKey="home_benefits_img"
              defaultImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
              className="rounded-2xl shadow-2xl relative z-10 brightness-75 aspect-video md:aspect-auto h-full"
            />
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-24 bg-white px-4 border-t border-aurum-gold/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-aurum-navy mb-4">{t("معرض الميديا", "Media Gallery")}</h2>
              <div className="h-1.5 w-20 bg-aurum-gold rounded-full" />
            </div>
            <Link to="/gallery" className="text-aurum-gold font-bold hover:underline flex items-center gap-2">
              {t("عرض المعرض الكامل", "View Full Gallery")}
              <ImageIcon size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {projects.slice(0, 4).map((p, i) => (
                <Link to="/gallery" key={i} className={cn(
                  "relative rounded-2xl overflow-hidden group aspect-square bg-gradient-to-br from-aurum-navy to-aurum-gold/30",
                  i === 0 && "md:col-span-2 md:row-span-2 aspect-auto"
                )}>
                  <img 
                    src={p.image} 
                    alt={language === 'ar' ? p.titleAr : p.titleEn} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-aurum-navy/20 group-hover:bg-aurum-navy/40 transition-colors" />
                </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-aurum-navy mb-16">{t("ماذا يقول عملاؤنا", "What Our Clients Say")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 bg-aurum-cream rounded-2xl border border-aurum-gold/10">
                <div className="flex gap-1 text-aurum-gold mb-4 justify-center">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                </div>
                <p className="italic text-gray-700 mb-6">
                  {t(
                    '"فريق عمل محترف ومشروعات تفوق التوقعات من حيث الجودة والالتزام بمواعيد التسليم."', 
                    '"A professional team and projects that exceed expectations in terms of quality and commitment to delivery schedules."'
                  )}
                </p>
                <div className="font-bold text-aurum-navy">{t("أحمد محمد", "Ahmed Mohamed")}</div>
                <div className="text-sm text-gray-500">{t("مستثمر عقاري", "Real Estate Investor")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
