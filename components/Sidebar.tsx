
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: Page.Dashboard, icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: Page.Connect, icon: 'fa-link', label: 'Connect WhatsApp' },
    { id: Page.Training, icon: 'fa-robot', label: 'AI Training' },
    { id: Page.Leads, icon: 'fa-users', label: 'Leads' },
    { id: Page.LiveChat, icon: 'fa-comments', label: 'Live Chat (Bot Test)' },
    { id: Page.Billing, icon: 'fa-credit-card', label: 'Billing' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <i className="fa-brands fa-whatsapp text-2xl text-white"></i>
        </div>
        <span className="font-bold text-xl tracking-tight">WhatsAppBot AI</span>
      </div>

      <nav className="flex-1 mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  currentPage === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="https://picsum.photos/seed/user123/100" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-slate-700"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Elite Coaching</p>
            <p className="text-xs text-slate-500 truncate">Pro Account</p>
          </div>
        </div>
        <button className="w-full text-left text-slate-400 hover:text-white text-sm flex items-center gap-2">
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
