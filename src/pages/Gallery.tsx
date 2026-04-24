import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '@/src/constants';
import { Image as ImageIcon, Video, Play, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedItem, setSelectedItem] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);

  // Extract all photos and videos from projects
  const allPhotos = STATIC_PROJECTS.flatMap(p => [p.image, ...(p.gallery || [])]);
  const allVideos = STATIC_PROJECTS.filter(p => p.videoUrl).map(p => ({
    url: p.videoUrl!,
    title: p.titleAr,
    poster: p.image
  }));

  const handleNext = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'photo') {
      const idx = allPhotos.indexOf(selectedItem.url);
      const nextIdx = (idx + 1) % allPhotos.length;
      setSelectedItem({ url: allPhotos[nextIdx], type: 'photo' });
    }
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'photo') {
      const idx = allPhotos.indexOf(selectedItem.url);
      const prevIdx = (idx - 1 + allPhotos.length) % allPhotos.length;
      setSelectedItem({ url: allPhotos[prevIdx], type: 'photo' });
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-aurum-navy mb-4">معرض الميديا</h1>
        <div className="h-1.5 w-24 bg-aurum-gold mx-auto rounded-full mb-6" />
        <p className="text-gray-600 max-w-2xl mx-auto">
          استكشف أرقى تفاصيل مشروعاتنا من خلال جولة بصرية وفيديوهات حصرية تبرز دقة التنفيذ وفخامة التصميم.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-white p-1.5 rounded-xl shadow-lg border border-aurum-gold/10 flex gap-2">
          <button
            onClick={() => setActiveTab('photos')}
            className={cn(
              "px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2",
              activeTab === 'photos' 
                ? "bg-aurum-navy text-white shadow-lg" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <ImageIcon size={20} />
            الصور
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={cn(
              "px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2",
              activeTab === 'videos' 
                ? "bg-aurum-navy text-white shadow-lg" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Video size={20} />
            الفيديوهات
          </button>
        </div>
      </div>

      {activeTab === 'photos' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allPhotos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="aspect-square relative group cursor-pointer overflow-hidden rounded-2xl shadow-md border border-aurum-gold/10 bg-gradient-to-br from-aurum-navy to-aurum-gold/30"
              onClick={() => setSelectedItem({ url: photo, type: 'photo' })}
            >
              <img 
                src={photo} 
                alt={`Gallery ${idx}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-aurum-navy/0 group-hover:bg-aurum-navy/40 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allVideos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-aurum-gold/10 group"
            >
              <div 
                className="aspect-video relative cursor-pointer bg-gradient-to-br from-aurum-navy to-aurum-gold/30"
                onClick={() => setSelectedItem({ url: video.url, type: 'video' })}
              >
                <img 
                  src={video.poster} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/20">
                  <div className="w-16 h-16 bg-aurum-gold rounded-full flex items-center justify-center text-aurum-navy shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-aurum-navy">{video.title}</h3>
                <p className="text-sm text-gray-500 mt-2 italic font-sans">Official Cinematic Trailer</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-6 left-6 text-white/70 hover:text-white p-2"
              onClick={() => setSelectedItem(null)}
            >
              <X size={40} />
            </button>

            {selectedItem.type === 'photo' && (
              <>
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-all bg-white/5 hover:bg-white/10 rounded-full"
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                >
                  <ChevronRight size={40} />
                </button>
                <motion.img
                  layoutId="active-item"
                  src={selectedItem.url}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  referrerPolicy="no-referrer"
                />
                <button 
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-all bg-white/5 hover:bg-white/10 rounded-full"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                >
                  <ChevronLeft size={40} />
                </button>
              </>
            )}

            {selectedItem.type === 'video' && (
              <motion.div
                layoutId="active-item"
                className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                >
                  <source src={selectedItem.url} type="video/mp4" />
                </video>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
