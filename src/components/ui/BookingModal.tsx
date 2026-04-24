import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '@/src/context/LanguageContext';
import { Project } from '@/src/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onConfirm: () => void;
}

export function BookingModal({ isOpen, onClose, project, onConfirm }: BookingModalProps) {
  const { language, t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-aurum-navy/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-aurum-gold/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-aurum-navy flex items-center gap-2">
                <Check className="text-aurum-gold" />
                {t("تأكيد الحجز", "Confirm Booking")}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-aurum-gold/10">
                  <img src={project.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-aurum-navy mb-2">
                    {language === 'ar' ? project.titleAr : project.titleEn}
                  </h4>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                    <MapPin size={14} className="text-aurum-gold" />
                    {language === 'ar' ? project.locationAr : project.locationEn}
                  </div>
                  <div className="flex items-center gap-1.5 text-aurum-gold font-bold">
                    <CreditCard size={14} />
                    {project.price}
                  </div>
                </div>
              </div>

              <div className="bg-aurum-cream/10 p-6 rounded-2xl border border-aurum-gold/10 mb-8">
                <p className="text-sm text-aurum-navy/70 leading-relaxed text-center">
                  {t(
                    "بالمتابعة، أنت تؤكد اهتمامك بهذا المشروع. سيتواصل معك مستشارنا العقاري في أقرب وقت لترتيب زيارة ومناقشة تفاصيل التعاقد.",
                    "By proceeding, you confirm your interest in this project. Our real estate consultant will contact you shortly to arrange a visit and discuss contract details."
                  )}
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="gold" 
                  className="flex-grow rounded-xl py-4 shadow-xl shadow-aurum-gold/20"
                  onClick={onConfirm}
                >
                  {t("تأكيد وإرسال طلب", "Confirm & Send Request")}
                  <ChevronLeft className="rtl:rotate-0 rotate-180" size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl px-6 border-gray-200 text-gray-500"
                  onClick={onClose}
                >
                  {t("إلغاء", "Cancel")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
