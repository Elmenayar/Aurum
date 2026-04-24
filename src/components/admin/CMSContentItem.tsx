import React, { useState } from 'react';
import { Save, Loader2, Globe, Type, Image as ImageIcon } from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { ImageUpload } from '@/src/components/ui/ImageUpload';

interface CMSContentItemProps {
  item: {
    key: string;
    label: string;
    section: string;
  };
  siteContent: Record<string, string>;
  onSave?: (key: string, value: string) => void;
}

export const CMSContentItem: React.FC<CMSContentItemProps> = ({ item, siteContent }) => {
  const [loading, setLoading] = useState(false);
  const [arValue, setArValue] = useState(siteContent[item.key] || '');
  const [enValue, setEnValue] = useState(siteContent[`${item.key}_en`] || '');
  const [isSaved, setIsSaved] = useState(true);

  const isLogo = item.key.includes('logo');

  // Sync internal state with external content when it updates (if we are in "saved" state)
  React.useEffect(() => {
    if (isSaved) {
      setArValue(siteContent[item.key] || '');
      setEnValue(siteContent[`${item.key}_en`] || '');
    }
  }, [siteContent, item.key, isSaved]);

  const handleAllSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cmsService.saveContent(item.key, arValue),
        cmsService.saveContent(`${item.key}_en`, enValue)
      ]);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save all content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    setArValue(url);
    setIsSaved(false);
    // Auto-save logos often feels better
    setLoading(true);
    try {
      await cmsService.saveContent(item.key, url);
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-aurum-gold/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Type size={14} className="text-aurum-gold" />
            <span className="text-xs font-bold text-aurum-gold uppercase tracking-widest">{item.section}</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-aurum-navy">{item.label}</h3>
          <p className="text-[10px] text-gray-400 font-mono mt-1">{item.key}</p>
        </div>
        
        <Button 
          onClick={handleAllSave}
          disabled={loading || isSaved}
          variant={isSaved ? "secondary" : "gold"}
          className={cn(
            "rounded-full px-8 transition-all shadow-lg",
            isSaved ? "bg-gray-50 text-gray-400 border-none opacity-50" : "shadow-aurum-gold/20"
          )}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaved ? 'تم الحفظ' : 'حفظ التعديلات'}</span>
        </Button>
      </div>

      {isLogo ? (
        <div className="max-w-md mx-auto">
          <ImageUpload 
            onUpload={handleImageUpload}
            currentImage={arValue}
            aspectRatio="logo"
            label="رفع الشعار الجديد"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Arabic Version */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-aurum-navy font-sans py-0.5">AR</span>
                المحتوى العربي
              </label>
            </div>
            <textarea
              value={arValue}
              onChange={(e) => {
                setArValue(e.target.value);
                setIsSaved(false);
              }}
              placeholder="أدخل النص العربي هنا..."
              className="w-full bg-gray-50/50 p-5 rounded-2xl border border-transparent focus:border-aurum-gold/30 focus:bg-white outline-none text-sm text-aurum-navy font-sans leading-relaxed min-h-[120px] transition-all resize-none shadow-inner"
            />
          </div>

          {/* English Version */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-aurum-navy font-sans py-0.5">EN</span>
                English Content
              </label>
            </div>
            <textarea
              value={enValue}
              onChange={(e) => {
                setEnValue(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Enter English text here..."
              dir="ltr"
              className="w-full bg-gray-50/50 p-5 rounded-2xl border border-transparent focus:border-aurum-gold/30 focus:bg-white outline-none text-sm text-aurum-navy font-sans leading-relaxed min-h-[120px] transition-all resize-none shadow-inner"
            />
          </div>
        </div>
      )}
    </div>
  );
}
