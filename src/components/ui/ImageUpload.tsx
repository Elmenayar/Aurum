import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { resizeImage } from '@/src/lib/imageUtils';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'logo';
}

export function ImageUpload({ 
  onUpload, 
  currentImage, 
  label, 
  className,
  aspectRatio = 'video' 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة صالح');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Resize and compress if it's large
        try {
          const processedImage = await resizeImage(
            base64, 
            aspectRatio === 'logo' ? 1200 : 1600, 
            aspectRatio === 'logo' ? 600 : 1200, 
            0.7
          );

          // Final check for Firestore 1MB limit (roughly 1.3M characters for base64)
          if (processedImage.length > 1000000) {
            alert('الصورة لا تزال كبيرة جداً، يرجى اختيار صورة أصغر أو بوضوح أقل');
            setLoading(false);
            return;
          }

          onUpload(processedImage);
        } catch (resizeErr) {
          console.error('Resize error:', resizeErr);
          onUpload(base64);
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الصورة');
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}
      
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4",
          isDragging ? "border-aurum-gold bg-aurum-gold/5" : "border-gray-200 hover:border-aurum-gold/50 bg-gray-50/50",
          aspectRatio === 'square' ? "aspect-square" : aspectRatio === 'logo' ? "h-32" : "aspect-video",
          loading && "opacity-50 pointer-events-none"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onChange} 
          className="hidden" 
          accept="image/*"
        />

        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={currentImage} 
                alt="Preview" 
                className={cn(
                  "w-full h-full object-contain",
                  aspectRatio === 'logo' && "p-4"
                )}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2">
                  <Upload size={14} /> تغيير الصورة
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-gray-400 gap-2"
            >
              <div className="p-4 bg-white rounded-full shadow-sm">
                <Upload size={24} className="text-aurum-gold" />
              </div>
              <p className="text-xs font-medium">اسحب الصورة هنا أو اضغط للرفع</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-aurum-gold" size={32} />
          </div>
        )}
      </div>
    </div>
  );
}
