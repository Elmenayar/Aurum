import React, { useState, useEffect } from 'react';
import { PROJECTS as STATIC_PROJECTS } from '@/src/constants';
import { Project } from '@/src/types';
import { projectService } from '@/src/services/projectService';
import ProjectCard from '@/src/components/ui/ProjectCard';
import { ProjectMap } from '@/src/components/ui/ProjectMap';
import { Search, Filter, Map as MapIcon, Grid, Hammer } from 'lucide-react';
import { EditableText } from '@/src/components/ui/EditableText';
import { Button } from '@/src/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Projects() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = projectService.subscribeToProjects((data) => {
      if (data.length > 0) setProjects(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesType = filterType === 'all' || project.type === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      project.titleAr.includes(searchTerm) || 
      project.locationAr.includes(searchTerm) ||
      project.titleEn.toLowerCase().includes(term) ||
      project.locationEn.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  const readyProjects = filteredProjects.filter(p => !p.isUnderConstruction);
  const constructionProjects = filteredProjects.filter(p => p.isUnderConstruction);

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-aurum-navy mb-2">
            <EditableText contentKey="projects_title" defaultText={t("مشروعاتنا", "Our Projects")} />
          </h1>
          <p className="text-gray-500">
            <EditableText contentKey="projects_sub" defaultText={t("استكشف مجموعة متنوعة من العقارات المتميزة", "Explore a diverse range of premium properties")} />
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          {/* View Toggles - High Visibility */}
          <div className="flex bg-aurum-navy p-1.5 rounded-2xl shadow-xl shadow-aurum-navy/20">
             <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-[13px] uppercase tracking-wider",
                viewMode === 'grid' 
                  ? "bg-aurum-gold text-aurum-navy shadow-lg" 
                  : "text-white/40 hover:text-white"
              )}
             >
                <Grid size={18} />
                <span>{t("الشبكة", "Grid")}</span>
             </button>
             <button 
              onClick={() => setViewMode('map')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-[13px] uppercase tracking-wider",
                viewMode === 'map' 
                  ? "bg-aurum-gold text-aurum-navy shadow-lg" 
                  : "text-white/40 hover:text-white"
              )}
             >
                <MapIcon size={18} />
                <span>{t("الخريطة", "Map")}</span>
             </button>
          </div>

          <div className="flex items-center gap-4 flex-grow md:flex-grow-0">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t("ابحث عن مشروع أو موقع...", "Search for project or location...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pr-10 pl-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:border-aurum-gold transition-all bg-white font-sans shadow-sm"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
              <Filter size={18} className="text-aurum-gold" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent focus:outline-none text-sm font-bold text-aurum-navy"
              >
                <option value="all">{t("الكل", "All")}</option>
                <option value="residential">{t("سكني", "Residential")}</option>
                <option value="office">{t("إداري", "Office")}</option>
                <option value="retail">{t("تجاري", "Retail")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectMap projects={filteredProjects} />
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            {/* Ready Projects Section */}
            {readyProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy mb-8 border-r-4 border-aurum-gold pr-4">
                  {t("مشاريعنا الحالية", "Our Current Projects")}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {readyProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Under Construction Section */}
            {constructionProjects.length > 0 && (
              <div className="bg-aurum-cream/30 -mx-4 px-4 py-16 rounded-[3rem] border border-aurum-gold/10">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-aurum-navy text-aurum-gold rounded-lg">
                      <Hammer size={24} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-aurum-navy">
                      {t("مشاريع تحت الإنشاء", "Projects Under Construction")}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {constructionProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Locations Directory Section */}
            {filteredProjects.length > 0 && (
              <div className="mt-24 pt-24 border-t border-aurum-gold/10">
                <div className="flex items-center gap-3 mb-10">
                   <div className="p-2 bg-aurum-gold/10 text-aurum-gold rounded-lg">
                      <MapIcon size={24} />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-aurum-navy">
                     {t("دليل مواقع المشاريع", "Project Locations Directory")}
                   </h2>
                </div>
                
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 rtl:divide-x-reverse">
                    {filteredProjects.map((project) => (
                      <motion.div 
                        key={project.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="p-6 hover:bg-aurum-cream/10 transition-colors group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                             <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-aurum-navy truncate mb-1 text-sm md:text-base">
                              {language === 'ar' ? project.titleAr : project.titleEn}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs md:text-sm">
                              <MapIcon size={14} className="text-aurum-gold flex-shrink-0" />
                              <span className="truncate">{language === 'ar' ? project.locationAr : project.locationEn}</span>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                            project.type === 'residential' ? "bg-blue-50 text-blue-600" :
                            project.type === 'office' ? "bg-purple-50 text-purple-600" :
                            "bg-orange-50 text-orange-600"
                          )}>
                            {t(
                              project.type === 'residential' ? 'سكني' :
                              project.type === 'office' ? 'إداري' : 'تجاري',
                              project.type
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-xl text-gray-500">
                  {t("لم يتم العثور على نتائج تطابق بحثك.", "No results found matching your search.")}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
