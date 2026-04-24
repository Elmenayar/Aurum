import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart3, LayoutDashboard, Search, 
  ExternalLink, Clock, Plus, Phone, Mail,
  CheckCircle2, AlertCircle, TrendingUp, Building2,
  FileText, MapPin, Menu, X, LogOut, Home
} from 'lucide-react';
import { auth, db, logout } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { leadService } from '../services/leadService';
import { brokerService } from '../services/brokerService';
import { notificationService } from '../services/notificationService';
import { Lead, Broker, Project } from '../types';
import { PROJECTS } from '../constants';
import { cn } from '../lib/utils';
import { Button } from '@/src/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Link } from 'react-router-dom';

export default function BrokerDashboard() {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [brokerProfile, setBrokerProfile] = useState<Broker | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'projects' | 'analytics'>('leads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectId: PROJECTS[0].id,
    notes: '',
    status: 'interested' as Lead['status']
  });
  const [profileFormData, setProfileFormData] = useState({
    companyName: '',
    phone: '',
    notes: '',
    websiteUrl: '',
    linkedinUrl: '',
    twitterUrl: ''
  });

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerProfile?.id) return;
    
    setLoading(true);
    try {
      if (isEditing && selectedLead?.id) {
        await leadService.updateLead(selectedLead.id, formData);
        await notificationService.logAndNotify({
          brokerId: brokerProfile.id,
          brokerName: brokerProfile.brokerName,
          leadId: selectedLead.id,
          leadName: formData.name,
          action: 'تحديث بيانات عميل',
          details: `قام البروكر بتحديث بيانات العميل. الحالة الحالية: ${formData.status}. الملاحظات: ${formData.notes || 'لا يوجد'}`
        });
      } else {
        const res = await leadService.addLead({
          ...formData,
          brokerId: brokerProfile.id,
          brokerEmail: brokerProfile.email
        });
        await notificationService.logAndNotify({
          brokerId: brokerProfile.id,
          brokerName: brokerProfile.brokerName,
          leadId: res.id,
          leadName: formData.name,
          action: 'إضافة عميل جديد',
          details: `تم إضافة عميل جديد يستهدف مشروع: ${PROJECTS.find(p => p.id === formData.projectId)?.titleAr || 'غير محدد'}. الحالة: ${formData.status}`
        });
      }
      setShowLeadModal(false);
      setFormData({ name: '', phone: '', email: '', projectId: PROJECTS[0].id, notes: '', status: 'interested' });
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      projectId: lead.projectId,
      notes: lead.notes || '',
      status: lead.status
    });
    setIsEditing(true);
    setShowLeadModal(true);
  };

  useEffect(() => {
    let unsubscribeLeads: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Subscribe to broker profile
        const q = query(collection(db, 'brokers'), where('email', '==', currentUser.email));
        unsubscribeProfile = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const brokerDoc = snapshot.docs[0];
            const brokerData = { id: brokerDoc.id, ...brokerDoc.data() } as Broker;
            setBrokerProfile(brokerData);
            setProfileFormData({
              companyName: brokerData.companyName,
              phone: brokerData.phone,
              notes: brokerData.notes || '',
              websiteUrl: brokerData.websiteUrl || '',
              linkedinUrl: brokerData.linkedinUrl || '',
              twitterUrl: brokerData.twitterUrl || ''
            });
            
            // Subscribe to leads if not already subscribed
            if (!unsubscribeLeads) {
              unsubscribeLeads = leadService.subscribeToBrokerLeads(brokerData.id!, (loadedLeads) => {
                setLeads(loadedLeads);
                setLoading(false);
              });
            }
          } else {
            setLoading(false);
          }
        }, (err) => {
          console.error("Profile sync error:", err);
          setLoading(false);
        });
      } else {
        setLoading(false);
        if (unsubscribeLeads) unsubscribeLeads();
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeLeads) unsubscribeLeads();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerProfile?.id) return;
    
    setLoading(true);
    try {
      await brokerService.updateBroker(brokerProfile.id, profileFormData);
      setShowProfileModal(false);
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurum-cream">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-aurum-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-aurum-navy font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !brokerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurum-cream pt-20">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border border-aurum-gold/10">
          <div className="w-20 h-20 bg-aurum-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-aurum-gold" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-aurum-navy mb-4">الدخول للمصرح لهم فقط</h2>
          <p className="text-gray-500 mb-8">عذراً، يجب أن يكون لديك حساب بروكر مسجل للدخول لهذه الصفحة.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-aurum-gold text-aurum-navy py-4 rounded-xl font-bold hover:bg-aurum-gold-light transition-all shadow-lg"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery)
  );

  const stats = {
    totalLeads: leads.length,
    closedDeals: leads.filter(l => l.status === 'closed').length,
    activeLeads: leads.filter(l => ['interested', 'contacted', 'negotiation'].includes(l.status)).length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'closed').length / leads.length) * 100).toFixed(1) : 0
  };

  return (
    <div className="min-h-screen bg-aurum-cream/20 flex flex-col md:flex-row rtl" dir="rtl">
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-aurum-gold/10 sticky top-16 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-aurum-navy p-1.5 rounded-lg">
            <Building2 className="text-aurum-gold" size={18} />
          </div>
          <span className="font-serif font-bold text-aurum-navy">لوحة تحكم البروكر</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-aurum-navy bg-aurum-gold/10 rounded-lg transition-colors hover:bg-aurum-gold/20"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-[120] w-72 bg-white border-l border-aurum-gold/10 transform transition-all duration-500 ease-in-out md:translate-x-0 md:static md:block shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-full flex flex-col pt-24 md:pt-32 p-6">
          <div className="mb-10 px-4">
             <h2 className="text-aurum-navy text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">القائمة الرئيسية</h2>
             <div className="h-1 w-10 bg-aurum-gold rounded-full" />
          </div>

          <nav className="flex-grow space-y-2">
            <Link
              to="/"
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group text-gray-500 hover:bg-aurum-gold/5 hover:text-aurum-navy"
            >
              <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-aurum-gold/10 group-hover:text-aurum-gold transition-all">
                <Home size={18} />
              </div>
              <span className="font-bold text-sm tracking-tight">{t('الرئيسية', 'Home')}</span>
            </Link>

            {[
              { id: 'leads', label: t('عملائي', 'My Leads'), icon: Users },
              { id: 'projects', label: t('المشاريع', 'Projects'), icon: Building2 },
              { id: 'analytics', label: t('التحليلات', 'Analytics'), icon: BarChart3 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative",
                  activeTab === item.id 
                    ? "bg-aurum-navy text-white shadow-2xl shadow-aurum-navy/20 translate-x-1" 
                    : "text-gray-500 hover:bg-aurum-gold/5 hover:text-aurum-navy"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-all duration-500",
                  activeTab === item.id 
                    ? "bg-aurum-gold text-aurum-navy rotate-3" 
                    : "bg-gray-50 text-gray-400 group-hover:bg-aurum-gold/10 group-hover:text-aurum-gold group-hover:rotate-12"
                )}>
                  <item.icon size={18} />
                </div>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {activeTab === item.id && (
                   <motion.div 
                     layoutId="sidebar-active-indicator" 
                     className="absolute -right-2 w-1.5 h-8 bg-aurum-gold rounded-full" 
                   />
                )}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-4 pb-6">
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group text-red-500 hover:bg-red-50"
            >
              <div className="p-2.5 rounded-xl bg-red-50 text-red-400 group-hover:bg-red-100 transition-all">
                <LogOut size={18} />
              </div>
              <span className="font-bold text-sm tracking-tight">{t('تسجيل الخروج', 'Logout')}</span>
            </button>
          </div>

          {/* Broker Profile Quick Info */}
          <div className="mt-auto pt-6 border-t border-gray-100/50">
             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="bg-aurum-cream/30 p-4 rounded-[1.5rem] border border-aurum-gold/5"
             >
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-9 h-9 bg-aurum-gold rounded-xl flex items-center justify-center text-aurum-navy font-bold text-sm shadow-sm">
                     {brokerProfile.brokerName.charAt(0)}
                   </div>
                   <div className="flex-grow min-w-0">
                     <div className="text-xs font-bold text-aurum-navy truncate">{brokerProfile.brokerName}</div>
                     <div className="text-[9px] text-gray-400 font-sans tracking-tighter truncate">{brokerProfile.companyName}</div>
                   </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-[9px] font-bold text-aurum-gold uppercase tracking-[0.1em]">
                  <span>{brokerProfile.status}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
             </motion.div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 pt-8 md:pt-32 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-aurum-navy rounded-3xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-aurum-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-aurum-gold rounded-full flex items-center justify-center text-aurum-navy text-3xl font-bold">
              {brokerProfile.brokerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-serif font-bold mb-1">{brokerProfile.brokerName}</h1>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="تعديل الملف الشخصي"
                >
                  <FileText size={16} className="text-aurum-gold" />
                </button>
              </div>
              <p className="text-white/60 flex items-center gap-2">
                <Building2 size={16} className="text-aurum-gold" />
                {brokerProfile.companyName}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-4">
            <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
              <div className="text-xs text-white/50 mb-1">المستوى</div>
              <div className="text-aurum-gold font-bold">{brokerProfile.status}</div>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
              <div className="text-xs text-white/50 mb-1">عدد العملاء</div>
              <div className="text-white font-bold">{leads.length}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-aurum-gold/5 flex items-center gap-4 hover:border-aurum-gold/20 transition-all"
          >
            <div className="p-3 bg-aurum-gold/10 text-aurum-gold rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 mb-0.5">عملاء نشطين</div>
              <div className="text-2xl font-bold text-aurum-navy">{stats.activeLeads}</div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-aurum-gold/5 flex items-center gap-4 hover:border-aurum-gold/20 transition-all"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 mb-0.5">صفقات ناجحة</div>
              <div className="text-2xl font-bold text-green-600">{stats.closedDeals}</div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-aurum-gold/5 flex items-center gap-4 hover:border-aurum-gold/20 transition-all"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 mb-0.5">معدل التحويل</div>
              <div className="text-2xl font-bold text-aurum-gold">{stats.conversionRate}%</div>
            </div>
          </motion.div>
        </div>

        {/* Broker Information Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-aurum-gold/10 mb-8 relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 text-aurum-gold/5 group-hover:scale-110 transition-transform duration-700">
              <Building2 size={160} />
           </div>
           
           <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-aurum-gold/10 text-aurum-gold rounded-xl">
                      <LayoutDashboard size={24} />
                    </div>
                    <h2 className="text-xl font-serif font-bold text-aurum-navy">بيانات البروكر والشركة</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-aurum-gold uppercase tracking-widest mb-1">الشركة</div>
                        <div className="text-lg font-bold text-aurum-navy flex items-center gap-2">
                          <Building2 size={20} className="text-aurum-gold/50" />
                          {brokerProfile.companyName}
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        {brokerProfile.websiteUrl && (
                          <a href={brokerProfile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-400 hover:text-aurum-gold hover:bg-aurum-gold/5 rounded-lg transition-all">
                            <ExternalLink size={18} />
                          </a>
                        )}
                        {brokerProfile.phone && (
                          <a href={`tel:${brokerProfile.phone}`} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 hover:text-aurum-gold rounded-lg text-xs font-bold transition-all">
                            <Phone size={14} /> {brokerProfile.phone}
                          </a>
                        )}
                        {brokerProfile.email && (
                          <a href={`mailto:${brokerProfile.email}`} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 hover:text-aurum-gold rounded-lg text-xs font-bold transition-all">
                            <Mail size={14} /> {brokerProfile.email}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-aurum-cream/20 p-5 rounded-2xl border border-aurum-gold/5 relative">
                      <div className="text-[10px] font-bold text-aurum-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={12} />
                        ملاحظات البروكر
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        {brokerProfile.notes || "لا يوجد ملاحظات عامة مضافة حالياً. يمكنك إضافة تفاصيل عن خبرتك ومناطق تخصصك من خلال تعديل الملف الشخصي."}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowProfileModal(true)}
                  variant="outline"
                  className="rounded-full px-6 border-aurum-gold/30 text-aurum-gold hover:bg-aurum-gold hover:text-aurum-navy shadow-lg"
                >
                  تعديل البيانات
                </Button>
              </div>
           </div>
        </motion.div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-grow max-w-xl">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="ابحث عن عميل بالاسم أو الهاتف..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30 transition-all font-sans"
                    dir="rtl"
                  />
                </div>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: '', phone: '', email: '', projectId: PROJECTS[0].id, notes: '', status: 'interested' });
                    setShowLeadModal(true);
                  }}
                  variant="primary"
                >
                  <Plus size={20} />
                  إضافة عميل جديد
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => {
                  const targetProject = PROJECTS.find(p => p.id === lead.projectId);
                  return (
                    <div key={lead.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          lead.status === 'closed' ? "bg-green-100 text-green-700" :
                          lead.status === 'lost' ? "bg-red-100 text-red-700" :
                          "bg-aurum-gold/20 text-aurum-navy"
                        )}>
                          {lead.status === 'closed' ? 'تم التعاقد' : 
                           lead.status === 'negotiation' ? 'في التفاوض' : 
                           lead.status === 'contacted' ? 'تم التواصل' : 
                           lead.status === 'lost' ? 'خسارة' : 'مهتم جديد'}
                        </div>
                        <Clock size={16} className="text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-aurum-navy mb-2">{lead.name}</h3>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Phone size={14} className="text-aurum-gold" />
                          <span dir="ltr">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <Building2 size={14} className="text-aurum-gold" />
                          {targetProject?.titleAr || 'مشروع غير محدد'}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-50 flex gap-2">
                        <Button 
                          onClick={() => openEditModal(lead)}
                          variant="secondary"
                          size="sm"
                          className="flex-grow bg-aurum-gold/10 hover:bg-aurum-gold"
                        >
                          تحديث الحالة
                        </Button>
                        <a 
                          href={`tel:${lead.phone}`}
                          className="p-3 border border-gray-100 rounded-xl text-gray-400 hover:text-aurum-gold hover:scale-110 active:scale-95 transition-all"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
                    <Users size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-400">لا يوجد عملاء مطابقين للبحث</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid md:grid-cols-2 gap-8">
              {PROJECTS.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row">
                  <div className="md:w-1/3 aspect-square md:aspect-auto relative">
                    <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-aurum-navy/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white">
                      عمولة ٢.٥٪
                    </div>
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-2">{p.titleAr}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <MapPin size={16} className="text-aurum-gold" />
                      {p.locationAr}
                    </div>
                    <p className="text-gray-400 text-xs mb-6 line-clamp-2">{p.descriptionAr}</p>
                    <div className="flex gap-4">
                      {p.brochureUrl ? (
                        <Button 
                          variant="primary" 
                          className="flex-grow rounded-xl bg-aurum-gold text-aurum-navy hover:bg-aurum-gold-light"
                          onClick={() => window.open(p.brochureUrl, '_blank')}
                        >
                          <FileText size={18} /> تحميل البروشور (PDF)
                        </Button>
                      ) : (
                        <Button variant="primary" className="flex-grow rounded-xl opacity-50 cursor-not-allowed">
                          <FileText size={18} /> المواد التسويقية قريباً
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-aurum-gold/10 border-none text-aurum-gold"
                        onClick={() => window.open(`/project/${p.id}`, '_blank')}
                      >
                        <ExternalLink size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 text-aurum-gold/10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
                      <Users size={80} />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">إجمالي العملاء</div>
                    <div className="text-4xl font-serif font-bold text-aurum-navy">{stats.totalLeads}</div>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 text-green-500/10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
                      <CheckCircle2 size={80} />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">صفقات ناجحة</div>
                    <div className="text-4xl font-serif font-bold text-green-600">{stats.closedDeals}</div>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 text-aurum-gold/10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
                      <Clock size={80} />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">عملاء نشطين</div>
                    <div className="text-4xl font-serif font-bold text-aurum-navy">{stats.activeLeads}</div>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 text-aurum-gold/10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
                      <TrendingUp size={80} />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">معدل التحويل</div>
                    <div className="text-4xl font-serif font-bold text-aurum-gold">{stats.conversionRate}%</div>
                 </div>
               </div>

               <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl">
                 <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-8 flex items-center gap-3">
                   <BarChart3 className="text-aurum-gold" /> مسار المبيعات
                 </h3>
                 <div className="space-y-6">
                    {['interested', 'contacted', 'negotiation', 'closed', 'lost'].map((status) => {
                      const count = leads.filter(l => l.status === status).length;
                      const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                      return (
                        <div key={status} className="relative">
                          <div className="flex justify-between text-sm font-bold mb-2">
                            <span>{status === 'interested' ? 'مهتمين جدد' : status === 'contacted' ? 'تواصل أولي' : status === 'negotiation' ? 'مفاوضات' : status === 'closed' ? 'مغلق (ناجح)' : 'ضائع'}</span>
                            <span className="text-gray-400">{count} عميل</span>
                          </div>
                          <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                status === 'closed' ? "bg-green-500" : status === 'lost' ? "bg-red-500" : "bg-aurum-gold"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl font-sans" 
            dir="rtl"
          >
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-6">
              {isEditing ? 'تحديث بيانات العميل' : 'إضافة عميل جديد'}
            </h3>
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم العميل</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30 font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المشروع المستهدف</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30"
                  >
                    {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.titleAr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الحالة الحالية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Lead['status']})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30"
                  >
                    <option value="interested">مهتم جديد</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="negotiation">في التفاوض</option>
                    <option value="closed">تم التعاقد</option>
                    <option value="lost">خسارة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/30"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-grow"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowLeadModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl font-sans" 
            dir="rtl"
          >
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-6">تعديل الملف الشخصي</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="opacity-60">
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم البروكر (للعرض فقط)</label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border border-transparent font-medium">
                    {brokerProfile.brokerName}
                  </div>
                </div>
                <div className="opacity-60">
                  <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني (للعرض فقط)</label>
                  <div className="px-4 py-3 rounded-xl bg-gray-100 border border-transparent font-sans">
                    {brokerProfile.email}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة</label>
                <input
                  type="text"
                  required
                  value={profileFormData.companyName}
                  onChange={(e) => setProfileFormData({...profileFormData, companyName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-aurum-gold/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  value={profileFormData.phone}
                  onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-aurum-gold/30 transition-all font-sans"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات عن البروكر</label>
                <textarea
                  value={profileFormData.notes}
                  onChange={(e) => setProfileFormData({...profileFormData, notes: e.target.value})}
                  rows={3}
                  placeholder="شركة متخصصة في التجمع الخامس، خبرة ٥ سنوات..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-aurum-gold/30 transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الموقع الإلكتروني</label>
                  <input
                    type="url"
                    value={profileFormData.websiteUrl}
                    onChange={(e) => setProfileFormData({...profileFormData, websiteUrl: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-aurum-gold/30 transition-all font-sans"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رابط LinkedIn</label>
                  <input
                    type="url"
                    value={profileFormData.linkedinUrl}
                    onChange={(e) => setProfileFormData({...profileFormData, linkedinUrl: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-aurum-gold/30 transition-all font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-grow"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </main>
    </div>
  );
}

