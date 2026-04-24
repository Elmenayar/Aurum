import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building, Mail, Phone, FileText, Send, CheckCircle } from 'lucide-react';
import { brokerService } from '@/src/services/brokerService';
import { EditableText } from '@/src/components/ui/EditableText';
import { Button } from '@/src/components/ui/Button';
import { useLanguage } from '@/src/context/LanguageContext';

export default function BrokerRegister() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brokerName: '',
    companyName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await brokerService.registerBroker(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Registration Error:", error);
      alert("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md w-full border border-aurum-gold/20"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-aurum-navy mb-4">
             <EditableText contentKey="reg_success_title" defaultText="شكراً لتسجيلك!" />
          </h2>
          <p className="text-gray-600 mb-8 font-sans">
             <EditableText contentKey="reg_success_sub" defaultText="تم استلام طلبك بنجاح. سيقوم فريقنا بمراجعة طلبك والتواصل معك في أقرب وقت ممكن." />
          </p>
          <Button 
            variant="ghost"
            onClick={() => setSubmitted(false)}
            className="text-aurum-gold hover:text-aurum-gold-light"
          >
            {t ? "تسجيل جديد" : "New Registration"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-aurum-cream">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-aurum-navy mb-6">
             <EditableText contentKey="reg_hero_title" defaultText="انضم لعائلة أورم كشريك نجاح" />
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed font-sans">
             <EditableText contentKey="reg_hero_sub" defaultText="نؤمن في أورم بقوة الشراكة. سجل الآن كبروكر معتمد واحصل على مميزات حصرية، عمولات مجزية، ودعم فني متواصل لمساعدتك في تحقيق مبيعات استثنائية." />
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-aurum-navy p-3 rounded-lg text-aurum-gold shadow-lg shadow-aurum-navy/20">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-aurum-navy italic">
                  <EditableText contentKey="reg_feature_1_title" defaultText="عمولات تنافسية" />
                </h4>
                <p className="text-sm text-gray-500 font-sans">
                  <EditableText contentKey="reg_feature_1_sub" defaultText="نقدم أفضل نظام عمولات في السوق العقاري المصري." />
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-aurum-navy p-3 rounded-lg text-aurum-gold shadow-lg shadow-aurum-navy/20">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-aurum-navy italic">
                  <EditableText contentKey="reg_feature_2_title" defaultText="دعم تدريبي" />
                </h4>
                <p className="text-sm text-gray-500 font-sans">
                  <EditableText contentKey="reg_feature_2_sub" defaultText="جلسات تدريبية دورية على كافة مشاريعنا وأنظمتنا." />
                </p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-aurum-gold/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-aurum-navy mb-2">الاسم بالكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  name="brokerName"
                  value={formData.brokerName}
                  onChange={handleChange}
                  type="text" 
                  placeholder="أدخل اسمك بالكامل"
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-aurum-navy mb-2">اسم الشركة</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  type="text" 
                  placeholder="أدخل اسم شركتك العقارية"
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-aurum-navy mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    placeholder="example@mail.com"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-aurum-navy mb-2">رقم الهاتف</label>
                <div className="relative">
                   <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel" 
                    placeholder="01234567890"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold transition-colors text-left"
                    dir="ltr"
                   />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-aurum-navy mb-2">ملاحظات إضافية</label>
              <div className="relative">
                <FileText className="absolute right-3 top-4 text-gray-400" size={18} />
                <textarea 
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="أخبرنا المزيد عن خبرتك..."
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold transition-colors"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'جاري الإرسال...' : (
                <>
                  <Send size={20} />
                  إرسال الطلب
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
