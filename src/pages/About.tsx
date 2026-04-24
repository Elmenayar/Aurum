import { motion } from 'motion/react';
import { EditableText } from '@/src/components/ui/EditableText';
import { EditableImage } from '@/src/components/ui/EditableImage';
import { Button } from '@/src/components/ui/Button';
import { CheckCircle2, Award, Users, Target, ShieldCheck } from 'lucide-react';

export default function About() {
  const values = [
    { 
      icon: <Award className="w-8 h-8 text-aurum-gold" />, 
      titleKey: 'about_value_1_title', 
      titleDefault: 'التميز والجودة', 
      descKey: 'about_value_1_desc', 
      descDefault: 'نلتزم بأعلى معايير الجودة في كافة مراحل مشاريعنا، من التصميم وحتى التسليم.' 
    },
    { 
      icon: <Users className="w-8 h-8 text-aurum-gold" />, 
      titleKey: 'about_value_2_title', 
      titleDefault: 'التركيز على العميل', 
      descKey: 'about_value_2_desc', 
      descDefault: 'عملاؤنا هم شركاء نجاحنا، ونهدف دائماً لتجاوز توقعاتهم وتلبية طموحاتهم.' 
    },
    { 
      icon: <Target className="w-8 h-8 text-aurum-gold" />, 
      titleKey: 'about_value_3_title', 
      titleDefault: 'الابتكار', 
      descKey: 'about_value_3_desc', 
      descDefault: 'نبحث دائماً عن حلول معمارية وإنشائية مبتكرة تجمع بين الجمالية والوظيفية.' 
    },
    { 
      icon: <ShieldCheck className="w-8 h-8 text-aurum-gold" />, 
      titleKey: 'about_value_4_title', 
      titleDefault: 'النزاهة والشفافية', 
      descKey: 'about_value_4_desc', 
      descDefault: 'نتعامل بصدق وشفافية كاملة مع كافة الأطراف المعنية لبناء علاقات طويلة الأمد.' 
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-aurum-navy to-aurum-gold/40">
        <div className="absolute inset-0 z-0">
          <EditableImage 
            contentKey="about_hero_image" 
            defaultImage="https://picsum.photos/seed/realestate_about/1920/1080" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-aurum-navy/70 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-wider"
          >
            <EditableText contentKey="about_hero_title" defaultText="من نحن" />
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 font-light leading-relaxed font-sans"
          >
            <EditableText contentKey="about_hero_sub" defaultText="شركة أورم للتطوير العقاري - نبني المستقبل برؤية عصرية ومعايير عالمية." />
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-aurum-navy mb-8">
              <EditableText contentKey="about_story_title" defaultText="قصة أورم للتطوير العقاري" />
            </h2>
            <div className="prose prose-lg text-gray-600 font-sans leading-relaxed space-y-6">
              <EditableText 
                contentKey="about_story_content" 
                as="p"
                defaultText="تأسست شركة أورم للتطوير العقاري برؤية واضحة تهدف إلى إحداث طفرة في السوق العقاري المصري. نحن نؤمن بأن العقار ليس مجرد جدران، بل هو مساحة للحياة والاستثمار المستدام. على مر السنين، نجحنا في تنفيذ مشروعات أصبحت علامات بارزة بفضل التزامنا بالابتكار والتميز." 
              />
              <EditableText 
                contentKey="about_story_content_2" 
                as="p"
                defaultText="نحن في أورم نجمع بين الخبرة العميقة والفكر الشاب المبتكر، مما يتيح لنا تقديم مشروعات عقارية تلبي احتياجات كافة الفئات، سواء كانت سكنية فاخرة أو تجارية إدارية متكاملة." 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="border-r-4 border-aurum-gold pr-6">
                <div className="text-4xl font-serif font-bold text-aurum-navy mb-2">
                   <EditableText contentKey="about_stat_1_val" defaultText="+١٠٠٠" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">
                   <EditableText contentKey="about_stat_1_label" defaultText="عميل سعيد" />
                </div>
              </div>
              <div className="border-r-4 border-aurum-gold pr-6">
                <div className="text-4xl font-serif font-bold text-aurum-navy mb-2">
                   <EditableText contentKey="about_stat_2_val" defaultText="١٥+" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">
                   <EditableText contentKey="about_stat_2_label" defaultText="مشروع منفذ" />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 bg-gradient-to-br from-aurum-navy to-aurum-gold/30">
               <EditableImage 
                 contentKey="about_story_image" 
                 defaultImage="https://picsum.photos/seed/aurum_story/800/1000" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-aurum-gold/10 rounded-full blur-3xl z-0" />
            <div className="absolute -top-10 -left-10 w-48 h-48 border-2 border-aurum-gold/30 rounded-3xl z-0" />
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-aurum-navy text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              <EditableText contentKey="about_values_title" defaultText="قيمنا الجوهرية" />
            </h2>
            <div className="h-1 w-20 bg-aurum-gold mx-auto mb-6 rounded-full" />
            <p className="text-white/60 max-w-2xl mx-auto font-sans">
              <EditableText contentKey="about_values_sub" defaultText="نحن نعمل وفق قيم راسخة تضمن استدامة نجاحنا وثقة عملائنا بنا." />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-aurum-gold/50 transition-all hover:-translate-y-2"
              >
                <div className="mb-6">{v.icon}</div>
                <h4 className="text-xl font-bold mb-4 font-serif text-aurum-gold">
                   <EditableText contentKey={v.titleKey} defaultText={v.titleDefault} />
                </h4>
                <p className="text-white/60 text-sm leading-relaxed font-sans">
                   <EditableText contentKey={v.descKey} defaultText={v.descDefault} />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-aurum-cream">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-aurum-gold/10">
             <div className="w-16 h-1 bg-aurum-gold mb-6" />
             <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-4">
                <EditableText contentKey="about_vision_title" defaultText="رؤيتنا" />
             </h3>
             <p className="text-gray-600 leading-relaxed font-sans">
                <EditableText contentKey="about_vision_content" defaultText="أن نكون الشركة الرائدة في تقديم حلول عقارية متكاملة ومبتكرة في منطقة الشرق الأوسط، والمساهمة الفعالة في خلق بيئات عمرانية مستدامة تثري حياة الأفراد وتدعم الاقتصاد الوطني." />
             </p>
          </div>

          <div className="bg-white p-12 rounded-3xl shadow-xl border border-aurum-gold/10">
             <div className="w-16 h-1 bg-aurum-gold mb-6" />
             <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-4">
                <EditableText contentKey="about_mission_title" defaultText="رسالتنا" />
             </h3>
             <motion.p 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3, duration: 0.8 }}
               className="text-gray-600 leading-relaxed font-sans"
             >
                <EditableText contentKey="about_mission_content" defaultText="رسالتنا هي تطوير مشروعات عقارية استثنائية تجمع بين الحداثة والأصالة، مع الالتزام التام بالشفافية والابتكار، وتقديم قيمة مضافة حقيقية لعملائنا وشركائنا من خلال الجودة والكفاءة." />
             </motion.p>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-aurum-navy rounded-[3rem] p-12 md:p-20 text-center relative z-10 overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-aurum-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           
           <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">
              <EditableText contentKey="about_cta_title" defaultText="ابحث عن استثمارك القادم معنا" />
           </h2>
           <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto font-sans">
              <EditableText contentKey="about_cta_sub" defaultText="سواء كنت تبحث عن منزل أحلامك أو فرصة استثمارية مضمونة، فريقنا جاهز لمساعدتك." />
           </p>
           
           <Button 
             variant="gold"
             size="xl"
             className="rounded-full"
             onClick={() => window.location.href = '/contact'}
           >
              <EditableText contentKey="about_cta_btn" defaultText="تواصل معنا الآن" />
           </Button>
        </div>
      </section>
    </div>
  );
}
