import React, { useState, useEffect, useRef } from 'react'

const Hero = ({ t, lang, onCategoryClick }) => {
  const [vantaEffect, setVantaEffect] = useState(null)
  const vantaRef = useRef(null)

  const cards = [
    { title: t.islamicLaw, desc: t.islamicDesc, icon: "📜", color: "bg-[#EAE4D3]" },
    { title: t.harassment, desc: t.harassmentDesc, icon: "⚖️", color: "bg-[#DDE4F0]" },
    { title: t.inheritance, desc: t.inheritanceDesc, icon: "📖", color: "bg-[#DDE9DD]" },
    { title: t.verify, desc: t.verifyDesc, icon: "🔍", color: "bg-[#E9DDE9]" },
  ];

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xa68a56,       
          color2: 0x2c2621,      
          backgroundColor: 0xfdfbf7 
        })
      )
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  const renderTitle = () => {
    if (lang === 'ur') return t.heroTitle;
    return (
      <>
        Know Your <span className="animate-color-glow">Legal</span> Rights
      </>
    );
  };

  return (
    <section 
      ref={vantaRef} 
      // Reduced top padding (py-8) and optimized min-height
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8 min-h-[calc(100vh-96px)] flex flex-col justify-center overflow-hidden"
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-10 w-full">
        
        {/* HEADER: Reduced margin-bottom to pull content up */}
        <div className="text-center mb-10">
          <h2 className="text-5xl md:text-6xl font-black text-[#0f1f0e] mb-4 tracking-tight uppercase leading-tight">
            {renderTitle()}
          </h2>
          
          <div className="flex items-center justify-center gap-4">
            <div className="h-[2px] w-10 bg-[#A68A56]/40"></div>
            <span className={`text-[#1d742e] font-black uppercase tracking-[0.2em] bg-white/40 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm
              ${lang === 'ur' ? 'text-2xl font-urdu' : 'text-[14px]'}`}>
              {lang === 'ur' ? 'قانون کا انتخاب کریں' : 'Select Category'}
            </span>
            <div className="h-[2px] w-10 bg-[#A68A56]/40"></div>
          </div>
        </div>

        {/* CARD GRID: Increased gap and card size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <div 
              key={index}
              onClick={() => onCategoryClick(card.title)}
              className="group relative p-[1px] rounded-[2.5rem] transition-all duration-500 hover:scale-[1.03]"
            >
              {/* EXTERNAL BORDER */}
              <div className="absolute inset-0 rounded-[2.5rem] border-2 border-[#2C2621]/10 group-hover:border-[#A68A56]/50 transition-colors duration-500"></div>

              {/* INCREASED PADDING (p-8) for better content layout */}
              <div className="relative h-full bg-white/75 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] group-hover:shadow-[0_45px_90px_rgba(166,138,86,0.18)] transition-all duration-500 border border-white/50 cursor-pointer">
                
                {/* ICON BOX */}
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  {card.icon}
                </div>

                {/* LARGER TEXT FOR TITLES AND DESCRIPTIONS */}
                <h3 className={`text-2xl font-black text-[#2C2621] mb-3 ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {card.title}
                </h3>
                
                <p className={`text-[#2C2621]/80 leading-relaxed font-serif ${lang === 'ur' ? 'font-urdu text-xl leading-normal' : 'text-[15px]'}`}>
                  {card.desc}
                </p>

                <div className="mt-6 flex justify-end">
                  <div className="w-10 h-10 rounded-full border-2 border-[#A68A56]/20 flex items-center justify-center text-[#A68A56] group-hover:bg-[#A68A56] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero