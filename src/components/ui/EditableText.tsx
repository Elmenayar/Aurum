import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, X, Edit3 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { cmsService } from '@/src/services/cmsService';
import { useAdmin } from '@/src/services/adminHook';
import { useLanguage } from '@/src/context/LanguageContext';

interface EditableTextProps {
  contentKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export function EditableText({ contentKey, defaultText, className, as: Component = 'span' }: EditableTextProps) {
  const { isAdmin } = useAdmin();
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const [tempText, setTempText] = useState(defaultText);
  const [loading, setLoading] = useState(true);

  // Derive specialized key for non-Arabic languages
  const specializedKey = language === 'ar' ? contentKey : `${contentKey}_en`;

  useEffect(() => {
    const unsubscribeCMS = cmsService.subscribeToContent(specializedKey, (value) => {
      if (value !== null) {
        setText(value);
        setTempText(value);
      } else {
        // Fallback to default text if no translation exists yet
        setText(defaultText);
        setTempText(defaultText);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeCMS();
    };
  }, [specializedKey, defaultText]);

  const handleSave = async () => {
    try {
      await cmsService.saveContent(specializedKey, tempText);
      setText(tempText);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save content", err);
      alert(language === 'ar' ? "حدث خطأ أثناء حفظ النص" : "Error saving text");
    }
  };

  if (isAdmin && isEditing) {
    return (
      <span className="relative group inline-block w-full">
        <textarea
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className={cn(
            "w-full bg-white/10 text-inherit border-2 border-aurum-gold rounded-lg p-2 focus:outline-none focus:ring-4 focus:ring-aurum-gold/20 font-inherit",
            className
          )}
          autoFocus
        />
        <span className="absolute -top-10 left-0 flex gap-2 z-20">
          <button 
            onClick={handleSave}
            className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:scale-110"
          >
            <Save size={16} />
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110"
          >
            <X size={16} />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className={cn("relative group/text inline-block min-w-[20px]", isAdmin && "cursor-pointer")}>
      <Component 
        className={className}
        onClick={() => isAdmin && setIsEditing(true)}
      >
        {text}
      </Component>
      {isAdmin && (
        <span className="absolute -right-6 top-0 opacity-0 group-hover/text:opacity-100 transition-opacity">
          <Edit3 size={14} className="text-aurum-gold animate-pulse" />
        </span>
      )}
    </span>
  );
}
