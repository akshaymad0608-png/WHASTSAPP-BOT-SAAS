
import React, { useState, useRef, useEffect } from 'react';
import { BusinessInfo, Message } from '../types';
import { getBotReply, extractLeadInfo, cleanBotResponse } from '../services/geminiService';

interface WhatsAppSimulatorProps {
  businessInfo: BusinessInfo;
  onLeadCaptured: (lead: any) => void;
}

const EMOJI_LIB = {
  faces: { icon: 'fa-face-smile', items: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🧐', '😎', '🤩', '😏', '😔', '😢', '😭', '😤', '😠', '🤯', '😳', '🥵', '🥶', '😱', '🤗', '🤔', '🫣', '🫡', '🫠'] },
  interaction: { icon: 'fa-hand-peace', items: ['🤝', '👍', '👎', '👏', '🙌', '🙏', '👋', '🤳', '💪', '👊', '✌️', '🤞', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '✍️', '🤚', '🖐️'] },
  nature: { icon: 'fa-leaf', items: ['🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🍃', '🍂', '🍁', '🍄', '🐚', '🪸', '🪵', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌍', '🌎', '🌏', '🪐', '💫', '⭐️', '🌟', '✨'] },
  food: { icon: 'fa-utensils', items: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🫒'] },
  business: { icon: 'fa-briefcase', items: ['📍', '📞', '💬', '✉️', '📦', '📝', '📁', '📅', '⏰', '🔒', '🔑', '🛠️', '💡', '🔦', '🔥', '✨', '⭐', '🎈', '🎉', '🎁', '🎂', '🏢', '🏦', '🏪', '🏫'] }
};

const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ businessInfo, onLeadCaptured }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'start', sender: 'bot', text: `Namaste! I am the ${businessInfo.name} AI assistant. How can I help you today?`, timestamp: new Date(), type: 'text' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<string>('faces');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  
  const [pendingFile, setPendingFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('wa_recent_emojis');
    if (stored) setRecentEmojis(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setEmojiSearch('');
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const insertEmoji = (emoji: string) => {
    if (!inputRef.current) return;
    
    const newRecents = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
    setRecentEmojis(newRecents);
    localStorage.setItem('wa_recent_emojis', JSON.stringify(newRecents));

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const text = inputText;
    setInputText(text.substring(0, start) + emoji + text.substring(end));
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = start + emoji.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const filteredEmojis = emojiSearch.trim() 
    ? Object.values(EMOJI_LIB).flatMap(cat => cat.items).filter((e, i, arr) => arr.indexOf(e) === i)
    : [];

  const handleSendMessage = async (textOverride?: string) => {
    const finalMsg = textOverride || inputText;
    if ((!finalMsg.trim() && !pendingFile) || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      text: finalMsg,
      timestamp: new Date(),
      type: pendingFile ? (pendingFile.mimeType.startsWith('image/') ? 'image' : 'file') : 'text',
      mediaUrl: pendingFile?.data,
      fileName: pendingFile?.name
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setPendingFile(null);
    setShowEmojiPicker(false);
    setIsTyping(true);

    try {
      const history = messages.slice(-8).map(m => ({ 
        role: m.sender === 'bot' ? 'bot' : 'user', 
        parts: m.text || `[${m.type}]` 
      }));
      const response = await getBotReply(finalMsg, history, businessInfo, pendingFile || undefined);
      
      const lead = extractLeadInfo(response);
      if (lead) onLeadCaptured(lead);

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: cleanBotResponse(response), 
        timestamp: new Date(), 
        type: 'text' 
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'customer', text: '', type: 'audio', mediaUrl: url, timestamp: new Date() }]);
        handleSendMessage("Sent a voice message.");
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (e) { alert("Microphone access denied."); }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      if (cancel) audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <mark key={i}>{p}</mark> : p)}</>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100 relative">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
        {isSearchOpen && (
          <div className="absolute inset-0 bg-[#075e54]/95 backdrop-blur-sm z-30 flex items-center px-4 gap-4 animate-fadeIn">
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="hover:opacity-70"><i className="fa-solid fa-arrow-left"></i></button>
            <input type="text" autoFocus placeholder="Search chat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-white/50" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><i className="fa-solid fa-xmark text-xs opacity-50"></i></button>}
          </div>
        )}
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(businessInfo.name)}&background=10b981&color=fff`} className="w-10 h-10 rounded-full border border-white/20 shadow-sm" />
          <div><p className="font-bold text-sm leading-tight">{businessInfo.name}</p><p className="text-[10px] text-emerald-100 opacity-80">{isTyping ? 'typing...' : 'Online'}</p></div>
        </div>
        <div className="flex gap-4 text-white/80">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-white transition-colors"><i className="fa-solid fa-magnifying-glass"></i></button>
          <i className="fa-solid fa-headset cursor-pointer hover:text-white transition-colors" title="Agent Handoff" onClick={() => handleSendMessage("I want to speak with an agent.")}></i>
          <i className="fa-solid fa-ellipsis-vertical cursor-pointer"></i>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 whatsapp-bg overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={scrollRef}>
        <div className="flex justify-center mb-6"><span className="bg-[#dcf8c6]/90 text-[9px] text-gray-500 px-3 py-1 rounded-lg shadow-sm font-black uppercase tracking-widest">Today</span></div>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded-xl shadow-sm relative group ${m.sender === 'customer' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              {m.type === 'image' && <img src={m.mediaUrl} className="rounded-lg mb-1 max-h-48" />}
              {m.type === 'audio' && <audio controls className="h-8 w-48 mt-1"><source src={m.mediaUrl} /></audio>}
              {m.text && <p className="text-sm px-1 leading-relaxed">{highlightText(m.text, searchQuery)}</p>}
              <div className="flex items-center justify-end gap-1 mt-1"><span className="text-[9px] text-gray-400">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{m.sender === 'customer' && <i className="fa-solid fa-check-double text-[9px] text-blue-400"></i>}</div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-white px-3 py-2 rounded-xl rounded-tl-none shadow-sm flex gap-1 animate-pulse"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span></div></div>}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 right-4 bg-white rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.2)] border border-slate-100 z-50 animate-slideUp overflow-hidden flex flex-col h-80">
          <div className="shrink-0 bg-white border-b border-slate-50 p-3">
            <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-3">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
              <input type="text" placeholder="Search emojis..." value={emojiSearch} onChange={e => setEmojiSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {emojiSearch.trim() ? (
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map(e => <button key={e} onClick={() => insertEmoji(e)} className="text-2xl p-2 hover:bg-slate-50 rounded-xl transition-all">{e}</button>)}
              </div>
            ) : (
              <div className="space-y-6">
                {recentEmojis.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Recent</p>
                    <div className="grid grid-cols-8 gap-1">{recentEmojis.map(e => <button key={e} onClick={() => insertEmoji(e)} className="text-2xl p-2 hover:bg-slate-50 rounded-xl transition-all">{e}</button>)}</div>
                  </div>
                )}
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{activeEmojiTab}</p>
                <div className="grid grid-cols-8 gap-1">{EMOJI_LIB[activeEmojiTab as keyof typeof EMOJI_LIB].items.map(e => <button key={e} onClick={() => insertEmoji(e)} className="text-2xl p-2 hover:bg-slate-50 rounded-xl transition-all">{e}</button>)}</div>
              </div>
            )}
          </div>
          <div className="shrink-0 flex bg-slate-50 border-t border-slate-100">
            {Object.entries(EMOJI_LIB).map(([key, cat]) => (
              <button key={key} onClick={() => {setActiveEmojiTab(key); setEmojiSearch('');}} className={`flex-1 py-3 text-sm transition-all ${activeEmojiTab === key ? 'text-emerald-600 bg-white border-t-2 border-emerald-600' : 'text-slate-400'}`}>
                <i className={`fa-solid ${cat.icon}`}></i>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="p-3 bg-[#f0f2f5] flex items-center gap-2 relative">
        <input type="file" ref={fileInputRef} className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = ev => setPendingFile({ data: ev.target?.result as string, mimeType: f.type, name: f.name });
          r.readAsDataURL(f);
        }} />
        {!isRecording ? (
          <div className="flex-1 flex items-center gap-3">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`text-xl transition-colors ${showEmojiPicker ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}><i className="fa-regular fa-face-smile"></i></button>
            <button onClick={() => fileInputRef.current?.click()} className="text-xl text-slate-400 hover:text-emerald-600 transition-colors -rotate-45"><i className="fa-solid fa-paperclip"></i></button>
            <div className="flex-1 bg-white rounded-full px-5 py-2.5 shadow-sm border border-slate-100 flex items-center"><input ref={inputRef} type="text" placeholder="Type a message..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="w-full outline-none text-sm bg-transparent" /></div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center justify-between shadow-inner border border-red-50 text-red-500 font-black text-xs uppercase tracking-widest"><div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> REC {recordingTime}s</div><button onClick={() => stopRecording(true)} className="hover:underline">Cancel</button></div>
        )}
        <button onMouseDown={() => !inputText && !pendingFile && startRecording()} onMouseUp={() => isRecording && stopRecording()} onClick={() => (inputText || pendingFile) && handleSendMessage()} className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${inputText || pendingFile ? 'bg-emerald-600' : isRecording ? 'bg-red-500 scale-110' : 'bg-[#075e54]'}`}><i className={`fa-solid ${inputText || pendingFile ? 'fa-paper-plane' : 'fa-microphone'}`}></i></button>
      </div>
    </div>
  );
};

export default WhatsAppSimulator;
