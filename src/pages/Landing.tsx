import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Globe2, 
  Users2, 
  FileCheck2, 
  Smartphone, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Search
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TANZANIA_LOGO_URL } from '@/constants/services';

interface LandingProps {
  onShowAuth: (mode: 'login' | 'signup', isDiaspora?: boolean) => void;
  onShowVerify?: () => void;
}

export function Landing({ onShowAuth, onShowVerify }: LandingProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-stone-200 z-50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={TANZANIA_LOGO_URL} 
              alt="Coat of Arms" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tighter text-stone-900 leading-none">E-MTAA</span>
              <span className="text-[6px] sm:text-[8px] font-bold text-stone-500 uppercase tracking-widest">Digital Local Government</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {onShowVerify && (
              <button 
                onClick={onShowVerify}
                className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors px-2 sm:px-4 py-2 flex items-center gap-1.5"
              >
                <Search size={16} />
                {lang === 'sw' ? 'Hakiki Hati' : 'Verify Doc'}
              </button>
            )}
            <button 
              onClick={() => onShowAuth('login')}
              className="text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors px-2 sm:px-4 py-2"
            >
              {t('nav.login')}
            </button>
            <button 
              onClick={() => onShowAuth('signup')}
              className="bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 active:scale-95"
            >
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold">
                <ShieldCheck size={14} />
                {lang === 'sw' ? 'Mfumo Rasmi wa Serikali' : 'Official Government Portal'}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[0.95]">
                {lang === 'sw' ? 'Huduma za Mtaa' : 'Local Services'}
                <span className="block text-emerald-600 italic font-serif font-normal">Kiganjani Mwako.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-lg font-medium">
                {lang === 'sw' 
                  ? 'Pata vibali, barua za utambulisho, na huduma zote za serikali ya mtaa kwa urahisi, haraka na usalama.'
                  : 'Access permits, introduction letters, and all local government services easily, quickly and securely.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => onShowAuth('signup')}
                  className="bg-emerald-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 group"
                >
                  {lang === 'sw' ? 'Anza Sasa' : 'Get Started'}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                {onShowVerify && (
                  <button 
                    onClick={onShowVerify}
                    className="bg-white text-emerald-700 border-2 border-emerald-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
                  >
                    <Search size={20} />
                    {lang === 'sw' ? 'Hakiki Hati' : 'Verify Document'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-stone-500">
                  <span className="text-stone-900">50,000+</span> {lang === 'sw' ? 'Watanzania wamesajiliwa' : 'Tanzanians registered'}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-[2.5rem] border border-stone-200 shadow-2xl overflow-hidden aspect-4/5 lg:aspect-square">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000" 
                  alt="Tanzania Digital" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-900/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-white font-bold text-sm">{lang === 'sw' ? 'Ombi Limeidhinishwa' : 'Application Approved'}</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-emerald-500"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-black text-emerald-400">26</div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{lang === 'sw' ? 'Mikoa' : 'Regions'}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-black text-emerald-400">184</div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{lang === 'sw' ? 'Halmashauri' : 'Councils'}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-black text-emerald-400">4,000+</div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{lang === 'sw' ? 'Mitaa' : 'Streets'}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-black text-emerald-400">1M+</div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{lang === 'sw' ? 'Maombi' : 'Applications'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black tracking-tight text-stone-900">
              {lang === 'sw' ? 'Huduma Maarufu' : 'Popular Services'}
            </h2>
            <p className="text-stone-500 font-medium max-w-2xl mx-auto">
              {lang === 'sw' 
                ? 'Pata huduma hizi na nyingine nyingi moja kwa moja kupitia mfumo wetu wa kidijitali.'
                : 'Access these services and many more directly through our digital portal.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FileCheck2 />, title: lang === 'sw' ? 'Utambulisho wa Mkazi' : 'Resident Identity', desc: lang === 'sw' ? 'Pata uthibitisho rasmi wa makazi yako kwenye mtaa wako.' : 'Proof of residence for banks, schools and passports.' },
              { icon: <Users2 />, title: lang === 'sw' ? 'Barua ya Utambulisho' : 'Introduction Letter', desc: lang === 'sw' ? 'Barua rasmi ya utambulisho kwa taasisi mbalimbali.' : 'Official introduction letter for various institutions.' },
              { icon: <Globe2 />, title: lang === 'sw' ? 'Huduma za Diaspora' : 'Diaspora Services', desc: lang === 'sw' ? 'Huduma maalum kwa Watanzania waishio nje ya nchi.' : 'Special services for Tanzanians living abroad.' }
            ].map((service, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-4xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all group"
            >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{service.title}</h3>
                <p className="text-stone-500 leading-relaxed mb-6 font-medium">{service.desc}</p>
                <button 
                  onClick={() => onShowAuth('signup')}
                  className="text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  {lang === 'sw' ? 'Omba Sasa' : 'Apply Now'} <ArrowRight size={18} />
                </button>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-stone-900">
                  {lang === 'sw' ? 'Kwanini Utumie E-MTAA?' : 'Why Use E-MTAA?'}
                </h2>
                <p className="text-stone-500 font-medium">
                  {lang === 'sw' ? 'Tumerahisisha upatikanaji wa huduma za serikali kwa kila mwananchi.' : 'We have simplified access to government services for every citizen.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { icon: <Clock />, title: lang === 'sw' ? 'Okoa Muda' : 'Save Time', desc: lang === 'sw' ? 'Hakuna haja ya kupanga foleni ofisini.' : 'No need to queue at the office.' },
                  { icon: <ShieldCheck />, title: lang === 'sw' ? 'Salama' : 'Secure', desc: lang === 'sw' ? 'Taarifa zako zinalindwa kwa teknolojia ya kisasa.' : 'Your data is protected with modern technology.' },
                  { icon: <Smartphone />, title: lang === 'sw' ? 'Rahisi' : 'Easy to Use', desc: lang === 'sw' ? 'Tumia simu yako popote ulipo.' : 'Use your phone wherever you are.' },
                  { icon: <MapPin />, title: lang === 'sw' ? 'Popote' : 'Everywhere', desc: lang === 'sw' ? 'Inapatikana mitaa yote Tanzania.' : 'Available in all streets in Tanzania.' }
                ].map((feature, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold text-stone-900">{feature.title}</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold">
                  <Globe2 size={14} />
                  {lang === 'sw' ? 'Huduma za Diaspora' : 'Diaspora Services'}
                </div>
                <h3 className="text-3xl font-black leading-tight">
                  {lang === 'sw' ? 'Upo Nje ya Nchi? Bado Unaweza Kupata Huduma.' : 'Living Abroad? You Can Still Access Services.'}
                </h3>
                <p className="text-stone-400 leading-relaxed font-medium">
                  {lang === 'sw' 
                    ? 'E-MTAA inawawezesha Watanzania waishio nje ya nchi kupata vibali na utambulisho bila kulazimika kusafiri.'
                    : 'E-MTAA enables Tanzanians living abroad to access permits and identification without having to travel.'}
                </p>
                <button 
                  onClick={() => onShowAuth('signup', true)}
                  className="w-full bg-white text-stone-900 py-4 rounded-2xl font-bold hover:bg-stone-100 transition-all flex items-center justify-center gap-3"
                >
                  {lang === 'sw' ? 'Jisajili kama Diaspora' : 'Register as Diaspora'}
                  <ArrowRight size={20} />
                </button>
              </div>
              <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img 
                  src={TANZANIA_LOGO_URL} 
                  alt="Coat of Arms" 
                  className="w-12 h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-stone-900">E-MTAA</span>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Digital Local Government</span>
                </div>
              </div>
              <p className="text-stone-500 max-w-sm font-medium leading-relaxed">
                {lang === 'sw' 
                  ? 'Mfumo rasmi wa kidijitali wa serikali za mitaa Tanzania kwa ajili ya kutoa huduma bora na za haraka kwa wananchi.'
                  : 'The official digital portal for local government in Tanzania, providing quality and fast services to citizens.'}
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs">{lang === 'sw' ? 'Viungo Muhimu' : 'Quick Links'}</h4>
              <ul className="space-y-4 text-sm font-bold text-stone-500">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'sw' ? 'Mwanzo' : 'Home'}</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'sw' ? 'Huduma' : 'Services'}</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'sw' ? 'Msaada' : 'Support'}</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'sw' ? 'Faragha' : 'Privacy'}</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs">{lang === 'sw' ? 'Mawasiliano' : 'Contact Us'}</h4>
              <ul className="space-y-4 text-sm font-bold text-stone-500">
                <li className="flex items-center gap-3"><MapPin size={16} /> Dodoma, Tanzania</li>
                <li className="flex items-center gap-3"><Clock size={16} /> 24/7 Digital Portal</li>
                <li className="flex items-center gap-3"><ShieldCheck size={16} /> Secure Access</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-stone-400">
              © {new Date().getFullYear()} E-MTAA. {lang === 'sw' ? 'Haki zote zimehifadhiwa.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black bg-stone-100 text-stone-500 px-2 py-1 rounded uppercase tracking-widest">PO-RALG</span>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded uppercase tracking-widest">Tanzania Digital</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
