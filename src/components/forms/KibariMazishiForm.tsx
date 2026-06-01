/**
 * Kibari cha Mazishi Form
 * Funeral Announcement / Permit
 * 
 * Service: Kibari cha Mazishi
 * Fee: Free (0 TZS)
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - Review step before submission
 * - Deceased and family information
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, Heart, Users, Calendar, MapPin, Phone, User } from 'lucide-react';
import { FormProps, labels } from './types';
import { ProgressFill } from '../ui/ProgressFill';

interface FormData {
  // Deceased info
  deceased_full_name: string;
  fathers_name: string;
  mothers_name: string;
  date_of_birth: string;
  date_of_death: string;
  place_of_death: string;
  age_at_death: number;
  surviving_spouse: string;
  // Funeral schedule
  body_location: string;
  service_date: string;
  service_time: string;
  service_location: string;
  burial_location: string;
  // Family contact
  family_representative: string;
  representative_phone: string;
  children_names: string;
}

type Step = 'deceased' | 'funeral' | 'family' | 'review';

export const KibariMazishiForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('deceased');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch } = useForm<FormData>();

  // Watch date_of_birth and date_of_death to calculate age
  const dob = watch('date_of_birth');
  const dod = watch('date_of_death');
  
  // Calculate age at death if both dates are provided
  const calculateAge = () => {
    if (dob && dod) {
      const birthDate = new Date(dob);
      const deathDate = new Date(dod);
      let age = deathDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = deathDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && deathDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  };

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'deceased', label: 'Deceased', swLabel: 'Marehemu' },
    { key: 'funeral', label: 'Funeral', swLabel: 'Mazishi' },
    { key: 'family', label: 'Family', swLabel: 'Familia' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'deceased':
        fieldsToValidate = ['deceased_full_name', 'date_of_death'];
        break;
      case 'funeral':
        fieldsToValidate = ['body_location', 'service_date', 'service_time', 'burial_location'];
        break;
      case 'family':
        fieldsToValidate = ['family_representative', 'representative_phone'];
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

    if (currentStep === 'family') {
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
    // Calculate age if not provided
    if (!data.age_at_death && dob && dod) {
      data.age_at_death = calculateAge() || 0;
    }
    setFormData(data);
    setShowReview(true);
  };

  const confirmSubmit = () => {
    if (formData) {
      onSubmit(formData as unknown as Record<string, unknown>);
    }
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-stone-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-linear-to-r from-stone-100 to-stone-50 p-4 rounded-xl border-l-4 border-stone-500 mb-6 shadow-sm";

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-stone-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-stone-600 text-white' 
                : index === currentStepIndex
                ? 'bg-stone-100 text-stone-600 border-2 border-stone-600'
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
        <ProgressFill progress={progress} className="bg-linear-to-r from-stone-500 to-stone-600 h-2 rounded-full transition-all duration-300" />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-stone-600">{Math.round(progress)}%</span>
      </div>
    </div>
  );

  // Review Component
  const ReviewSection = () => {
    const data = getValues();
    const calculatedAge = calculateAge();
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {lang === 'sw' ? 'Hakiki Taarifa za Mazishi' : 'Review Funeral Information'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa za marehemu na mazishi kabla ya kuwasilisha. Taarifa hizi zitatumika kutayarisha Kibari cha Mazishi.'
                  : 'Please review the deceased and funeral information before submitting. This information will be used to prepare the Funeral Announcement.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Deceased Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {lang === 'sw' ? 'Taarifa za Marehemu' : 'Deceased Information'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-medium text-lg">{data.deceased_full_name}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina la Baba' : "Father's Name"}</span>
                  <p className="font-medium">{data.fathers_name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina la Mama' : "Mother's Name"}</span>
                  <p className="font-medium">{data.mothers_name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mume/Mke' : 'Spouse'}</span>
                  <p className="font-medium">{data.surviving_spouse || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'}</span>
                  <p className="font-medium">{data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Kufariki' : 'Date of Death'}</span>
                  <p className="font-bold text-red-600">{new Date(data.date_of_death).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Umri' : 'Age'}</span>
                  <p className="font-medium">{calculatedAge || data.age_at_death || '-'} {lang === 'sw' ? 'miaka' : 'years'}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mahala pa Kufariki' : 'Place of Death'}</span>
                <p className="font-medium">{data.place_of_death || '-'}</p>
              </div>
            </div>
          </div>

          {/* Funeral Schedule */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {lang === 'sw' ? 'Ratiba ya Mazishi' : 'Funeral Schedule'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mahala ilipo Maiti' : 'Body Location'}</span>
                  <p className="font-medium">{data.body_location}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Mazishi' : 'Funeral Date'}</span>
                  <p className="font-medium">{new Date(data.service_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda' : 'Time'}</span>
                  <p className="font-medium">{data.service_time}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mahala pa Huduma' : 'Service Location'}</span>
                  <p className="font-medium">{data.service_location || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mahala pa Kuzika' : 'Burial Location'}</span>
                  <p className="font-medium">{data.burial_location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Contact */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {lang === 'sw' ? 'Mawasiliano ya Familia' : 'Family Contact'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Mwakilishi wa Familia' : 'Family Representative'}</span>
                  <p className="font-medium">{data.family_representative}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{data.representative_phone}</p>
                </div>
              </div>
              
              {data.children_names && (
                <div className="mt-3">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Majina ya Watoto' : 'Children Names'}</span>
                  <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1 whitespace-pre-wrap">{data.children_names}</p>
                </div>
              )}
            </div>
          </div>

          {/* Applicant Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200">
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                {lang === 'sw' ? 'Mwombaji' : 'Applicant'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina' : 'Name'}</span>
                  <p className="font-medium">
                    {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile?.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Free Service Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-emerald-800">
                  {lang === 'sw' ? 'Huduma Bure' : 'Free Service'}
                </h4>
                <p className="text-sm text-emerald-700">
                  {lang === 'sw' 
                    ? 'Kibari cha Mazishi ni huduma ya bure. Hakitozwi ada yoyote.'
                    : 'Funeral Announcement is a free service. No fees are charged.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('family')}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading}
            className="flex-1 py-3 bg-linear-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Kibari' : 'Submit Announcement'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

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

      {/* Step 1: Deceased Information */}
      {currentStep === 'deceased' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MAREHEMU' : 'DECEASED INFORMATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina Kamili la Marehemu' : 'Full Name of Deceased'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              {...register('deceased_full_name', { required: true })} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Juma Mohamed Juma' : 'E.g.: Juma Mohamed Juma'}
            />
            {errors.deceased_full_name && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Baba' : "Father's Name"}
              </label>
              <input 
                type="text" 
                {...register('fathers_name')} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Mohamed Juma' : 'E.g.: Mohamed Juma'}
              />
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Mama' : "Mother's Name"}
              </label>
              <input 
                type="text" 
                {...register('mothers_name')} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Amina Salim' : 'E.g.: Amina Salim'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'}
              </label>
              <input 
                type="date" 
                {...register('date_of_birth')} 
                className={inputClass}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kufariki' : 'Date of Death'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                {...register('date_of_death', { required: true })} 
                className={inputClass}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date_of_death && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Umri wa Kufariki' : 'Age at Death'}
              </label>
              <input 
                type="number" 
                {...register('age_at_death')} 
                className={inputClass}
                placeholder={calculateAge()?.toString() || lang === 'sw' ? 'Itakadiriwa' : 'Will be calculated'}
                readOnly={!!calculateAge()}
                value={calculateAge() || undefined}
              />
              {calculateAge() && (
                <p className="text-xs text-stone-500 mt-1">
                  {lang === 'sw' ? 'Imekokotolewa kiotomatiki' : 'Auto-calculated'}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mahala pa Kufariki' : 'Place of Death'}
            </label>
            <input 
              type="text" 
              {...register('place_of_death')} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Hospitali ya Mnazi Mmoja' : 'E.g.: Mnazi Mmoja Hospital'}
            />
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina la Mume/Mke (Aliye hai)' : 'Surviving Spouse'}
            </label>
            <input 
              type="text" 
              {...register('surviving_spouse')} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Fatuma Juma' : 'E.g.: Fatuma Juma'}
            />
          </div>
        </div>
      )}

      {/* Step 2: Funeral Schedule */}
      {currentStep === 'funeral' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {lang === 'sw' ? 'RATIBA YA MAZISHI' : 'FUNERAL SCHEDULE'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mahala ilipo Maiti' : 'Body Location'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('body_location', { required: true })} 
                className={`${inputClass} pl-10`}
                placeholder={lang === 'sw' ? 'Mfano: Hospitali ya Muhimbili, Chumba cha Maiti' : 'E.g.: Muhimbili Hospital Morgue'}
              />
            </div>
            {errors.body_location && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Mazishi' : 'Funeral Date'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                {...register('service_date', { 
                  required: true,
                  validate: value => new Date(value) >= new Date() || lang === 'sw' ? 'Tarehe lazima iwe ya baadaye' : 'Date must be in the future'
                })} 
                className={inputClass}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.service_date && <span className="text-red-500 text-sm">{errors.service_date.message || t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Mazishi' : 'Funeral Time'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="time" 
                {...register('service_time', { required: true })} 
                className={inputClass}
              />
              {errors.service_time && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mahala pa Huduma (Msikiti/Kanisa)' : 'Service Location (Mosque/Church)'}
            </label>
            <input 
              type="text" 
              {...register('service_location')} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Msikiti wa Kariakoo' : 'E.g.: Kariakoo Mosque'}
            />
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mahala pa Kuzika (Makaburini)' : 'Burial Location (Cemetery)'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              {...register('burial_location', { required: true })} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Makaburi ya Kinondoni' : 'E.g.: Kinondoni Cemetery'}
            />
            {errors.burial_location && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          {/* Funeral guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2">
              {lang === 'sw' ? 'Miongozo ya Mazishi' : 'Funeral Guidelines'}
            </h4>
            <p className="text-sm text-amber-700">
              {lang === 'sw' 
                ? 'Hakikisha tarehe na muda wa mazishi umezingatia kanuni za eneo lako. Baadhi ya makaburi yana muda maalum wa kuzika.'
                : 'Ensure the funeral date and time comply with local regulations. Some cemeteries have specific burial hours.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Family Contact */}
      {currentStep === 'family' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'MWASILIANO YA FAMILIA' : 'FAMILY CONTACT'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Mwakilishi wa Familia' : 'Family Representative'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('family_representative', { required: true })} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Mfano: Mohamed Juma' : 'E.g.: Mohamed Juma'}
                />
              </div>
              {errors.family_representative && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Simu ya Mwakilishi' : 'Representative Phone'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="tel" 
                  {...register('representative_phone', { 
                    required: true,
                    pattern: {
                      value: /^(\+255|0)[67][0-9]{8}$/,
                      message: lang === 'sw' ? 'Namba si sahihi. Tumia +255 or 0' : 'Invalid phone number. Use +255 or 0'
                    }
                  })} 
                  className={`${inputClass} pl-10`}
                  placeholder="+255 7XX XXX XXX"
                />
              </div>
              {errors.representative_phone && <span className="text-red-500 text-sm">{errors.representative_phone.message || t.required}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Majina ya Watoto (Wachache)' : 'Children Names (Few)'}
            </label>
            <textarea 
              {...register('children_names')} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Orodhesha majina ya watoto, moja kwa mstari. Mfano:\nAli Juma\nAsha Juma\nHassan Juma' 
                : 'List children names, one per line. E.g.:\nAli Juma\nAsha Juma\nHassan Juma'}
            />
          </div>

          {/* Contact importance */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {lang === 'sw' 
                  ? 'Namba ya simu ya mwakilishi wa familia ni muhimu kwa ajili ya mawasiliano ya haraka wakati wa maandalizi ya mazishi.'
                  : 'The family representative\'s phone number is important for quick communication during funeral preparations.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
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
        
        {currentStep !== 'review' ? (
          <button
            type="button"
            onClick={handleNext}
            className={`flex-1 py-3 bg-linear-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'family' ? (
              <>
                {lang === 'sw' ? 'Hakiki Taarifa' : 'Review Information'}
                <Eye className="h-5 w-5" />
              </>
            ) : (
              <>
                {lang === 'sw' ? 'Endelea' : 'Continue'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowReview(true)}
            className="flex-1 py-3 bg-linear-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="h-5 w-5" />
            {lang === 'sw' ? 'Malizia na Hakiki' : 'Finish & Review'}
          </button>
        )}
      </div>
    </form>
  );
};

export default KibariMazishiForm;

