import React, { useState } from "react";

interface EmergencyProps {
  lang: string;
  t: any;
}

const Emergency: React.FC<EmergencyProps> = ({ lang, t }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const emergencyData = [
    {
      en: "National Emergency (PEHEL)",
      ur: "قومی ایمرجنسی ہیلپ لائن",
      ph: "911",
    },
    { en: "Police Emergency", ur: "پولیس مدد", ph: "15" },
    { en: "Rescue 1122", ur: "ریسکیو ۱۱۲۲", ph: "1122" },
    { en: "Fire Brigade", ur: "فائر بریگیڈ", ph: "16" },
    { en: "Edhi Ambulance", ur: "ایدھی ایمبولینس", ph: "115" },
    { en: "Motorway Police", ur: "موٹروے پولیس", ph: "130" },
    { en: "Women Helpline", ur: "خواتین کی ہیلپ لائن", ph: "1094" },
    { en: "Punjab Women Helpline", ur: "پنجاب خواتین ہیلپ لائن", ph: "1043" },
    { en: "Child Protection", ur: "چائلڈ پروٹیکشن", ph: "1121" },
    {
      en: "Zainab Alert (Missing Children)",
      ur: "گمشدہ بچوں کی اطلاع",
      ph: "1102",
    },
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

  const filteredNumbers = emergencyData.filter(
    (item) =>
      item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ur.includes(searchTerm) ||
      item.ph.includes(searchTerm),
  );

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="animate-in max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black text-[#065016] mb-6 uppercase tracking-tighter font-law">
          {lang === "ur" ? "ہنگامی مدد" : "EMERGENCY HUB"}
        </h2>

        <div className="max-w-md mx-auto relative group">
          <input
            type="text"
            placeholder={
              lang === "ur"
                ? "نمبر یا سروس تلاش کریں..."
                : "Search services or numbers..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-6 p-x-10 rounded-[2rem] border-2 border-[#065016]/5 outline-none focus:border-[#065016] transition-all bg-white shadow-2xl text-lg ${lang === "ur" ? "text-right font-urdu" : "text-left font-serif"}`}
          />
        </div>
      </div>

      {filteredNumbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNumbers.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCopy(item.ph)}
              className="group relative flex flex-col items-center justify-center p-10 bg-white border border-[#065016]/10 hover:border-[#065016] shadow-sm hover:shadow-2xl rounded-[3rem] transition-all hover:-translate-y-2 overflow-hidden cursor-pointer"
            >
              {copiedNumber === item.ph && (
                <div className="absolute inset-0 bg-[#065016] flex items-center justify-center z-10 animate-in">
                  <span className="text-white font-black text-xs uppercase tracking-[0.4em]">
                    {lang === "ur" ? "کاپی کر لیا گیا" : "COPIED TO CLIPBOARD"}
                  </span>
                </div>
              )}

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#065016] mb-4 group-hover:scale-110 transition-transform">
                {item.en}
              </span>

              <span
                className={`text-2xl font-black text-[#065016] mb-4 ${lang === "ur" ? "font-urdu" : "font-law"}`}
              >
                {item.ur}
              </span>

              <div className="h-[2px] w-12 bg-[#065016]/5 group-hover:w-20 transition-all mb-4"></div>

              <span className="text-5xl font-black text-[#065016] tracking-tighter animate-shine">
                {item.ph}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-20">
          <p className="text-3xl font-law uppercase tracking-[0.5em]">
            No Intelligence Found
          </p>
        </div>
      )}

      <div className="mt-20 p-12 bg-[#065016] rounded-[4rem] text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68A56]/10 rounded-bl-full"></div>
        <p className="text-[10px] uppercase font-black tracking-[0.6em] opacity-40 mb-4">
          Official Diagnostic Hub
        </p>
        <p className="text-3xl font-law font-black tracking-widest text-[#A68A56]">
          PAK-INNOVATE
        </p>
      </div>
    </div>
  );
};

export default Emergency;
