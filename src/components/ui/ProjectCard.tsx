import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Heart, ExternalLink } from 'lucide-react';
import { Project } from '@/src/types';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

interface ProjectCardProps {
  project: Project;
  key?: string;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { language, t } = useLanguage();

  const title = language === 'ar' ? project.titleAr : project.titleEn;
  const location = language === 'ar' ? project.locationAr : project.locationEn;
  const typeLabel = t(
    project.type === 'residential' ? 'سكني' : project.type === 'office' ? 'إداري' : 'تجاري',
    project.type.charAt(0).toUpperCase() + project.type.slice(1)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden shadow-lg border border-aurum-gold/10 hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500"
    >
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-aurum-navy to-aurum-gold/40">
        <img
          src={project.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aurum-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10",
              isLiked ? "bg-white text-red-500 shadow-lg" : "bg-black/20 text-white hover:bg-black/40"
            )}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={2} />
          </motion.button>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div className="bg-aurum-gold text-aurum-navy px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            {typeLabel}
          </div>
          {project.isUnderConstruction && (
            <div className="bg-aurum-navy text-aurum-gold px-3 py-1 rounded text-[10px] font-bold border border-aurum-gold/30 backdrop-blur-sm">
              {t("تحت الإنشاء", "Under Construction")}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-aurum-navy group-hover:text-aurum-gold transition-colors line-clamp-1">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4 line-clamp-1">
          <MapPin size={14} className="text-aurum-gold" />
          <span>{location}</span>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="text-aurum-navy font-bold text-sm">
            {project.price}
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center gap-1 text-aurum-gold font-bold hover:underline text-sm"
          >
            {t("التفاصيل", "Details")}
            <ExternalLink size={14} className="rtl:rotate-0 rotate-180" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
