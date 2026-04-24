import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { teamService } from '@/src/services/teamService';
import { TeamMember } from '@/src/types';
import { useLanguage } from '@/src/context/LanguageContext';
import { Users, Mail, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Team() {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = teamService.subscribeToTeam((data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20 bg-aurum-cream/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurum-navy/5 text-aurum-gold mb-6"
          >
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {t("فريقنا", "Our Team")}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-aurum-navy mb-6"
          >
            {t("الخبراء خلف أورم", "The Experts Behind AURUM")}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            {t(
              "نحن نجمع بين الخبرة العميقة والابتكار التكنولوجي لنقدم لكم أفضل الحلول العقارية في مصر.",
              "We combine deep expertise with technological innovation to bring you the best real estate solutions in Egypt."
            )}
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-6 border border-gray-100 shadow-sm aspect-[3/4]">
                <div className="w-full h-2/3 bg-gray-100 rounded-2xl mb-4" />
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          ) : members.length > 0 ? (
            members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={language === 'ar' ? member.nameAr : member.nameEn}
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-aurum-navy/20 group-hover:bg-transparent transition-colors duration-500" />
                    
                    {/* Social Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                         <button className="p-2 hover:text-aurum-gold text-white transition-colors">
                           <Linkedin size={18} />
                         </button>
                         <button className="p-2 hover:text-aurum-gold text-white transition-colors">
                           <Twitter size={18} />
                         </button>
                         <button className="p-2 hover:text-aurum-gold text-white transition-colors">
                           <Mail size={18} />
                         </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-aurum-navy mb-1">
                      {language === 'ar' ? member.nameAr : member.nameEn}
                    </h3>
                    <p className="text-aurum-gold font-bold text-sm mb-4 leading-tight">
                      {language === 'ar' ? member.roleAr : member.roleEn}
                    </p>
                    {(member.bioAr || member.bioEn) && (
                      <p className="text-xs text-gray-400 line-clamp-3">
                        {language === 'ar' ? member.bioAr : member.bioEn}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Users size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400">{t("سيتم إضافة أعضاء الفريق قريباً", "Team members will be added soon")}</p>
            </div>
          )}
        </div>

        {/* Culture Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 bg-aurum-navy rounded-3xl p-12 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-aurum-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl font-serif font-bold mb-6 italic">"{t("الإنسان هو حجر الزاوية في كل ما نبنيه.", "Humans are the cornerstone of everything we build.")}"</h2>
            <p className="text-white/70 text-lg">
              {t(
                "في أورم، نؤمن أن التميز العقاري لا يبدأ بالحجارة والأسمنت، بل بالعقول المبدعة والقلوب الشغوفة التي تضع احتياجات العميل فوق كل اعتبار.",
                "At AURUM, we believe that real estate excellence doesn't start with stones and cement, but with the creative minds and passionate hearts that put the client's needs above all else."
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
