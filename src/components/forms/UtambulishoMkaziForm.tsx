/**
 * Utambulisho wa Mkazi (Barua ya Utambulisho) Form
 * Residency Certificate / Identification Letter
 * 
 * Service: Utambulisho wa Mkazi - Kujitambulisha Mkazi
 * Fee: 5,000 TZS
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, 
  User, MapPin, Phone, Mail, Calendar, Users, Heart, Briefcase,
  FileText, Download, Printer, Home, Zap, Droplet, Globe, AlertCircle,
  Shield, Info, CreditCard, CheckSquare
} from 'lucide-react';
import { FormProps, labels } from './types';
import { ProgressFill } from '../ui/ProgressFill';

const COUNCILS = [
  { label: 'SERIKALI YA MTAA - ARUSHA', value: 'ARUSHA_MTAA' },
  { label: 'SERIKALI YA MTAA - DAR ES SALAAM', value: 'DAR_MTAA' },
  { label: 'SERIKALI YA MTAA - DODOMA', value: 'DODOMA_MTAA' },
  { label: 'SERIKALI YA MTAA - GEITA', value: 'GEITA_MTAA' },
  { label: 'SERIKALI YA MTAA - IRINGA', value: 'IRINGA_MTAA' },
  { label: 'SERIKALI YA MTAA - KAGERA', value: 'KAGERA_MTAA' },
  { label: 'SERIKALI YA MTAA - KATAVI', value: 'KATAVI_MTAA' },
  { label: 'SERIKALI YA MTAA - KIGOMA', value: 'KIGOMA_MTAA' },
  { label: 'SERIKALI YA MTAA - KILIMANJARO', value: 'KILIMANJARO_MTAA' },
  { label: 'SERIKALI YA MTAA - LINDI', value: 'LINDI_MTAA' },
  { label: 'SERIKALI YA MTAA - MANYARA', value: 'MANYARA_MTAA' },
  { label: 'SERIKALI YA MTAA - MARA', value: 'MARA_MTAA' },
  { label: 'SERIKALI YA MTAA - MBEYA', value: 'MBEYA_MTAA' },
  { label: 'SERIKALI YA MTAA - MOROGORO', value: 'MOROGORO_MTAA' },
  { label: 'SERIKALI YA MTAA - MTWARA', value: 'MTWARA_MTAA' },
  { label: 'SERIKALI YA MTAA - MWANZA', value: 'MWANZA_MTAA' },
  { label: 'SERIKALI YA MTAA - NJOMBE', value: 'NJOMBE_MTAA' },
  { label: 'SERIKALI YA MTAA - PWANI', value: 'PWANI_MTAA' },
  { label: 'SERIKALI YA MTAA - RUKWA', value: 'RUKWA_MTAA' },
  { label: 'SERIKALI YA MTAA - RUVUMA', value: 'RUVUMA_MTAA' },
  { label: 'SERIKALI YA MTAA - SHINYANGA', value: 'SHINYANGA_MTAA' },
  { label: 'SERIKALI YA MTAA - SIMIYU', value: 'SIMIYU_MTAA' },
  { label: 'SERIKALI YA MTAA - SINGIDA', value: 'SINGIDA_MTAA' },
  { label: 'SERIKALI YA MTAA - SONGWE', value: 'SONGWE_MTAA' },
  { label: 'SERIKALI YA MTAA - TABORA', value: 'TABORA_MTAA' },
  { label: 'SERIKALI YA MTAA - TANGA', value: 'TANGA_MTAA' },
];

// Comprehensive Wards by Council (Halmashauri) for all Tanzania regions
const WARDS_BY_COUNCIL: Record<string, { label: string; value: string }[]> = {
  ARUSHA_MTAA: [
    { label: 'Arusha Urban', value: 'ARUSHA_URBAN' },
    { label: 'Arusha Rural', value: 'ARUSHA_RURAL' },
    { label: 'Karatu', value: 'KARATU' },
    { label: 'Longido', value: 'LONGIDO' },
    { label: 'Monduli', value: 'MONDULI' },
    { label: 'Ngorongoro', value: 'NGORONGORO' },
  ],
  DAR_MTAA: [
    { label: 'Ilala', value: 'ILALA' },
    { label: 'Kinondoni', value: 'KINONDONI' },
    { label: 'Ubungo', value: 'UBUNGO' },
    { label: 'Kigamboni', value: 'KIGAMBONI' },
    { label: 'Temeke', value: 'TEMEKE' },
    { label: 'Chalinze', value: 'CHALINZE' },
  ],
  DODOMA_MTAA: [
    { label: 'Dodoma Urban', value: 'DODOMA_URBAN' },
    { label: 'Dodoma Rural', value: 'DODOMA_RURAL' },
    { label: 'Bahi', value: 'BAHI' },
    { label: 'Chamwino', value: 'CHAMWINO' },
    { label: 'Chemba', value: 'CHEMBA' },
    { label: 'Kondoa', value: 'KONDOA' },
    { label: 'Kongwa', value: 'KONGWA' },
    { label: 'Mpwapwa', value: 'MPWAPWA' },
  ],
  GEITA_MTAA: [
    { label: 'Geita Town', value: 'GEITA_TOWN' },
    { label: 'Bukombe', value: 'BUKOMBE' },
    { label: 'Chato', value: 'CHATO' },
    { label: 'Mbogwe', value: 'MBOGWE' },
    { label: 'Nyang\'hwale', value: 'NYANG_HWALE' },
  ],
  IRINGA_MTAA: [
    { label: 'Iringa Urban', value: 'IRINGA_URBAN' },
    { label: 'Iringa Rural', value: 'IRINGA_RURAL' },
    { label: 'Kilolo', value: 'KILOLO' },
    { label: 'Mafinga', value: 'MAFINGA' },
  ],
  KAGERA_MTAA: [
    { label: 'Bukoba Urban', value: 'BUKOBA_URBAN' },
    { label: 'Bukoba Rural', value: 'BUKOBA_RURAL' },
    { label: 'Biharamulo', value: 'BIHARAMULO' },
    { label: 'Karagwe', value: 'KARAGWE' },
    { label: 'Muleba', value: 'MULEBA' },
    { label: 'Ngara', value: 'NGARA' },
  ],
  KATAVI_MTAA: [
    { label: 'Mpanda Town', value: 'MPANDA_TOWN' },
    { label: 'Mpanda District', value: 'MPANDA_DISTRICT' },
    { label: 'Sumbawanga', value: 'SUMBAWANGA' },
  ],
  KIGOMA_MTAA: [
    { label: 'Kigoma Urban', value: 'KIGOMA_URBAN' },
    { label: 'Kigoma Rural', value: 'KIGOMA_RURAL' },
    { label: 'Kasulu', value: 'KASULU' },
    { label: 'Kibondo', value: 'KIBONDO' },
    { label: 'Uvinza', value: 'UVINZA' },
  ],
  KILIMANJARO_MTAA: [
    { label: 'Arusha Urban', value: 'ARUSHA_URBAN_KLM' },
    { label: 'Moshi Urban', value: 'MOSHI_URBAN' },
    { label: 'Moshi Rural', value: 'MOSHI_RURAL' },
    { label: 'Hai', value: 'HAI' },
    { label: 'Same', value: 'SAME' },
    { label: 'Rombo', value: 'ROMBO' },
  ],
  LINDI_MTAA: [
    { label: 'Lindi Urban', value: 'LINDI_URBAN' },
    { label: 'Lindi Rural', value: 'LINDI_RURAL' },
    { label: 'Mtwara Urban', value: 'MTWARA_URBAN' },
    { label: 'Mtwara Rural', value: 'MTWARA_RURAL' },
  ],
  MANYARA_MTAA: [
    { label: 'Moshi', value: 'MOSHI_MANYARA' },
    { label: 'Iramba', value: 'IRAMBA' },
    { label: 'Kiteto', value: 'KITETO' },
    { label: 'Mbulu', value: 'MBULU' },
  ],
  MARA_MTAA: [
    { label: 'Musoma Urban', value: 'MUSOMA_URBAN' },
    { label: 'Musoma Rural', value: 'MUSOMA_RURAL' },
    { label: 'Bariadi', value: 'BARIADI' },
    { label: 'Butiama', value: 'BUTIAMA' },
    { label: 'Serengeti', value: 'SERENGETI' },
    { label: 'Tarime', value: 'TARIME' },
  ],
  MBEYA_MTAA: [
    { label: 'Mbeya Urban', value: 'MBEYA_URBAN' },
    { label: 'Mbeya Rural', value: 'MBEYA_RURAL' },
    { label: 'Chunya', value: 'CHUNYA' },
    { label: 'Karoi', value: 'KAROI' },
    { label: 'Rungwe', value: 'RUNGWE' },
  ],
  MOROGORO_MTAA: [
    { label: 'Morogoro Urban', value: 'MOROGORO_URBAN' },
    { label: 'Morogoro Rural', value: 'MOROGORO_RURAL' },
    { label: 'Iringa', value: 'IRINGA_MOROGORO' },
    { label: 'Kilombero', value: 'KILOMBERO' },
    { label: 'Ulanga', value: 'ULANGA' },
  ],
  MTWARA_MTAA: [
    { label: 'Mtwara Urban', value: 'MTWARA_URBAN_MT' },
    { label: 'Mtwara Rural', value: 'MTWARA_RURAL_MT' },
    { label: 'Newala', value: 'NEWALA' },
    { label: 'Tandahimba', value: 'TANDAHIMBA' },
  ],
  MWANZA_MTAA: [
    { label: 'Mwanza Urban', value: 'MWANZA_URBAN' },
    { label: 'Mwanza Rural', value: 'MWANZA_RURAL' },
    { label: 'Bukoba', value: 'BUKOBA_MWANZA' },
    { label: 'Kigoma', value: 'KIGOMA_MWANZA' },
    { label: 'Kwimba', value: 'KWIMBA' },
    { label: 'Nyamagana', value: 'NYAMAGANA' },
  ],
  NJOMBE_MTAA: [
    { label: 'Njombe Urban', value: 'NJOMBE_URBAN' },
    { label: 'Njombe Rural', value: 'NJOMBE_RURAL' },
    { label: 'Makambako', value: 'MAKAMBAKO' },
    { label: 'Wanging\'ombe', value: 'WANGING_OMBE' },
  ],
  PWANI_MTAA: [
    { label: 'Bagamoyo', value: 'BAGAMOYO' },
    { label: 'Chalinze', value: 'CHALINZE_PWANI' },
    { label: 'Mkuranga', value: 'MKURANGA' },
    { label: 'Kibaha', value: 'KIBAHA' },
    { label: 'Kunduchi', value: 'KUNDUCHI_PWANI' },
  ],
  RUKWA_MTAA: [
    { label: 'Sumbawanga Urban', value: 'SUMBAWANGA_URBAN' },
    { label: 'Sumbawanga Rural', value: 'SUMBAWANGA_RURAL' },
    { label: 'Nkansi', value: 'NKANSI' },
  ],
  RUVUMA_MTAA: [
    { label: 'Songea Urban', value: 'SONGEA_URBAN' },
    { label: 'Songea Rural', value: 'SONGEA_RURAL' },
    { label: 'Iringa', value: 'IRINGA_RUVUMA' },
    { label: 'Tunduru', value: 'TUNDURU' },
  ],
  SHINYANGA_MTAA: [
    { label: 'Shinyanga Urban', value: 'SHINYANGA_URBAN' },
    { label: 'Shinyanga Rural', value: 'SHINYANGA_RURAL' },
    { label: 'Kahama', value: 'KAHAMA' },
    { label: 'Nzega', value: 'NZEGA' },
  ],
  SIMIYU_MTAA: [
    { label: 'Bariadi', value: 'BARIADI_SIMIYU' },
    { label: 'Busega', value: 'BUSEGA_SIMIYU' },
    { label: 'Itilima', value: 'ITILIMA_SIMIYU' },
    { label: 'Maswa', value: 'MASWA_SIMIYU' },
  ],
  SINGIDA_MTAA: [
    { label: 'Singida Urban', value: 'SINGIDA_URBAN' },
    { label: 'Singida Rural', value: 'SINGIDA_RURAL' },
    { label: 'Ikungi', value: 'IKUNGI_SINGIDA' },
    { label: 'Manyoni', value: 'MANYONI_SINGIDA' },
  ],
  SONGWE_MTAA: [
    { label: 'Mbozi', value: 'MBOZI' },
    { label: 'Ileje', value: 'ILEJE' },
    { label: 'Momba', value: 'MOMBA' },
    { label: 'Songwe', value: 'SONGWE_WARD' },
  ],
  TABORA_MTAA: [
    { label: 'Tabora Urban', value: 'TABORA_URBAN' },
    { label: 'Tabora Rural', value: 'TABORA_RURAL' },
    { label: 'Igunga', value: 'IGUNGA' },
    { label: 'Nzega', value: 'NZEGA_TABORA' },
    { label: 'Urambo', value: 'URAMBO' },
  ],
  TANGA_MTAA: [
    { label: 'Tanga Urban', value: 'TANGA_URBAN' },
    { label: 'Tanga Rural', value: 'TANGA_RURAL' },
    { label: 'Handeni', value: 'HANDENI' },
    { label: 'Kilindi', value: 'KILINDI' },
    { label: 'Korogwe', value: 'KOROGWE' },
    { label: 'Lushoto', value: 'LUSHOTO' },
    { label: 'Muheza', value: 'MUHEZA' },
    { label: 'Pangani', value: 'PANGANI' },
  ],
};

const MARITAL_STATUS = [
  { label: 'Ndoa (Married)', value: 'MARRIED' },
  { label: 'Hajaoa / Hajaolewa (Single)', value: 'SINGLE' },
  { label: 'Talaka (Divorced)', value: 'DIVORCED' },
  { label: 'Mjane (Widowed)', value: 'WIDOWED' },
];

const RESIDENCY_STATUS = [
  { label: 'Mkazi wa Kawaida (Regular Resident)', value: 'REGULAR' },
  { label: 'Mgeni (Foreigner)', value: 'FOREIGNER' },
  { label: 'Diaspora (Tanzanian Living Abroad)', value: 'DIASPORA' },
];

const WORK_PERMIT_OPTIONS = [
  { label: 'Ndiyo - Nina Work Permit', value: 'YES' },
  { label: 'Hapana - Sina Work Permit', value: 'NO' },
  { label: 'Sihitaji (Not Applicable)', value: 'NA' },
];

const OWNERSHIP_STATUS = [
  { label: 'Namiliki Nyumba (I Own the House)', value: 'OWN' },
  { label: 'Nakodi (I Rent)', value: 'RENT' },
  { label: 'Naishi na Familia (Live with Family)', value: 'FAMILY' },
  { label: 'Naishi Kwa Biashara (Business Stay)', value: 'BUSINESS' },
];

const PURPOSE_VALUE = 'KUJITAMBULISHA_MKAZI';
const PURPOSE_LABEL = 'KUJITAMBULISHA MKAZI / RESIDENCY IDENTIFICATION';
const INSTITUTION_VALUE = 'SERIKALI_YA_MTAA';
const INSTITUTION_LABEL = 'SERIKALI YA MTAA / LOCAL GOVERNMENT';

interface FormData {
  council: string;
  ward: string;
  village_street: string;
  marital_status: string;
  occupation: string;
  employer_name: string;
  neighborhood: string;
  house_number: string;
  block_number: string;
  plot_number: string;
  electricity_bill_number: string;
  water_bill_number: string;
  property_tax_number: string;
  family_members_count: number;
  dependents_count: number;
  children_under_18: number;
  elderly_over_60: number;
  residency_status: string;
  work_permit: string;
  passport_number: string;
  country_of_origin: string;
  ownership_status: string;
  years_at_residence: number;
  purpose: string;
  institution_name: string;
  terms_accepted: boolean;
  data_confirmed: boolean;
}

type Step = 'council' | 'personal' | 'residence' | 'sensitive' | 'family' | 'status' | 'review';

export const UtambulishoMkaziForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile,
  draftId
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('council');
  const [showReview, setShowReview] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, reset, watch } = useForm<FormData>({
    defaultValues: {
      purpose: PURPOSE_VALUE,
      institution_name: INSTITUTION_VALUE,
      family_members_count: 0,
      dependents_count: 0,
      children_under_18: 0,
      elderly_over_60: 0,
      years_at_residence: 0,
    }
  });

  // Watch council field to update ward options
  const councilValue = watch('council');
  React.useEffect(() => {
    setSelectedCouncil(councilValue || '');
  }, [councilValue]);

  // Auto-save draft functionality
  const saveDraft = React.useCallback(() => {
    if (!userProfile || isDraftLoaded) return;

    const currentData = getValues();
    const draftKey = draftId || `draft_${userProfile.id}_utambulisho_mkazi`;
    
    const draft = {
      id: draftKey,
      user_id: userProfile.id,
      service_name: 'Utambulisho wa Mkazi',
      service_id: 'utambulisho_mkazi',
      form_data: currentData,
      current_step: currentStep,
      last_saved: new Date().toISOString(),
      status: 'draft'
    };

    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [userProfile, getValues, currentStep, draftId, isDraftLoaded]);

  // Load draft if exists
  React.useEffect(() => {
    if (!userProfile || !draftId) return;

    const draftData = localStorage.getItem(draftId);
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        if (draft.form_data) {
          reset(draft.form_data);
          setCurrentStep(draft.current_step || 'council');
          setIsDraftLoaded(true);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [userProfile, draftId, reset]);

  // Auto-save on form changes
  React.useEffect(() => {
    const subscription = watch(() => {
      // Debounce auto-save
      const timeoutId = setTimeout(saveDraft, 1000);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveDraft]);

  // Save draft on step change
  React.useEffect(() => {
    saveDraft();
  }, [currentStep, saveDraft]);

  React.useEffect(() => {
    if (!userProfile) {
      return;
    }

    const region = userProfile.region;

    const councilMatch = region
      ? COUNCILS.find(
          (c) =>
            c.label.toLowerCase().includes(region.toLowerCase()) ||
            c.value.toLowerCase().includes(region.toLowerCase())
        )
      : undefined;

    const autoFillValues: Partial<FormData> = {};

    if (councilMatch) {
      autoFillValues.council = councilMatch.value;
    }
    if (userProfile.ward) {
      autoFillValues.ward = userProfile.ward;
    }
    if (typeof (userProfile as any).country_of_citizenship === 'string') {
      autoFillValues.country_of_origin = (userProfile as any).country_of_citizenship;
    }
    if (typeof (userProfile as any).country_of_residence === 'string' && !autoFillValues.country_of_origin) {
      autoFillValues.country_of_origin = (userProfile as any).country_of_residence;
    }
    if (typeof (userProfile as any).passport_number === 'string') {
      autoFillValues.passport_number = (userProfile as any).passport_number;
    }
    if (typeof (userProfile as any).occupation === 'string') {
      autoFillValues.occupation = (userProfile as any).occupation;
    }
    if (typeof (userProfile as any).marital_status === 'string') {
      autoFillValues.marital_status = (userProfile as any).marital_status;
    }
    if (typeof userProfile.is_diaspora === 'boolean') {
      autoFillValues.residency_status = userProfile.is_diaspora ? 'DIASPORA' : 'REGULAR';
    }

    if (Object.keys(autoFillValues).length > 0) {
      reset({ ...getValues(), ...autoFillValues });
    }
  }, [userProfile, reset, getValues]);

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'council', label: 'Council', swLabel: 'Serikali ya Mtaa' },
    { key: 'personal', label: 'Personal', swLabel: 'Binafsi' },
    { key: 'residence', label: 'Residence', swLabel: 'Makazi' },
    { key: 'sensitive', label: 'Utilities', swLabel: 'Huduma' },
    { key: 'family', label: 'Family', swLabel: 'Familia' },
    { key: 'status', label: 'Status', swLabel: 'Hadhi' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'council':
        fieldsToValidate = ['council', 'ward', 'village_street'];
        break;
      case 'personal':
        fieldsToValidate = ['marital_status', 'occupation'];
        break;
      case 'residence':
        fieldsToValidate = ['neighborhood', 'house_number', 'plot_number'];
        break;
      case 'sensitive':
        fieldsToValidate = [];
        break;
      case 'family':
        fieldsToValidate = ['family_members_count', 'dependents_count'];
        break;
      case 'status':
        fieldsToValidate = ['residency_status', 'ownership_status'];
        break;
      default:
        return true;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep === 'status') {
      setCurrentStep('review');
    } else {
      const nextStep = steps[currentStepIndex + 1].key;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const onFormSubmit = (data: FormData) => {
    setFormData(data);
    setShowPdfPreview(true);
  };

  const confirmSubmit = async () => {
    const submitData = formData ?? getValues();

    // Clear draft on successful submission
    if (userProfile) {
      const draftKey = draftId || `draft_${userProfile.id}_utambulisho_mkazi`;
      localStorage.removeItem(draftKey);
    }

    await Promise.resolve(onSubmit(submitData));
  };

  const handlePrint = () => {
    window.print();
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-linear-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-l-4 border-emerald-500 mb-6 shadow-sm";
  const cardClass = "bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm";

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-emerald-600 text-white' 
                : index === currentStepIndex
                ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600'
                : 'bg-stone-100 text-stone-400'
              }
            `}>
              {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {lang === 'sw' ? step.swLabel : step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
        <ProgressFill progress={progress} className="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300" />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-emerald-600">{Math.round(progress)}%</span>
      </div>
    </div>
  );

  const PdfPreview = () => {
    const data = getValues();
    
    if (!showPdfPreview) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {lang === 'sw' ? 'Hakiki Hati yako (PDF Preview)' : 'Preview Your Document (PDF Preview)'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Hakiki hati yako kabla ya kuwasilisha. Unaweza kuchapisha au kupakua kwa PDF.'
                  : 'Review your document before submission. You can print or download as PDF.'}
              </p>
            </div>
          </div>
        </div>

        <div 
          ref={printRef}
          className="document-preview"
        >
          <div className="text-center mb-8 border-b-2 border-emerald-600 pb-4">
            <h1 className="text-2xl font-bold text-emerald-800 uppercase tracking-wide">
              JAMHURI YA MUUNGANO WA TANZANIA
            </h1>
            <h2 className="text-xl font-semibold text-stone-700 mt-2">
              BARUA YA UTAMBULISHO WA MKAZI
            </h2>
            <h2 className="text-lg text-stone-600">
              RESIDENCY IDENTIFICATION LETTER
            </h2>
            {userProfile?.citizen_id && (
              <p className="text-sm text-stone-700 mt-2">
                {lang === 'sw' ? 'Namba ya Raia:' : 'Citizen ID:'} {userProfile.citizen_id}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-600">
              <p className="font-bold text-emerald-800">
                {COUNCILS.find(c => c.value === data.council)?.label || data.council}
              </p>
              <p className="text-sm text-stone-600">Kata / Ward: {data.ward}</p>
              <p className="text-sm text-stone-600">Kijiji / Mtaa: {data.village_street}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                TAARIFA BINAFSI
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Jina:</span> {userProfile?.first_name} {userProfile?.middle_name} {userProfile?.last_name}</p>
                <p><span className="font-semibold text-stone-600">NIDA:</span> {userProfile?.nida_number || '-'}</p>
                <p><span className="font-semibold text-stone-600">Simu:</span> {userProfile?.phone || '-'}</p>
                <p><span className="font-semibold text-stone-600">Barua Pepe:</span> {userProfile?.email || '-'}</p>
                <p><span className="font-semibold text-stone-600">Hali ya Ndoa:</span> {MARITAL_STATUS.find(m => m.value === data.marital_status)?.label || data.marital_status}</p>
                <p><span className="font-semibold text-stone-600">Kazi:</span> {data.occupation}</p>
                {data.employer_name && <p><span className="font-semibold text-stone-600">Mwajiri:</span> {data.employer_name}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                MAKAZI / RESIDENCE
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Kitongoji:</span> {data.neighborhood}</p>
                <p><span className="font-semibold text-stone-600">Namba ya Nyumba:</span> {data.house_number}</p>
                <p><span className="font-semibold text-stone-600">Namba ya Plot:</span> {data.plot_number || '-'}</p>
                <p><span className="font-semibold text-stone-600">Block:</span> {data.block_number || '-'}</p>
                <p><span className="font-semibold text-stone-600">Miaka ya Kukaa:</span> {data.years_at_residence}</p>
                <p><span className="font-semibold text-stone-600">Hali ya Umiliki:</span> {OWNERSHIP_STATUS.find(o => o.value === data.ownership_status)?.label || data.ownership_status}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                HUDUMA / UTILITIES
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Namba ya Stima:</span> {data.electricity_bill_number || '-'}</p>
                <p><span className="font-semibold text-stone-600">Namba ya Maji:</span> {data.water_bill_number || '-'}</p>
                <p><span className="font-semibold text-stone-600">Namba ya Kodi ya Nyumba:</span> {data.property_tax_number || '-'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                FAMILIA / FAMILY
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Jumla ya Familia:</span> {data.family_members_count}</p>
                <p><span className="font-semibold text-stone-600">Wategemezi:</span> {data.dependents_count}</p>
                <p><span className="font-semibold text-stone-600">Watoto chini ya 18:</span> {data.children_under_18 || 0}</p>
                <p><span className="font-semibold text-stone-600">Wazee zaidi ya 60:</span> {data.elderly_over_60 || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                HADHI / STATUS
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Hadhi ya Ukazi:</span> {RESIDENCY_STATUS.find(r => r.value === data.residency_status)?.label || data.residency_status}</p>
                <p><span className="font-semibold text-stone-600">Work Permit:</span> {WORK_PERMIT_OPTIONS.find(w => w.value === data.work_permit)?.label || data.work_permit || '-'}</p>
                {data.passport_number && <p><span className="font-semibold text-stone-600">Namba ya Pasipoti:</span> {data.passport_number}</p>}
                {data.country_of_origin && <p><span className="font-semibold text-stone-600">Nchi ya Asili:</span> {data.country_of_origin}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-emerald-700 border-b border-emerald-200 pb-1 mb-3">
                MADHUMUNI / PURPOSE
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold text-stone-600">Sababu:</span> KUJITAMBULISHA MKAZI</p>
                <p><span className="font-semibold text-stone-600">Taasisi:</span> SERIKALI YA MTAA</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-stone-200 text-center text-sm text-stone-500">
            <p>Hati hii imetolewa kwa njia ya kielektroniki na ni halali kisheria</p>
            <p>This document is electronically generated and is legally valid</p>
            <p className="mt-2">Tarehe: {new Date().toLocaleDateString('sw-TZ')}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPdfPreview(false)}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi kwa Hakiki' : 'Back to Review'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Printer className="h-5 w-5" />
            {lang === 'sw' ? 'Chapisha' : 'Print'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading}
            className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Thibitisha na Wasilisha' : 'Confirm & Submit'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const ReviewSection = () => {
    const data = getValues();
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {lang === 'sw' ? 'Hakiki Taarifa Zako' : 'Review Your Information'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa zako kabla ya kuona PDF. Bado unaweza kurekebisha.'
                  : 'Please review your information before viewing PDF. You can still make changes.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {lang === 'sw' ? 'Serikali ya Mtaa' : 'Local Government'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Halmashauri' : 'Council'}</span>
                  <p className="font-medium">{COUNCILS.find(c => c.value === data.council)?.label || data.council}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kata' : 'Ward'}</span>
                  <p className="font-medium">{data.ward}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kijiji/Mtaa' : 'Village/Street'}</span>
                  <p className="font-medium">{data.village_street}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                {lang === 'sw' ? 'Taarifa Binafsi (Kutoka NIDA)' : 'Personal Info (From NIDA)'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-medium">
                    {userProfile ? `${userProfile.first_name} ${userProfile.middle_name || ''} ${userProfile.last_name}`.replace(/\s+/g, ' ') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">NIDA</span>
                  <p className="font-medium">{userProfile?.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile?.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-medium">{userProfile?.email || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'}</span>
                  <p className="font-medium">{MARITAL_STATUS.find(m => m.value === data.marital_status)?.label || data.marital_status}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kazi' : 'Occupation'}</span>
                  <p className="font-medium">{data.occupation}</p>
                </div>
                {data.employer_name && (
                  <div className="md:col-span-2">
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mwajiri' : 'Employer'}</span>
                    <p className="font-medium">{data.employer_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <Home className="h-4 w-4" />
                {lang === 'sw' ? 'Makazi' : 'Residence'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kitongoji' : 'Neighborhood'}</span>
                  <p className="font-medium">{data.neighborhood}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Nyumba No.' : 'House No.'}</span>
                  <p className="font-medium">{data.house_number}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Plot No.' : 'Plot Number'}</span>
                  <p className="font-medium">{data.plot_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Block</span>
                  <p className="font-medium">{data.block_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Miaka ya Kukaa' : 'Years at Residence'}</span>
                  <p className="font-medium">{data.years_at_residence}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Umiliki' : 'Ownership'}</span>
                  <p className="font-medium">{OWNERSHIP_STATUS.find(o => o.value === data.ownership_status)?.label || data.ownership_status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {lang === 'sw' ? 'Huduma' : 'Utilities'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Stima' : 'Electricity Bill No.'}</span>
                  <p className="font-medium">{data.electricity_bill_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Maji' : 'Water Bill No.'}</span>
                  <p className="font-medium">{data.water_bill_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Kodi' : 'Property Tax No.'}</span>
                  <p className="font-medium">{data.property_tax_number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {lang === 'sw' ? 'Familia na Wategemezi' : 'Family and Dependents'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jumla ya Familia' : 'Total Family'}</span>
                  <p className="font-medium">{data.family_members_count}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Wategemezi' : 'Dependents'}</span>
                  <p className="font-medium">{data.dependents_count}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Watoto (<18)' : 'Children (<18)'}</span>
                  <p className="font-medium">{data.children_under_18 || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Wazee (>60)' : 'Elderly (>60)'}</span>
                  <p className="font-medium">{data.elderly_over_60 || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {lang === 'sw' ? 'Hadhi ya Ukazi' : 'Residency Status'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Hadhi' : 'Status'}</span>
                  <p className="font-medium">{RESIDENCY_STATUS.find(r => r.value === data.residency_status)?.label || data.residency_status}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Work Permit</span>
                  <p className="font-medium">{WORK_PERMIT_OPTIONS.find(w => w.value === data.work_permit)?.label || data.work_permit || '-'}</p>
                </div>
                {data.passport_number && (
                  <div>
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Pasipoti' : 'Passport Number'}</span>
                    <p className="font-medium">{data.passport_number}</p>
                  </div>
                )}
                {data.country_of_origin && (
                  <div>
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Nchi ya Asili' : 'Country of Origin'}</span>
                    <p className="font-medium">{data.country_of_origin}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-emerald-800">{lang === 'sw' ? 'Ada ya Maombi:' : 'Application Fee:'}</span>
              <span className="font-bold text-xl text-emerald-600">5,000 TZS</span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {lang === 'sw' 
                ? 'Utachagua njia ya malipo baada ya kuwasilisha'
                : 'You will select payment method after submission'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('status')}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(getValues());
              setShowPdfPreview(true);
            }}
            className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Eye className="h-5 w-5" />
            {lang === 'sw' ? 'Ona PDF na Wasilisha' : 'View PDF & Submit'}
          </button>
        </div>
      </div>
    );
  };

  if (showPdfPreview) {
    return (
      <form className="space-y-6">
        <PdfPreview />
      </form>
    );
  }

  if (showReview) {
    return (
      <form className="space-y-6">
        <ReviewSection />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <ProgressBar />

      {currentStep === 'council' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {lang === 'sw' ? 'SERIKALI YA MTAA' : 'LOCAL GOVERNMENT'}
            </h3>
            <p className="text-xs text-emerald-600 mt-1">
              {lang === 'sw' 
                ? 'Madhumuni pekee: Kujitambulisha Mkazi'
                : 'Only purpose: Residency Identification'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass}>
                {lang === 'sw' ? 'Halmashauri ya Mtaa' : 'Local Council'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('council', { required: true })} 
                className={inputClass}
              >
                <option value="">{lang === 'sw' ? 'Chagua Halmashauri' : 'Select Council'}</option>
                {COUNCILS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.council && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kata' : 'Ward'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('ward', { required: true })} 
                className={inputClass}
              >
                <option value="">{lang === 'sw' ? 'Chagua Kata' : 'Select Ward'}</option>
                {selectedCouncil && WARDS_BY_COUNCIL[selectedCouncil as keyof typeof WARDS_BY_COUNCIL]?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.ward && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kijiji / Mtaa' : 'Village / Street'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('village_street', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Mtaa wa Uhuru' : 'E.g.: Uhuru Street'}
              />
              {errors.village_street && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' ? 'Madhumuni:' : 'Purpose:'} {PURPOSE_LABEL}
                </span>
                <p className="text-xs text-emerald-600">
                  {lang === 'sw' 
                    ? 'Hakuna madhumuni mengine yanayokubalika'
                    : 'No other purposes are accepted'}
                </p>
              </div>
            </div>
          </div>

          <input type="hidden" {...register('purpose')} value={PURPOSE_VALUE} />
          <input type="hidden" {...register('institution_name')} value={INSTITUTION_VALUE} />
        </div>
      )}

      {currentStep === 'personal' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA BINAFSI (ZILIZOHIFADHIWA)' : 'PERSONAL INFO (SAVED)'}
            </h3>
          </div>

          {userProfile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-emerald-700">
                  {lang === 'sw' ? 'Taarifa kutoka NIDA (Hazibadilishwi)' : 'Information from NIDA (Cannot be changed)'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-bold text-stone-800">
                    {userProfile.first_name} {userProfile.middle_name || ''} {userProfile.last_name}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">NIDA Number</span>
                  <p className="font-bold text-stone-800">{userProfile.nida_number || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-bold text-stone-800">{userProfile.phone || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-bold text-stone-800">{userProfile.email || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'}</span>
                  <p className="font-bold text-stone-800">{userProfile.birth_date || '-'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jinsia' : 'Gender'}</span>
                  <p className="font-bold text-stone-800">{userProfile.gender || '-'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('marital_status', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.select}</option>
                {MARITAL_STATUS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.marital_status && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kazi / Shughuli' : 'Occupation'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('occupation', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Mwalimu, Mfanyabiashara' : 'E.g.: Teacher, Business'}
              />
              {errors.occupation && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Mwajiri (Hiari)' : 'Employer Name (Optional)'}
              </label>
              <input 
                type="text" 
                {...register('employer_name')} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Serikali, Kampuni XYZ' : 'E.g.: Government, XYZ Company'}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {lang === 'sw' 
                  ? 'Taarifa za NIDA zimehakikiwa na hazibadilishwi. Tafadhali hakikisha ni sahihi.'
                  : 'NIDA information is verified and cannot be changed. Please ensure it is correct.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'residence' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Home className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MAKAZI' : 'RESIDENCE INFORMATION'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kitongoji' : 'Neighborhood'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('neighborhood', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Upanga, Kariakoo' : 'E.g.: Upanga, Kariakoo'}
              />
              {errors.neighborhood && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Nyumba' : 'House Number'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('house_number', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: HN 123' : 'E.g.: HN 123'}
              />
              {errors.house_number && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Plot' : 'Plot Number'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('plot_number', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Plot 45' : 'E.g.: Plot 45'}
              />
              {errors.plot_number && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Block / Eneo' : 'Block / Area'}
              </label>
              <input 
                type="text" 
                {...register('block_number')} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Block F' : 'E.g.: Block F'}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 'sensitive' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {lang === 'sw' ? 'HUDUMA NA BILI' : 'UTILITIES AND BILLS'}
            </h3>
            <p className="text-xs text-emerald-600 mt-1">
              {lang === 'sw' 
                ? 'Taarifa hizi zitasaidia kuthibitisha makazi yako (Hiari)'
                : 'This information helps verify your residence (Optional)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Stima (TANESCO)' : 'Electricity Bill Number (TANESCO)'}
              </label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('electricity_bill_number')} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Mfano: 12345678' : 'E.g.: 12345678'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Maji (DAWASA)' : 'Water Bill Number (DAWASA)'}
              </label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('water_bill_number')} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Mfano: 87654321' : 'E.g.: 87654321'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Kodi ya Nyumba' : 'Property Tax Number'}
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('property_tax_number')} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Mfano: PT-12345' : 'E.g.: PT-12345'}
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-700 font-medium">
                  {lang === 'sw' 
                    ? 'Taarifa hizi zinalindwa kwa usiri na hazitatumika kwa madhumuni mengine'
                    : 'This information is protected and will not be used for other purposes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'family' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'FAMILIA NA WATEGEMEZI' : 'FAMILY AND DEPENDENTS'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jumla ya Wanafamilia' : 'Total Family Members'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('family_members_count', { required: true, min: 0 })} 
                  className={`${inputClass} pl-10`}
                  min="0"
                />
              </div>
              {errors.family_members_count && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Idadi ya Wategemezi' : 'Number of Dependents'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('dependents_count', { required: true, min: 0 })} 
                  className={`${inputClass} pl-10`}
                  min="0"
                />
              </div>
              {errors.dependents_count && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Watoto (Chini ya miaka 18)' : 'Children (Under 18)'}
              </label>
              <input 
                type="number" 
                {...register('children_under_18', { min: 0 })} 
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Wazee (Zaidi ya miaka 60)' : 'Elderly (Over 60)'}
              </label>
              <input 
                type="number" 
                {...register('elderly_over_60', { min: 0 })} 
                className={inputClass}
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 'status' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {lang === 'sw' ? 'HADHI YA UKAZI NA UMILIKI' : 'RESIDENCY STATUS AND OWNERSHIP'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Hadhi ya Ukazi' : 'Residency Status'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('residency_status', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.select}</option>
                {RESIDENCY_STATUS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.residency_status && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Umiliki wa Nyumba' : 'House Ownership'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('ownership_status', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.select}</option>
                {OWNERSHIP_STATUS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.ownership_status && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Miaka ya Kukaa hapa' : 'Years at this residence'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                {...register('years_at_residence', { required: true, min: 0 })} 
                className={inputClass}
                min="0"
              />
              {errors.years_at_residence && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Work Permit' : 'Work Permit'}
              </label>
              <select 
                {...register('work_permit')} 
                className={inputClass}
              >
                <option value="">{t.select}</option>
                {WORK_PERMIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Namba ya Pasipoti (kwa wageni)' : 'Passport Number (for foreigners)'}
                </label>
                <input 
                  type="text" 
                  {...register('passport_number')} 
                  className={inputClass}
                  placeholder={lang === 'sw' ? 'Mfano: AB123456' : 'E.g.: AB123456'}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Nchi ya Asili' : 'Country of Origin'}
                </label>
                <input 
                  type="text" 
                  {...register('country_of_origin')} 
                  className={inputClass}
                  placeholder={lang === 'sw' ? 'Mfano: Kenya, India' : 'E.g.: Kenya, India'}
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('terms_accepted', { required: true })} 
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' 
                    ? 'Nathibitisha kuwa taarifa nilizotoa ni sahihi na za kweli' 
                    : 'I confirm that the information provided is correct and true'}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  {lang === 'sw' 
                    ? 'Kwa kuthibitisha, unakubali kuwajibika kwa usahihi wa taarifa hizi.'
                    : 'By confirming, you accept responsibility for the accuracy of this information.'}
                </p>
              </div>
            </label>
            {errors.terms_accepted && (
              <span className="text-red-500 text-sm block mt-2">
                {lang === 'sw' ? 'Lazima uthibitishe taarifa zako' : 'You must confirm your information'}
              </span>
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('data_confirmed', { required: true })} 
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' 
                    ? 'Nakubali kutoa taarifa hizi kwa Serikali ya Mtaa' 
                    : 'I consent to provide this information to the Local Government'}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  {lang === 'sw' 
                    ? 'Taarifa zako zitatumika kwa madhumuni ya utambulisho pekee.'
                    : 'Your information will be used for identification purposes only.'}
                </p>
              </div>
            </label>
            {errors.data_confirmed && (
              <span className="text-red-500 text-sm block mt-2">
                {lang === 'sw' ? 'Lazima ukubali kutoa taarifa' : 'You must consent to provide information'}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-6 border-t border-stone-200">
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Nyuma' : 'Previous'}
          </button>
        )}
        
        <button
          type="button"
          onClick={handleNext}
          className={`flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
            currentStepIndex === 0 ? 'w-full' : ''
          }`}
        >
          {currentStep === 'status' ? (
            <>
              {lang === 'sw' ? 'Hakiki Maombi' : 'Review Application'}
              <Eye className="h-5 w-5" />
            </>
          ) : (
            <>
              {lang === 'sw' ? 'Endelea' : 'Continue'}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UtambulishoMkaziForm;





