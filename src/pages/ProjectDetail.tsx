import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS as STATIC_PROJECTS } from '@/src/constants';
import { Project } from '@/src/types';
import { projectService } from '@/src/services/projectService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { EditableImage } from '@/src/components/ui/EditableImage';
import { EditableText } from '@/src/components/ui/EditableText';
import { ShareModal } from '@/src/components/ui/ShareModal';
import { BookingModal } from '@/src/components/ui/BookingModal';
import { GoogleMapEmbed } from '@/src/components/ui/GoogleMapEmbed';
import { EditableCoordinates } from '@/src/components/ui/EditableCoordinates';
import { 
  MapPin, Phone, MessageSquare, Share2, ArrowRight, 
  CreditCard, LayoutDashboard, FileText, Play, Download,
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { EditableGallery } from '@/src/components/ui/EditableGallery';
import { useAdmin } from '@/src/services/adminHook';

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAdmin();
  const { language, t } = useLanguage();
  const [project, setProject] = useState<Project | null>(STATIC_PROJECTS.find(p => p.id === id) || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lightboxRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = projectService.subscribeToProjects((data) => {
      const found = data.find(p => p.id === id);
      if (found) setProject(found);
    });
    return () => unsubscribe();
  }, [id]);

  if (!project) {
    return <div className="pt-32 text-center text-2xl font-serif text-aurum-navy min-h-screen">{t("المشروع غير موجود", "Project Not Found")}</div>;
  }

  const allImages = [project.image, ...(project.gallery || [])];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
    setZoom(1);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => prev === 1 ? 2.5 : 1);
  };

  const toggleFullscreen = () => {
    if (!lightboxRef.current) return;
    
    if (!document.fullscreenElement) {
      lightboxRef.current.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AURUM - ${language === 'ar' ? project.titleAr : project.titleEn}`,
          text: language === 'ar' ? project.descriptionAr : project.descriptionAr, // Note: we'd need descriptionEn for full i18n
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setIsShareModalOpen(true);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleBookingConfirm = () => {
    // Here we would typically send a request to the backend or open WhatsApp
    window.open(`https://wa.me/201000000000?text=${encodeURIComponent(
      language === 'ar' 
        ? `أهلاً، أود الاستفسار عن مشروع ${project.titleAr} المعروض بسعر ${project.price}`
        : `Hi, I'm interested in ${project.titleEn} listed at ${project.price}`
    )}`, '_blank');
    setIsBookingModalOpen(false);
  };

  return (
    <div className="pt-20 pb-20">
      {/* Header / Gallery */}
      <section className="relative h-[65vh] group overflow-hidden bg-gradient-to-br from-aurum-navy to-aurum-gold/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img 
              src={allImages[currentHeroIndex]} 
              alt={language === 'ar' ? project.titleAr : project.titleEn} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setCurrentHeroIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
          >
            <ChevronRight size={32} className="rtl:rotate-0 rotate-180" />
          </button>
          <button 
            onClick={() => setCurrentHeroIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
          >
            <ChevronLeft size={32} className="rtl:rotate-0 rotate-180" />
          </button>
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHeroIndex(i)}
              className={cn(
                "h-1 transition-all rounded-full",
                currentHeroIndex === i ? "w-10 bg-aurum-gold" : "w-4 bg-white/30"
              )}
            />
          ))}
        </div>

        <div className="absolute bottom-12 right-0 w-full px-4 z-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/projects" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <ArrowRight size={20} className="rtl:rotate-0 rotate-180" />
              {t("العودة للمشاريع", "Back to Projects")}
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
                  <EditableText 
                    contentKey={`project_title_${project.id}`} 
                    defaultText={language === 'ar' ? project.titleAr : project.titleEn} 
                  />
                </h1>
                <div className="flex items-center gap-4 text-aurum-gold">
                  <div className="flex items-center gap-1 bg-aurum-navy/40 backdrop-blur-sm px-5 py-2.5 rounded-full border border-aurum-gold/40 shadow-2xl shadow-black/40">
                    <MapPin size={28} strokeWidth={3} className="drop-shadow-[0_0_10px_rgba(212,175,55,0.7)]" />
                    <span className="text-lg font-bold">
                      <EditableText 
                        contentKey={`project_loc_${project.id}`} 
                        defaultText={language === 'ar' ? project.locationAr : project.locationEn} 
                      />
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="white"
                size="sm"
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-white/20 rounded-full"
              >
                <Share2 size={18} className="text-aurum-gold" />
                <span className="font-bold uppercase tracking-tight text-xs">{t("مشاركة", "Share")}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-aurum-navy mb-4">{t("نظرة عامة", "Overview")}</h2>
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
              <EditableText 
                contentKey={`project_desc_${project.id}`} 
                defaultText={language === 'ar' ? project.descriptionAr : "A unique residential experience that combines sophistication and modern designs in the heart of the region."} 
              />
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
              <div className="flex items-center gap-3 mb-4 text-aurum-gold">
                <CreditCard size={24} />
                <h3 className="font-bold text-lg text-aurum-navy">{t("نظام السداد", "Payment Plan")}</h3>
              </div>
              <div className="text-gray-600">
                <EditableText 
                  contentKey={`project_payment_${project.id}`} 
                  defaultText={language === 'ar' ? project.paymentPlanAr : "Flexible installment plans available."} 
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
              <div className="flex items-center gap-3 mb-4 text-aurum-gold">
                <LayoutDashboard size={24} />
                <h3 className="font-bold text-lg text-aurum-navy">{t("أنواع الوحدات", "Unit Types")}</h3>
              </div>
              <div className="text-gray-600">
                <EditableText 
                  contentKey={`project_units_${project.id}`} 
                  defaultText={t("تتوفر مساحات متنوعة تبدأ من ٨٠ متر مربع وتصل لـ ٣٠٠ متر مربع.", "Various sizes available starting from 80 sqm up to 300 sqm.")} 
                />
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-aurum-navy mb-4">{t("فيديو المشروع", "Project Video")}</h2>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group">
              {project.videoUrl ? (
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster={project.image}
                >
                  <source src={project.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                  <Play size={48} className="mb-4" />
                  <p>{t("الفيديو التشويقي للمشروع قريباً", "Teaser video coming soon")}</p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-aurum-navy mb-4">{t("معرض الصور", "Photo Gallery")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allImages.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm border border-aurum-gold/10 group relative"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={img}
                    alt={`${language === 'ar' ? project.titleAr : project.titleEn} - ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                  </div>
                </motion.div>
              ))}
            </div>

            {isAdmin && (
              <EditableGallery 
                projectId={project.id} 
                gallery={project.gallery || []} 
              />
            )}
          </section>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-aurum-navy">{t("الموقع", "Location")}</h2>
              <EditableCoordinates projectId={project.id} currentCoords={project.coordinates} />
            </div>
            {project.coordinates ? (
              <GoogleMapEmbed 
                lat={project.coordinates.lat}
                lng={project.coordinates.lng}
                title={language === 'ar' ? project.titleAr : project.titleEn}
                language={language as 'ar' | 'en'}
                className="aspect-video"
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative grayscale">
                 <img 
                  src="https://picsum.photos/seed/map/1200/600" 
                  alt="Map Placeholder" 
                  className="w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 p-4 rounded-xl shadow-xl flex flex-col items-center">
                      <MapPin className="text-aurum-gold mb-2" size={32} />
                      <span className="font-bold text-aurum-navy">{t("موقع المشروع", "Project Location")}</span>
                    </div>
                 </div>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-aurum-gold/10">
              <div className="text-sm text-gray-500 mb-2">{t("السعر", "Price")}</div>
              <div className="text-3xl font-bold text-aurum-navy mb-8">
                <EditableText 
                  contentKey={`project_price_${project.id}`} 
                  defaultText={project.price} 
                />
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  <Phone size={20} />
                  {t("احجز الآن", "Book Now")}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="w-full border-aurum-gold text-aurum-gold hover:bg-aurum-gold hover:text-aurum-navy"
                >
                  <Share2 size={20} />
                  <span>{t("مشاركة المشروع", "Share Project")}</span>
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => project.brochureUrl && window.open(project.brochureUrl, '_blank')}
                  className="w-full text-aurum-gold hover:text-aurum-gold-light border border-aurum-gold/30 rounded-lg hover:border-aurum-gold gap-2"
                >
                   <Download size={18} />
                   {t("تحميل بروشور المشروع (PDF)", "Download Project Brochure (PDF)")}
                </Button>
              </div>
            </div>

            <div className="bg-aurum-navy text-white p-8 rounded-2xl">
              <h4 className="font-bold mb-4">{t("هل لديك استفسار؟", "Have questions?")}</h4>
              <p className="text-white/70 text-sm mb-6">{t("تواصل مع مستشارنا العقاري للحصول على كافة التفاصيل والمعلومات.", "Contact our real estate consultant to get all the details and information.")}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-aurum-gold rounded-full flex items-center justify-center font-bold text-aurum-navy">A</div>
                <div>
                   <div className="font-bold">{t("أحمد علي", "Ahmed Ali")}</div>
                   <div className="text-xs text-white/50">{t("مستشار عقاري أول", "Senior Real Estate Consultant")}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Lightbox / Carousel Overlay */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
            onClick={() => setSelectedImageIndex(null)}
          >
            <button 
              className="absolute top-6 left-6 text-white/50 hover:text-white transition-all hover:scale-110 z-[110]"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X size={32} />
            </button>

            <div className="absolute top-6 right-6 flex items-center gap-4 z-[110]">
               <button 
                className="text-white/70 hover:text-white p-2 transition-transform hover:scale-110"
                onClick={toggleZoom}
                title={t("تغيير التكبير", "Toggle Zoom")}
              >
                {zoom > 1 ? <ZoomOut size={28} className="text-aurum-gold" /> : <ZoomIn size={28} />}
              </button>
              <button 
                className="text-white/70 hover:text-white p-2 transition-transform hover:scale-110"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                title={t("ملء الشاشة", "Fullscreen")}
              >
                <Maximize size={24} />
              </button>
              <div className="text-white/50 font-mono text-sm">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>

            <button 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-all z-[110] bg-white/5 hover:bg-white/10 rounded-full"
              onClick={handlePrev}
            >
              <ChevronRight size={40} className="rtl:rotate-0 rotate-180" />
            </button>

              <motion.div 
                key={selectedImageIndex}
                initial={{ scale: 0.9, opacity: 0, x: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  x: 0,
                  transition: { type: "spring", damping: 25, stiffness: 200 }
                }}
                exit={{ scale: 0.9, opacity: 0, x: -20 }}
                className="relative max-w-5xl w-full aspect-[3/2] flex items-center justify-center overflow-hidden rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  animate={{ scale: zoom }}
                  whileHover={{ scale: zoom === 1 ? 1.05 : zoom }}
                  transition={{ 
                    scale: { type: "spring", damping: 20 },
                    transition: { duration: 0.4 }
                  }}
                  src={allImages[selectedImageIndex]}
                  alt="Selected Gallery"
                  className={cn(
                    "max-w-full max-h-full object-contain select-none transition-shadow",
                    zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                  )}
                  onClick={toggleZoom}
                  referrerPolicy="no-referrer"
                />
              </motion.div>

            <button 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-all z-[110] bg-white/5 hover:bg-white/10 rounded-full"
              onClick={handleNext}
            >
              <ChevronLeft size={40} className="rtl:rotate-0 rotate-180" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 overflow-x-auto max-w-[80vw] p-2 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); setZoom(1); }}
                  className={cn(
                    "w-16 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                    selectedImageIndex === idx ? "border-aurum-gold scale-110" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        title={`${language === 'ar' ? project.titleAr : project.titleEn} - ${language === 'ar' ? project.locationAr : project.locationEn}`}
        url={window.location.href}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        project={project}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}
