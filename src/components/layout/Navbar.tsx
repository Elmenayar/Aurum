import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Landmark, ImagePlus, LogIn, LogOut, User as UserIcon, Globe, Upload } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/src/lib/utils';
import { auth, loginWithGoogle, logout } from '@/src/services/firebase';
import { cmsService } from '@/src/services/cmsService';
import { useAdmin } from '@/src/services/adminHook';
import { useLanguage } from '@/src/context/LanguageContext';

import { resizeImage } from '@/src/lib/imageUtils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, user } = useAdmin();
  const { language, setLanguage, t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState('/api/attachment/input_file_0.png');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // CMS Global sync for logo
    const unsubscribeCMS = cmsService.subscribeToContent('site_logo', (value) => {
      if (value) setLogoUrl(value);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeCMS();
    };
  }, []);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const processedImage = await resizeImage(base64, 1200, 600, 0.7);
        
        if (processedImage.length > 1000000) {
          alert(t('الشعار كبير جداً، يرجى اختيار ملف أصغر', 'Logo is too large, please choose a smaller file'));
          return;
        }

        await cmsService.saveContent('site_logo', processedImage);
        setLogoUrl(processedImage);
      } catch (err) {
        console.error("Failed to update logo", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const onLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (!isAdmin) return;
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  };

  const navLinks = [
    { title: t('الرئيسية', 'Home'), href: '/' },
    { title: t('من نحن', 'About'), href: '/about' },
    { title: t('فريق العمل', 'Team'), href: '/team' },
    { title: t('المشاريع', 'Projects'), href: '/projects' },
    { title: t('المعرض', 'Gallery'), href: '/gallery' },
    { title: t('اتصل بنا', 'Contact'), href: '/contact' },
    { title: t('تسجيل بروكر', 'Broker Register'), href: '/broker-register' },
    { title: t('بوابة البروكر', 'Broker Portal'), href: '/broker-dashboard' },
    { title: t('لوحة التحكم', 'Admin'), href: '/admin' },
  ];

  const LanguageSwitcher = () => (
    <button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-aurum-gold/30 hover:border-aurum-gold hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest text-white/90"
    >
      <Globe size={14} className="text-aurum-gold" />
      <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );

  return (
    <nav 
      className={cn(
        "fixed w-full z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-aurum-navy/98 backdrop-blur-md border-aurum-gold/30 shadow-2xl py-0" 
          : "bg-aurum-navy/90 backdrop-blur-sm border-aurum-gold/10 py-2"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex justify-between items-center transition-all duration-300",
          isScrolled ? "h-24" : "h-20"
        )}>
          <div 
            className={cn(
              "flex items-center gap-3 group relative rounded-xl transition-all",
              isAdmin && isDraggingLogo && "bg-aurum-gold/20 ring-4 ring-aurum-gold"
            )}
            onDragOver={(e) => { e.preventDefault(); isAdmin && setIsDraggingLogo(true); }}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDrop={onLogoDrop}
          >
            <Link to="/" className="flex items-center">
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 8,
                  rotateX: -5,
                  z: 20,
                  boxShadow: "0 15px 35px rgba(212, 175, 55, 0.4)"
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="p-2 rounded-xl transition-all duration-500"
                style={{ transformStyle: "preserve-3d", perspective: "800px" }}
              >
                <img 
                  src={logoUrl} 
                  alt="AURUM Logo" 
                  className={cn(
                    "w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]",
                    isScrolled ? "h-20" : "h-14"
                  )}
                  style={{ mixBlendMode: 'multiply' }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </Link>
            {isAdmin && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-4 right-0 bg-aurum-gold text-aurum-navy p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  title={t("رفع لوجو جديد", "Upload New Logo")}
                >
                  <ImagePlus size={14} />
                </button>
                {isDraggingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-aurum-navy/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-aurum-gold pointer-events-none">
                    <Upload className="text-aurum-gold animate-bounce" size={24} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop Links - Hidden on scroll as per user request */}
          <div className={cn(
            "hidden md:flex items-center gap-8 transition-all duration-300",
            isScrolled && "opacity-0 pointer-events-none w-0 overflow-hidden"
          )}>
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-tight transition-colors hover:text-aurum-gold",
                    location.pathname === link.href ? "text-aurum-gold" : "text-white/70"
                  )}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-6 border-r border-white/10 pr-6 mr-2">
              <LanguageSwitcher />
              
              {/* Auth Buttons */}
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                     <div className="text-right hidden md:block">
                        <div className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">
                          {isAdmin ? 'Admin' : 'Client'}
                        </div>
                        <div className="text-xs text-white font-medium truncate max-w-[100px]">{user.displayName || user.email}</div>
                     </div>
                     <button 
                       onClick={logout}
                       className="p-2 text-white/60 hover:text-red-400 transition-colors"
                       title={t("تسجيل الخروج", "Logout")}
                     >
                       <LogOut size={18} />
                     </button>
                  </div>
                ) : (
                  <button 
                    onClick={loginWithGoogle}
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-aurum-gold transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">{t("دخول", "Login")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button & Language Switcher (Visible even when scrolled) */}
          <div className="flex items-center gap-4">
            {isScrolled && (
               <div className="hidden md:flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                  <LanguageSwitcher />
                  {user ? (
                    <button 
                      onClick={logout}
                      className="p-2 text-white/60 hover:text-red-400 transition-colors"
                    >
                      <LogOut size={18} />
                    </button>
                  ) : (
                    <button onClick={loginWithGoogle} className="text-aurum-gold hover:text-white transition-colors">
                      <LogIn size={18} />
                    </button>
                  )}
               </div>
            )}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSwitcher />
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-aurum-navy border-b border-aurum-gold/20"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 text-base font-medium transition-colors",
                  location.pathname === link.href 
                    ? "text-aurum-gold bg-white/5 border-r-2 border-aurum-gold" 
                    : "text-white hover:text-aurum-gold"
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
