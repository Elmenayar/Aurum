import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentFile?: string;
  label?: string;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  onUpload, 
  currentFile, 
  label, 
  className,
  accept = ".pdf",
  maxSizeMB = 10
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(`حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeMB} ميجابايت`);
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we convert to base64. 
      // In production, this would be a Firebase Storage upload.
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUpload(base64);
        setFileName(file.name);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
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
          "relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 min-h-[120px]",
          isDragging ? "border-aurum-gold bg-aurum-gold/5" : "border-gray-200 hover:border-aurum-gold/50 bg-gray-50/50",
          loading && "opacity-50 pointer-events-none"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onChange} 
          className="hidden" 
          accept={accept}
        />

        <AnimatePresence mode="wait">
          {currentFile ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="bg-aurum-navy/5 p-4 rounded-full text-aurum-gold">
                <FileText size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-aurum-navy truncate max-w-[200px]">
                  {fileName || "تم رفع البروشور"}
                </p>
                <p className="text-[10px] text-green-600 flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 size={10} />
                  جاهز للنشر
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-aurum-gold border border-aurum-gold/30 px-3 py-1 rounded-full uppercase tracking-widest">
                تغيير الملف
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
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Upload size={20} className="text-aurum-gold" />
              </div>
              <p className="text-xs font-medium">اسحب الكتيب (PDF) هنا أو اضغط للرفع</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
            <Loader2 className="animate-spin text-aurum-gold" size={32} />
          </div>
        )}
      </div>
    </div>
  );
}
