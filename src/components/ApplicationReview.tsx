import React from 'react';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';

interface ApplicationReviewProps {
  lang: string;
  user?: UserProfile | null;  // optional – component reads from useAuth internally
}

export function ApplicationReview({ lang }: ApplicationReviewProps) {
  const { user } = useAuth();
  const title = lang === 'sw' ? 'Uhakiki wa Maombi' : 'Application Review';
  const subtitle = lang === 'sw'
    ? `Karibu ${`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}. Hapa unaweza kuhakiki maombi yaliyowasilishwa.`
    : `Welcome ${`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}. You can review submitted applications here.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-800">{title}</h2>
          <p className="text-sm text-stone-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
