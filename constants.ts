
import { BusinessInfo, Lead } from './types';

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: 'Elite Coaching Classes',
  industry: 'Education',
  description: 'We provide 10th and 12th board coaching for Science and Commerce students in Mumbai. Our mission is to provide quality education at affordable prices with expert faculty.',
  faqs: [
    { question: 'What are the timings?', answer: 'Morning batch: 8 AM - 12 PM, Evening batch: 4 PM - 8 PM.' },
    { question: 'Do you provide notes?', answer: 'Yes, we provide printed notes and weekly test series.' },
    { question: 'Where is the branch located?', answer: 'We are located at 2nd Floor, Sai Commercial Center, Dadar West, Mumbai.' },
    { question: 'Is there a demo lecture?', answer: 'Yes, we offer 2 days of free demo lectures for all new students.' },
    { question: 'What is the fee for 12th Science?', answer: 'The total fee for 12th Science is ₹45,000, which can be paid in 3 installments.' }
  ],
  contactPhone: '+91 9876543210',
  languagePreference: 'Hinglish'
};

export const INITIAL_LEADS: Lead[] = [
  { id: '1', name: 'Rahul Sharma', phone: '9820012345', requirement: 'Inquiry for 12th Science batch', timestamp: '2023-10-25 14:30', status: 'New' },
  { id: '2', name: 'Priya Verma', phone: '9930054321', requirement: 'Wants demo class for Commerce', timestamp: '2023-10-26 10:15', status: 'Contacted' },
  { id: '3', name: 'Amit Gupta', phone: '9769011223', requirement: 'Discount on group admission', timestamp: '2023-10-27 16:45', status: 'Closed' }
];

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['50 Chats / Month', 'Basic AI Replies', 'Manual Leads Export', '1 Business Profile'],
    icon: 'fa-seedling',
    color: 'slate'
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 499,
    yearlyPrice: 4790,
    features: ['500 Chats / Month', 'Standard AI Training', 'Automatic Lead Capture', 'Google Sheets Sync'],
    icon: 'fa-rocket',
    color: 'blue'
  },
  {
    id: 'pro',
    name: 'Business Pro',
    monthlyPrice: 999,
    yearlyPrice: 9590,
    features: ['Unlimited Chats', 'Advanced Logic Training', 'Multi-language Support', 'Premium Analytics', 'Priority API Access'],
    icon: 'fa-crown',
    color: 'emerald',
    highlight: true,
    badge: 'Most Popular'
  },
  {
    id: 'agency',
    name: 'Agency Elite',
    monthlyPrice: 2999,
    yearlyPrice: 28790,
    features: ['White Label Dashboard', 'Manage 10 Clients', 'Dedicated Account Manager', 'Custom Integration', 'Lead Routing Engine'],
    icon: 'fa-building-shield',
    color: 'indigo'
  }
];
