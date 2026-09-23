import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Home,
  FileCheck,
  Layers,
  Headphones,
  Bot
} from 'lucide-react';
import { CompanyBranding } from '../types';
import { CEOSignature } from './CEOSignature';

interface CompanyInfoViewProps {
  branding: CompanyBranding;
  onBack: () => void;
  onNavigateToTab: (tab: any) => void;
  initialSection?: string;
}

export const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({
  branding,
  onBack,
  onNavigateToTab,
  initialSection,
}) => {
  useEffect(() => {
    if (initialSection) {
      const element = document.getElementById(initialSection);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [initialSection]);

  const quickNav = [
    { label: 'Home', icon: Home, tab: 'home' },
    { label: 'Form', icon: FileCheck, tab: 'form' },
    { label: 'Status', icon: Layers, tab: 'status' },
    { label: 'Account', icon: User, tab: 'account' },
    { label: 'Support', icon: Headphones, tab: 'support' },
    { label: 'AI Bot', icon: Bot, tab: 'assistant' },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-20 pt-4 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Overview</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-16">
        {/* About Section */}
        <section id="company-about-section" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">About {branding.companyName || 'Anthony India'}</h2>
              <p className="text-xs text-slate-500 font-medium">Enterprise Digital Transformation & Governance</p>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm leading-relaxed text-slate-600 space-y-4">
            <p className="text-sm sm:text-base">
              {branding.companyName || 'Anthony India'} is a leading global provider of enterprise cloud solutions, specialized engineering services, and digital governance. With a commitment to excellence and innovation, we help our clients navigate complex technological landscapes with secure, efficient, and scalable platforms.
            </p>
            <p className="text-sm sm:text-base">
              Our infrastructure is built on the principles of absolute transparency and reliability. We serve as a strategic partner to high-priority accounts worldwide, ensuring that every digital interaction is backed by rigorous auditing and professional accountability.
            </p>
          </div>
        </section>

        {/* CEO Message */}
        <section id="ceo-message-section" className="bg-[#0b1329] text-white p-8 sm:p-12 rounded-[2rem] border border-slate-800 shadow-xl space-y-8 scroll-mt-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="flex items-center gap-5 relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg border border-blue-500/30">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Message from the CEO</h2>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Arnav Sharma • Founder & Chief Executive</p>
            </div>
          </div>
          
          <div className="space-y-6 relative">
            <p className="text-base sm:text-lg text-slate-300 italic font-medium leading-relaxed max-w-4xl">
              "Our mission has always been to simplify the complex. This portal is a testament to our dedication to transparency, security, and efficiency. Every application you submit is a step toward a stronger partnership, and I personally oversee the governance of our high-priority strategic accounts to ensure we deliver nothing but the best."
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="h-12 flex items-center bg-white px-4 rounded-xl">
                  <CEOSignature className="w-28 h-10" color="#1e40af" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">
                  CEO DIGITAL<br/>VERIFICATION
                </div>
              </div>
              <div className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Identity Secured
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section id="mission-vision-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24">
          <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To empower organizations through intelligent automation and secure digital infrastructure, fostering growth and resilience in a rapidly changing world. We focus on delivering value that translates into measurable success for our partners.
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Our Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To be the world's most trusted partner for enterprise digital transformation, known for our unwavering commitment to security and user-centric engineering. We strive to set the global standard for professional excellence.
            </p>
          </div>
        </section>

        {/* Governance */}
        <section id="corporate-governance-section" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Governance & Compliance</h2>
          </div>
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 leading-relaxed text-slate-600">
            <p className="text-sm sm:text-base">
              We maintain the highest standards of integrity and accountability. Our governance framework ensures that all client data is handled with extreme care, and our review processes are audited to maintain fairness and speed. We comply with international data protection regulations and industry-specific security standards. Our internal audit team regularly reviews all portal activities to ensure absolute protocol compliance.
            </p>
          </div>
        </section>

        {/* Careers */}
        <section id="careers-section" className="bg-blue-600 text-white p-8 sm:p-12 rounded-[2rem] shadow-xl space-y-8 scroll-mt-24">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl font-bold">Join Our Global Team</h2>
            <p className="text-blue-100 text-sm sm:text-base">We are looking for exceptional talent to help us build the next generation of enterprise infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Engineering & Architecture', desc: 'Cloud architects, security specialists & full-stack engineers.' },
              { title: 'Design & Experience', desc: 'UI/UX designers, researchers & creative directors.' },
              { title: 'Product & Governance', desc: 'Product managers, compliance officers & audit leads.' },
              { title: 'Strategic Partnerships', desc: 'Account directors, consultants & solution specialists.' }
            ].map((role) => (
              <div key={role.title} className="p-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer group">
                <h4 className="text-sm font-bold mb-1 group-hover:text-blue-200 transition-colors">{role.title}</h4>
                <p className="text-[11px] text-blue-100 leading-relaxed opacity-80">{role.desc}</p>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="px-8 py-3 rounded-xl bg-white text-blue-600 text-sm font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg flex items-center gap-2"
          >
            <span>Explore Current Openings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>

      {/* Quick Navigation Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Quick Portal Navigation</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickNav.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigateToTab(item.tab)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
