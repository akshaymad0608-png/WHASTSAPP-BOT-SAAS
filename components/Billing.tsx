
import React, { useState, useEffect } from 'react';
import { PRICING_PLANS } from '../constants';
import { GoogleGenAI } from "@google/genai";

const Billing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPay, setLoadingPay] = useState(false);
  const [activePlan, setActivePlan] = useState<string>('free');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId);
  const price = billingCycle === 'monthly' ? selectedPlan?.monthlyPrice : selectedPlan?.yearlyPrice;

  const handleOpenCheckout = (planId: string) => {
    if (planId === activePlan) return;
    setPaymentError(null);
    setSelectedPlanId(planId);
  };

  const handleFinalPayment = async () => {
    if (!termsAccepted) {
      setPaymentError("Please accept terms to continue.");
      return;
    }
    
    setLoadingPay(true);
    setPaymentError(null);

    // AI Studio Key Selection Requirement for paid plans
    if (selectedPlanId === 'pro' || selectedPlanId === 'agency') {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          const hasKey = await aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await aistudio.openSelectKey();
          }
        } catch (e) {
          console.warn("AI Studio context unavailable.");
        }
      }
    }

    // Simulate Payment
    setTimeout(() => {
      setLoadingPay(false);
      setActivePlan(selectedPlanId!);
      setSelectedPlanId(null);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="animate-fadeIn space-y-12 pb-20 relative">
      {isSuccess && (
        <div className="fixed top-8 right-8 z-[200] bg-white border border-emerald-100 p-2 pr-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-slideUp">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200"><i className="fa-solid fa-check"></i></div>
          <div><p className="font-black text-slate-900 leading-tight">Payment Received!</p><p className="text-xs text-slate-500">Upgrade complete.</p></div>
        </div>
      )}

      <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Simple, Transparent <br/> <span className="text-emerald-600">Growth</span> Pricing.</h1>
        <div className="flex items-center justify-center gap-6 pt-6">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
          <button onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')} className="w-16 h-9 bg-slate-200 rounded-full p-1 relative transition-all">
            <div className={`w-7 h-7 bg-white rounded-full shadow-lg transition-all absolute top-1 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center gap-3"><span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span><span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Save 20%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRICING_PLANS.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-[3rem] p-10 flex flex-col transition-all duration-500 border border-slate-100 shadow-xl ${plan.highlight ? 'ring-2 ring-emerald-500 scale-105 z-10' : ''}`}>
            <div className="mb-10 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl mx-auto ${plan.highlight ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600'}`}><i className={`fa-solid ${plan.icon}`}></i></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-4xl font-black text-slate-900">₹{billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}<span className="text-slate-400 text-sm">/mo</span></p>
            </div>
            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((f, i) => <div key={i} className="flex items-start gap-3"><i className="fa-solid fa-check text-emerald-500 mt-1"></i><span className="text-sm text-slate-600 font-bold">{f}</span></div>)}
            </div>
            <button onClick={() => handleOpenCheckout(plan.id)} disabled={activePlan === plan.id} className={`w-full py-5 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${activePlan === plan.id ? 'bg-emerald-50 text-emerald-700' : plan.highlight ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>{activePlan === plan.id ? 'Current Plan' : 'Select Plan'}</button>
          </div>
        ))}
      </div>

      {selectedPlanId && (
        <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 space-y-8 animate-slideUp">
            <h3 className="text-2xl font-black text-slate-900">Checkout {selectedPlan?.name}</h3>
            {paymentError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{paymentError}</div>}
            <div className="space-y-4">
              <input type="text" placeholder="UPI ID (user@bank)" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-600" /><span className="text-xs text-slate-500 font-bold">I agree to the billing terms and API key requirements.</span></label>
              <div className="flex gap-4"><button onClick={() => setSelectedPlanId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">Cancel</button><button onClick={handleFinalPayment} disabled={loadingPay} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-100">{loadingPay ? 'Processing...' : 'Pay Now'}</button></div>
            </div>
            {(selectedPlanId === 'pro' || selectedPlanId === 'agency') && <p className="text-[10px] text-center text-slate-400 font-bold">Note: Paid plans require choosing a valid API key from <a href="https://ai.google.dev/gemini-api/docs/billing" className="underline">ai.google.dev</a></p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
