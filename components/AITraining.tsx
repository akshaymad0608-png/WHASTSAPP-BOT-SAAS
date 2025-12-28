
import React, { useState } from 'react';
import { BusinessInfo } from '../types';
import { generateSuggestedFaqs } from '../services/geminiService';

interface AITrainingProps {
  businessInfo: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
}

const AITraining: React.FC<AITrainingProps> = ({ businessInfo, onUpdate }) => {
  const [formData, setFormData] = useState<BusinessInfo>(businessInfo);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    });
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleAiGenerate = async () => {
    if (!formData.description || formData.description.length < 20) {
      alert("Please provide a detailed business description first so AI can generate relevant FAQs.");
      return;
    }

    setIsGenerating(true);
    try {
      const suggested = await generateSuggestedFaqs(formData);
      if (suggested && suggested.length > 0) {
        setFormData({
          ...formData,
          faqs: [...formData.faqs, ...suggested]
        });
      } else {
        alert("Could not generate FAQs. Please try again or add manually.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating suggestions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    alert('AI Training knowledge updated successfully!');
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Training Center</h1>
          <p className="text-gray-500">Teach your bot about your business and common customer queries.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          Save Training Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-building text-emerald-500"></i>
            Business Profile
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
                placeholder="What do you do? Who is your target audience?"
              />
              <p className="text-[10px] text-gray-400 mt-1">Provide more detail for better AI FAQ generation.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Response Language</label>
              <select 
                value={formData.languagePreference}
                onChange={(e) => setFormData({...formData, languagePreference: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="Hinglish">Hinglish (Mix of Hindi/English)</option>
                <option value="English">Pure English</option>
                <option value="Hindi">Pure Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 flex flex-col h-full">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-question text-emerald-500"></i>
              Knowledge Base
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="text-white bg-indigo-500 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isGenerating ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                )}
                AI Suggester
              </button>
              <button 
                onClick={handleAddFaq}
                className="text-emerald-600 bg-emerald-50 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
              >
                <i className="fa-solid fa-plus"></i> Manual
              </button>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
            {formData.faqs.length === 0 && (
              <div className="h-64 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <i className="fa-solid fa-database text-xl"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">Your knowledge base is empty.</p>
                <button onClick={handleAiGenerate} className="text-indigo-600 text-xs font-bold hover:underline">Click AI Suggester to get started</button>
              </div>
            )}
            
            {formData.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50 relative group hover:border-emerald-100 transition-all shadow-sm">
                <button 
                  onClick={() => handleRemoveFaq(idx)}
                  className="absolute -top-2 -right-2 bg-white text-red-500 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md border border-gray-100 hover:bg-red-50"
                  title="Remove FAQ"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Question (e.g. When do you open?)"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold bg-white"
                  />
                  <textarea 
                    placeholder="Answer (e.g. We open at 9 AM daily.)"
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITraining;
