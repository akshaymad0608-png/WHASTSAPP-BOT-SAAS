
import React, { useState, useMemo } from 'react';
import { Stats, Lead } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardHomeProps {
  stats: Stats;
  recentLeads: Lead[];
}

type Period = '7days' | '30days' | '24h';

const DashboardHome: React.FC<DashboardHomeProps> = ({ stats, recentLeads = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7days');

  const activityData = useMemo(() => {
    return [
      { name: 'Mon', chats: 45, leads: 12 },
      { name: 'Tue', chats: 52, leads: 15 },
      { name: 'Wed', chats: 38, leads: 8 },
      { name: 'Thu', chats: 65, leads: 22 },
      { name: 'Fri', chats: 48, leads: 18 },
      { name: 'Sat', chats: 30, leads: 10 },
      { name: 'Sun', chats: 25, leads: 5 },
    ];
  }, [selectedPeriod]);

  const leadStatusData = [
    { name: 'New', value: 45, color: '#3b82f6' },
    { name: 'Contacted', value: 30, color: '#f59e0b' },
    { name: 'Closed', value: 25, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring your bot performance in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Conversations', value: stats.totalChats, icon: 'fa-comments', color: 'blue' },
          { label: 'Total Leads', value: stats.totalLeads, icon: 'fa-user-plus', color: 'emerald' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: 'fa-chart-line', color: 'amber' },
          { label: 'Avg. Bot Speed', value: '1.2s', icon: 'fa-bolt', color: 'purple' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl ${
              item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              item.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
            }`}><i className={`fa-solid ${item.icon}`}></i></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <p className="text-2xl font-black text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-black text-slate-800 mb-8">Performance Trends</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="chats" stroke="#10b981" fill="#10b98120" strokeWidth={4} isAnimationActive={false} />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="#3b82f620" strokeWidth={4} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-8">Lead Funnel</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadStatusData} innerRadius={60} outerRadius={80} dataKey="value" isAnimationActive={false}>
                  {leadStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
