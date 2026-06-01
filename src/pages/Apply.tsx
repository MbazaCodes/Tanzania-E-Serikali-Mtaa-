import React from 'react';
import type { AnyFormData, ApplicationDraft } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TANZANIA_LOGO_URL } from '@/constants/services';
import { Service } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { DynamicFormGenerator } from '@/components/DynamicFormGenerator';
import { SERVICE_FORMS, hasServiceForm } from '@/components/forms';

interface ApplyProps {
  selectedService: Service;
  onBack: () => void;
  onSubmit: (formData: AnyFormData) => void;
  draft?: ApplicationDraft | null;
}

export function Apply({ selectedService, onBack, onSubmit, draft }: ApplyProps) {
  const { user } = useAuth();
  const { lang, currency } = useLanguage();

  // Ensure user profile has all required fields, provide defaults
  const userProfileForForm = user ? {
    id: user.id,
    first_name: user.first_name || '',
    middle_name: user.middle_name,
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    nida_number: user.nida_number,
    region: user.region,
    district: user.district,
    ward: user.ward,
    street: user.street,
    is_diaspora: user.is_diaspora,
    role: user.role,
    is_verified: user.is_verified,
    account_status: user.account_status,
  } : null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <button 
        onClick={onBack}
        className="text-sm text-stone-500 hover:text-emerald-600 flex items-center gap-2 transition-colors font-bold"
      >
        <ArrowLeft className="h-4 w-4" /> {lang === 'sw' ? 'Rudi kwenye Huduma' : 'Back to Services'}
      </button>
      
      {/* Official Form Header */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />
        <img 
          src={TANZANIA_LOGO_URL} 
          alt="Nembo ya Tanzania" 
          className="h-20 w-20 mx-auto mb-4 object-contain" 
          referrerPolicy="no-referrer"
        />
        <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-1">
          {lang === 'sw' ? 'JAMHURI YA MUUNGANO WA TANZANIA' : 'THE UNITED REPUBLIC OF TANZANIA'}
        </p>
        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-4">
          {lang === 'sw' ? 'OFISI YA RAIS — TAWALA ZA MIKOA NA SERIKALI ZA MITAA' : 'PRESIDENT\'S OFFICE — REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT'}
        </p>
        
        <div className="h-px bg-stone-100 w-24 mx-auto mb-6" />
        
        <h2 className="text-2xl font-heading font-black text-stone-900 uppercase tracking-tight mb-1">
          {lang === 'sw' ? selectedService.name : (selectedService as any).name_en || selectedService.name}
        </h2>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">
          {lang === 'sw' ? (selectedService as any).name_en || selectedService.name : selectedService.name}
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
          <CreditCard className="h-3 w-3" />
          {lang === 'sw' ? 'Ada ya Huduma:' : 'Service Fee:'} {formatCurrency(selectedService.fee, currency)}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-stone-800">{lang === 'sw' ? 'Taarifa za Maombi' : 'Application Details'}</h3>
          <p className="text-sm text-stone-500 mt-1">{lang === 'sw' ? 'Tafadhali jaza maelezo yote yanayohitajika kwa usahihi.' : 'Please fill in all required details accurately.'}</p>
        </div>
        
        {/* Use dedicated service form if available, otherwise fall back to dynamic form */}
        {hasServiceForm(selectedService.name) ? (
          (() => {
            const FormComponent = SERVICE_FORMS[selectedService.name];
            return (
              <FormComponent
                onSubmit={onSubmit}
                lang={lang}
                userProfile={userProfileForForm}
                draftId={draft?.id}
              />
            );
          })()
        ) : (
          <DynamicFormGenerator 
            schema={userProfileForForm?.is_diaspora ? (selectedService as any).diaspora_form_schema || selectedService.form_schema : selectedService.form_schema} 
            onSubmit={onSubmit} 
            lang={lang}
            userProfile={userProfileForForm}
            draftId={draft?.id}
          />
        )}
      </div>
    </motion.div>
  );
}