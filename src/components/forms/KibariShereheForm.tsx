/**
 * Kibari cha Matukio / Sherehe Form
 * Event / Celebration Permit
 * 
 * Service: Kibari cha Matukio / Sherehe
 * Fee: 20,000 TZS
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - Review step before submission
 * - Event planning information
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, Calendar, MapPin, Users, User, Phone, Link2, PartyPopper, Clock } from 'lucide-react';
import { FormProps, labels } from './types';
import { ProgressFill } from '../ui/ProgressFill';

// Event type options
const EVENT_TYPES = [
  { label: 'HARUSI - Wedding', value: 'HARUSI' },
  { label: 'HITIMU - Graduation', value: 'HITIMU' },
  { label: 'TAMASHA - Festival', value: 'TAMASHA' },
  { label: 'MKUTANO - Meeting', value: 'MKUTANO' },
  { label: 'SAREHE YA MWAKA MPYA - New Year', value: 'MWAKA_MPYA' },
  { label: 'KRISMASI - Christmas', value: 'KRISMASI' },
  { label: 'IDD - Eid', value: 'IDD' },
  { label: 'NYINGINEZO - Other', value: 'NYINGINEZO' },
];

// Expected guests ranges
const GUEST_RANGES = [
  { label: 'Chini ya 50', value: '0-50' },
  { label: '50 - 100', value: '50-100' },
  { label: '100 - 200', value: '100-200' },
  { label: '200 - 500', value: '200-500' },
  { label: '500 - 1000', value: '500-1000' },
  { label: 'Zaidi ya 1000', value: '1000+' },
];

// Event duration options
const DURATION_OPTIONS = [
  { label: 'Saa 1-3', value: '1-3' },
  { label: 'Saa 3-6', value: '3-6' },
  { label: 'Saa 6-12', value: '6-12' },
  { label: 'Zaidi ya saa 12', value: '12+' },
];

interface FormData {
  // Event info
  event_type: string;
  event_name: string;
  event_description: string;
  // Date and venue
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  venue: string;
  venue_address: string;
  expected_guests: string;
  duration: string;
  // Contact info
  contact_person: string;
  contact_phone: string;
  whatsapp_group: string;
  // Additional info
  has_sound_system: boolean;
  has_food_vendors: boolean;
  special_requests: string;
}

type Step = 'event' | 'datetime' | 'contact' | 'review';

export const KibariShereheForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('event');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'event', label: 'Event', swLabel: 'Tukio' },
    { key: 'datetime', label: 'Date & Venue', swLabel: 'Muda na Mahali' },
    { key: 'contact', label: 'Contact', swLabel: 'Mawasiliano' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'event':
        fieldsToValidate = ['event_type', 'event_name'];
        break;
      case 'datetime':
        fieldsToValidate = ['start_date', 'start_time', 'venue', 'expected_guests'];
        break;
      case 'contact':
        fieldsToValidate = ['contact_person', 'contact_phone'];
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

    if (currentStep === 'contact') {
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
    setShowReview(true);
  };

  const confirmSubmit = () => {
    if (formData) {
      onSubmit(formData);
    }
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-linear-to-r from-pink-50 to-rose-50 p-4 rounded-xl border-l-4 border-pink-500 mb-6 shadow-sm";

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-pink-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-pink-600 text-white' 
                : index === currentStepIndex
                ? 'bg-pink-100 text-pink-600 border-2 border-pink-600'
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
        <ProgressFill progress={progress} className="bg-linear-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300" />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-pink-600">{Math.round(progress)}%</span>
      </div>
    </div>
  );

  // Review Component
  const ReviewSection = () => {
    const data = getValues();
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {lang === 'sw' ? 'Hakiki Maelezo ya Tukio' : 'Review Event Details'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa za tukio lako kabla ya kuwasilisha. Taarifa hizi zitatumika kutayarisha Kibari cha Tukio.'
                  : 'Please review your event information before submitting. This information will be used to prepare the Event Announcement.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Event Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
              <h4 className="font-bold text-pink-800 flex items-center gap-2">
                <PartyPopper className="h-4 w-4" />
                {lang === 'sw' ? 'Maelezo ya Tukio' : 'Event Information'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Tukio' : 'Event Type'}</span>
                  <p className="font-medium">{EVENT_TYPES.find(e => e.value === data.event_type)?.label || data.event_type}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina la Tukio' : 'Event Name'}</span>
                  <p className="font-medium">{data.event_name}</p>
                </div>
              </div>
              
              {data.event_description && (
                <div className="mt-3">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Maelezo ya Ziada' : 'Additional Description'}</span>
                  <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1">{data.event_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Date, Time and Venue */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
              <h4 className="font-bold text-pink-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {lang === 'sw' ? 'Muda na Mahali' : 'Date, Time & Venue'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Kuanza' : 'Start Date'}</span>
                  <p className="font-medium">{new Date(data.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda wa Kuanza' : 'Start Time'}</span>
                  <p className="font-medium">{data.start_time}</p>
                </div>
                {data.end_date && (
                  <div>
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Mwisho' : 'End Date'}</span>
                    <p className="font-medium">{new Date(data.end_date).toLocaleDateString()}</p>
                  </div>
                )}
                {data.end_time && (
                  <div>
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda wa Mwisho' : 'End Time'}</span>
                    <p className="font-medium">{data.end_time}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Ukumbi / Eneo' : 'Venue'}</span>
                <p className="font-medium">{data.venue}</p>
              </div>
              
              {data.venue_address && (
                <div className="mt-2">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani Kamili' : 'Full Address'}</span>
                  <p className="font-medium text-sm">{data.venue_address}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Wageni Wanaotarajiwa' : 'Expected Guests'}</span>
                  <p className="font-medium">{GUEST_RANGES.find(g => g.value === data.expected_guests)?.label || data.expected_guests}</p>
                </div>
                {data.duration && (
                  <div>
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda wa Tukio' : 'Event Duration'}</span>
                    <p className="font-medium">{DURATION_OPTIONS.find(d => d.value === data.duration)?.label || data.duration}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
              <h4 className="font-bold text-pink-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {lang === 'sw' ? 'Mawasiliano' : 'Contact Information'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Msimamizi wa Tukio' : 'Event Organizer'}</span>
                  <p className="font-medium">{data.contact_person}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{data.contact_phone}</p>
                </div>
              </div>
              
              {data.whatsapp_group && (
                <div className="mt-3">
                  <span className="text-xs text-stone-500">WhatsApp Group</span>
                  <p className="font-medium text-blue-600 break-all">
                    <a href={data.whatsapp_group} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {data.whatsapp_group}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
              <h4 className="font-bold text-pink-800">{lang === 'sw' ? 'Maelezo ya Ziada' : 'Additional Information'}</h4>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.has_sound_system ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {data.has_sound_system ? '✓' : '✗'} {lang === 'sw' ? 'Mfumo wa Sauti' : 'Sound System'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.has_food_vendors ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {data.has_food_vendors ? '✓' : '✗'} {lang === 'sw' ? 'Wauzaji wa Chakula' : 'Food Vendors'}
                  </span>
                </div>
                
                {data.special_requests && (
                  <div className="mt-3">
                    <span className="text-xs text-stone-500">{lang === 'sw' ? 'Maombi Maalum' : 'Special Requests'}</span>
                    <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1">{data.special_requests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-pink-50 px-4 py-2 border-b border-pink-100">
              <h4 className="font-bold text-pink-800">{lang === 'sw' ? 'Mwombaji' : 'Applicant'}</h4>
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
                <div>
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-medium">{userProfile?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-linear-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-pink-800">{lang === 'sw' ? 'Ada ya Kibari cha Tukio:' : 'Event Permit Fee:'}</span>
              <span className="font-bold text-xl text-pink-600">20,000 TZS</span>
            </div>
            <p className="text-xs text-pink-600 mt-1">
              {lang === 'sw' 
                ? 'Ada hii ni kwa ajili ya kibari cha tukio. Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'This is the event permit fee. Payment will be completed after submission.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('contact')}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading}
            className="flex-1 py-3 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Kibari' : 'Submit Permit'}
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

      {/* Step 1: Event Type and Basic Info */}
      {currentStep === 'event' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-pink-800 flex items-center gap-2">
              <PartyPopper className="h-5 w-5" />
              {lang === 'sw' ? 'AINA NA MAELEZO YA TUKIO' : 'EVENT TYPE AND DETAILS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Tukio' : 'Event Type'} <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('event_type', { required: true })} 
              className={inputClass}
            >
              <option value="">{t.select}</option>
              {EVENT_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.event_type && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina la Tukio' : 'Event Name'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              {...register('event_name', { required: true })} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Harusi ya John & Mary, Sherehe ya Krismasi' : 'E.g.: John & Mary Wedding, Christmas Celebration'}
            />
            {errors.event_name && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Ziada ya Tukio' : 'Additional Event Description'}
            </label>
            <textarea 
              {...register('event_description')} 
              className={inputClass}
              rows={3}
              placeholder={lang === 'sw' 
                ? 'Eleza kwa ufupi kuhusu tukio lako (aina ya sherehe, nini kitafanyika, n.k.)' 
                : 'Briefly describe your event (type of celebration, what will happen, etc.)'}
            />
          </div>
        </div>
      )}

      {/* Step 2: Date, Time and Venue */}
      {currentStep === 'datetime' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-pink-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {lang === 'sw' ? 'MUDA NA MAHALI PA TUKIO' : 'EVENT DATE, TIME AND VENUE'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuanza' : 'Start Date'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="date" 
                  {...register('start_date', { 
                    required: true,
                    validate: value => new Date(value) >= new Date(new Date().setHours(0,0,0,0)) || lang === 'sw' ? 'Tarehe lazima iwe ya leo au baadaye' : 'Date must be today or later'
                  })} 
                  className={`${inputClass} pl-10`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.start_date && <span className="text-red-500 text-sm">{errors.start_date.message || t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Kuanza' : 'Start Time'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="time" 
                  {...register('start_time', { required: true })} 
                  className={`${inputClass} pl-10`}
                />
              </div>
              {errors.start_time && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Mwisho (kama ipo)' : 'End Date (if applicable)'}
              </label>
              <input 
                type="date" 
                {...register('end_date', {
                  validate: (value, formValues) => {
                    if (!value) return true;
                    return new Date(value) >= new Date(formValues.start_date) || 
                      (lang === 'sw' ? 'Tarehe ya mwisho lazima iwe baada ya tarehe ya kuanza' : 'End date must be after start date');
                  }
                })} 
                className={inputClass}
                min={watch('start_date')}
              />
              {errors.end_date && <span className="text-red-500 text-sm">{errors.end_date.message}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Mwisho (kama ipo)' : 'End Time (if applicable)'}
              </label>
              <input 
                type="time" 
                {...register('end_time')} 
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina la Ukumbi / Eneo' : 'Venue Name'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('venue', { required: true })} 
                className={`${inputClass} pl-10`}
                placeholder={lang === 'sw' ? 'Mfano: AICC, Diamond Jubilee Hall, Kunduchi Beach' : 'E.g.: AICC, Diamond Jubilee Hall, Kunduchi Beach'}
              />
            </div>
            {errors.venue && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Anwani Kamili ya Ukumbi' : 'Full Venue Address'}
            </label>
            <textarea 
              {...register('venue_address')} 
              className={inputClass}
              rows={2}
              placeholder={lang === 'sw' ? 'Mtaa, jirani, alama za eneo, wilaya, mkoa' : 'Street, nearby landmarks, district, region'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Idadi ya Wageni (Inayokadiriwa)' : 'Expected Guests'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <select 
                  {...register('expected_guests', { required: true })} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">{t.select}</option>
                  {GUEST_RANGES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {errors.expected_guests && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Tukio' : 'Event Duration'}
              </label>
              <select 
                {...register('duration')} 
                className={inputClass}
              >
                <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'}</option>
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Venue requirements notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2">
              {lang === 'sw' ? 'Mahitaji ya Ukumbi' : 'Venue Requirements'}
            </h4>
            <p className="text-sm text-amber-700">
              {lang === 'sw' 
                ? 'Hakikisha umepata kibali cha kutumia ukumbi husika. Baadhi ya vukumbi vinahitaji vibali maalum kwa ajili ya sherehe.'
                : 'Ensure you have permission to use the venue. Some venues require special permits for events.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Contact and Additional Info */}
      {currentStep === 'contact' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-pink-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'MAWASILIANO NA MAELEZO YA ZIADA' : 'CONTACT AND ADDITIONAL INFO'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Msimamizi wa Tukio' : 'Event Organizer'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('contact_person', { required: true })} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Jina kamili' : 'Full name'}
                />
              </div>
              {errors.contact_person && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Simu ya Msimamizi' : 'Organizer Phone'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="tel" 
                  {...register('contact_phone', { 
                    required: true,
                    pattern: {
                      value: /^(\+255|0)[67][0-9]{8}$/,
                      message: lang === 'sw' ? 'Namba si sahihi. Tumia +255 au 0' : 'Invalid phone number. Use +255 or 0'
                    }
                  })} 
                  className={`${inputClass} pl-10`}
                  placeholder="+255 7XX XXX XXX"
                />
              </div>
              {errors.contact_phone && <span className="text-red-500 text-sm">{errors.contact_phone.message || t.required}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Kiungo cha Group la WhatsApp' : 'WhatsApp Group Link'}
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="url" 
                {...register('whatsapp_group')} 
                className={`${inputClass} pl-10`}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className={labelClass}>
              {lang === 'sw' ? 'Vifaa na Huduma' : 'Equipment and Services'}
            </label>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('has_sound_system')} 
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-stone-700">
                  {lang === 'sw' ? 'Mfumo wa Sauti (Speakers, Microphone)' : 'Sound System'}
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('has_food_vendors')} 
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-stone-700">
                  {lang === 'sw' ? 'Wauzaji wa Chakula' : 'Food Vendors'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maombi Maalum / Maelezo ya Ziada' : 'Special Requests / Additional Notes'}
            </label>
            <textarea 
              {...register('special_requests')} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Eleza mahitaji yoyote maalum kwa ajili ya tukio lako (mfano: umeme wa ziada, usalama, n.k.)' 
                : 'Describe any special requirements for your event (e.g., additional power, security, etc.)'}
            />
          </div>

          {/* Event planning tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-800 mb-2">
              {lang === 'sw' ? 'Vidokezo vya Kupanga Tukio' : 'Event Planning Tips'}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>{lang === 'sw' ? 'Hakikisha unapata kibali cha ukumbi mapema' : 'Secure venue permit early'}</li>
              <li>{lang === 'sw' ? 'Panga usalama ikiwa wageni watakuwa wengi' : 'Arrange security if many guests expected'}</li>
              <li>{lang === 'sw' ? 'Zingatia kanuni za mtaa kuhusu kelele na muda' : 'Consider local regulations on noise and timing'}</li>
              <li>{lang === 'sw' ? 'Washa taarifa kwa majirani kama tukio litakuwa na kelele' : 'Inform neighbors if event will be noisy'}</li>
            </ul>
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
            className={`flex-1 py-3 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'contact' ? (
              <>
                {lang === 'sw' ? 'Hakiki Tukio' : 'Review Event'}
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
            className="flex-1 py-3 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="h-5 w-5" />
            {lang === 'sw' ? 'Malizia na Hakiki' : 'Finish & Review'}
          </button>
        )}
      </div>
    </form>
  );
};

export default KibariShereheForm;

