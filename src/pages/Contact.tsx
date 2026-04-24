import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Phone, MapPin, Send, 
  CheckCircle2, AlertCircle, Clock,
  MessageSquare, User, Building2
} from 'lucide-react';
import { inquiryService } from '../services/inquiryService';
import { configService, AppConfig } from '@/src/services/configService';
import { PROJECTS } from '../constants';
import { cn } from '../lib/utils';
import { EditableText } from '@/src/components/ui/EditableText';
import { Button } from '@/src/components/ui/Button';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [config, setConfig] = React.useState<AppConfig | null>(null);

  React.useEffect(() => {
    const unsub = configService.subscribeToConfig((data) => setConfig(data));
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectId: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const projectName = PROJECTS.find(p => p.id === formData.projectId)?.titleAr || '';
      await inquiryService.submitInquiry({
        ...formData,
        projectName
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', projectId: '', message: '' });
    } catch (err) {
      setError('حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'اتصل بنا',
      contentKey: 'footer_phone',
      defaultText: '+971 52 602 7080',
      description: 'متاحون على مدار الأسبوع من ٩ صباحاً وحتى ٩ مساءً',
      action: 'tel:+971526027080'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      contentKey: 'footer_email',
      defaultText: 'info@aurum-eg.com',
      description: 'سنقوم بالرد عليك خلال ٢٤ ساعة عمل',
      action: 'mailto:info@aurum-eg.com'
    },
    {
      icon: MapPin,
      title: 'موقعنا',
      contentKey: 'footer_address',
      defaultText: 'القاهرة الجديدة، التجمع الخامس، منطقة البنوك - مبنى أورم',
      description: 'منطقة البنوك، مبنى أورم الإداري',
      action: 'https://maps.google.com'
    }
  ];

  return (
    <div className="pt-24 pb-20">
      {/* Hero Header */}
      <section className="bg-aurum-navy py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-aurum-gold rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurum-gold rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold text-white mb-6"
          >
            <EditableText contentKey="contact_hero_title" defaultText="تواصل مع أورم" />
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60 max-w-2xl mx-auto font-light font-sans"
          >
            <EditableText contentKey="contact_hero_sub" defaultText="نحن هنا لمساعدتك في العثور على منزلك المثالي أو استثمارك القادم. تواصل معنا اليوم وسيقوم أحد مستشارينا بالرد عليك." />
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Details cards */}
          {contactInfo.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.action}
              target={item.icon === MapPin ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-aurum-gold/10 flex flex-col items-center text-center group hover:border-aurum-gold transition-all"
            >
              <div className="p-4 bg-aurum-cream text-aurum-gold rounded-2xl mb-6 group-hover:bg-aurum-gold group-hover:text-aurum-navy transition-colors">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-aurum-navy mb-2">{item.title}</h3>
              <div className="text-aurum-gold font-bold text-lg mb-2" dir="ltr">
                <EditableText contentKey={item.contentKey} defaultText={item.defaultText} />
              </div>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </motion.a>
          ))}
        </div>

        <div className="mt-16 grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-white p-10 rounded-3xl shadow-2xl border border-aurum-gold/5"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-bold text-aurum-navy mb-2">
                <EditableText contentKey="contact_form_title" defaultText="أرسل استفسارك" />
              </h2>
              <p className="text-gray-500 font-sans">
                <EditableText contentKey="contact_form_sub" defaultText="املأ النموذج أدناه وسيقوم فريقنا بالتواصل معك في أقرب وقت." />
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-aurum-navy mb-4">تم الإرسال بنجاح!</h3>
                  <p className="text-gray-500 mb-8">شكراً لتواصلك مع أورم. سيقوم مستشارونا بمراجعة طلبك والاتصال بك قريباً.</p>
                  <Button 
                    variant="ghost"
                    onClick={() => setIsSuccess(false)}
                    className="text-aurum-gold hover:text-aurum-gold-light"
                  >
                    {t("إرسال رسالة أخرى", "Send another message")}
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <User size={16} className="text-aurum-gold" />
                        الاسم الكامل
                      </label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-aurum-gold focus:bg-white outline-none transition-all"
                        placeholder="أدخل اسمك..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Phone size={16} className="text-aurum-gold" />
                        رقم الهاتف
                      </label>
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-aurum-gold focus:bg-white outline-none transition-all font-sans"
                        placeholder="+971 -- --- ----"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Mail size={16} className="text-aurum-gold" />
                        البريد الإلكتروني
                      </label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-aurum-gold focus:bg-white outline-none transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Building2 size={16} className="text-aurum-gold" />
                        المشروع المهتم به (اختياري)
                      </label>
                      <select 
                        value={formData.projectId}
                        onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-aurum-gold focus:bg-white outline-none transition-all"
                      >
                        <option value="">اختر مشروعاً...</option>
                        {PROJECTS.map(p => (
                          <option key={p.id} value={p.id}>{p.titleAr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-aurum-gold" />
                      رسالتك
                    </label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-aurum-gold focus:bg-white outline-none transition-all resize-none"
                      placeholder="كيف يمكننا مساعدتك؟"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    size="xl"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t("إرسال الرسالة", "Send Message")}
                        <Send size={20} className="mr-2 transform rotate-180" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Social & FAQ Side */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-aurum-navy mb-6">الأسئلة الشائعة</h3>
              <div className="space-y-4">
                {[
                  { q: 'ما هي مواعيد العمل الرسمية؟', a: 'نحن متاحون في المقر الرئيسي من السبت إلى الخميس، من الساعة ٩ صباحاً وحتى ٦ مساءً.' },
                  { q: 'هل يمكنني حجز معاينة للمشاريع؟', a: 'بالتأكيد، يمكنك طلب معاينة من خلال النموذج وسيتواصل معك المستشار العقاري المختص لتحديد موعد.' },
                  { q: 'هل تقدمون أنظمة سداد ميسرة؟', a: 'نعم، لدينا أنظمة سداد متنوعة تبدأ من بدون مقدم وتصل لـ ٨ سنوات بدون فوائد في بعض المشاريع.' }
                ].map((faq, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl border border-aurum-gold/10 shadow-sm">
                    <h4 className="font-bold text-aurum-navy mb-2 text-sm">{faq.q}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-aurum-cream/50 p-8 rounded-3xl border border-aurum-gold/10">
              <h3 className="text-xl font-bold text-aurum-navy mb-4">انضم لمجتمع أورم</h3>
              <p className="text-gray-500 text-sm mb-6">تابعنا على وسائل التواصل الاجتماعي لتبقى على اطلاع بأحدث التطورات والعروض الحصرية.</p>
              <div className="flex flex-wrap gap-4">
                {config?.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-aurum-gold/20 rounded-lg text-xs font-bold text-aurum-navy hover:bg-aurum-gold hover:border-aurum-gold transition-all">
                    الفيسبوك
                  </a>
                )}
                {config?.instagramUrl && (
                  <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-aurum-gold/20 rounded-lg text-xs font-bold text-aurum-navy hover:bg-aurum-gold hover:border-aurum-gold transition-all">
                    إنستجرام
                  </a>
                )}
                {config?.tiktokUrl && (
                  <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-aurum-gold/20 rounded-lg text-xs font-bold text-aurum-navy hover:bg-aurum-gold hover:border-aurum-gold transition-all">
                    تيك توك
                  </a>
                )}
                <a href="#" className="px-4 py-2 border border-aurum-gold/20 rounded-lg text-xs font-bold text-aurum-navy hover:bg-aurum-gold hover:border-aurum-gold transition-all">
                  لينكد إن
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section Placeholder */}
      <section className="mt-24 px-4 max-w-7xl mx-auto">
        <div className="h-[400px] bg-gray-100 rounded-3xl overflow-hidden relative border border-aurum-gold/10 shadow-2xl">
          <img 
            src="https://picsum.photos/seed/map-aurum/1200/600" 
            alt="Map"
            className="w-full h-full object-cover grayscale opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur px-8 py-6 rounded-2xl shadow-2xl text-center border border-aurum-gold/20 scale-110">
              <MapPin className="text-aurum-gold mx-auto mb-3" size={40} />
              <h4 className="text-xl font-bold text-aurum-navy mb-1">المقر الرئيسي</h4>
              <p className="text-gray-500 text-sm">القاهرة الجديدة، منطقة البنوك</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
