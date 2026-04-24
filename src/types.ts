export type BrokerStatus = 'New' | 'Active' | 'Inactive' | 'VIP';
export type BrokerSource = 'website' | 'excel_import' | 'google_sheet_import';
export type InteractionType = 'call' | 'email' | 'whatsapp';
export type UserRole = 'admin' | 'broker' | 'user';

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email: string;
  projectId: string; 
  status: 'interested' | 'contacted' | 'negotiation' | 'closed' | 'lost';
  brokerId: string; 
  brokerEmail: string; // Added for secure filtering
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CommunicationLog {
  id: string;
  type: InteractionType;
  timestamp: string;
  performedBy: string;
}

export interface Broker {
  id?: string;
  brokerName: string;
  companyName: string;
  email: string;
  phone: string;
  notes: string;
  source: BrokerSource;
  status: BrokerStatus;
  privateNotes?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  logs?: CommunicationLog[];
}

export interface Project {
  id: string;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  price: string;
  type: 'residential' | 'commercial' | 'office' | 'retail';
  image: string;
  gallery?: string[];
  descriptionAr: string;
  paymentPlanAr: string;
  videoUrl?: string;
  brochureUrl?: string;
  coordinates?: { lat: number; lng: number };
  isUnderConstruction?: boolean;
}

export interface TeamMember {
  id?: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  image: string;
  bioAr?: string;
  bioEn?: string;
  order: number;
}

export type Permission = 'manage_brokers' | 'manage_projects' | 'manage_team' | 'manage_content' | 'manage_inquiries' | 'manage_leads';

export interface StaffMember {
  uid: string;
  email: string;
  displayName: string;
  permissions: Permission[];
  isSuperAdmin?: boolean; // Primary admin like elmenayar123
  createdAt: any;
}
