import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  MessageSquare, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  ThumbsUp
} from 'lucide-react';
import { supabase, Application } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

export function CustomerSupport() {
  const { lang, currency } = useLanguage();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setApplication(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured || searchTerm.toUpperCase().startsWith('EMT-')) {
        const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
        const found = demoApps.find((app: any) => app.application_number === searchTerm.trim().toUpperCase());
        
        if (found) {
          setApplication({
            ...found,
            services: { name: found.service_name || 'Service', fee: 0 },
            users: { first_name: 'Demo', last_name: 'User', phone: '0712345678', nida_number: '12345678901234567890' }
          } as any);
        } else if (!isConfigured) {
          setError(lang === 'sw' ? 'Maombi hayajapatikana.' : 'Application not found.');
        }
        
        if (!isConfigured) {
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*, services(*), users:user_id(*)')
        .eq('application_number', searchTerm.trim().toUpperCase())
        .single();

      if (error || !data) {
        setError(lang === 'sw' ? 'Maombi hayajapatikana.' : 'Application not found.');
      } else {
        setApplication(data);
      }
    } catch (err) {
      setError(lang === 'sw' ? 'Hitilafu imetokea wakati wa kutafuta.' : 'An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!application) return;
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kurejesha malipo ya maombi haya?' : 'Are you sure you want to refund this application?')) return;

    setProcessing(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: 'submitted' }) // Reset to submitted or a specific 'refunded' status
      .eq('id', application.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(lang === 'sw' ? 'Malipo yamehusishwa kurejeshwa.' : 'Refund processed successfully.', 'success');
      setApplication({ ...application, status: 'submitted' });
    }
    setProcessing(false);
  };

  const handleConfirmPayment = async () => {
    if (!application) return;
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kuthibitisha malipo ya maombi haya?' : 'Are you sure you want to confirm payment for this application?')) return;

    setProcessing(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: 'issued' })
      .eq('id', application.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(lang === 'sw' ? 'Malipo yamethibitishwa. Hati imetolewa.' : 'Payment confirmed. Document issued.', 'success');
      setApplication({ ...application, status: 'issued' });
    }
    setProcessing(false);
  };

  const handleApprove = async () => {
    if (!application) return;
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kuidhinisha maombi haya?' : 'Are you sure you want to approve this application?')) return;

    setProcessing(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: 'pending_payment' })
      .eq('id', application.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(lang === 'sw' ? 'Maombi yameidhinishwa. Inasubiri malipo.' : 'Application approved. Pending payment.', 'success');
      setApplication({ ...application, status: 'pending_payment' });
    }
    setProcessing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <HelpCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Huduma kwa Wateja' : 'Customer Support'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Tafuta na usaidie maombi ya wananchi' : 'Search and assist citizen applications'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl space-y-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={24} />
          <input 
            type="text"
            placeholder={lang === 'sw' ? 'Ingiza Namba ya Maombi (Mf. EMT-XXXXXX)' : 'Enter Application Number (e.g. EMT-XXXXXX)'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-40 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono text-lg uppercase tracking-widest"
          />
          <button 
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="absolute right-3 top-3 bottom-3 px-8 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (lang === 'sw' ? 'Tafuta' : 'Search')}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 text-red-800"
            >
              <AlertCircle size={24} className="text-red-600" />
              <p className="font-bold">{error}</p>
            </motion.div>
          )}

          {application && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Taarifa za Maombi' : 'Application Details'}</h3>
                  <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Namba ya Maombi' : 'App Number'}</span>
                      <span className="font-mono font-bold text-stone-900">{application.application_number}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Huduma' : 'Service'}</span>
                      <span className="font-bold text-stone-900">{(application as any).services?.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Tarehe na Muda' : 'Date & Time'}</span>
                      <span className="font-bold text-stone-900">{new Date(application.created_at || '').toLocaleDateString()} {new Date(application.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Hali' : 'Status'}</span>
                      <StatusBadge status={application.status} lang={lang} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Gharama' : 'Fee'}</span>
                      <span className="font-bold text-stone-900">{formatCurrency((application as any).services?.fee || 0, currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Taarifa za Mwombaji' : 'Applicant Details'}</h3>
                  <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Jina' : 'Name'}</span>
                      <span className="font-bold text-stone-900">{(application as any).users?.first_name} {(application as any).users?.last_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                      <span className="font-bold text-stone-900">{(application as any).users?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-stone-500">{lang === 'sw' ? 'NIDA' : 'NIDA'}</span>
                      <span className="font-bold text-stone-900">{(application as any).users?.nida_number || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-100 space-y-4">
                {/* Primary Actions Based on Status */}
                <div className="flex flex-wrap gap-4">
                  {application.status === 'pending_payment' && (
                    <button 
                      onClick={handleConfirmPayment}
                      disabled={processing}
                      className="flex-1 h-14 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
                      <CreditCard size={20} />
                      {lang === 'sw' ? 'Thibitisha Malipo' : 'Confirm Payment'}
                    </button>
                  )}
                  {(application.status === 'submitted' || application.status === 'verified') && (
                    <button 
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                      <ThumbsUp size={20} />
                      {lang === 'sw' ? 'Idhinisha Maombi' : 'Approve Application'}
                    </button>
                  )}
                </div>
                
                {/* Secondary Actions */}
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleRefund}
                    disabled={processing || application.status === 'submitted'}
                    className="flex-1 h-14 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                  >
                    <RefreshCw size={20} />
                    {lang === 'sw' ? 'Rejesha Malipo (Refund)' : 'Process Refund'}
                  </button>
                  <button className="flex-1 h-14 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={20} />
                    {lang === 'sw' ? 'Tuma Ujumbe' : 'Send Message'}
                  </button>
                  <button className="flex-1 h-14 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} />
                    {lang === 'sw' ? 'Tatua Tatizo' : 'Resolve Issue'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
