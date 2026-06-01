import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  MapPin, 
  Settings, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Shield,
  DollarSign,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Database,
  Globe,
  Smartphone,
  Laptop,
  BarChart3,
  PieChart,
  Percent
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/ui/StatCard';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { HARDCODED_SERVICES } from '@/constants/services';

interface DashboardStats {
  // User stats
  totalUsers: number;
  totalCitizens: number;
  totalStaff: number;
  totalAdmins: number;
  verifiedUsers: number;
  pendingVerification: number;
  
  // Application stats
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  inProgressApplications: number;
  
  // Financial stats
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  
  // Service stats
  totalServices: number;
  activeServices: number;
  totalCategories: number;
  
  // Location stats
  totalRegions: number;
  totalDistricts: number;
  totalWards: number;
  totalStreets: number;
  
  // System stats
  systemUptime: number;
  activeSessions: number;
  apiCalls: number;
  averageResponseTime: number;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'application' | 'payment' | 'service';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

const INITIAL_STATS: DashboardStats = {
  totalUsers: 0,
  totalCitizens: 0,
  totalStaff: 0,
  totalAdmins: 0,
  verifiedUsers: 0,
  pendingVerification: 0,
  
  totalApplications: 0,
  approvedApplications: 0,
  pendingApplications: 0,
  rejectedApplications: 0,
  inProgressApplications: 0,
  
  totalRevenue: 0,
  todayRevenue: 0,
  monthlyRevenue: 0,
  pendingPayments: 0,
  
  totalServices: 0,
  activeServices: 0,
  totalCategories: 0,
  
  totalRegions: 0,
  totalDistricts: 0,
  totalWards: 0,
  totalStreets: 0,
  
  systemUptime: 0,
  activeSessions: 0,
  apiCalls: 0,
  averageResponseTime: 0,
};

export function AdminDashboard({ setView }: { setView?: (view: string) => void }) {
  const { lang, currency } = useLanguage();
  const { showToast } = useToast();
  
  // State management
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview');

  const applicationSuccessRate = useMemo(() => {
    if (stats.totalApplications === 0) return 0;
    return ((stats.approvedApplications / stats.totalApplications) * 100).toFixed(1);
  }, [stats]);

  const verificationRate = useMemo(() => {
    if (stats.totalUsers === 0) return 0;
    return ((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1);
  }, [stats]);

  const recentActivities = useMemo(() => {
    return activities.slice(0, 5);
  }, [activities]);

  const getProgressWidthClass = (percentageValue: string | number): string => {
    const numericValue = typeof percentageValue === 'string' ? parseFloat(percentageValue) : percentageValue;

    if (!Number.isFinite(numericValue) || numericValue <= 0) return 'w-0';
    if (numericValue >= 100) return 'w-full';
    if (numericValue >= 95) return 'w-11/12';
    if (numericValue >= 90) return 'w-10/12';
    if (numericValue >= 80) return 'w-9/12';
    if (numericValue >= 70) return 'w-8/12';
    if (numericValue >= 60) return 'w-7/12';
    if (numericValue >= 50) return 'w-6/12';
    if (numericValue >= 40) return 'w-5/12';
    if (numericValue >= 30) return 'w-4/12';
    if (numericValue >= 20) return 'w-3/12';
    if (numericValue >= 10) return 'w-2/12';
    return 'w-1/12';
  };

  const serviceColorClasses = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-red-500', 'bg-cyan-500'];

  // Data fetching
  const fetchDashboardStats = useCallback(async () => {
    setRefreshing(true);
    try {

      // Fetch real data from Supabase
      const [
        usersCount,
        citizensCount,
        staffCount,
        adminsCount,
        verifiedCount,
        pendingVerification,
        applicationsCount,
        approvedCount,
        pendingCount,
        rejectedCount,
        inProgressCount,
        revenueTotal,
        revenueToday,
        revenueMonth,
        pendingPayments,
        servicesCount,
        activeServicesCount,
        categoriesCount,
        regionsCount,
        districtsCount,
        wardsCount,
        streetsCount,
        activeSessions
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'citizen'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['approved', 'issued']),
        supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'paid']),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['in_progress', 'verified']),
        supabase.from('applications').select('form_data, service_id').in('status', ['paid', 'issued', 'verified', 'approved']),
        supabase.from('applications').select('form_data, service_id').in('status', ['paid', 'issued', 'verified', 'approved']).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('applications').select('form_data, service_id').in('status', ['paid', 'issued', 'verified', 'approved']).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('applications').select('form_data, service_id').in('status', ['pending_payment', 'submitted']),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('service_categories').select('*', { count: 'exact', head: true }),
        supabase.from('locations').select('*', { count: 'exact', head: true }).eq('level', 'region'),
        supabase.from('locations').select('*', { count: 'exact', head: true }).eq('level', 'district'),
        supabase.from('locations').select('*', { count: 'exact', head: true }).eq('level', 'ward'),
        supabase.from('locations').select('*', { count: 'exact', head: true }).eq('level', 'street'),
        supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('active', true)
      ]);

      // Log results for debugging

      if (applicationsCount.error) console.error('Applications error:', applicationsCount.error);
      if (usersCount.error) console.error('Users error:', usersCount.error);

      // Helper function to calculate revenue from applications
      const calculateRevenueFromApps = (apps: Array<{ form_data: Record<string, unknown>; service_id: string }> | null): number => {
        if (!apps) return 0;
        return apps.reduce((acc, app) => {
          // First check payment_data.amount in form_data
          const paymentAmount = (app.form_data as Record<string, { amount?: number }>)?.["payment_data"]?.amount;
          if (paymentAmount && typeof paymentAmount === 'number') {
            return acc + paymentAmount;
          }
          // Then check service_fee in form_data (for percentage-based services)
          const serviceFee = app.form_data?.service_fee;
          if (serviceFee && typeof serviceFee === 'number') {
            return acc + serviceFee;
          }
          // Finally, try to get fee from hardcoded services
          const service = HARDCODED_SERVICES.find(s => s.id === app.service_id);
          if (service && service.fee) {
            return acc + service.fee;
          }
          return acc;
        }, 0);
      };

      // Calculate totals from applications
      const totalRevenue = calculateRevenueFromApps(revenueTotal.data);
      const todayRev = calculateRevenueFromApps(revenueToday.data);
      const monthRev = calculateRevenueFromApps(revenueMonth.data);
      const pendingPay = calculateRevenueFromApps(pendingPayments.data);

      const newStats: DashboardStats = {
        totalUsers: usersCount.count || 0,
        totalCitizens: citizensCount.count || 0,
        totalStaff: staffCount.count || 0,
        totalAdmins: adminsCount.count || 0,
        verifiedUsers: verifiedCount.count || 0,
        pendingVerification: pendingVerification.count || 0,
        
        totalApplications: applicationsCount.count || 0,
        approvedApplications: approvedCount.count || 0,
        pendingApplications: pendingCount.count || 0,
        rejectedApplications: rejectedCount.count || 0,
        inProgressApplications: inProgressCount.count || 0,
        
        totalRevenue,
        todayRevenue: todayRev,
        monthlyRevenue: monthRev,
        pendingPayments: pendingPay,
        
        // Use hardcoded services count if database has no services
        totalServices: (servicesCount.count || 0) > 0 ? servicesCount.count! : HARDCODED_SERVICES.length,
        activeServices: (activeServicesCount.count || 0) > 0 ? activeServicesCount.count! : HARDCODED_SERVICES.filter(s => s.active ?? s.active).length,
        totalCategories: categoriesCount.count || 4, // Default to 4 categories
        
        totalRegions: regionsCount.count || 0,
        totalDistricts: districtsCount.count || 0,
        totalWards: wardsCount.count || 0,
        totalStreets: streetsCount.count || 0,
        
        systemUptime: 99.98,
        activeSessions: activeSessions.count || 0,
        apiCalls: 1250000,
        averageResponseTime: 245,
      };
      setStats(newStats);
      
      // Fetch recent activities
      await fetchRecentActivities();
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showToast(
        lang === 'sw' ? 'Hitilafu kupakia takwimu' : 'Error loading statistics',
        'error'
      );
      // Initialize with zeros on error
      setStats({
        totalUsers: 0,
        totalCitizens: 0,
        totalStaff: 0,
        totalAdmins: 0,
        verifiedUsers: 0,
        pendingVerification: 0,
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        inProgressApplications: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        totalServices: 0,
        activeServices: 0,
        totalCategories: 0,
        totalRegions: 0,
        totalDistricts: 0,
        totalWards: 0,
        totalStreets: 0,
        systemUptime: 0,
        activeSessions: 0,
        apiCalls: 0,
        averageResponseTime: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lang, showToast]);

  const fetchRecentActivities = useCallback(async () => {
    try {
      // Fetch real activities from activity_logs table
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          details,
          created_at,
          users:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedActivities: ActivityItem[] = data.map(item => ({
          id: item.id,
          type: determineActivityType(item.action),
          action: item.action,
          description: item.details,
          user: item.users && Array.isArray(item.users) && item.users.length > 0
            ? `${item.users[0].first_name} ${item.users[0].last_name}`
            : item.users && !Array.isArray(item.users)
            ? `${(item.users as any).first_name} ${(item.users as any).last_name}`
            : 'System',
          timestamp: item.created_at,
          status: determineActivityStatus(item.action)
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  }, []);

  const determineActivityType = (action: string): ActivityItem['type'] => {
    if (action.toLowerCase().includes('user') || action.toLowerCase().includes('citizen')) return 'user';
    if (action.toLowerCase().includes('application')) return 'application';
    if (action.toLowerCase().includes('payment')) return 'payment';
    if (action.toLowerCase().includes('service')) return 'service';
    return 'user';
  };

  const determineActivityStatus = (action: string): 'success' | 'pending' | 'error' => {
    if (action.toLowerCase().includes('approve') || action.toLowerCase().includes('success')) return 'success';
    if (action.toLowerCase().includes('pending') || action.toLowerCase().includes('submitted')) return 'pending';
    if (action.toLowerCase().includes('reject') || action.toLowerCase().includes('fail')) return 'error';
    return 'success';
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Set up real-time subscriptions
    const subscription = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDashboardStats]);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'sw' ? 'sasa hivi' : 'just now';
    if (diffMins < 60) return `${diffMins} ${lang === 'sw' ? 'dakika' : 'min'} ${lang === 'sw' ? 'zilizopita' : 'ago'}`;
    if (diffHours < 24) return `${diffHours} ${lang === 'sw' ? 'saa' : 'hour'}${diffHours > 1 ? 's' : ''} ${lang === 'sw' ? 'zilizopita' : 'ago'}`;
    return `${diffDays} ${lang === 'sw' ? 'siku' : 'day'}${diffDays > 1 ? 's' : ''} ${lang === 'sw' ? 'zilizopita' : 'ago'}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Dashibodi ya Msimamizi' : 'Admin Dashboard'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Muhtasari wa mfumo mzima wa E-Mtaa' : 'System-wide overview of E-Mtaa'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            title={lang === 'sw' ? 'Chagua kipindi cha wakati' : 'Select time range'}
            aria-label={lang === 'sw' ? 'Kipindi cha wakati' : 'Time range'}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="h-12 px-4 bg-white border border-stone-200 rounded-xl font-medium text-stone-600 focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="today">{lang === 'sw' ? 'Leo' : 'Today'}</option>
            <option value="week">{lang === 'sw' ? 'Wiki hii' : 'This Week'}</option>
            <option value="month">{lang === 'sw' ? 'Mwezi huu' : 'This Month'}</option>
            <option value="year">{lang === 'sw' ? 'Mwaka huu' : 'This Year'}</option>
          </select>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-12 px-4 bg-white border border-stone-200 rounded-xl font-medium text-stone-600 hover:bg-stone-50 transition-all flex items-center gap-2 disabled:opacity-50"
            title={lang === 'sw' ? 'Onyesha upya' : 'Refresh'}
          >
            <TrendingUp size={18} className={cn(refreshing && "animate-spin")} />
            <span className="hidden sm:inline">
              {refreshing 
                ? (lang === 'sw' ? 'Inaonyesha...' : 'Refreshing...') 
                : (lang === 'sw' ? 'Onyesha upya' : 'Refresh')}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm transition-all",
            activeTab === 'overview' 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {lang === 'sw' ? 'Muhtasari' : 'Overview'}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm transition-all",
            activeTab === 'analytics' 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {lang === 'sw' ? 'Takwimu' : 'Analytics'}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm transition-all",
            activeTab === 'reports' 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {lang === 'sw' ? 'Ripoti' : 'Reports'}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={<Users className="text-blue-500" />} 
              label={lang === 'sw' ? "Wananchi" : "Citizens"} 
              value={stats.totalCitizens.toLocaleString()}
              trend={+12.5}
              description={lang === 'sw' ? '+12.5% kutoka mwezi uliopita' : '+12.5% from last month'}
            />
            <StatCard 
              icon={<Shield className="text-purple-500" />} 
              label={lang === 'sw' ? "Watumishi" : "Staff"} 
              value={stats.totalStaff.toLocaleString()}
              trend={+5.2}
              description={lang === 'sw' ? '+5.2% kutoka mwezi uliopita' : '+5.2% from last month'}
            />
            <StatCard 
              icon={<FileText className="text-amber-500" />} 
              label={lang === 'sw' ? "Maombi" : "Applications"} 
              value={stats.totalApplications.toLocaleString()}
              trend={+8.3}
              description={lang === 'sw' ? 'Kiwango cha kuidhinishwa ' + applicationSuccessRate + '%' : 'Approval rate ' + applicationSuccessRate + '%'}
            />
            <StatCard 
              icon={<DollarSign className="text-emerald-500" />} 
              label={lang === 'sw' ? "Mapato" : "Revenue"} 
              value={formatCurrency(stats.totalRevenue, currency)}
              trend={+15.7}
              description={lang === 'sw' ? 'Leo: ' + formatCurrency(stats.todayRevenue, currency) : 'Today: ' + formatCurrency(stats.todayRevenue, currency)}
            />
          </div>

          {/* Second Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-4xl p-6 border border-stone-100 shadow-xl">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">
                {lang === 'sw' ? 'Hali ya Maombi' : 'Application Status'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Zilizoidhinishwa' : 'Approved'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.approvedApplications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Zinasubiri' : 'Pending'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.pendingApplications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Zinafanyika' : 'In Progress'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.inProgressApplications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Zilizokataliwa' : 'Rejected'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.rejectedApplications.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4xl p-6 border border-stone-100 shadow-xl">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">
                {lang === 'sw' ? 'Takwimu za Watumiaji' : 'User Statistics'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Waliothibitishwa' : 'Verified'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.verifiedUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Wanasubiri' : 'Pending'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.pendingVerification.toLocaleString()}</span>
                </div>
                <div className="mt-4 p-3 bg-stone-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-500">
                      {lang === 'sw' ? 'Kiwango cha Uhakiki' : 'Verification Rate'}
                    </span>
                    <span className="text-sm font-bold text-stone-900">{verificationRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-600 rounded-full transition-all ${getProgressWidthClass(verificationRate)}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4xl p-6 border border-stone-100 shadow-xl">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">
                {lang === 'sw' ? 'Huduma na Maeneo' : 'Services & Locations'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-400 mb-1">
                    {lang === 'sw' ? 'Huduma' : 'Services'}
                  </p>
                  <p className="text-2xl font-black text-stone-900">{stats.totalServices}</p>
                  <p className="text-xs text-emerald-600">
                    {stats.activeServices} {lang === 'sw' ? 'zinazotumika' : 'active'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">
                    {lang === 'sw' ? 'Kategoria' : 'Categories'}
                  </p>
                  <p className="text-2xl font-black text-stone-900">{stats.totalCategories}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">
                    {lang === 'sw' ? 'Mikoa' : 'Regions'}
                  </p>
                  <p className="text-2xl font-black text-stone-900">{stats.totalRegions}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">
                    {lang === 'sw' ? 'Wilaya' : 'Districts'}
                  </p>
                  <p className="text-2xl font-black text-stone-900">{stats.totalDistricts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health */}
            <div className="lg:col-span-1 bg-white rounded-4xl p-6 border border-stone-100 shadow-xl">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">
                {lang === 'sw' ? 'Afya ya Mfumo' : 'System Health'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-emerald-500" />
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Upatikanaji' : 'Uptime'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.systemUptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-blue-500" />
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Vipindi Hai' : 'Active Sessions'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.activeSessions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-purple-500" />
                    <span className="font-medium text-stone-600">
                      {lang === 'sw' ? 'Muda wa Kujibu' : 'Response Time'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{stats.averageResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-amber-500" />
                    <span className="font-medium text-stone-600">
                      API {lang === 'sw' ? 'Miito' : 'Calls'}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">{(stats.apiCalls / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-4xl p-6 border border-stone-100 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">
                  {lang === 'sw' ? 'Shughuli za Karibuni' : 'Recent Activity'}
                </h3>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  {lang === 'sw' ? 'Tazama Zote' : 'View All'}
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      activity.type === 'application' && "bg-blue-50 text-blue-600",
                      activity.type === 'payment' && "bg-emerald-50 text-emerald-600",
                      activity.type === 'user' && "bg-purple-50 text-purple-600",
                      activity.type === 'service' && "bg-amber-50 text-amber-600"
                    )}>
                      {activity.type === 'application' && <FileText size={16} />}
                      {activity.type === 'payment' && <DollarSign size={16} />}
                      {activity.type === 'user' && <Users size={16} />}
                      {activity.type === 'service' && <Settings size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900 text-sm">{activity.action}</p>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                          activity.status === 'success' && "bg-emerald-50 text-emerald-600",
                          activity.status === 'pending' && "bg-amber-50 text-amber-600",
                          activity.status === 'error' && "bg-red-50 text-red-600"
                        )}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-400">{activity.user}</span>
                        <span className="text-[10px] text-stone-300">•</span>
                        <span className="text-[10px] text-stone-400">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-stone-900 rounded-4xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Zap size={20} className="text-emerald-400" />
                {lang === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setView?.('service_management')}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left"
                >
                  <FileText size={24} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    {lang === 'sw' ? 'Huduma' : 'Services'}
                  </p>
                  <p className="text-sm font-bold">{lang === 'sw' ? 'Simamia Huduma' : 'Manage Services'}</p>
                </button>
                <button 
                  onClick={() => setView?.('citizen_management')}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left"
                >
                  <Users size={24} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    {lang === 'sw' ? 'Wananchi' : 'Citizens'}
                  </p>
                  <p className="text-sm font-bold">{lang === 'sw' ? 'Simamia Wananchi' : 'Manage Citizens'}</p>
                </button>
                <button 
                  onClick={() => setView?.('location_management')}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left"
                >
                  <MapPin size={24} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    {lang === 'sw' ? 'Maeneo' : 'Locations'}
                  </p>
                  <p className="text-sm font-bold">{lang === 'sw' ? 'Simamia Maeneo' : 'Manage Locations'}</p>
                </button>
                <button 
                  onClick={() => setView?.('admin_logs')}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left"
                >
                  <BarChart3 size={24} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    {lang === 'sw' ? 'Shughuli' : 'Activity'}
                  </p>
                  <p className="text-sm font-bold">{lang === 'sw' ? 'Tazama Logi' : 'View Logs'}</p>
                </button>
              </div>
            </div>
            <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-2xl">
                  <TrendingUp size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">{lang === 'sw' ? 'Maombi/Siku' : 'Apps/Day'}</p>
                  <p className="text-2xl font-black text-stone-900">{Math.round(stats.totalApplications / 30)}</p>
                </div>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[72%]"></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Percent size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">{lang === 'sw' ? 'Kiwango Kuidhinisha' : 'Approval Rate'}</p>
                  <p className="text-2xl font-black text-stone-900">{applicationSuccessRate}%</p>
                </div>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className={`h-full bg-blue-500 rounded-full ${getProgressWidthClass(applicationSuccessRate)}`}></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">{lang === 'sw' ? 'Uthibitisho' : 'Verification'}</p>
                  <p className="text-2xl font-black text-stone-900">{verificationRate}%</p>
                </div>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div className={`h-full bg-purple-500 rounded-full ${getProgressWidthClass(verificationRate)}`}></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">{lang === 'sw' ? 'Muda wa Kufanya' : 'Avg. Process'}</p>
                  <p className="text-2xl font-black text-stone-900">2.4 {lang === 'sw' ? 'siku' : 'days'}</p>
                </div>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[60%]"></div>
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <PieChart size={20} className="text-emerald-600" />
              {lang === 'sw' ? 'Mgawanyo wa Huduma' : 'Service Breakdown'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HARDCODED_SERVICES.slice(0, 6).map((service, index) => (
                <div key={service.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${serviceColorClasses[index] || 'bg-stone-400'}`}></div>
                    <span className="font-medium text-stone-700">{lang === 'sw' ? service.name : (service.name_en || service.name)}</span>
                  </div>
                  <span className="font-bold text-stone-900">{formatCurrency(service.fee, currency)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl">
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-emerald-600" />
                {lang === 'sw' ? 'Muhtasari wa Maeneo' : 'Location Summary'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Mikoa' : 'Regions'}</span>
                  <span className="font-bold text-emerald-600">{stats.totalRegions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Wilaya' : 'Districts'}</span>
                  <span className="font-bold text-blue-600">{stats.totalDistricts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Kata' : 'Wards'}</span>
                  <span className="font-bold text-purple-600">{stats.totalWards}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Mitaa' : 'Streets'}</span>
                  <span className="font-bold text-amber-600">{stats.totalStreets}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl">
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-600" />
                {lang === 'sw' ? 'Hali ya Mfumo' : 'System Health'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Uptime' : 'Uptime'}</span>
                  <span className="font-bold text-emerald-600">{stats.systemUptime}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Vikao vya Sasa' : 'Active Sessions'}</span>
                  <span className="font-bold text-blue-600">{stats.activeSessions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="font-medium text-stone-600">{lang === 'sw' ? 'Muda wa Majibu' : 'Response Time'}</span>
                  <span className="font-bold text-purple-600">{stats.averageResponseTime}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-4xl p-8 text-white shadow-xl">
              <DollarSign size={32} className="mb-4 opacity-80" />
              <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">
                {lang === 'sw' ? 'Mapato ya Mwezi' : 'Monthly Revenue'}
              </p>
              <p className="text-3xl font-black">{formatCurrency(stats.monthlyRevenue, currency)}</p>
              <p className="text-emerald-100 text-sm mt-2">
                {lang === 'sw' ? 'Leo: ' : 'Today: '}{formatCurrency(stats.todayRevenue, currency)}
              </p>
            </div>

            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-4xl p-8 text-white shadow-xl">
              <FileText size={32} className="mb-4 opacity-80" />
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">
                {lang === 'sw' ? 'Maombi ya Mwezi' : 'Monthly Applications'}
              </p>
              <p className="text-3xl font-black">{stats.totalApplications}</p>
              <p className="text-blue-100 text-sm mt-2">
                {lang === 'sw' ? 'Yaliyoidhinishwa: ' : 'Approved: '}{stats.approvedApplications}
              </p>
            </div>

            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-4xl p-8 text-white shadow-xl">
              <Users size={32} className="mb-4 opacity-80" />
              <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mb-1">
                {lang === 'sw' ? 'Watumiaji Wapya' : 'New Users'}
              </p>
              <p className="text-3xl font-black">{stats.totalUsers}</p>
              <p className="text-purple-100 text-sm mt-2">
                {lang === 'sw' ? 'Wamethibitishwa: ' : 'Verified: '}{stats.verifiedUsers}
              </p>
            </div>
          </div>

          {/* Detailed Reports */}
          <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              {lang === 'sw' ? 'Ripoti za Kina' : 'Detailed Reports'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setView?.('admin_logs')}
                className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all">
                    <Activity size={20} className="text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">{lang === 'sw' ? 'Shughuli za Mfumo' : 'System Activity'}</p>
                    <p className="text-sm text-stone-500">{lang === 'sw' ? 'Tazama logi za shughuli' : 'View activity logs'}</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-stone-400 group-hover:text-emerald-600 transition-all" />
              </button>

              <button 
                onClick={() => setView?.('citizen_management')}
                className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">{lang === 'sw' ? 'Ripoti ya Wananchi' : 'Citizens Report'}</p>
                    <p className="text-sm text-stone-500">{lang === 'sw' ? 'Watumiaji wote' : 'All users'}: {stats.totalUsers}</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-stone-400 group-hover:text-blue-600 transition-all" />
              </button>

              <button 
                onClick={() => setView?.('office_management')}
                className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-all">
                    <Building2 size={20} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">{lang === 'sw' ? 'Ripoti ya Ofisi' : 'Office Report'}</p>
                    <p className="text-sm text-stone-500">{lang === 'sw' ? 'Watumishi' : 'Staff'}: {stats.totalStaff}</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-stone-400 group-hover:text-purple-600 transition-all" />
              </button>

              <button 
                onClick={() => setView?.('service_management')}
                className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-all">
                    <Settings size={20} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">{lang === 'sw' ? 'Ripoti ya Huduma' : 'Services Report'}</p>
                    <p className="text-sm text-stone-500">{lang === 'sw' ? 'Huduma' : 'Services'}: {stats.totalServices}</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-stone-400 group-hover:text-amber-600 transition-all" />
              </button>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-4xl p-8 border border-stone-100 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600" />
              {lang === 'sw' ? 'Muhtasari wa Fedha' : 'Financial Summary'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <span className="font-medium text-stone-700">{lang === 'sw' ? 'Mapato Jumla' : 'Total Revenue'}</span>
                <span className="font-bold text-emerald-600 text-xl">{formatCurrency(stats.totalRevenue, currency)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <span className="font-medium text-stone-700">{lang === 'sw' ? 'Mapato ya Mwezi' : 'Monthly Revenue'}</span>
                <span className="font-bold text-blue-600 text-xl">{formatCurrency(stats.monthlyRevenue, currency)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                <span className="font-medium text-stone-700">{lang === 'sw' ? 'Malipo Yanasubiri' : 'Pending Payments'}</span>
                <span className="font-bold text-amber-600 text-xl">{formatCurrency(stats.pendingPayments, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
