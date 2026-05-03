import React from "react";

const License: React.FC<{ lang: string }> = ({ lang }) => {
  const developers = [
    "Raqeeba Yasin",
    "Nimra Naeem",
    "Kainat Sohail",
    "Abdul Wahab",
    "Tajammal Hussain",
    "Muhammad Mohsin",
  ];

  return (
    <div className="animate-in max-w-4xl mx-auto py-12 px-6">
      <div className="relative bg-white border border-[#065016]/20 p-16 rounded-[4rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#065016]/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#065016]/2 rounded-tr-full"></div>

        <div className="relative z-10 text-center">
          <h2 className="text-5xl font-black text-[#065016] mb-2 uppercase tracking-tighter font-law">
            {lang === "ur" ? "پروجیکٹ لائسنس" : "Project License"}
          </h2>
          <p className="text-[#065016] font-black tracking-[0.4em] uppercase text-[10px] mb-8">
            Gen-AI Hackathon build (PAK)
          </p>

          <div className="h-[2px] w-40 bg-gradient-to-r from-transparent via-[#065016] to-transparent mx-auto mb-12"></div>

          <div className="space-y-12">
            <div
              className={`text-[#065016]/80 leading-relaxed max-w-2xl mx-auto font-serif text-lg italic ${lang === "ur" ? "font-urdu text-2xl not-italic" : ""}`}
            >
              {lang === "ur"
                ? "قاون ساتھی کو جنیاتی اے آئی ہیکاتھون (Gen-AI Hackathon) کے لیے ایک ایسے پلیٹ فارم کے طور پر تیار کیا گیا ہے جو عام شہریوں کو ان کے قانونی حقوق سے آگاہ کرتا ہے۔ اس کا مقصد پیچیدہ قانونی زبان کو سادہ اور قابل فہم بنانا ہے تاکہ ہر پاکستانی بااختیار بن سکے۔"
                : "Qanoon Sathi was engineered for the Gen-AI Hackathon to democratize legal intelligence. Our framework synthesizes complex statutory datasets into accessible, human-centric guidance for the people of Pakistan."}
            </div>

            <div>
              <p className="text-[#065016]/30 text-[10px] uppercase font-black tracking-[0.4em] mb-8">
                Core Engineering Team
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {developers.map((member) => (
                  <div
                    key={member}
                    className="p-6 bg-[#FDFBF7] border border-[#065016]/10 rounded-[2rem] transition-all hover:border-[#065016]/50 hover:shadow-lg group"
                  >
                    <span className="text-lg font-law text-[#065016] font-bold group-hover:text-[#065016]/70 transition-colors">
                      {member}
                    </span>
                    <div className="text-[9px] text-[#065016] mt-2 uppercase font-black tracking-widest">
                      Developer
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-[#065016]/5">
              <p className="text-[#065016]/30 text-[10px] uppercase font-black tracking-widest mb-2">
                Organization
              </p>
              <h3 className="text-3xl font-black text-[#065016] tracking-tighter uppercase">
                PAK-INNOVATE
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default License;
