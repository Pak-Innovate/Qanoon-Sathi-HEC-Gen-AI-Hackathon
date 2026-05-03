import React, { useState, useEffect, useRef } from "react";

interface HeroProps {
  t: any;
  lang: string;
  onCategoryClick: (category: string) => void;
}

const Hero: React.FC<HeroProps> = ({ t, lang, onCategoryClick }) => {
  const cards = [
    {
      title: t.islamicLaw,
      desc: t.islamicDesc,
      icon: "📜",
      color: "bg-[#EAE4D3]",
    },
    {
      title: t.harassment,
      desc: t.harassmentDesc,
      icon: "⚖️",
      color: "bg-[#DDE4F0]",
    },
    {
      title: t.inheritance,
      desc: t.inheritanceDesc,
      icon: "📖",
      color: "bg-[#DDE9DD]",
    },
    { title: t.verify, desc: t.verifyDesc, icon: "🔍", color: "bg-[#E9DDE9]" },
  ];

  const renderTitle = () => {
    if (lang === "ur")
      return (
        <h2 className="text-6xl md:text-8xl font-black text-[#065016] font-urdu leading-tight">
          {t.heroTitle}
        </h2>
      );
    return (
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-[#065016] font-black uppercase tracking-[0.5em] mb-4">
          Official Legal Framework (PAK)
        </span>
        <h2 className="text-5xl md:text-8xl font-black text-[#065016] font-law tracking-tighter leading-tight text-center">
          KNOW YOUR <span className="animate-color-glow italic">LEGAL</span>{" "}
          RIGHTS
        </h2>
      </div>
    );
  };

  return (
    <section className="relative z-10 py-16 min-h-[calc(100vh-96px)] flex flex-col justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#065016] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#065016] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-10 w-full">
        <div className="text-center mb-16 animate-in">
          {renderTitle()}

          <div className="flex items-center justify-center gap-6 mt-12">
            <div className="h-[2px] w-16 bg-[#065016]/20"></div>
            <span
              className={`text-[#065016] font-black uppercase tracking-[0.3em] bg-white/40 backdrop-blur px-8 py-2 border border-[#065016]/30 rounded-full shadow-sm
              ${lang === "ur" ? "text-2xl font-urdu tracking-normal" : "text-[10px]"}`}
            >
              {lang === "ur" ? "قانون کا انتخاب کریں" : "SELECT ARCHITECTURE"}
            </span>
            <div className="h-[2px] w-16 bg-[#065016]/20"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => onCategoryClick(card.title)}
              className="group relative h-full animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-[#065016]/10 transform transition-transform group-hover:scale-[1.05] group-hover:rotate-1 duration-500 shadow-xl"></div>

              <div className="relative h-full p-10 flex flex-col items-center text-center cursor-pointer">
                <div
                  className={`w-20 h-20 ${card.color} rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}
                >
                  {card.icon}
                </div>

                <h3
                  className={`text-2xl font-black text-[#065016] mb-4 ${lang === "ur" ? "font-urdu" : "font-law"}`}
                >
                  {card.title}
                </h3>

                <p
                  className={`text-[#065016]/70 leading-relaxed font-serif ${lang === "ur" ? "font-urdu text-xl" : "text-[15px]"}`}
                >
                  {card.desc}
                </p>

                <div className="mt-8 pt-8 border-t border-[#065016]/10 w-full flex justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full border-2 border-[#065016] flex items-center justify-center text-[#065016] transition-colors hover:bg-[#065016] hover:text-white">
                    →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
