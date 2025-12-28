
export interface BusinessInfo {
  name: string;
  industry: string;
  description: string;
  faqs: { question: string; answer: string }[];
  contactPhone: string;
  languagePreference: 'English' | 'Hindi' | 'Hinglish';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  requirement: string;
  timestamp: string;
  status: 'New' | 'Contacted' | 'Closed';
}

export interface Message {
  id: string;
  sender: 'customer' | 'bot' | 'agent';
  text: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'audio' | 'file';
  mediaUrl?: string;
  fileName?: string;
}

export enum Page {
  Dashboard = 'dashboard',
  Training = 'training',
  Leads = 'leads',
  LiveChat = 'live-chat',
  Billing = 'billing',
  Connect = 'connect'
}

export interface Stats {
  totalChats: number;
  totalLeads: number;
  conversionRate: number;
}
