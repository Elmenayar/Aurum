import React, { useState, useEffect } from 'react';
import { Broker, BrokerStatus, BrokerSource } from '@/src/types';
import { 
  Users, UserPlus, Phone, Mail, 
  Search, Download, Upload, Link as LinkIcon,
  PhoneCall, MessageSquare, Trash2, Edit, LogIn, LogOut, History, Clock, Send, FileText,
  CheckCircle2, AlertCircle, X, RefreshCcw, FileUp, Info, Building2, Settings, Save, Bell, BellOff,
  Layout, ImagePlus, Loader2, MapPin, ArrowUpDown, Award, Share2, Target, Facebook, Instagram, Music, Sparkles, Globe, Twitter, Linkedin
} from 'lucide-react';
import { ImageUpload } from '@/src/components/ui/ImageUpload';
import { FileUpload } from '@/src/components/ui/FileUpload';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { brokerService } from '@/src/services/brokerService';
import { leadService } from '@/src/services/leadService';
import { inquiryService, Inquiry } from '@/src/services/inquiryService';
import { configService, AppConfig } from '@/src/services/configService';
import { cmsService } from '@/src/services/cmsService';
import { projectService } from '@/src/services/projectService';
import { teamService } from '@/src/services/teamService';
import { staffService } from '@/src/services/staffService';
import { projectParserService } from '@/src/services/projectParserService';
import { auth, loginWithGoogle, logout } from '@/src/services/firebase';
import { useAdmin } from '@/src/services/adminHook';
import { calculateBrokerScore } from '@/src/lib/scoring';
import { CMS_KEYS } from '@/src/constants/cmsKeys';
import { PROJECTS as INITIAL_PROJECTS } from '@/src/constants';
import { MOCK_BROKERS } from '@/src/mocks/brokers';
import { CMSContentItem } from '@/src/components/admin/CMSContentItem';
import { Project, Lead, TeamMember, StaffMember, Permission } from '@/src/types';

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin, hasPermission, user, loading: authLoading } = useAdmin();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<'brokers' | 'inquiries' | 'leads' | 'settings' | 'content' | 'projects' | 'team' | 'staff'>('projects');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BrokerStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<BrokerSource | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'score'>('score');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    data: (Partial<Broker> & { status: 'valid' | 'invalid' | 'duplicate'; validationError?: string })[];
    fileName: string;
  } | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'whatsapp'>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isBulkEmail, setIsBulkEmail] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);
  
  const [privateNotes, setPrivateNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firestore Real-time Sync
  useEffect(() => {
    if (!user) return;
    
    const handlePermissionError = (err: any) => {
      if (err.message?.includes('permission-denied') || err.code === 'permission-denied') {
        setError('عذراً، ليس لديك صلاحيات المدير. يرجى مراجعة المسؤول لإضافتك كمدير نظام.');
      }
    };

    const unsubBrokers = brokerService.subscribeToBrokers((data) => {
      setBrokers(data);
      setError(null);
    }, handlePermissionError);

    const unsubInquiries = inquiryService.subscribeToInquiries((data) => {
      setInquiries(data);
    }, handlePermissionError);

    const unsubConfig = configService.subscribeToConfig((config) => {
      setAppConfig(config);
    }, handlePermissionError);

    const unsubCMS = cmsService.subscribeToAllContent((content) => {
      setSiteContent(content);
    }, handlePermissionError);

    const unsubProjects = projectService.subscribeToProjects((data) => {
      setProjects(data);
    }, handlePermissionError);

    const unsubLeads = leadService.subscribeToAllLeads((data) => {
      setAllLeads(data);
    });

    const unsubTeam = teamService.subscribeToTeam((data) => {
        setTeamMembers(data);
    }, handlePermissionError);

    const unsubStaff = isSuperAdmin ? staffService.subscribeToStaff((data) => {
        setStaffMembers(data);
    }) : undefined;

    return () => {
      unsubBrokers();
      unsubInquiries();
      unsubConfig();
      unsubCMS();
      unsubProjects();
      unsubLeads();
      unsubTeam();
      if (unsubStaff) unsubStaff();
    };
  }, [isAdmin, isSuperAdmin]);

  const seedProjects = async () => {
    if (projects.length > 0) return;
    setLoading(true);
    try {
      for (const p of INITIAL_PROJECTS) {
        const { id, ...projectData } = p;
        await projectService.addProject(projectData);
      }
      alert("تم استيراد المشروعات الافتراضية بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء الاستيراد");
    } finally {
      setLoading(false);
    }
  };

  const seedBrokers = async () => {
    if (brokers.length > 0) return;
    setLoading(true);
    try {
      for (const b of MOCK_BROKERS) {
        const { id, createdAt, updatedAt, ...brokerData } = b;
        await brokerService.addBroker(brokerData);
      }
      alert("تم استيراد بيانات البروكرز بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء استيراد البروكرز");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    setLoading(true);
    try {
      if (editingProject.id) {
        const { id, ...data } = editingProject;
        await projectService.updateProject(id, data);
      } else {
        await projectService.addProject(editingProject as Project);
      }
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ المشروع");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setLoading(true);
    try {
      if (editingMember.id) {
        const { id, ...data } = editingMember;
        await teamService.updateMember(id, data);
      } else {
        await teamService.addMember(editingMember as TeamMember);
      }
      setShowTeamModal(false);
      setEditingMember(null);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ العضو");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا العضو؟")) return;
    try {
      await teamService.deleteMember(id);
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff?.uid) return;
    setLoading(true);
    try {
      await staffService.addStaff(editingStaff as StaffMember);
      setShowStaffModal(false);
      setEditingStaff(null);
    } catch (err) {
      console.error("Failed to save staff", err);
      alert("حدث خطأ أثناء حفظ بيانات الموظف");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (uid: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await staffService.deleteStaff(uid);
      } catch (err) {
        console.error("Failed to delete staff", err);
      }
    }
  };

  const handleParseProjectPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const reader = new FileReader();
      const loadPromise = new Promise<string>((resolve) => {
        reader.onload = (evt) => resolve((evt.target?.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64 = await loadPromise;
      
      const extractedData = await projectParserService.parseProjectFromPDF(base64);
      
      if (!editingProject) {
        setEditingProject(extractedData);
        setShowProjectModal(true);
      } else {
        setEditingProject(prev => ({
          ...prev,
          ...extractedData
        }));
      }
      alert("تم استخراج البيانات بنجاح! يرجى مراجعتها وتعديلها إذا لزم الأمر.");
    } catch (err: any) {
      alert(`حدث خطأ أثناء تحليل الملف: ${err.message}`);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const filteredBrokers = brokers
    .filter(b => {
      const s = searchTerm.toLowerCase().trim();
      const matchesSearch = !s ||
                           b.brokerName.toLowerCase().includes(s) || 
                           b.companyName.toLowerCase().includes(s) || 
                           b.phone.includes(s) || 
                           (b.email || '').toLowerCase().includes(s);
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || b.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = calculateBrokerScore(a, allLeads, appConfig?.scoringWeights).totalScore;
        const scoreB = calculateBrokerScore(b, allLeads, appConfig?.scoringWeights).totalScore;
        return scoreB - scoreA;
      }
      return a.brokerName.localeCompare(b.brokerName);
    });

  const downloadTemplate = () => {
    const templateData = [
      { 'NAME': 'الاسم', 'Office Name English': 'الشركة', 'Email': 'الايميل', 'PHONE': 'الهاتف', 'note': 'ملاحظات' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brokers Template");
    XLSX.writeFile(wb, "Aurum_Broker_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
     let file: File | undefined;
     if ('files' in e.target && e.target.files) {
       file = e.target.files[0];
     } else if ('dataTransfer' in e) {
       e.preventDefault();
       file = e.dataTransfer.files[0];
       setIsDragging(false);
     }
     
     if (!file) return;
     analyzeFile(file);
  };

  const analyzeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
       const bstr = evt.target?.result;
       const wb = XLSX.read(bstr, { type: 'binary' });
       const wsname = wb.SheetNames[0];
       const ws = wb.Sheets[wsname];
       const data: any[] = XLSX.utils.sheet_to_json(ws);
       
       const previewData = data.map(row => {
          const brokerName = String(row['NAME'] || '').trim();
          const phone = String(row['PHONE'] || '').trim();
          const companyName = String(row['Office Name English'] || '').trim();
          const email = String(row['Email'] || '').trim();
          
          let status: 'valid' | 'invalid' | 'duplicate' = 'valid';
          let validationError = '';

          if (!brokerName || !phone) {
            status = 'invalid';
            validationError = 'الاسم والهاتف مطلوبان';
          } else {
            const isDuplicate = brokers.some(b => 
              b.phone === phone || (email && b.email === email)
            );
            if (isDuplicate) {
              status = 'duplicate';
              validationError = 'يوجد بروكر بنفس الهاتف أو الإيميل';
            }
          }

          return {
            brokerName,
            companyName,
            email,
            phone,
            notes: String(row['note'] || '').trim(),
            source: 'excel_import' as BrokerSource,
            status: status,
            validationError
          };
       });
       
       setImportPreview({ data: previewData, fileName: file.name });
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    setLoading(true);
    try {
      const validToImport = importPreview.data.filter(i => i.status === 'valid');
      if (validToImport.length === 0) {
        alert("لا توجد بيانات صالحة للاستيراد.");
        return;
      }

      for (const b of validToImport) {
        const { status, validationError, ...brokerData } = b;
        await brokerService.addBroker({
          ...brokerData as Broker,
          status: 'New'
        });
      }
      
      alert(`تم استيراد ${validToImport.length} بروكر بنجاح`);
      setShowImportModal(false);
      setImportPreview(null);
    } catch (err) {
      alert("حدث خطأ أثناء الاستيراد.");
    } finally {
      setLoading(false);
    }
  };

  const syncGoogleSheet = async () => {
    if (!sheetUrl) return;
    setLoading(true);
    try {
       const match = sheetUrl.match(/\/d\/(.*?)(\/|$)/);
       if (!match) throw new Error('رابط غير صالح');
       
       const sheetId = match[1];
       const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
       
       const response = await fetch(csvUrl);
       const text = await response.text();
       
       const lines = text.split('\n').filter(l => l.trim());
       const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
       
       const nameIdx = headers.indexOf('NAME');
       const phoneIdx = headers.indexOf('PHONE');

       if (nameIdx === -1 || phoneIdx === -1) {
         throw new Error('لم يتم العثور على الأعمدة المطلوبة: NAME, PHONE');
       }

       const newBrokersData = lines.slice(1).map(line => {
          const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
          return {
            brokerName: parts[nameIdx],
            companyName: parts[headers.indexOf('Office Name English')] || '',
            email: parts[headers.indexOf('Email')] || '',
            phone: parts[phoneIdx],
            notes: parts[headers.indexOf('note')] || '',
            source: 'google_sheet_import' as BrokerSource,
            status: 'New' as BrokerStatus,
          };
       }).filter(b => b.brokerName && b.phone && b.brokerName !== 'NAME');

       for (const b of newBrokersData) {
         await brokerService.addBroker(b);
       }

       setShowSyncModal(false);
       setSheetUrl('');
       alert(`تم مزامنة ${newBrokersData.length} بروكر بنجاح`);
    } catch (err: any) {
      alert(`خطأ في المزامنة: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteBroker = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البروكر؟')) {
      await brokerService.deleteBroker(id);
    }
  };

  const getStatusColor = (status: BrokerStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Active': return 'bg-green-100 text-green-700';
      case 'VIP': return 'bg-aurum-gold/20 text-aurum-gold font-bold';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
    }
  };

  const trackInteraction = async (brokerId: string, type: 'call' | 'email' | 'whatsapp') => {
    if (!user) return;
    try {
      await brokerService.recordCommunication(brokerId, type, user.displayName || user.email || 'Admin');
    } catch (err) {
      console.error("Interaction Tracking Error:", err);
    }
  };

  const handleSendEmail = async () => {
    if ((!selectedBroker && !isBulkEmail) || !user) return;
    setLoading(true);
    try {
      if (isBulkEmail) {
        const emails = brokers.map(b => b.email).filter(Boolean).join(',');
        const mailtoUrl = `mailto:?bcc=${emails}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoUrl;
      } else if (selectedBroker) {
        await trackInteraction(selectedBroker.id!, 'email');
        const mailtoUrl = `mailto:${selectedBroker.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoUrl;
      }
      setShowEmailModal(false);
      setIsBulkEmail(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      alert("حدث خطأ أثناء تسجيل التواصل.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedBroker) return;
    setLoading(true);
    try {
      await brokerService.updateBroker(selectedBroker.id!, { privateNotes: privateNotes });
      setShowNotesModal(false);
      setPrivateNotes('');
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الملاحظات.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (brokers.length === 0) {
      alert("لا يوجد بيانات لتصديرها.");
      return;
    }
    
    const dataToExport = filteredBrokers.map(b => ({
      'الاسم': b.brokerName,
      'الشركة': b.companyName,
      'الايميل': b.email,
      'الهاتف': b.phone,
      'الحالة': b.status,
      'المصدر': b.source,
      'ملاحظات خاصة': b.privateNotes || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brokers Data");
    
    // Using .xlsx for better Arabic character support, or can use .csv but XLSX is already here
    XLSX.writeFile(wb, `Aurum_Brokers_Export.xlsx`);
  };

  if (authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-aurum-navy/40">
        <Loader2 className="animate-spin text-aurum-gold" size={48} />
        <p className="font-bold tracking-widest text-xs uppercase">جاري التحقق من الهوية...</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-aurum-gold/10"
        >
          <div className="w-24 h-24 bg-aurum-navy rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl">
             <Building2 className="text-aurum-gold" size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-aurum-navy mb-4">لوحة تحكم AURUM</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">يرجى تسجيل الدخول للوصول إلى نظام إدارة البروكرز والمحتوى العالمي.</p>
          <button 
            onClick={loginWithGoogle}
            className="group w-full bg-aurum-navy text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-black transition-all shadow-lg hover:shadow-black/10"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            تسجيل الدخول بجوجل
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 mb-8 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-aurum-navy p-2 rounded-xl shadow-lg shadow-aurum-navy/10">
               <Building2 className="text-aurum-gold" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-aurum-navy">AURUM Admin</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-bold">Enterprise Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-8 divide-x divide-gray-100 divide-x-reverse">
            <div className="flex items-center gap-4">
              <div className="text-right flex flex-col items-end">
                 <div className="text-sm font-bold text-aurum-navy">{user.displayName || 'مدير النظام'}</div>
                 <div className="text-[10px] text-gray-400 font-sans tracking-tight">{user.email}</div>
              </div>
              
              <div className="w-10 h-10 rounded-full border-2 border-aurum-gold/20 p-0.5 shadow-sm">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Admin')}&background=0F172A&color=D4AF37`} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="pr-8">
              <Button 
                variant="ghost"
                size="sm"
                onClick={logout} 
                className="text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8">
        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-8 p-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl flex items-center gap-4 shadow-sm"
            >
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertCircle size={24} className="flex-shrink-0" />
              </div>
              <div className="flex-grow">
                <p className="font-bold">تنبيه صلاحيات</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-red-200/50 rounded-full transition-colors self-start">
                 <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-aurum-navy text-aurum-gold rounded-xl"><Users /></div>
            <div>
              <div className="text-sm text-gray-500">إجمالي البروكرز</div>
              <div className="text-2xl font-bold">{brokers.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-aurum-gold/20 text-aurum-gold rounded-xl"><UserPlus /></div>
            <div>
              <div className="text-sm text-gray-500">طلبات بروكر جديدة</div>
              <div className="text-2xl font-bold">{brokers.filter(b => b.status === 'New').length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><MessageSquare /></div>
            <div>
              <div className="text-sm text-gray-500">رسائل العملاء</div>
              <div className="text-2xl font-bold">{inquiries.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-aurum-gold/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-aurum-cream text-aurum-gold rounded-xl"><CheckCircle2 /></div>
            <div>
              <div className="text-sm text-gray-500">تم التواصل</div>
              <div className="text-2xl font-bold">{inquiries.filter(i => i.status !== 'new').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {hasPermission('manage_brokers') && (
          <button 
            onClick={() => setActiveTab('brokers')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'brokers' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            إدارة البروكرز
            {activeTab === 'brokers' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {hasPermission('manage_inquiries') && (
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'inquiries' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            طلبات العملاء
            {activeTab === 'inquiries' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {hasPermission('manage_leads') && (
          <button 
            onClick={() => setActiveTab('leads')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'leads' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            العملاء (Leads)
            {activeTab === 'leads' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {hasPermission('manage_projects') && (
          <button 
            onClick={() => setActiveTab('projects')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'projects' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            إدارة المشروعات
            {activeTab === 'projects' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {hasPermission('manage_team') && (
          <button 
            onClick={() => setActiveTab('team')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'team' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            فريق العمل
            {activeTab === 'team' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {hasPermission('manage_content') && (
          <button 
            onClick={() => setActiveTab('content')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'content' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            إدارة المحتوى
            {activeTab === 'content' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {isSuperAdmin && (
          <button 
            onClick={() => setActiveTab('staff')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'staff' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            إدارة الصلاحيات
            {activeTab === 'staff' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
        {isSuperAdmin && (
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "pb-4 px-6 font-bold text-lg transition-all relative whitespace-nowrap",
              activeTab === 'settings' ? "text-aurum-navy" : "text-gray-400 hover:text-gray-600"
            )}
          >
            إعدادات النظام
            {activeTab === 'settings' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-aurum-gold rounded-full" />}
          </button>
        )}
      </div>

      {activeTab === 'brokers' && (
        <div className="bg-white rounded-2xl shadow-xl border border-aurum-gold/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-4">
             <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم، الشركة، الهاتف..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-aurum-gold bg-white w-64 text-sm font-sans"
                />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value as any)}
               className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none font-sans"
             >
                <option value="All">كل الحالات</option>
                <option value="New">جديد</option>
                <option value="Active">نشط</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">غير نشط</option>
             </select>
             <select 
               value={sourceFilter}
               onChange={(e) => setSourceFilter(e.target.value as any)}
               className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none font-sans"
             >
                <option value="All">كل المصادر</option>
                <option value="website">الموقع الإلكتروني</option>
                <option value="excel_import">إكسيل</option>
                <option value="google_sheet_import">جوجل شيت</option>
             </select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                setIsBulkEmail(true);
                setSelectedBroker(null);
                setEmailSubject('رسالة من أورم للتطوير العقاري');
                setShowEmailModal(true);
              }} 
              className="bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/10"
              size="sm"
            >
              <Mail size={16} /> إرسال للكل
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={seedBrokers}
              disabled={loading || brokers.length > 0}
              className={cn("bg-aurum-navy text-white hover:bg-black border-none", brokers.length > 0 && "hidden")}
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              استيراد بروكرز افتراضيين
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={exportToCSV} 
              className="bg-green-600 text-white hover:bg-green-700 border-none shadow-green-600/10"
            >
              <Download size={16} /> تصدير البيانات
            </Button>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              <Upload size={16} /> رفع ملف
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download size={16} /> النموذج
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setShowSyncModal(true)}
              className="font-sans"
            >
              <LinkIcon size={16} /> Google Sheet
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[600px] font-sans">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:text-aurum-navy transition-colors text-right"
                  onClick={() => setSortBy('name')}
                >
                  <div className="flex items-center gap-2">
                    الاسم
                    <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-aurum-gold' : 'opacity-20'} />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-right">اسم الشركة</th>
                <th className="px-6 py-4 font-bold text-right">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold text-right">رقم الهاتف</th>
                <th className="px-6 py-4 font-bold text-right">ملاحظات</th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer hover:text-aurum-navy transition-colors text-right"
                  onClick={() => setSortBy('score')}
                >
                  <div className="flex items-center gap-2">
                    الأداء
                    <ArrowUpDown size={12} className={sortBy === 'score' ? 'text-aurum-gold' : 'opacity-20'} />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-right">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBrokers.map((broker) => {
                const scoreDetails = calculateBrokerScore(broker, allLeads, appConfig?.scoringWeights);
                return (
                  <tr key={broker.id} className="hover:bg-aurum-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-aurum-navy">{broker.brokerName}</div>
                      <div className="text-[10px] text-gray-400">{broker.source}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{broker.companyName}</td>
                    <td className="px-6 py-4">
                      {broker.email ? (
                        <a href={`mailto:${broker.email}`} className="text-xs flex items-center gap-2 text-gray-400 hover:text-aurum-gold transition-colors">
                          <Mail size={12} />
                          {broker.email}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-sans text-aurum-navy" dir="ltr">
                      <a href={`tel:${broker.phone}`} className="flex items-center gap-2 hover:text-aurum-gold transition-colors">
                        <Phone size={12} />
                        {broker.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                         onClick={() => {
                           setSelectedBroker(broker);
                           setPrivateNotes(broker.privateNotes || '');
                           setShowNotesModal(true);
                         }}
                         className="text-xs text-gray-500 hover:text-aurum-gold flex items-center gap-2 max-w-[150px]"
                      >
                        <FileText size={12} className="flex-shrink-0" />
                        <span className="truncate">{broker.privateNotes || 'إضافة ملاحظة...'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Award size={14} className={scoreDetails.totalScore > 70 ? 'text-aurum-gold' : 'text-gray-400'} />
                          <span className="font-bold text-aurum-navy">{scoreDetails.totalScore}%</span>
                        </div>
                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all",
                              scoreDetails.totalScore > 70 ? "bg-aurum-gold" : 
                              scoreDetails.totalScore > 40 ? "bg-blue-500" : "bg-gray-400"
                            )} 
                            style={{ width: `${scoreDetails.totalScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={broker.status} 
                        onChange={(e) => brokerService.updateBroker(broker.id!, { status: e.target.value as BrokerStatus })}
                        className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase outline-none bg-transparent cursor-pointer text-right", getStatusColor(broker.status))}
                      >
                         <option value="New">جديد</option>
                         <option value="Active">نشط</option>
                         <option value="VIP">VIP</option>
                         <option value="Inactive">غير نشط</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <a 
                          href={`tel:${broker.phone}`} 
                          onClick={() => trackInteraction(broker.id!, 'call')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-bold shadow-lg shadow-blue-600/20"
                          title="اتصال هاتفي"
                         >
                          <PhoneCall size={14} />
                          <span>اتصال</span>
                         </a>
                         <a 
                          href={`https://wa.me/${broker.phone.replace(/\D/g, '')}`} 
                          onClick={() => trackInteraction(broker.id!, 'whatsapp')}
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="مراسلة واتساب"
                         >
                          <MessageSquare size={16} />
                         </a>
                         <button 
                          onClick={() => {
                            setSelectedBroker(broker);
                            setHistoryFilter('whatsapp');
                            setShowHistoryModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="سجل واتساب"
                         >
                          <Clock size={16} className="text-green-600" />
                         </button>
                         {broker.email && (
                           <button 
                            onClick={() => {
                              setSelectedBroker(broker);
                              setEmailSubject(`مرحباً ${broker.brokerName} - شركة أورم للتطوير العقاري`);
                              setShowEmailModal(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="إرسال إيميل"
                           >
                            <Mail size={16} />
                           </button>
                         )}
                         <button 
                          onClick={() => {
                            setSelectedBroker(broker);
                            setPrivateNotes(broker.privateNotes || '');
                            setShowNotesModal(true);
                          }}
                          className="p-2 text-aurum-navy hover:bg-aurum-navy/10 rounded-lg"
                          title="ملاحظات خاصة"
                         >
                          <FileText size={16} />
                         </button>
                         <button 
                          onClick={() => {
                            setSelectedBroker(broker);
                            setHistoryFilter('all');
                            setShowHistoryModal(true);
                          }}
                          className="p-2 text-aurum-gold hover:bg-aurum-gold/10 rounded-lg"
                          title="سجل التواصل"
                         >
                          <History size={16} />
                         </button>
                         <button onClick={() => deleteBroker(broker.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl shadow-xl border border-aurum-gold/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-aurum-navy">طلبات تواصل العملاء</h2>
            <div className="text-sm text-gray-500">إجمالي الطلبات: {inquiries.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold text-right">اسم العميل</th>
                  <th className="px-6 py-4 font-bold text-right">رقم الهاتف</th>
                  <th className="px-6 py-4 font-bold text-right">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-bold text-right">المشروع</th>
                  <th className="px-6 py-4 font-bold text-right">الرسالة</th>
                  <th className="px-6 py-4 font-bold text-right">الحالة</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-aurum-cream/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-aurum-navy">{inquiry.name}</td>
                    <td className="px-6 py-4 text-sm font-sans" dir="ltr">{inquiry.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">{inquiry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inquiry.projectName || '-'}</td>
                    <td className="px-6 py-4 text-xs text-gray-400 max-w-[200px] truncate" title={inquiry.message}>
                      {inquiry.message}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        inquiry.status === 'new' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      )}>
                        {inquiry.status === 'new' ? 'جديد' : 'تم التواصل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <a 
                          href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-[#25D366] hover:bg-green-50 rounded-lg transition-all"
                        >
                          <MessageSquare size={16} />
                        </a>
                        <a 
                          href={`tel:${inquiry.phone}`} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-aurum-navy text-white rounded-lg hover:bg-black transition-all text-xs font-bold shadow-lg"
                        >
                          <PhoneCall size={14} />
                          <span>اتصال</span>
                        </a>
                        {inquiry.status === 'new' && (
                          <button 
                            onClick={() => inquiryService.updateInquiryStatus(inquiry.id!, 'contacted')}
                            className="p-2 text-aurum-gold hover:bg-aurum-gold/10 rounded-lg transition-all"
                            title="تحديد كمكتمل"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inquiries.length === 0 && (
              <div className="text-center py-20 text-gray-400">لا يوجد طلبات تواصل حالياً.</div>
            )}
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && editingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full shadow-2xl font-sans my-8" dir="rtl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <h3 className="text-3xl font-serif font-bold text-aurum-navy">
                   {editingProject.id ? 'تعديل مشروع' : 'إضافة مشروع جديد'}
                 </h3>
                 <label className="flex items-center gap-2 bg-aurum-gold/10 text-aurum-gold px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-aurum-gold/20 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 transition-all">
                   <input type="file" className="hidden" accept=".pdf" onChange={handleParseProjectPDF} disabled={loading} />
                   {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   تعبئة تلقائية من PDF
                 </label>
               </div>
               <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                 <X size={32} />
               </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
               <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم المشروع (عربي)</label>
                    <input 
                      type="text" 
                      value={editingProject.titleAr || ''}
                      onChange={(e) => setEditingProject({...editingProject, titleAr: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الموقع (عربي)</label>
                    <input 
                      type="text" 
                      value={editingProject.locationAr || ''}
                      onChange={(e) => setEditingProject({...editingProject, locationAr: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">السعر</label>
                    <input 
                      type="text" 
                      value={editingProject.price || ''}
                      onChange={(e) => setEditingProject({...editingProject, price: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                      placeholder="تبدأ من ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع المشروع</label>
                    <select 
                      value={editingProject.type || 'residential'}
                      onChange={(e) => setEditingProject({...editingProject, type: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    >
                      <option value="residential">سكني</option>
                      <option value="office">إداري</option>
                      <option value="retail">تجاري</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رابط الصورة الرئيسية</label>
                    <ImageUpload 
                      currentImage={editingProject.image}
                      onUpload={(url) => setEditingProject({...editingProject, image: url})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">خطة الدفع</label>
                    <input 
                      type="text" 
                      value={editingProject.paymentPlanAr || ''}
                      placeholder="مثال: مقدم 10% وتقسيط..."
                      onChange={(e) => setEditingProject({...editingProject, paymentPlanAr: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رابط فيديو (اختياري)</label>
                    <input 
                      type="text" 
                      value={editingProject.videoUrl || ''}
                      placeholder="https://youtube.com/..."
                      onChange={(e) => setEditingProject({...editingProject, videoUrl: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <FileUpload 
                      label="كتيب المشروع (PDF)"
                      currentFile={editingProject.brochureUrl}
                      onUpload={(url) => setEditingProject({...editingProject, brochureUrl: url})}
                    />
                  </div>
               </div>
            </div>

            <div className="mb-10">
               <label className="block text-sm font-bold text-gray-700 mb-2">وصف المشروع</label>
               <textarea 
                 rows={4}
                 value={editingProject.descriptionAr || ''}
                 onChange={(e) => setEditingProject({...editingProject, descriptionAr: e.target.value})}
                 className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none resize-none"
               />
            </div>

            <div className="flex gap-4">
               <Button 
                variant="gold"
                size="lg"
                onClick={handleSaveProject}
                disabled={loading || !editingProject.titleAr || !editingProject.image}
                className="flex-grow text-xl shadow-2xl"
               >
                 {loading ? <Loader2 className="animate-spin" /> : null}
                 {loading ? 'جاري الحفظ...' : 'حفظ المشروع'}
               </Button>
               <Button 
                variant="secondary"
                size="lg"
                onClick={() => setShowProjectModal(false)}
                className="px-10 text-xl"
               >
                 إلغاء
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamModal && editingMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl font-sans my-8" dir="rtl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-serif font-bold text-aurum-navy">
                {editingMember.id ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={32} />
              </button>
            </div>

            <div className="space-y-6 mb-10">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم (عربي)</label>
                    <input 
                      type="text" 
                      value={editingMember.nameAr || ''}
                      onChange={(e) => setEditingMember({...editingMember, nameAr: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name (English)</label>
                    <input 
                      type="text" 
                      value={editingMember.nameEn || ''}
                      onChange={(e) => setEditingMember({...editingMember, nameEn: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none font-sans"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الدور الوظيفي (عربي)</label>
                    <input 
                      type="text" 
                      value={editingMember.roleAr || ''}
                      onChange={(e) => setEditingMember({...editingMember, roleAr: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role (English)</label>
                    <input 
                      type="text" 
                      value={editingMember.roleEn || ''}
                      onChange={(e) => setEditingMember({...editingMember, roleEn: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none font-sans"
                    />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">صورة العضو</label>
                 <ImageUpload 
                   currentImage={editingMember.image}
                   onUpload={(url) => setEditingMember({...editingMember, image: url})}
                 />
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الترتيب في الصفحة</label>
                  <input 
                    type="number" 
                    value={editingMember.order || 0}
                    onChange={(e) => setEditingMember({...editingMember, order: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none"
                  />
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نبذة مختصرة (عربي)</label>
                    <textarea 
                      value={editingMember.bioAr || ''}
                      onChange={(e) => setEditingMember({...editingMember, bioAr: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-aurum-gold outline-none resize-none"
                    />
                  </div>
               </div>
            </div>

            <div className="flex gap-6 mt-12">
               <Button 
                onClick={handleSaveMember}
                disabled={loading}
                variant="gold"
                size="lg"
                className="flex-grow text-xl h-16 shadow-aurum-gold/20"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                 <span>حفظ بيانات العضو</span>
               </Button>
               <Button 
                onClick={() => setShowTeamModal(false)}
                variant="secondary"
                size="lg"
                className="px-10 text-xl"
               >
                 إلغاء
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl font-sans" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-aurum-navy">
                {historyFilter === 'whatsapp' ? 'سجل واتساب' : 'سجل تواصل'}: {selectedBroker.brokerName}
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600"><LogOut size={20} /></button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto mb-6 pr-2">
              {selectedBroker.logs && selectedBroker.logs.filter(l => historyFilter === 'all' || l.type === 'whatsapp').length > 0 ? (
                <div className="space-y-4">
                  {selectedBroker.logs
                    .filter(l => historyFilter === 'all' || l.type === 'whatsapp')
                    .map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={cn(
                        "p-3 rounded-full flex-shrink-0 flex items-center justify-center",
                        log.type === 'call' ? 'bg-blue-100 text-blue-600' : 
                        log.type === 'whatsapp' ? 'bg-green-100 text-green-600' : 
                        'bg-purple-100 text-purple-600'
                      )}>
                        {log.type === 'call' ? <PhoneCall size={16} /> : 
                         log.type === 'whatsapp' ? <MessageSquare size={16} /> : 
                         <Mail size={16} />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-aurum-navy">
                            {log.type === 'call' ? 'اتصال هاتف' : 
                             log.type === 'whatsapp' ? 'رسالة واتساب' : 
                             'إرسال بريد إلكتروني'}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1" dir="ltr">
                            <Clock size={10} />
                            {new Date(log.timestamp).toLocaleString('ar-EG')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">بواسطة: {log.performedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا يوجد سجل تواصل متاح حالياً لهذا البروكر.</p>
                </div>
              )}
            </div>
            
            <button onClick={() => setShowHistoryModal(false)} className="w-full py-3 rounded-lg font-bold bg-aurum-navy text-white hover:bg-black transition-all">إغلاق</button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (selectedBroker || isBulkEmail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl font-sans" dir="rtl">
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-6">
              {isBulkEmail ? 'إرسال بريد إلكتروني جماعي' : 'إرسال بريد إلكتروني'}
            </h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">المستلم</label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  {isBulkEmail ? `كافة البروكرز (${brokers.filter(b => b.email).length})` : selectedBroker?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">الموضوع</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-aurum-gold outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">الرسالة</label>
                <textarea 
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-aurum-gold outline-none text-sm resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              {isBulkEmail && (
                <p className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded">
                  * سيتم إرسال الإيميل كـ BCC لضمان خصوصية البروكرز. 
                  <br />
                  * قد لا تعمل الروابط الطويلة جداً في بعض برامج البريد.
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSendEmail} 
                disabled={loading || !emailSubject || !emailBody}
                className="flex-grow bg-aurum-gold text-aurum-navy py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-aurum-gold-light transition-all disabled:opacity-50"
              >
                <Send size={18} />
                إرسال الآن
              </button>
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setIsBulkEmail(false);
                }} 
                className="px-6 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl font-sans" dir="rtl">
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-4">ملاحظات خاصة: {selectedBroker.brokerName}</h3>
            <p className="text-sm text-gray-500 mb-6 font-sans">هذه الملاحظات مرئية فقط للمديرين ولا تظهر للبروكر.</p>
            <textarea 
              rows={8}
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-aurum-gold outline-none text-sm resize-none mb-6 font-sans"
              placeholder="اكتب ملاحظاتك الإدارية هنا..."
            />
            <div className="flex gap-4">
              <button 
                onClick={handleUpdateNotes}
                disabled={loading}
                className="flex-grow bg-aurum-navy text-white py-3 rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
              </button>
              <button 
                onClick={() => setShowNotesModal(false)} 
                className="px-6 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50 transition-all font-sans"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl font-sans">
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-4">ربط Google Sheet</h3>
            <p className="text-gray-500 text-sm mb-6">يرجى التأكد من أن الملف "منشور للويب" (Published to Web) بصيغة CSV.</p>
            <input type="text" placeholder="رابط الملف..." value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-6"/>
            <div className="flex gap-4">
               <Button 
                variant="gold"
                onClick={syncGoogleSheet} 
                disabled={loading} 
                className="flex-grow"
               >
                 {loading ? <Loader2 className="animate-spin" /> : null}
                 {loading ? 'جاري...' : 'مزامنة الآن'}
               </Button>
               <Button 
                variant="secondary"
                onClick={() => setShowSyncModal(false)}
               >
                 إلغاء
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && editingStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden font-sans"
            dir="rtl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-aurum-gold/5 rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-serif font-bold text-aurum-navy">
                  {editingStaff.uid ? 'تعديل موظف' : 'إضافة موظف للمنصة'}
                </h3>
                <button onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">UID المستخدم (من Firebase Auth)</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingStaff.uid}
                      value={editingStaff.uid}
                      onChange={(e) => setEditingStaff({...editingStaff, uid: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-aurum-gold/30 focus:bg-white outline-none transition-all disabled:opacity-50"
                      placeholder="e.g. jS9vX..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الموظف</label>
                    <input
                      type="text"
                      required
                      value={editingStaff.displayName}
                      onChange={(e) => setEditingStaff({...editingStaff, displayName: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-aurum-gold/30 focus:bg-white outline-none transition-all"
                      placeholder="الاسم الثلاثي"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={editingStaff.email}
                      onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-aurum-gold/30 focus:bg-white outline-none transition-all font-sans"
                      placeholder="staff@aurum.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">الصلاحيات الممنوحة</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'manage_brokers', label: 'إدارة البروكرز' },
                      { key: 'manage_projects', label: 'إدارة المشروعات' },
                      { key: 'manage_team', label: 'إدارة فريق العمل' },
                      { key: 'manage_content', label: 'إدارة المحتوى' },
                      { key: 'manage_inquiries', label: 'طلبات العملاء' },
                      { key: 'manage_leads', label: 'إدارة العملاء' },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-aurum-gold/5 transition-all">
                        <input 
                          type="checkbox"
                          checked={editingStaff.permissions?.includes(perm.key as Permission)}
                          onChange={(e) => {
                            const perms = [...(editingStaff.permissions || [])];
                            if (e.target.checked) {
                              perms.push(perm.key as Permission);
                            } else {
                              const idx = perms.indexOf(perm.key as Permission);
                              if (idx > -1) perms.splice(idx, 1);
                            }
                            setEditingStaff({...editingStaff, permissions: perms});
                          }}
                          className="w-5 h-5 accent-aurum-gold"
                        />
                        <span className="text-sm font-medium text-aurum-navy">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 relative z-10">
                  <Button 
                    type="submit" 
                    className="flex-grow rounded-2xl py-6 shadow-xl shadow-aurum-gold/10"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save />}
                    حفظ بيانات الموظف
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => setShowStaffModal(false)}
                    className="rounded-2xl py-6"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl font-sans" dir="rtl">
            <h3 className="text-2xl font-serif font-bold text-aurum-navy mb-4">رفع ملف بروكرز</h3>
            
            {!importPreview ? (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all h-[400px]",
                  isDragging ? "border-aurum-gold bg-aurum-gold/10 scale-[1.02]" : "border-gray-200 hover:border-aurum-gold hover:bg-gray-50 bg-white"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileUpload}
              >
                 <div className="bg-aurum-navy/5 p-6 rounded-full mb-6">
                   <FileUp size={64} className="text-aurum-gold" />
                 </div>
                 <span className="text-xl font-bold text-aurum-navy mb-2">اسحب الملف هنا أو اضغط للاختيار</span>
                 <p className="text-gray-400 text-sm mb-6">يدعم ملفات .xlsx، .xls، .csv</p>
                 <input type="file" className="hidden" id="fileImport" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                 <label htmlFor="fileImport" className="bg-aurum-gold text-aurum-navy px-8 py-3 rounded-lg font-bold hover:bg-aurum-gold-light transition-all cursor-pointer shadow-lg active:scale-95">
                   اختيار ملف من الجهاز
                 </label>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 bg-aurum-navy/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-500" />
                    <div>
                      <div className="font-bold text-aurum-navy">{importPreview.fileName}</div>
                      <div className="text-xs text-gray-500">تم تحليل الملف بنجاح. يرجى مراجعة ملخص البيانات:</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200">
                      <div className="text-lg font-bold leading-none">{importPreview.data.filter(d => d.status === 'valid').length}</div>
                      <div className="text-[10px] font-medium uppercase">صالح</div>
                    </div>
                    <div className="text-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                      <div className="text-lg font-bold leading-none">{importPreview.data.filter(d => d.status === 'duplicate').length}</div>
                      <div className="text-[10px] font-medium uppercase">مكرر</div>
                    </div>
                    <div className="text-center px-3 py-1 bg-red-100 text-red-700 rounded-lg border border-red-200">
                      <div className="text-lg font-bold leading-none">{importPreview.data.filter(d => d.status === 'invalid').length}</div>
                      <div className="text-[10px] font-medium uppercase">خطأ</div>
                    </div>
                  </div>
                </div>

                <div className="max-h-[350px] overflow-y-auto mb-6 border border-gray-100 rounded-xl">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 font-bold">الاسم</th>
                        <th className="px-4 py-3 font-bold">الهاتف</th>
                        <th className="px-4 py-3 font-bold">الحالة</th>
                        <th className="px-4 py-3 font-bold">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {importPreview.data.map((row, idx) => (
                        <tr key={idx} className={cn(
                          row.status === 'invalid' ? 'bg-red-50/30' : 
                          row.status === 'duplicate' ? 'bg-orange-50/30' : 
                          'bg-white'
                        )}>
                          <td className="px-4 py-3">
                            <div className={cn("font-medium", !row.brokerName && "text-red-500 italic")}>
                              {row.brokerName || 'الاسم مفقود'}
                            </div>
                            <div className="text-[10px] text-gray-400">{row.companyName || 'لا يوجد شركة'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={cn("font-sans", !row.phone && "text-red-500 italic")} dir="ltr">
                              {row.phone || 'رقم غير متوفر'}
                            </div>
                            {row.email && <div className="text-[10px] text-gray-400">{row.email}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              row.status === 'valid' ? 'bg-green-100 text-green-700' :
                              row.status === 'duplicate' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {row.status === 'valid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {row.status === 'valid' ? 'صالح' : row.status === 'duplicate' ? 'مكرر' : 'خطأ'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-gray-500">
                            {row.validationError || <span className="text-green-500">جاهز للاستيراد</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 p-4 border-t border-gray-100 -mx-8 -mb-8 bg-gray-50/50 rounded-b-2xl">
                  <div className="flex-grow flex gap-4">
                    <button 
                      onClick={confirmImport}
                      disabled={loading || importPreview.data.filter(i => i.status === 'valid').length === 0}
                      className="flex-grow bg-aurum-gold text-aurum-navy py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-aurum-gold-light transition-all disabled:opacity-50 shadow-xl"
                    >
                      <Download size={20} />
                      {loading ? 'جاري الاستيراد...' : `استيراد ${importPreview.data.filter(i => i.status === 'valid').length} بروكر`}
                    </button>
                    <button 
                      onClick={() => setImportPreview(null)}
                      className="px-6 py-4 rounded-xl font-bold border border-aurum-gold text-aurum-gold hover:bg-aurum-gold/10 transition-all flex items-center gap-2"
                    >
                      <RefreshCcw size={18} /> تغيير الملف
                    </button>
                  </div>
                  <button 
                    onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                    className="px-8 py-4 rounded-xl font-bold border border-gray-200 hover:bg-white bg-transparent transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
            
            {!importPreview && (
              <button 
                onClick={() => setShowImportModal(false)} 
                className="mt-8 w-full py-3 rounded-lg font-bold border border-gray-200 text-gray-400 hover:bg-gray-50"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white rounded-2xl shadow-xl border border-aurum-gold/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-aurum-navy">سجل العملاء (Leads)</h2>
            <div className="text-sm text-gray-500">إجمالي العملاء: {allLeads.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold text-right">اسم العميل</th>
                  <th className="px-6 py-4 font-bold text-right">رقم الهاتف</th>
                  <th className="px-6 py-4 font-bold text-right">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-bold text-right">المشروع</th>
                  <th className="px-6 py-4 font-bold text-right">البروكر المسجل</th>
                  <th className="px-6 py-4 font-bold text-right">الحالة</th>
                  <th className="px-6 py-4 font-bold text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allLeads.map((lead) => {
                  const targetProject = projects.find(p => p.id === lead.projectId) || INITIAL_PROJECTS.find(p => p.id === lead.projectId);
                  const broker = brokers.find(b => b.id === lead.brokerId);
                  return (
                    <tr key={lead.id} className="hover:bg-aurum-cream/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-aurum-navy">{lead.name}</td>
                      <td className="px-6 py-4 text-sm font-sans" dir="ltr">{lead.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lead.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{targetProject?.titleAr || 'غير محدد'}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-aurum-gold">{broker?.brokerName || 'غير معروف'}</div>
                        <div className="text-[10px] text-gray-400">{broker?.companyName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          lead.status === 'closed' ? "bg-green-100 text-green-700" :
                          lead.status === 'lost' ? "bg-red-100 text-red-700" :
                          "bg-aurum-gold/20 text-aurum-navy"
                        )}>
                          {lead.status === 'closed' ? 'تم التعاقد' : 
                          lead.status === 'negotiation' ? 'في التفاوض' : 
                          lead.status === 'contacted' ? 'تم التواصل' : 
                          lead.status === 'lost' ? 'خسارة' : 'مهتم جديد'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-gray-400 font-sans" dir="ltr">
                        {lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleString('ar-EG') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allLeads.length === 0 && (
              <div className="text-center py-20 text-gray-400">لا يوجد عملاء مسجلين حالياً.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && appConfig && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Notifications Section */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-aurum-gold/10">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
              <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                <Settings size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy">إعدادات الإشعارات</h2>
                <p className="text-gray-500 text-sm">إدارة تنبيهات النظام والبريد الإلكتروني</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    appConfig.emailNotificationsEnabled ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                  )}>
                    {appConfig.emailNotificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
                  </div>
                  <div>
                    <div className="font-bold text-aurum-navy">إشعارات البريد الإلكتروني</div>
                    <div className="text-xs text-gray-400">إرسال ملخص نشاط البروكرز للمدير</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => configService.updateConfig({ emailNotificationsEnabled: !appConfig.emailNotificationsEnabled })}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors duration-300",
                    appConfig.emailNotificationsEnabled ? "bg-aurum-gold" : "bg-gray-300"
                  )}
                >
                  <motion.div 
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: appConfig.emailNotificationsEnabled ? 24 : 0 }}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">بريد المدير المستلم</label>
                <div className="flex gap-4">
                  <input 
                    type="email" 
                    value={appConfig.adminEmail}
                    onChange={(e) => setAppConfig({...appConfig, adminEmail: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="admin@aurum.com"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ adminEmail: appConfig.adminEmail })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    حفظ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-aurum-gold/10">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
              <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                <Share2 size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy">وسائل التواصل الاجتماعي</h2>
                <p className="text-gray-500 text-sm">ربط حسابات فيسبوك وإنستجرام وتويتر ولينكد إن وتيك توك</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Facebook size={16} className="text-blue-600" />
                  رابط فيسبوك
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={appConfig.facebookUrl || ''}
                    onChange={(e) => setAppConfig({...appConfig, facebookUrl: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="https://facebook.com/yourpage"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ facebookUrl: appConfig.facebookUrl })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    حفظ
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Instagram size={16} className="text-pink-600" />
                  رابط إنستجرام
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={appConfig.instagramUrl || ''}
                    onChange={(e) => setAppConfig({...appConfig, instagramUrl: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="https://instagram.com/yourprofile"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ instagramUrl: appConfig.instagramUrl })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    حفظ
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Twitter size={16} className="text-sky-500" />
                  رابط تويتر
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={appConfig.twitterUrl || ''}
                    onChange={(e) => setAppConfig({...appConfig, twitterUrl: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="https://twitter.com/yourprofile"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ twitterUrl: appConfig.twitterUrl })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    حفظ
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Linkedin size={16} className="text-blue-700" />
                  رابط لينكد إن
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={appConfig.linkedinUrl || ''}
                    onChange={(e) => setAppConfig({...appConfig, linkedinUrl: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ linkedinUrl: appConfig.linkedinUrl })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    حفظ
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Music size={16} className="text-black" />
                  رابط تيك توك
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={appConfig.tiktokUrl || ''}
                    onChange={(e) => setAppConfig({...appConfig, tiktokUrl: e.target.value})}
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                    placeholder="https://tiktok.com/@youraccount"
                  />
                  <button 
                    onClick={() => configService.updateConfig({ tiktokUrl: appConfig.tiktokUrl })}
                    className="bg-aurum-navy text-white px-8 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    حفظ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Tracking Section */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-aurum-gold/10">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
              <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy">تتبع الإعلانات (Pixels)</h2>
                <p className="text-gray-500 text-sm">أضف معرفات التتبع لـ Meta و TikTok لمتابعة أداء حملاتك</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Meta Pixel ID</label>
                <input 
                  type="text" 
                  value={appConfig.metaPixelId || ''}
                  onChange={(e) => setAppConfig({...appConfig, metaPixelId: e.target.value})}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                  placeholder="ID: 15478954..."
                />
                <button 
                  onClick={() => configService.updateConfig({ metaPixelId: appConfig.metaPixelId })}
                  className="w-full bg-aurum-navy text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
                >
                  حفظ معرف Meta
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">TikTok Pixel ID</label>
                <input 
                  type="text" 
                  value={appConfig.tiktokPixelId || ''}
                  onChange={(e) => setAppConfig({...appConfig, tiktokPixelId: e.target.value})}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-aurum-gold/20 font-sans"
                  placeholder="ID: C9J2B..."
                />
                <button 
                  onClick={() => configService.updateConfig({ tiktokPixelId: appConfig.tiktokPixelId })}
                  className="w-full bg-aurum-navy text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
                >
                  حفظ معرف TikTok
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl flex items-start gap-3">
               <Info size={20} className="flex-shrink-0 mt-0.5" />
               <p className="text-xs leading-relaxed">
                  عند إضافة معرفات التتبع، سيقوم الموقع تلقائياً بتفعيل أكواد التتبع اللازمة لقياس التحويلات (Conversions) وتحسين وصول إعلاناتك للجمهور المستهدف.
               </p>
            </div>
          </div>

          {/* Broker Scoring Weights Section */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-aurum-gold/10">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
              <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                <Award size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy">إعدادات تقييم البروكرز</h2>
                <p className="text-gray-500 text-sm">حدد الأوزان النسبية لكل معيار من معايير تقييم الأداء</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                {[
                  { key: 'registration', label: 'اكتمال البيانات', icon: <FileText size={18} /> },
                  { key: 'communication', label: 'تكرار التواصل', icon: <MessageSquare size={18} /> },
                  { key: 'closure', label: 'معدل إغلاق الصفقات', icon: <CheckCircle2 size={18} /> },
                  { key: 'vip', label: 'حالة VIP', icon: <Award size={18} /> }
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-bold text-aurum-navy flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </label>
                      <span className="font-sans text-aurum-gold font-bold">
                        {appConfig.scoringWeights[item.key as keyof typeof appConfig.scoringWeights]} نقطة
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={appConfig.scoringWeights[item.key as keyof typeof appConfig.scoringWeights]}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);
                        setAppConfig({
                          ...appConfig,
                          scoringWeights: {
                            ...appConfig.scoringWeights,
                            [item.key]: newVal
                          }
                        });
                      }}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-aurum-gold"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-between bg-aurum-cream/10 p-8 rounded-3xl border border-aurum-gold/10">
                <div>
                  <h3 className="font-sans font-bold text-aurum-navy mb-4">إجمالي نقاط التقييم</h3>
                  <div className="text-5xl font-serif font-bold text-aurum-gold mb-2">
                    {Object.values(appConfig.scoringWeights as Record<string, number>).reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    يتم احتساب أداء البروكر بناءً على مجموع هذه النقاط. المجموع المثالي هو 100، ولكن يمكنك تعديله حسب احتياجاتك.
                  </p>
                </div>
                
                <Button 
                  onClick={() => configService.updateConfig({ scoringWeights: appConfig.scoringWeights })}
                  className="w-full mt-6"
                  variant="gold"
                >
                  <Save size={18} />
                  حفظ إعدادات التقييم
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-aurum-gold/10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                 <Building2 size={32} />
               </div>
               <div>
                 <h2 className="text-2xl font-serif font-bold text-aurum-navy">إدارة المشروعات العقارية</h2>
                 <p className="text-gray-500 text-sm">أضف، عدل أو احذف مشروعات أورم العقارية</p>
               </div>
            </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 bg-aurum-navy text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-black hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-black/10">
                  <input type="file" className="hidden" accept=".pdf" onChange={handleParseProjectPDF} disabled={loading} />
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  إضافة من PDF
                </label>
                {projects.length === 0 && (
                <Button 
                  variant="primary"
                  onClick={seedProjects} 
                  disabled={loading}
                >
                  <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                  استيراد البيانات الأساسية
                </Button>
              )}
              <Button 
                variant="gold"
                onClick={() => { setEditingProject({}); setShowProjectModal(true); }}
              >
                <UserPlus size={18} />
                إضافة مشروع جديد
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all">
                <div className="relative h-48">
                  <img src={project.image} alt={project.titleAr} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingProject(project); setShowProjectModal(true); }}
                      className="p-2 bg-white text-aurum-navy rounded-lg shadow-lg hover:scale-110 transition-transform"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('حذف المشروع؟')) projectService.deleteProject(project.id!); }}
                      className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-aurum-gold font-bold uppercase tracking-widest mb-2">{project.type}</div>
                  <h3 className="text-xl font-serif font-bold text-aurum-navy mb-2">{project.titleAr}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin size={14} />
                    {project.locationAr}
                  </div>
                  <div className="text-lg font-bold text-aurum-gold">{project.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-aurum-gold/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-aurum-navy text-aurum-gold rounded-2xl">
                <Users size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-aurum-navy">إدارة فريق العمل</h2>
                <p className="text-gray-500 text-sm">إضافة وتعديل أعضاء فريق أورم العقارية</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setEditingMember({ order: teamMembers.length + 1 });
                setShowTeamModal(true);
              }}
              variant="gold"
              className="px-8"
            >
              <UserPlus size={20} />
              إضافة عضو جديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
                <div className="aspect-[4/5] relative group">
                  <img src={member.image} alt={member.nameAr} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => {
                        setEditingMember(member);
                        setShowTeamModal(true);
                      }}
                      className="p-3 bg-white text-aurum-navy rounded-full hover:bg-aurum-gold transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => member.id && handleDeleteMember(member.id)}
                      className="p-3 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <div className="text-xs font-bold text-aurum-gold mb-1">{member.roleAr}</div>
                  <h3 className="font-bold text-aurum-navy text-lg">{member.nameAr}</h3>
                  <div className="text-xs text-gray-400 mt-2 font-mono">الترتيب: {member.order}</div>
                </div>
              </div>
            ))}
          </div>

          {teamMembers.length === 0 && (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
               <Users size={64} className="mx-auto text-gray-200 mb-6" />
               <p className="text-gray-400 text-lg">لم يتم إضافة أي أعضاء للفريق بعد.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-aurum-gold/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-aurum-gold via-aurum-navy to-aurum-gold" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-aurum-navy text-aurum-gold rounded-[1.5rem] shadow-xl rotate-3">
                  <Layout size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-aurum-navy">إدارة المحتوى الذكي</h2>
                  <p className="text-gray-500 font-medium">تحكم في كافة نصوص ومصطلحات الموقع بالعربية والإنجليزية</p>
                </div>
              </div>
              
              <div className="relative w-full md:w-80 group">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-aurum-gold group-focus-within:scale-110 transition-transform" size={20} />
                 <input 
                   type="text" 
                   placeholder="ابحث عن نص، عنوان، أو مفتاح..." 
                   className="w-full pr-12 pl-6 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-aurum-gold/10 text-sm font-sans transition-all placeholder:text-gray-300"
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>
          </div>

          <div className="space-y-16">
             {/* Dynamic Grouping by Section */}
             {['Global', 'Home', 'About', 'Projects', 'Contact', 'Footer'].map(section => {
               const keysInSection = CMS_KEYS.filter(k => k.section === section && (
                 !searchTerm || 
                 k.label.includes(searchTerm) || 
                 k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 section.toLowerCase().includes(searchTerm.toLowerCase())
               ));
               
               if (keysInSection.length === 0) return null;

               return (
                 <div key={section} className="space-y-8">
                    <div className="flex items-center gap-4 px-4 overflow-hidden">
                       <h3 className="text-2xl font-serif font-bold text-aurum-navy whitespace-nowrap">
                         {section === 'Global' ? 'الإعدادات العامة لموقع أورم' : `قسم: ${section === 'Home' ? 'الرئيسية' : section === 'About' ? 'من نحن' : section === 'Projects' ? 'المشاريع' : section === 'Contact' ? 'اتصل بنا' : section === 'Footer' ? 'تذييل الصفحة' : section}`}
                       </h3>
                       <div className="h-[2px] bg-gradient-to-l from-aurum-gold/20 to-transparent flex-grow rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                       {keysInSection.map(item => (
                         <CMSContentItem key={item.key} item={item} siteContent={siteContent} />
                       ))}
                    </div>
                 </div>
               );
             })}

             {/* Discovered Keys (Unregistered dynamic keys) */}
             {Object.keys(siteContent).filter(k => !CMS_KEYS.some(ck => ck.key === k) && !k.endsWith('_en')).length > 0 && (
               <div className="space-y-8 border-t border-gray-100 pt-16">
                  <div className="flex items-center gap-4 px-4">
                     <div className="p-3 bg-gray-100 text-gray-400 rounded-xl">
                        <Sparkles size={24} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-serif font-bold text-gray-400 italic">نصوص تم اكتشافها ديناميكياً</h3>
                        <p className="text-gray-300 text-sm">هذه المفاتيح ليست جزءاً من التكوين الأساسي ولكنها موجودة في قاعدة البيانات</p>
                     </div>
                     <div className="h-px bg-gray-50 flex-grow" />
                  </div>
                  <div className="grid grid-cols-1 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                     {Object.keys(siteContent)
                       .filter(k => !CMS_KEYS.some(ck => ck.key === k) && !k.endsWith('_en'))
                       .filter(k => !searchTerm || k.toLowerCase().includes(searchTerm.toLowerCase()))
                       .map(key => (
                       <CMSContentItem 
                        key={key} 
                        item={{ key, label: `مفتاح مكتشف: ${key}`, section: 'Discovered' }} 
                        siteContent={siteContent} 
                       />
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'staff' && isSuperAdmin && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-aurum-gold/10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-aurum-navy text-aurum-gold rounded-[1.5rem] shadow-xl">
                    <Target size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-aurum-navy">إدارة صلاحيات العاملين</h2>
                    <p className="text-gray-500 font-medium">تعيين وتعديل صلاحيات الوصول لموظفي النظام</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setEditingStaff({ uid: '', email: '', displayName: '', permissions: [] });
                    setShowStaffModal(true);
                  }}
                  variant="gold"
                  className="rounded-full px-8 shadow-aurum-gold/20"
                >
                  <UserPlus size={20} /> إضافة موظف جديد
                </Button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffMembers.map(staff => (
                <div key={staff.uid} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative">
                   {staff.isSuperAdmin && (
                     <div className="absolute top-4 left-4 bg-aurum-gold text-aurum-navy text-[10px] font-bold px-2 py-1 rounded">SUPER ADMIN</div>
                   )}
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-aurum-navy text-aurum-gold rounded-full flex items-center justify-center text-xl font-bold">
                        {staff.displayName?.[0] || staff.email[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-aurum-navy">{staff.displayName || 'بدون اسم'}</h4>
                        <p className="text-xs text-gray-400 font-sans">{staff.email}</p>
                      </div>
                   </div>

                   <div className="space-y-2 mb-8">
                      <p className="text-[10px] font-bold text-aurum-gold uppercase tracking-widest mb-2">الصلاحيات</p>
                      <div className="flex flex-wrap gap-2">
                        {(staff.permissions || []).map(p => {
                          const labels: Record<string, string> = {
                            manage_brokers: 'إدارة البروكرز',
                            manage_projects: 'إدارة المشروعات',
                            manage_team: 'إدارة فريق العمل',
                            manage_content: 'إدارة المحتوى',
                            manage_inquiries: 'طلبات العملاء',
                            manage_leads: 'إدارة العملاء'
                          };
                          return (
                            <span key={p} className="text-[10px] bg-aurum-gold/10 text-aurum-navy px-2 py-1 rounded-lg border border-aurum-gold/20">
                              {labels[p] || p}
                            </span>
                          );
                        })}
                        {(!staff.permissions || staff.permissions.length === 0) && <span className="text-xs text-gray-300 italic">بدون صلاحيات</span>}
                      </div>
                   </div>

                   {!staff.isSuperAdmin && (
                     <div className="flex gap-2 pt-6 border-t border-gray-50">
                        <Button 
                          onClick={() => {
                            setEditingStaff(staff);
                            setShowStaffModal(true);
                          }}
                          variant="secondary"
                          className="flex-grow rounded-xl"
                        >
                          <Edit size={16} /> تعديل
                        </Button>
                        <button 
                          onClick={() => handleDeleteStaff(staff.uid)}
                          className="p-3 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'settings' && isSuperAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-aurum-gold/10 p-8 space-y-8 animate-in fade-in">
          <div className="flex items-center gap-4 mb-6">
             <div className="p-3 bg-aurum-navy text-aurum-gold rounded-xl"><Settings /></div>
             <h2 className="text-2xl font-serif font-bold text-aurum-navy">إعدادات النظام</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Globe size={18} className="text-aurum-gold" /> تفعيل اللغات</h3>
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span>اللغة العربية (افتراضية)</span>
                <CheckCircle2 className="text-green-500" />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span>اللغة الإنجليزية</span>
                <Button size="sm" variant="outline">تعطيل</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Target size={18} className="text-aurum-gold" /> أدوات البيانات</h3>
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={seedProjects} className="justify-start gap-4 h-14 rounded-xl border-dashed">
                  <RefreshCcw size={18} /> استيراد المشاريع الافتراضية
                </Button>
                <Button variant="outline" onClick={seedBrokers} className="justify-start gap-4 h-14 rounded-xl border-dashed">
                  <RefreshCcw size={18} /> تحميل بيانات بروكرز تجريبية
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
