const License = ({ lang }) => {
  const developers = [
    "Raqeeba Yasin",
    "Nimra",
    "Kainat Sohail",
    "Abdul Wahab",
    "Tajammal",
    "Muhammad Mohsin"
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-1000 max-w-4xl mx-auto py-12 px-6">
      <div className="relative bg-white border border-[#A68A56]/20 p-12 rounded-[2rem] shadow-2xl text-center overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68A56]/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2C2621]/5 rounded-tr-full"></div>

        <h2 className="text-5xl font-black text-[#2C2621] mb-2 uppercase tracking-tighter">
          {lang === 'ur' ? 'پروجیکٹ لائسنس' : 'Project License'}
        </h2>
        <p className="text-[#A68A56] font-bold tracking-[0.3em] uppercase text-xs mb-8">
          Gen-AI Hackathon Project
        </p>
        
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-[#A68A56] to-transparent mx-auto mb-10"></div>

        <div className="space-y-8">
          <div className="text-[#2C2621]/80 font-serif leading-relaxed text-lg max-w-2xl mx-auto mb-10">
            {lang === 'ur' ? 
              "قانون ساتھی کو جنیاتی اے آئی ہیکاتھون (Gen-AI Hackathon) کے لیے ایک ایسے پلیٹ فارم کے طور پر تیار کیا گیا ہے جو عام شہریوں کو ان کے قانونی حقوق سے آگاہ کرتا ہے۔ اس کا مقصد پیچیدہ قانونی زبان کو سادہ اور قابل فہم بنانا ہے تاکہ ہر پاکستانی بااختیار بن سکے۔" : 
              "Qanoon Sathi was developed for the Gen-AI Hackathon to empower citizens with legal knowledge. Our mission is to simplify complex legal frameworks into accessible guidance, ensuring every Pakistani can stand up for their rights."
            }
          </div>

          <div>
            <p className="text-[#2C2621]/50 text-sm uppercase font-bold tracking-widest mb-6">
              Developers
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {developers.map((member) => (
                <div 
                  key={member} 
                  className="p-4 bg-[#FDFBF7] border border-[#A68A56]/20 rounded-xl transition-all hover:shadow-md hover:border-[#A68A56]"
                >
                  <span className="text-xl font-serif text-[#2C2621] font-medium">
                    {member}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <p className="text-[#2C2621]/50 text-sm uppercase font-bold tracking-widest mb-1">Organization</p>
            <h3 className="text-2xl font-bold text-[#A68A56]">Pak-Innovate</h3>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#2C2621]/5">
          <p className="text-[#2C2621]/40 text-xs font-mono uppercase tracking-widest">
            © 2026 Pak-Innovate • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default License;