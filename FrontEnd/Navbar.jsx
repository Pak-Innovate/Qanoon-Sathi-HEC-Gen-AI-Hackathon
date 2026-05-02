import React, { useState } from 'react';

const Navbar = ({ lang, setLang, t, setCurrentPage, userName, setUserName, onLogin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const linkClass = `relative font-black uppercase transition-all duration-300 hover:text-[#A68A56] py-1 group whitespace-nowrap 
    ${lang === 'ur' ? 'text-2xl font-urdu tracking-normal' : 'text-[14px] tracking-[0.25em]'}`;
  
  const mobileLinkClass = `w-full text-left font-black uppercase py-6 border-b border-[#2C2621]/10 
    ${lang === 'ur' ? 'text-4xl font-urdu text-right' : 'text-xl tracking-widest'}`;

  const underline = "absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#A68A56] transition-all duration-300 group-hover:w-full";

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="sticky top-0 z-50">
      <nav className="bg-[#FDFBF7]/95 backdrop-blur-2xl">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-20 lg:h-24 flex justify-between items-center" dir="ltr">
          
          {/* LEFT: BRANDING */}
          <div className="flex items-center gap-4 cursor-pointer group z-50" onClick={() => { setCurrentPage('home'); closeSidebar(); }}>
            <div className="w-10 h-10 lg:w-11 lg:h-11 bg-[#2C2621] flex items-center justify-center rotate-45 group-hover:rotate-0 transition-all duration-500 shadow-[6px_6px_0px_0px_rgba(166,138,86,0.2)]">
              <span className="text-[#FDFBF7] -rotate-45 group-hover:rotate-0 transition-all font-bold text-xl">Q</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter text-[#2C2621] hidden sm:block">{t.nav}</h1>
          </div>

          {/* MIDDLE: DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-14 flex-[2] justify-center">
            <button onClick={() => setCurrentPage('search')} className={linkClass}>
              {lang === 'ur' ? 'تلاش' : 'Search'} <div className={underline}></div>
            </button>
            <button onClick={() => setCurrentPage('license')} className={linkClass}>
              {t.license} <div className={underline}></div>
            </button>
            <button onClick={() => setCurrentPage('emergency')} className={linkClass}>
              {t.emergency} <div className={underline}></div>
            </button>
          </div>

          {/* RIGHT: AUTH & TOGGLE */}
          <div className="flex items-center gap-4 lg:gap-8 flex-1 justify-end">
            <div className="hidden sm:flex items-center bg-[#A68A56]/10 rounded-full p-1 border border-[#A68A56]/30">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'en' ? 'bg-[#A68A56] text-white shadow-sm' : 'text-[#A68A56]/60'}`}>EN</button>
              <button onClick={() => setLang('ur')} className={`px-4 py-1 text-lg font-black rounded-full transition-all font-urdu ${lang === 'ur' ? 'bg-[#A68A56] text-white shadow-sm' : 'text-[#A68A56]/60'}`}>اردو</button>
            </div>

            {userName ? (
              <div className="hidden lg:flex items-center gap-4 animate-in fade-in">
                <span className={`font-bold text-[#2C2621] border-b-2 border-[#A68A56] ${lang === 'ur' ? 'text-xl font-urdu' : 'text-sm'}`}>{userName}</span>
                <button onClick={() => setUserName('')} className="text-[#A68A56] font-black uppercase text-[10px] tracking-widest hover:text-[#2C2621] transition-colors">{t.logout}</button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="hidden lg:block bg-[#2C2621] text-[#FDFBF7] hover:bg-[#A68A56] transition-all rounded-full font-black uppercase tracking-widest text-[10px] px-8 py-3 shadow-lg active:scale-95"
              >
                {t.login}
              </button>
            )}

            {/* MOBILE HAMBURGER ICON */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-50 transition-all active:scale-90"
              aria-label="Toggle Menu"
            >
              <div className={`w-6 h-0.5 bg-[#2C2621] transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-[#2C2621] transition-all duration-200 ${isSidebarOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-[#2C2621] transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>
          </div>
        </div>

        {/* MOBILE SLIDEBAR */}
        <div className={`fixed inset-0 transition-all duration-500 z-40 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-[#2C2621]/40 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeSidebar}></div>
          
          {/* Content */}
          <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[#FDFBF7] shadow-2xl transition-transform duration-500 ease-out flex flex-col p-10 pt-32 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
            
            <button onClick={() => { setCurrentPage('search'); closeSidebar(); }} className={mobileLinkClass}>
              {lang === 'ur' ? 'تلاش' : 'Search'}
            </button>
            <button onClick={() => { setCurrentPage('license'); closeSidebar(); }} className={mobileLinkClass}>
              {t.license}
            </button>
            <button onClick={() => { setCurrentPage('emergency'); closeSidebar(); }} className={mobileLinkClass}>
              {t.emergency}
            </button>

            <div className="mt-auto space-y-6">
              {/* Mobile Lang Toggle */}
              <div className="flex justify-center bg-[#A68A56]/10 rounded-2xl p-2 border border-[#A68A56]/30">
                <button onClick={() => setLang('en')} className={`flex-1 py-4 rounded-xl font-black transition-all ${lang === 'en' ? 'bg-[#A68A56] text-white shadow-md' : 'text-[#A68A56]'}`}>ENGLISH</button>
                <button onClick={() => setLang('ur')} className={`flex-1 py-4 rounded-xl font-urdu text-2xl font-black transition-all ${lang === 'ur' ? 'bg-[#A68A56] text-white shadow-md' : 'text-[#A68A56]'}`}>اردو</button>
              </div>

              {userName ? (
                <button onClick={() => { setUserName(''); closeSidebar(); }} className="w-full py-5 bg-[#2C2621] text-white rounded-2xl font-black tracking-widest uppercase shadow-xl">
                  {t.logout} ({userName})
                </button>
              ) : (
                <button onClick={() => { onLogin(); closeSidebar(); }} className="w-full py-5 bg-[#A68A56] text-white rounded-2xl font-black tracking-widest uppercase shadow-xl active:scale-95 transition-transform">
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#A68A56] to-transparent"></div>
    </div>
  );
};

export default Navbar;