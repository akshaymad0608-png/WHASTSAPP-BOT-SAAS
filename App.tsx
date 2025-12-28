
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import AITraining from './components/AITraining';
import LeadsTable from './components/LeadsTable';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import Billing from './components/Billing';
import { Page, BusinessInfo, Lead, Stats } from './types';
import { DEFAULT_BUSINESS_INFO, INITIAL_LEADS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [stats, setStats] = useState<Stats>({
    totalChats: 248,
    totalLeads: 42,
    conversionRate: 16.9
  });

  const handleLeadCaptured = (newLead: any) => {
    if (!newLead) return;
    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name || 'Anonymous',
      phone: newLead.phone || 'Unknown',
      requirement: newLead.requirement || 'No details provided',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'New'
    };
    setLeads(prev => [lead, ...prev]);
    setStats(prev => {
      const newTotalLeads = prev.totalLeads + 1;
      const newTotalChats = Math.max(prev.totalChats, newTotalLeads);
      return {
        ...prev,
        totalLeads: newTotalLeads,
        totalChats: newTotalChats,
        conversionRate: parseFloat(((newTotalLeads / newTotalChats) * 100).toFixed(1))
      };
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <DashboardHome stats={stats} recentLeads={leads} />;
      case Page.Training:
        return <AITraining businessInfo={businessInfo} onUpdate={setBusinessInfo} />;
      case Page.Leads:
        return <LeadsTable leads={leads} />;
      case Page.LiveChat:
        return (
          <div className="h-[calc(100vh-8rem)] -mt-4 -mx-4 flex animate-fadeIn overflow-hidden">
            {/* Inbox Sidebar */}
            <div className="w-80 bg-white border-r border-gray-100 flex flex-col hidden lg:flex">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Inbox</h2>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">4 Active</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {[
                  { name: 'Sohan Kumar', last: 'Looking for 12th commerce...', time: '2m', active: true },
                  { name: 'Anita Shah', last: 'What are the demo timings?', time: '14m', active: false },
                  { name: 'Rahul V.', last: 'Sent a voice note', time: '1h', active: false },
                  { name: 'Priya Verma', last: 'When do classes start?', time: '3h', active: false },
                ].map((chat, i) => (
                  <div key={i} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${chat.active ? 'bg-emerald-50/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 uppercase">{chat.name[0]}</div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-xs font-bold text-gray-800 truncate">{chat.name}</p>
                          <span className="text-[9px] text-gray-400">{chat.time}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{chat.last}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Main Chat Simulator */}
            <div className="flex-1 p-6 flex flex-col">
              <WhatsAppSimulator businessInfo={businessInfo} onLeadCaptured={handleLeadCaptured} />
            </div>
            {/* Right Panel: CRM Context */}
            <div className="w-80 bg-white border-l border-gray-100 p-6 hidden xl:block">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-address-card text-emerald-500"></i>
                Lead Context
              </h3>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">AI Bot Status</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-emerald-600">Active Autopilot</span>
                    <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">The bot is currently handling this conversation using the "Hinglish" training profile.</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Quick Shortcuts</p>
                  <button className="w-full text-left p-3 text-xs bg-white border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-user-check text-blue-500"></i> Mark as Potential Lead
                  </button>
                  <button className="w-full text-left p-3 text-xs bg-white border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-headset text-amber-500"></i> Take Over Chat (Human)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case Page.Connect:
        return (
          <div className="animate-fadeIn max-w-2xl space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Connect Your WhatsApp</h1>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-qrcode text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold">Scan QR Code to Connect</h3>
              <p className="text-gray-500">Official Meta Cloud API linking ensures your privacy and security.</p>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppBotDemo" className="mx-auto" />
              </div>
            </div>
          </div>
        );
      case Page.Billing:
        return <Billing />;
      default:
        return <DashboardHome stats={stats} recentLeads={leads} />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
