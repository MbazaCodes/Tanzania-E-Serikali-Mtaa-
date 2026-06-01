import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HARDCODED_SERVICES } from '@/constants/services';
import { Service } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/context/AuthContext';
import { 
  FileCheck2, 
  Users2, 
  PartyPopper, 
  Skull, 
  Users,
  Building2,
  Lock
} from 'lucide-react';

interface ServicesProps {
  onSelectService: (service: Service) => void;
  onRefresh?: () => void;
}

export function Services({ onSelectService, onRefresh }: ServicesProps) {
  const { lang, currency } = useLanguage();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Mkazi')) return FileCheck2;
    if (name.includes('Utambulisho')) return Users2;
    if (name.includes('Tukio')) return PartyPopper;
    if (name.includes('Mazishi')) return Skull;
    if (name.includes('Mauziano')) return Users;
    if (name.includes('PANGISHA')) return Building2;
    return FileCheck2;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">{lang === 'sw' ? 'Huduma Zinazopatikana' : 'Available Services'}</h2>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Chagua huduma unayoihitaji na ufanye maombi.' : 'Choose the service you need and make an application.'}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {HARDCODED_SERVICES.map(service => {
          const Icon = getServiceIcon(service.name);
          return (
            <div 
              key={service.id} 
              className={cn(
                "bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-100 shadow-sm transition-all flex flex-col relative overflow-hidden",
                user?.is_verified 
                  ? "hover:shadow-xl hover:border-emerald-500 cursor-pointer group" 
                  : "opacity-75 cursor-not-allowed"
              )}
              onClick={() => user?.is_verified && onSelectService(service)}
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
                  user?.is_verified ? "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100" : "bg-stone-100 text-stone-400"
                )}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="bg-orange-50 text-orange-800 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-orange-100">
                  {formatCurrency(service.fee, currency)}
                </div>
              </div>
              
              <div className="space-y-1 mb-2 sm:mb-3">
                <h3 className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
                  {lang === 'sw' ? service.name : service.name_en || service.name}
                </h3>
                <p className="text-[10px] sm:text-sm font-medium text-stone-400">
                  {lang === 'sw' ? service.name_en || 'Service' : service.name}
                </p>
              </div>
              
              <p className="text-sm sm:text-base text-stone-500 mb-6 sm:mb-8 line-clamp-2 leading-relaxed font-medium">
                {lang === 'sw' ? service.description : service.description_en || service.description}
              </p>
              
              <div className="mt-auto">
                <button 
                  disabled={!user?.is_verified}
                  className={cn(
                    "w-full py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                    user?.is_verified 
                      ? "bg-[#2471A3] text-white hover:bg-[#1F618D] shadow-blue-100 group-hover:scale-[1.02]" 
                      : "bg-stone-200 text-stone-500 shadow-none"
                  )}
                >
                  {user?.is_verified ? (
                    <>
                      {lang === 'sw' ? 'Omba Sasa' : 'Apply Now'}
                      <ArrowRight size={16} className="sm:w-4.5 sm:h-4.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      {lang === 'sw' ? 'Inasubiri Uhakiki' : 'Pending Verification'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
