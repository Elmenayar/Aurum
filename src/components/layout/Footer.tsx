import { Landmark, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, ImagePlus, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '@/src/services/firebase';
import { cmsService } from '@/src/services/cmsService';
import { configService, AppConfig } from '@/src/services/configService';
import { EditableText } from '@/src/components/ui/EditableText';
import { useAdmin } from '@/src/services/adminHook';

export default function Footer() {
  const { isAdmin } = useAdmin();
  const [logoUrl, setLogoUrl] = useState('/api/attachment/input_file_0.png');
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    // CMS Global sync for Logo
    const unsubscribeCMS = cmsService.subscribeToContent('site_logo', (value) => {
      if (value) setLogoUrl(value);
    });

    const unsubscribeConfig = configService.subscribeToConfig((data) => {
      setConfig(data);
    });

    return () => {
      unsubscribeCMS();
      unsubscribeConfig();
    };
  }, []);

  const handleLogoChange = async () => {
    const newUrl = prompt('يرجى إدخال رابط اللوجو الجديد:', logoUrl);
    if (newUrl && newUrl !== logoUrl) {
      try {
        await cmsService.saveContent('site_logo', newUrl);
        setLogoUrl(newUrl);
      } catch (err) {
        console.error("Failed to update logo", err);
        alert("حدث خطأ أثناء تحديث اللوجو");
      }
    }
  };

  return (
    <footer className="bg-aurum-navy text-white pt-20 pb-10 border-t border-aurum-gold/20">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6 group relative">
            <Link to="/" className="flex items-center">
              <img 
                src={logoUrl} 
                alt="AURUM Logo" 
                className="h-32 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                style={{ mixBlendMode: 'multiply' }}
                referrerPolicy="no-referrer"
              />
            </Link>
            {isAdmin && (
              <button 
                onClick={handleLogoChange}
                className="absolute -bottom-4 right-0 bg-aurum-gold text-aurum-navy p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="تغيير اللوجو"
              >
                <ImagePlus size={14} />
              </button>
            )}
          </div>
          <p className="text-white/60 leading-relaxed mb-6">
            شركة أورم للتطوير العقاري - نضع معايير جديدة للفخامة والتميز في السوق العقاري المصري من خلال مشروعاتنا المبتكرة.
          </p>
          <div className="flex gap-4">
            {config?.facebookUrl && (
              <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-aurum-gold hover:text-aurum-navy transition-all" title="Facebook"><Facebook size={18} /></a>
            )}
            {config?.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-aurum-gold hover:text-aurum-navy transition-all" title="Instagram"><Instagram size={18} /></a>
            )}
            {config?.twitterUrl && (
              <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-aurum-gold hover:text-aurum-navy transition-all" title="Twitter"><Twitter size={18} /></a>
            )}
            {config?.linkedinUrl && (
              <a href={config.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-aurum-gold hover:text-aurum-navy transition-all" title="LinkedIn"><Linkedin size={18} /></a>
            )}
            {config?.tiktokUrl && (
              <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-aurum-gold hover:text-aurum-navy transition-all" title="TikTok"><Music size={18} /></a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-aurum-gold mb-6">روابط سريعة</h4>
          <ul className="space-y-4 text-white/70">
            <li><Link to="/" className="hover:text-aurum-gold transition-colors">الرئيسية</Link></li>
            <li><Link to="/about" className="hover:text-aurum-gold transition-colors">من نحن</Link></li>
            <li><Link to="/team" className="hover:text-aurum-gold transition-colors">فريق العمل</Link></li>
            <li><Link to="/projects" className="hover:text-aurum-gold transition-colors">مشاريعنا</Link></li>
            <li><Link to="/gallery" className="hover:text-aurum-gold transition-colors">المعرض</Link></li>
            <li><Link to="/contact" className="hover:text-aurum-gold transition-colors">اتصل بنا</Link></li>
            <li><Link to="/broker-register" className="hover:text-aurum-gold transition-colors">تسجيل بروكر</Link></li>
            <li><Link to="/admin" className="hover:text-aurum-gold transition-colors">لوحة التحكم</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-aurum-gold mb-6">تواصل معنا</h4>
          <ul className="space-y-4 text-white/70">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-aurum-gold" />
              <span dir="ltr">
                <EditableText contentKey="footer_phone" defaultText="+971 52 602 7080" />
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-aurum-gold" />
              <span>
                <EditableText contentKey="footer_email" defaultText="info@aurum-eg.com" />
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-aurum-gold flex-shrink-0" />
              <span>
                <EditableText contentKey="footer_address" defaultText="القاهرة الجديدة، التجمع الخامس، منطقة البنوك - مبنى أورم" />
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-aurum-gold mb-6">النشرة الإخبارية</h4>
          <p className="text-white/60 mb-4 text-sm">اشترك لتصلك أحدث أخبار مشاريعنا وعروض الاستثمار.</p>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <input 
              type="email" 
              placeholder="بريدك الإلكتروني" 
              className="bg-transparent border-none focus:ring-0 text-sm px-3 py-2 flex-grow outline-none"
            />
            <button className="bg-aurum-gold text-aurum-navy px-4 py-2 rounded-md font-bold text-xs hover:bg-aurum-gold-light transition-all">
              اشتراك
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/5 text-center text-white/40 text-sm">
        <p>© ٢٠٢٦ شركة أورم للتطوير العقاري. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
