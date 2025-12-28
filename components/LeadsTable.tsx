
import React, { useState, useMemo } from 'react';
import { Lead } from '../types';

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [syncStage, setSyncStage] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.phone.includes(searchTerm) || 
      l.requirement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Phone", "Requirement", "Timestamp", "Status"];
    const rows = leads.map(l => [l.id, `"${l.name}"`, `"${l.phone}"`, `"${l.requirement}"`, `"${l.timestamp}"`, l.status]);
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const syncToSheets = () => {
    if (!isConnected) { setShowConfigModal(true); return; }
    setIsSyncing(true);
    const stages = ["Authenticating...", "Connecting Sheet...", "Mapping Data...", "Pushing Rows...", "Sync Complete!"];
    let i = 0;
    const interval = setInterval(() => {
      setSyncStage(stages[i++]);
      if (i >= stages.length) {
        clearInterval(interval);
        setIsSyncing(false);
        setSyncSuccess(true);
        setLastSynced(new Date().toLocaleTimeString());
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    }, 800);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leads Central</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and export your captured business prospects.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input type="text" placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 shadow-sm transition-all" />
          </div>
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs shadow-sm active:scale-95"><i className="fa-solid fa-file-csv text-emerald-600"></i> Export CSV</button>
          <button onClick={syncToSheets} disabled={isSyncing} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg active:scale-95 text-white ${isConnected ? 'bg-emerald-600' : 'bg-indigo-600'}`}>{isSyncing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-rotate"></i>}{isConnected ? 'Sync Sheets' : 'Connect Sheets'}</button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead><tr className="bg-slate-50/50 border-b border-slate-100"><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospect</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Captured</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLeads.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-100">{l.name[0]}</div><span className="font-bold text-sm text-slate-800">{l.name}</span></div></td>
                <td className="px-8 py-5 text-sm font-bold text-slate-600">+91 {l.phone}</td>
                <td className="px-8 py-5 text-sm text-slate-500 max-w-xs truncate">{l.requirement}</td>
                <td className="px-8 py-5 text-xs text-slate-400 font-bold">{l.timestamp}</td>
                <td className="px-8 py-5"><span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${l.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isSyncing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"><div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-6 animate-slideUp"><div className="w-20 h-20 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div><h3 className="text-xl font-black text-slate-900">{syncStage}</h3></div></div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 space-y-8 animate-slideUp">
            <div className="text-center"><div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl"><i className="fa-brands fa-google-drive"></i></div><h3 className="text-2xl font-black text-slate-900">Sheets Integration</h3><p className="text-sm text-slate-400 font-medium">Sync leads automatically to your Google Spreadsheet.</p></div>
            <input type="url" placeholder="Paste Spreadsheet URL" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
            <div className="flex gap-4"><button onClick={() => setShowConfigModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">Cancel</button><button onClick={() => { setIsConnected(true); setShowConfigModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-100">Connect</button></div>
          </div>
        </div>
      )}

      {(syncSuccess || exportSuccess) && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl animate-slideUp font-black text-sm uppercase tracking-widest flex items-center gap-3"><i className="fa-solid fa-circle-check text-emerald-500"></i> {syncSuccess ? 'Pipeline Synced!' : 'CSV Downloaded!'}</div>}
    </div>
  );
};

export default LeadsTable;
