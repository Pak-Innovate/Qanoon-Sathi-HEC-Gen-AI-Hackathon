import React, { useState } from 'react';

const Emergency = ({ lang, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(null);

  const emergencyData = [
    { en: "National Emergency (PEHEL)", ur: "قومی ایمرجنسی ہیلپ لائن", ph: "911" },
    { en: "Police Emergency", ur: "پولیس مدد", ph: "15" },
    { en: "Rescue 1122", ur: "ریسکیو ۱۱۲۲", ph: "1122" },
    { en: "Fire Brigade", ur: "فائر بریگیڈ", ph: "16" },
    { en: "Edhi Ambulance", ur: "ایدھی ایمبولینس", ph: "115" },
    { en: "Motorway Police", ur: "موٹروے پولیس", ph: "130" },
    { en: "Women Helpline", ur: "خواتین کی ہیلپ لائن", ph: "1094" },
    { en: "Punjab Women Helpline", ur: "پنجاب خواتین ہیلپ لائن", ph: "1043" },
    { en: "Child Protection", ur: "چائلڈ پروٹیکشن", ph: "1121" },
    { en: "Zainab Alert (Missing Children)", ur: "گمشدہ بچوں کی اطلاع", ph: "1102" },
    { en: "FIA Cybercrime", ur: "سائبر کرائم رپورٹنگ", ph: "1991" },
    { en: "Human Rights Helpline", ur: "انسانی حقوق ہیلپ لائن", ph: "1099" },
    { en: "Chhipa Ambulance", ur: "چھیپا ایمبولینس", ph: "1020" },
    { en: "Red Crescent (PRCS)", ur: "ہلالِ احمر", ph: "1030" },
    { en: "Aman Foundation", ur: "امن فاؤنڈیشن", ph: "1021" },
    { en: "Gas Emergency", ur: "گیس ایمرجنسی", ph: "1199" },
    { en: "Electricity Complaint", ur: "بجلی کی شکایت", ph: "118" },
    { en: "Railway Inquiry", ur: "ریلوے انکوائری", ph: "117" },
    { en: "Disaster Management (PDMA)", ur: "پی ڈی ایم اے", ph: "1129" },
    { en: "Traffic Police (Lahore)", ur: "ٹریفک پولیس", ph: "1915" },
  ];

  const filteredNumbers = emergencyData.filter(item => 
    item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ur.includes(searchTerm) ||
    item.ph.includes(searchTerm)
  );

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-[#065016] mb-6 uppercase tracking-tight">
          {t.emergency}
        </h2>
        
        {/* SEARCH BAR SECTION */}
        <div className="max-w-md mx-auto relative group">
          <input 
            type="text"
            placeholder={lang === 'ur' ? "نمبر یا سروس تلاش کریں..." : "Search service or number..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-5 rounded-2xl border-2 border-[#065016]/10 outline-none focus:border-[#065016] transition-all bg-white shadow-sm text-lg ${lang === 'ur' ? 'text-right font-urdu' : 'text-left'}`}
          />
          <div className={`absolute top-1/2 -translate-y-1/2 text-[#065016] opacity-30 group-focus-within:opacity-100 transition-opacity ${lang === 'ur' ? 'left-5' : 'right-5'}`}>
            🔍
          </div>
        </div>
      </div>

      {/* EMERGENCY CARDS GRID */}
      {filteredNumbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNumbers.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCopy(item.ph)}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border-b-4 border-[#065016]/10 hover:border-[#065016] shadow-sm rounded-2xl transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              {/* Copied Overlay remains Gold for visibility contrast */}
              {copiedNumber === item.ph && (
                <div className="absolute inset-0 bg-[#A68A56] flex items-center justify-center z-10 animate-in fade-in">
                  <span className="text-white font-bold text-lg uppercase tracking-widest">
                    {lang === 'ur' ? 'کاپی کر لیا گیا' : 'Copied!'}
                  </span>
                </div>
              )}

              <span className="text-sm font-bold uppercase tracking-widest text-[#2C2621]/40 mb-2 group-hover:text-[#065016]">
                {item.en}
              </span>
              
              <span className={`text-2xl font-black text-[#2C2621] mb-3 ${lang === 'ur' ? 'font-urdu' : ''}`}>
                {item.ur}
              </span>

              {/* NUMBER COLOR CHANGED TO GREEN */}
              <span className="text-4xl font-black text-[#065016] tracking-tighter">
                {item.ph}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-30">
          <p className="text-2xl font-serif">
            {lang === 'ur' ? 'کوئی نتیجہ نہیں ملا' : 'No results found'}
          </p>
        </div>
      )}

      {/* FOOTER SECTION */}
      <div className="mt-16 p-8 bg-[#065016] rounded-3xl text-center text-white">
        <p className="text-xs uppercase tracking-[0.4em] opacity-50 mb-2">Powered by</p>
        <p className="text-xl font-serif">Pak-Innovate</p>
      </div>
    </div>
  );
};

export default Emergency;