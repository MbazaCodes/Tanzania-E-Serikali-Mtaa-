import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
  XCircle,
  X,
  User,
  Globe,
  BadgeCheck,
  Calendar,
  Edit2,
  Trash2,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { supabase, UserProfile } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

interface PendingProfileChange {
  id: string;
  user_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function CitizenManagement() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [activeTab, setActiveTab] = useState<'citizens' | 'profile-changes'>('citizens');
  const [pendingChanges, setPendingChanges] = useState<PendingProfileChange[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  
  // Details modal state
  const [selectedCitizen, setSelectedCitizen] = useState<UserProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    region: '',
    district: ''
  });

  const regions = [
    "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Tanga", 
    "Morogoro", "Mbeya", "Kilimanjaro", "Iringa", "Kagera"
  ];

  const getDistrictsForRegion = (region: string) => {
    const districtsMap: {[key: string]: string[]} = {
      "Dar es Salaam": ["Ilala", "Kinondoni", "Ubungo", "Temeke", "Kigamboni"],
      "Arusha": ["Arusha CC", "Arusha DC", "Meru", "Longido", "Monduli"],
      "Dodoma": ["Dodoma CC", "Bahi", "Chamwino", "Chemba", "Kondoa"],
      "Mwanza": ["Nyamagana", "Ilemela", "Magu", "Kwimba", "Sengerema"],
      "Tanga": ["Tanga CC", "Muheza", "Korogwe", "Lushoto", "Handeni"],
      "Morogoro": ["Morogoro CC", "Morogoro DC", "Kilosa", "Ulanga", "Malinyi"],
      "Mbeya": ["Mbeya CC", "Mbeya DC", "Rungwe", "Kyela", "Mbozi"],
      "Kilimanjaro": ["Moshi CC", "Moshi DC", "Hai", "Siha", "Rombo"],
      "Iringa": ["Iringa CC", "Iringa DC", "Kilolo", "Mufindi"],
      "Kagera": ["Bukoba CC", "Bukoba DC", "Muleba", "Karagwe", "Kyerwa"]
    };
    return districtsMap[region] || ["Central", "North", "South", "East", "West"];
  };

  useEffect(() => {
    fetchCitizens();
    fetchPendingProfileChanges();
  }, []);

  const fetchPendingProfileChanges = async () => {
    setLoadingChanges(true);
    try {
      const { data, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profile changes:', error);
        setPendingChanges([]);
        return;
      }

      setPendingChanges(data || []);
    } catch (error) {
      console.error('Exception fetching profile changes:', error);
      setPendingChanges([]);
    } finally {
      setLoadingChanges(false);
    }
  };

  const handleApproveChange = async (change: PendingProfileChange) => {
    try {
      // Update the user's profile with the new value
      const { error: updateError } = await supabase
        .from('users')
        .update({ [change.field_name]: change.new_value })
        .eq('id', change.user_id);

      if (updateError) throw updateError;

      // Mark the change request as approved
      const { error: statusError } = await supabase
        .from('profile_change_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', change.id);

      if (statusError) throw statusError;

      // Remove from local state
      setPendingChanges(prev => prev.filter(c => c.id !== change.id));
      showToast(lang === 'sw' ? 'Mabadiliko yameidhinishwa' : 'Change approved successfully', 'success');
      
      // Refresh citizens list to show updated data
      fetchCitizens();
    } catch (error: any) {
      console.error('Error approving change:', error);
      showToast(error.message || (lang === 'sw' ? 'Hitilafu kuidhinisha' : 'Error approving change'), 'error');
    }
  };

  const handleRejectChange = async (change: PendingProfileChange) => {
    try {
      const { error } = await supabase
        .from('profile_change_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', change.id);

      if (error) throw error;

      setPendingChanges(prev => prev.filter(c => c.id !== change.id));
      showToast(lang === 'sw' ? 'Mabadiliko yamekataliwa' : 'Change rejected', 'info');
    } catch (error: any) {
      console.error('Error rejecting change:', error);
      showToast(error.message || (lang === 'sw' ? 'Hitilafu kukataa' : 'Error rejecting change'), 'error');
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, { en: string; sw: string }> = {
      first_name: { en: 'First Name', sw: 'Jina la Kwanza' },
      middle_name: { en: 'Middle Name', sw: 'Jina la Kati' },
      last_name: { en: 'Last Name', sw: 'Jina la Mwisho' },
      nida_number: { en: 'NIDA Number', sw: 'Namba ya NIDA' },
      nationality: { en: 'Nationality', sw: 'Uraia' },
      gender: { en: 'Gender', sw: 'Jinsia' },
      phone: { en: 'Phone', sw: 'Simu' },
      region: { en: 'Region', sw: 'Mkoa' },
      district: { en: 'District', sw: 'Wilaya' },
      ward: { en: 'Ward', sw: 'Kata' },
      street: { en: 'Street', sw: 'Mtaa' }
    };
    return labels[field]?.[lang] || field;
  };

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      console.log('CitizenManagement: Fetching citizens from Supabase...');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'citizen')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching citizens:', error);
        showToast(lang === 'sw' ? 'Hitilafu kupata wananchi' : 'Error fetching citizens', 'error');
        setCitizens([]);
        return;
      }

      console.log('Citizens fetched from Supabase:', data?.length || 0);
      setCitizens(data || []);
    } catch (error) {
      console.error('Exception in fetchCitizens:', error);
      showToast(lang === 'sw' ? 'Hitilafu kupata wananchi' : 'Error fetching citizens', 'error');
      setCitizens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (citizenId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', citizenId);

      if (error) throw error;
      setCitizens(prev => prev.map(c => c.id === citizenId ? { ...c, is_verified: true } : c));
      showToast(lang === 'sw' ? 'Mwananchi amethibitishwa.' : 'Citizen verified successfully.', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleDecline = async (citizenId: string) => {
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kukataa uhakiki huu?' : 'Are you sure you want to decline this verification?')) return;
    
    try {
      // For decline, we delete the unverified user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', citizenId);

      if (error) throw error;
      setCitizens(prev => prev.filter(c => c.id !== citizenId));
      setShowDetailsModal(false);
      setSelectedCitizen(null);
      showToast(lang === 'sw' ? 'Uhakiki umekataliwa.' : 'Verification declined.', 'info');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleCitizenClick = (citizen: UserProfile) => {
    setSelectedCitizen(citizen);
    setEditFormData({
      first_name: citizen.first_name || '',
      middle_name: citizen.middle_name || '',
      last_name: citizen.last_name || '',
      phone: citizen.phone || '',
      region: citizen.region || '',
      district: citizen.district || ''
    });
    setEditingInfo(false);
    setShowDetailsModal(true);
  };

  const handleUpdateInfo = async () => {
    if (!selectedCitizen) return;
    
    setUpdating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        // Demo mode - update localStorage
        const demoCitizens = JSON.parse(localStorage.getItem('demo_citizens') || '[]');
        const updated = demoCitizens.map((c: any) => 
          c.id === selectedCitizen.id ? { ...c, ...editFormData } : c
        );
        localStorage.setItem('demo_citizens', JSON.stringify(updated));
        setCitizens(prev => prev.map(c => 
          c.id === selectedCitizen.id ? { ...c, ...editFormData } : c
        ));
        setSelectedCitizen({ ...selectedCitizen, ...editFormData });
        setEditingInfo(false);
        showToast(lang === 'sw' ? 'Taarifa zimesasishwa' : 'Information updated', 'success');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          first_name: editFormData.first_name,
          middle_name: editFormData.middle_name,
          last_name: editFormData.last_name,
          phone: editFormData.phone,
          region: editFormData.region,
          district: editFormData.district
        })
        .eq('id', selectedCitizen.id);
      
      if (error) throw error;
      
      setCitizens(prev => prev.map(c => 
        c.id === selectedCitizen.id ? { ...c, ...editFormData } : c
      ));
      setSelectedCitizen({ ...selectedCitizen, ...editFormData });
      setEditingInfo(false);
      showToast(lang === 'sw' ? 'Taarifa zimesasishwa' : 'Information updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCitizen = async (citizenId: string) => {
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kumfuta mwananchi huyu?' : 'Are you sure you want to delete this citizen?')) return;
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        const demoCitizens = JSON.parse(localStorage.getItem('demo_citizens') || '[]');
        const updated = demoCitizens.filter((c: any) => c.id !== citizenId);
        localStorage.setItem('demo_citizens', JSON.stringify(updated));
        setCitizens(prev => prev.filter(c => c.id !== citizenId));
        setShowDetailsModal(false);
        setSelectedCitizen(null);
        showToast(lang === 'sw' ? 'Mwananchi amefutwa' : 'Citizen deleted', 'success');
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', citizenId);
      
      if (error) throw error;
      
      setCitizens(prev => prev.filter(c => c.id !== citizenId));
      setShowDetailsModal(false);
      setSelectedCitizen(null);
      showToast(lang === 'sw' ? 'Mwananchi amefutwa' : 'Citizen deleted', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = 
      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nida_number?.includes(searchQuery) ||
      c.citizen_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'verified' && c.is_verified) || 
      (filter === 'unverified' && !c.is_verified);

    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Usimamizi wa Wananchi' : 'Citizen Management'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Tazama na dhibiti watumiaji wote waliosajiliwa' : 'View and manage all registered citizens'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCitizens}
            disabled={loading}
            title={lang === 'sw' ? 'Onesha upya' : 'Refresh'}
            aria-label={lang === 'sw' ? 'Onesha upya orodha' : 'Refresh list'}
            className="h-12 w-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-50 transition-all"
          >
            <RefreshCw size={18} className={cn("text-stone-500", loading && "animate-spin")} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all w-full sm:w-64 font-medium"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            aria-label={lang === 'sw' ? 'Chuja kwa hali' : 'Filter by verification status'}
            title={lang === 'sw' ? 'Chuja kwa hali' : 'Filter by verification status'}
            className="h-12 px-4 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            <option value="all">{lang === 'sw' ? 'Wote' : 'All'}</option>
            <option value="verified">{lang === 'sw' ? 'Waliothibitishwa' : 'Verified'}</option>
            <option value="unverified">{lang === 'sw' ? 'Wasiohakikiwa' : 'Unverified'}</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('citizens')}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all",
            activeTab === 'citizens' 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          )}
        >
          <Users size={16} className="inline mr-2" />
          {lang === 'sw' ? 'Wananchi' : 'Citizens'} ({filteredCitizens.length})
        </button>
        <button
          onClick={() => setActiveTab('profile-changes')}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all relative",
            activeTab === 'profile-changes' 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          )}
        >
          <Edit2 size={16} className="inline mr-2" />
          {lang === 'sw' ? 'Mabadiliko ya Wasifu' : 'Profile Changes'}
          {pendingChanges.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingChanges.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'profile-changes' ? (
        <div className="bg-white rounded-4xl border border-stone-100 shadow-xl overflow-hidden">
          {loadingChanges ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-stone-500 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading changes...'}</p>
            </div>
          ) : pendingChanges.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-stone-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-stone-900">{lang === 'sw' ? 'Hakuna Mabadiliko Yanayosubiri' : 'No Pending Changes'}</h3>
              <p className="text-stone-500 font-medium">{lang === 'sw' ? 'Mabadiliko yote ya wasifu yameshughulikiwa' : 'All profile changes have been processed'}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {pendingChanges.map((change) => (
                <div key={change.id} className="p-6 hover:bg-stone-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Edit2 size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">
                          {change.users?.first_name} {change.users?.last_name}
                        </p>
                        <p className="text-xs text-stone-500">{change.users?.email}</p>
                        <div className="mt-2 bg-stone-50 rounded-lg p-3">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                            {getFieldLabel(change.field_name)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 line-through">{change.old_value || '-'}</span>
                            <span className="text-stone-400">→</span>
                            <span className="font-bold text-emerald-600">{change.new_value}</span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 mt-2">
                          {new Date(change.created_at).toLocaleString(lang === 'sw' ? 'sw-TZ' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveChange(change)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                      >
                        <Check size={16} />
                        {lang === 'sw' ? 'Idhinisha' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectChange(change)}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all"
                      >
                        <X size={16} />
                        {lang === 'sw' ? 'Kataa' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className="bg-white rounded-4xl border border-stone-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-stone-500 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading citizens...'}</p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-stone-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{lang === 'sw' ? 'Hakuna Wananchi' : 'No Citizens Found'}</h3>
            <p className="text-stone-500 font-medium">{lang === 'sw' ? 'Jaribu kubadilisha vigezo vya utafutaji' : 'Try adjusting your search or filter'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mwananchi' : 'Citizen'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mawasiliano' : 'Contact'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mahali' : 'Location'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Hali' : 'Status'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredCitizens.map((citizen) => (
                  <tr 
                    key={citizen.id} 
                    onClick={() => handleCitizenClick(citizen)}
                    className="hover:bg-stone-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold">
                          {citizen.first_name[0]}{citizen.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{citizen.first_name} {citizen.last_name}</p>
                          <p className="text-xs text-emerald-600 font-bold">CT ID: {citizen.citizen_id || 'N/A'}</p>
                          <p className="text-xs text-stone-500 font-medium">NIDA: {citizen.nida_number || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                          <Mail size={14} className="text-stone-400" />
                          {citizen.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                          <Phone size={14} className="text-stone-400" />
                          {citizen.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                        <MapPin size={14} className="text-stone-400" />
                        {citizen.region}, {citizen.district}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {citizen.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                          <ShieldCheck size={14} />
                          {lang === 'sw' ? 'Imehakikiwa' : 'Verified'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                          <ShieldAlert size={14} />
                          {lang === 'sw' ? 'Inasubiri' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!citizen.is_verified && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(citizen.id);
                              }}
                              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                              title={lang === 'sw' ? 'Thibitisha' : 'Verify'}
                              aria-label={lang === 'sw' ? 'Thibitisha mwananchi' : 'Verify citizen'}
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecline(citizen.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title={lang === 'sw' ? 'Kataa' : 'Decline'}
                              aria-label={lang === 'sw' ? 'Kataa uhakiki' : 'Decline verification'}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCitizenClick(citizen);
                          }}
                          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
                          title={lang === 'sw' ? 'Tazama zaidi' : 'View details'}
                          aria-label={lang === 'sw' ? 'Tazama zaidi' : 'View details'}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Citizen Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCitizen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-linear-to-r from-emerald-50 to-blue-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {selectedCitizen.first_name?.[0] || 'C'}{selectedCitizen.last_name?.[0] || 'Z'}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-extrabold text-stone-900">
                      {selectedCitizen.first_name} {selectedCitizen.middle_name} {selectedCitizen.last_name}
                    </h3>
                    <p className="text-sm text-stone-500">{selectedCitizen.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCitizen(null);
                    setEditingInfo(false);
                  }}
                  title={lang === 'sw' ? 'Funga' : 'Close'}
                  aria-label={lang === 'sw' ? 'Funga modal' : 'Close modal'}
                  className="p-2 hover:bg-white/80 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* CT ID & NIDA Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* CT ID */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <CreditCard size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        CT ID
                      </span>
                    </div>
                    <p className="font-bold text-emerald-800 text-lg">
                      {selectedCitizen.citizen_id || (lang === 'sw' ? 'Haijatolewa' : 'Not assigned')}
                    </p>
                  </div>

                  {/* NIDA Number */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                      <CreditCard size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        NIDA
                      </span>
                    </div>
                    <p className="font-bold text-amber-800 text-lg">
                      {selectedCitizen.nida_number || (lang === 'sw' ? 'Haijasajiliwa' : 'Not registered')}
                    </p>
                  </div>
                </div>

                {/* Citizen Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-400 mb-1">
                      <Phone size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {lang === 'sw' ? 'Simu' : 'Phone'}
                      </span>
                    </div>
                    <p className="font-bold text-stone-800">
                      {selectedCitizen.phone || (lang === 'sw' ? 'Haijasajiliwa' : 'Not provided')}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-400 mb-1">
                      <User size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {lang === 'sw' ? 'Jinsia' : 'Gender'}
                      </span>
                    </div>
                    <p className="font-bold text-stone-800">
                      {selectedCitizen.gender === 'M' ? (lang === 'sw' ? 'Me' : 'Male') :
                       selectedCitizen.gender === 'F' ? (lang === 'sw' ? 'Ke' : 'Female') :
                       (lang === 'sw' ? 'Haijulikani' : 'Unknown')}
                    </p>
                  </div>

                  {/* Nationality */}
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-400 mb-1">
                      <Globe size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {lang === 'sw' ? 'Uraia' : 'Nationality'}
                      </span>
                    </div>
                    <p className="font-bold text-stone-800">
                      {selectedCitizen.nationality || 'Tanzania'}
                    </p>
                  </div>

                  {/* Verification Status */}
                  <div className="p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-400 mb-1">
                      <BadgeCheck size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {lang === 'sw' ? 'Uhakiki' : 'Verification'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCitizen.is_verified ? (
                        <>
                          <ShieldCheck size={16} className="text-emerald-500" />
                          <span className="font-bold text-emerald-600">
                            {lang === 'sw' ? 'Imethibitishwa' : 'Verified'}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={16} className="text-amber-500" />
                          <span className="font-bold text-amber-600">
                            {lang === 'sw' ? 'Inasubiri' : 'Pending'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <MapPin size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {lang === 'sw' ? 'Mahali' : 'Location'}
                      </span>
                    </div>
                    {!editingInfo && (
                      <button
                        onClick={() => setEditingInfo(true)}
                        title={lang === 'sw' ? 'Hariri' : 'Edit'}
                        aria-label={lang === 'sw' ? 'Hariri taarifa' : 'Edit information'}
                        className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-500 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  {editingInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder={lang === 'sw' ? 'Jina la kwanza' : 'First name'}
                          value={editFormData.first_name}
                          onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder={lang === 'sw' ? 'Jina la kati' : 'Middle name'}
                          value={editFormData.middle_name}
                          onChange={(e) => setEditFormData({ ...editFormData, middle_name: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder={lang === 'sw' ? 'Jina la mwisho' : 'Last name'}
                          value={editFormData.last_name}
                          onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                        />
                      </div>
                      
                      <input
                        type="tel"
                        placeholder={lang === 'sw' ? 'Simu' : 'Phone'}
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          title={lang === 'sw' ? 'Chagua mkoa' : 'Select region'}
                          aria-label={lang === 'sw' ? 'Chagua mkoa' : 'Select region'}
                          value={editFormData.region}
                          onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value, district: '' })}
                          className="h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                        >
                          <option value="">{lang === 'sw' ? '-- Mkoa --' : '-- Region --'}</option>
                          {regions.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        
                        <select
                          title={lang === 'sw' ? 'Chagua wilaya' : 'Select district'}
                          aria-label={lang === 'sw' ? 'Chagua wilaya' : 'Select district'}
                          value={editFormData.district}
                          onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                          disabled={!editFormData.region}
                          className="h-10 px-3 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm disabled:opacity-50"
                        >
                          <option value="">{lang === 'sw' ? '-- Wilaya --' : '-- District --'}</option>
                          {editFormData.region && getDistrictsForRegion(editFormData.region).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingInfo(false)}
                          className="flex-1 h-10 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all text-sm"
                        >
                          {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                        </button>
                        <button
                          onClick={handleUpdateInfo}
                          disabled={updating}
                          className="flex-1 h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          {updating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          {lang === 'sw' ? 'Hifadhi' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-800">
                      <span className="font-bold">
                        {selectedCitizen.region || (lang === 'sw' ? 'Hakuna eneo' : 'No location')}
                        {selectedCitizen.district ? `, ${selectedCitizen.district}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {!selectedCitizen.is_verified && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                      {lang === 'sw' ? 'Hatua za Haraka' : 'Quick Actions'}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleVerify(selectedCitizen.id);
                          setSelectedCitizen({ ...selectedCitizen, is_verified: true });
                        }}
                        className="flex-1 h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={16} />
                        {lang === 'sw' ? 'Thibitisha' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleDecline(selectedCitizen.id)}
                        className="flex-1 h-10 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        {lang === 'sw' ? 'Kataa' : 'Decline'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCitizen(null);
                    }}
                    className="flex-1 h-12 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                  >
                    {lang === 'sw' ? 'Funga' : 'Close'}
                  </button>
                  <button
                    onClick={() => handleDeleteCitizen(selectedCitizen.id)}
                    className="h-12 px-6 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    {lang === 'sw' ? 'Futa' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
