import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { cmsService } from '@/src/services/cmsService';
import { ImageUpload } from './ImageUpload';
import { useAdmin } from '@/src/services/adminHook';

interface EditableImageProps {
  contentKey: string;
  defaultImage: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'logo';
  style?: React.CSSProperties;
}

export function EditableImage({ contentKey, defaultImage, className, aspectRatio = 'video', style }: EditableImageProps) {
  const { isAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(defaultImage);
  const [tempImage, setTempImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeCMS = cmsService.subscribeToContent(contentKey, (value) => {
      if (value !== null) {
        setImage(value);
        setTempImage(value);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeCMS();
    };
  }, [contentKey]);

  const handleSave = async (newUrl: string) => {
    try {
      await cmsService.saveContent(contentKey, newUrl);
      setImage(newUrl);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save image", err);
      alert("حدث خطأ أثناء حفظ الصورة");
    }
  };

  if (isAdmin && isEditing) {
    return (
      <div className="relative group">
        <ImageUpload 
          aspectRatio={aspectRatio}
          currentImage={tempImage}
          onUpload={(url) => {
            setTempImage(url);
            handleSave(url);
          }}
          className={className}
        />
        <button 
          onClick={() => setIsEditing(false)}
          className="absolute -top-4 -right-4 p-2 bg-red-600 text-white rounded-full shadow-lg z-10"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative group/img", className)}>
      <img 
        src={image} 
        alt="Editable Content" 
        className={cn("w-full h-full object-cover", isAdmin && "cursor-pointer transition-opacity hover:opacity-90")}
        onClick={() => isAdmin && setIsEditing(true)}
        style={style}
        referrerPolicy="no-referrer"
      />
      {isAdmin && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/20"
        >
          <div className="bg-aurum-gold text-aurum-navy p-3 rounded-full shadow-xl transform scale-75 group-hover/img:scale-100 transition-transform">
            <ImagePlus size={24} />
          </div>
        </button>
      )}
    </div>
  );
}
