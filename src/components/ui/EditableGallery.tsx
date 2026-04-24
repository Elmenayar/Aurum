import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePlus, X, Trash2, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ImageUpload } from './ImageUpload';
import { useAdmin } from '@/src/services/adminHook';
import { projectService } from '@/src/services/projectService';
import { useLanguage } from '@/src/context/LanguageContext';

interface EditableGalleryProps {
  projectId: string;
  gallery: string[];
  onUpdate?: (newGallery: string[]) => void;
}

export function EditableGallery({ projectId, gallery: initialGallery, onUpdate }: EditableGalleryProps) {
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newGallery: string[]) => {
    setLoading(true);
    try {
      await projectService.updateProject(projectId, { gallery: newGallery });
      setGallery(newGallery);
      if (onUpdate) onUpdate(newGallery);
    } catch (err) {
      console.error("Failed to update gallery", err);
      alert(t("حدث خطأ أثناء تحديث المعرض", "Error updating gallery"));
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    handleUpdate(newGallery);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newGallery = [...gallery];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newGallery.length) return;
    
    [newGallery[index], newGallery[newIndex]] = [newGallery[newIndex], newGallery[index]];
    handleUpdate(newGallery);
  };

  const addImage = (url: string) => {
    const newGallery = [...gallery, url];
    handleUpdate(newGallery);
    setIsAdding(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-dashed border-aurum-gold/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-aurum-navy">{t("إدارة معرض الصور", "Manage Gallery")}</h3>
          <p className="text-xs text-gray-500">{t("يمكنك إضافة، ترتيب، أو حذف صور المشروع", "Add, reorder, or delete project images")}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
            isAdding ? "bg-gray-100 text-gray-500" : "bg-aurum-gold text-aurum-navy hover:scale-105 shadow-lg shadow-aurum-gold/20"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? t("إلغاء", "Cancel") : t("إضافة صورة", "Add Image")}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <ImageUpload
              onUpload={addImage}
              label={t("رفع صورة جديدة للمعرض", "Upload Gallery Image")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {gallery.map((img, index) => (
          <motion.div
            key={index}
            layout
            className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50"
          >
            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => moveImage(index, 'left')}
                  disabled={index === 0}
                  className="p-1.5 bg-white text-aurum-navy rounded-lg hover:text-aurum-gold disabled:opacity-30"
                  title={t("تحريك لليسار", "Move Left")}
                >
                  <ChevronRight size={16} className="rtl:rotate-0 rotate-180" />
                </button>
                <button
                  onClick={() => moveImage(index, 'right')}
                  disabled={index === gallery.length - 1}
                  className="p-1.5 bg-white text-aurum-navy rounded-lg hover:text-aurum-gold disabled:opacity-30"
                  title={t("تحريك لليمين", "Move Right")}
                >
                  <ChevronLeft size={16} className="rtl:rotate-0 rotate-180" />
                </button>
              </div>
              <button
                onClick={() => removeImage(index)}
                className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                title={t("حذف الصورة", "Delete Image")}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                <Loader2 size={24} className="text-aurum-gold animate-spin" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
