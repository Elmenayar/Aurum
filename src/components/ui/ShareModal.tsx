import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Facebook, Twitter, Linkedin, 
  Mail, MessageCircle, Link2, Check
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  url 
}) => {
  const [copied, setCopied] = React.useState(false);
  const { t } = useLanguage();

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2]',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0077B5]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-aurum-navy">{t("مشاركة المشروع", "Share Project")}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-aurum-navy transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group"
                >
                  <div className={cn(
                    "p-2 rounded-xl text-white transition-transform group-hover:scale-110",
                    option.color
                  )}>
                    <option.icon size={20} />
                  </div>
                  <span className="font-bold text-aurum-navy text-sm">{option.name}</span>
                </a>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("رابط مباشر", "Direct Link")}</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={url}
                  className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className={cn(
                    "px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                    copied 
                      ? "bg-green-500 text-white" 
                      : "bg-aurum-gold text-aurum-navy hover:bg-aurum-gold-light"
                  )}
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                  {copied ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
