import React, { useState, useEffect } from 'react';

const SearchPage = ({ t, lang, initialCategory, userName }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState(initialCategory || '');
  
  // This state now ONLY tracks the language of the current answer
  const [lastResultLang, setLastResultLang] = useState(null);
  
  const [history, setHistory] = useState([
    {
      id: 1,
      query: lang === 'ur' ? "بنیادی انسانی حقوق کیا ہیں؟" : "What are basic fundamental rights?",
      answer: lang === 'ur' ? "آئین پاکستان کے تحت ہر شہری کو زندگی، آزادی اور برابری کا حق حاصل ہے۔" : "Under the Constitution of Pakistan, every citizen is entitled to life, liberty, and equality.",
      resLang: lang
    }
  ]);

  const containsUrdu = (text) => /[\u0600-\u06FF]/.test(text);

  // COMPUTED PROPERTY: Determines which language to use for the UI/Display
  // This fixes the error in image_cf3581.png by removing the setState inside useEffect
  const displayLang = lastResultLang || lang;

  const getGreeting = (targetLang) => {
    if (userName) return targetLang === 'ur' ? `محترمہ ${userName}` : `Dear ${userName}`;
    return targetLang === 'ur' ? 'معزز پاکستانی شہری' : 'Dear Pakistani Citizen';
  };

  const handleSearch = (customQuery = null) => {
    const activeQuery = typeof customQuery === 'string' ? customQuery : query;
    if (!activeQuery.trim()) return;
    
    setIsLoading(true);
    setAnswer('');

    const isUrduInput = containsUrdu(activeQuery);
    const targetLang = isUrduInput ? 'ur' : lang;
    
    // We only set this once the search is triggered
    setLastResultLang(targetLang);

    setTimeout(() => {
      let result = "";
      if (activeQuery.toLowerCase().includes('random')) {
        result = targetLang === 'ur' ? "معذرت، اس حوالے سے معلومات دستیاب نہیں ہیں۔" : "Information not available for this query.";
      } else {
        const currentGreeting = getGreeting(targetLang);
        const domainLabel = targetLang === 'ur' ? (detectedCategory || 'عمومی قوانین') : (detectedCategory || 'General Laws');
        result = `${currentGreeting},\n\n` +
          (targetLang === 'ur' 
            ? `آپ ${domainLabel} کے زمرے میں تلاش کر رہے ہیں۔ اس قانونی فریم ورک کے تحت آپ کو مکمل تحفظ حاصل ہے۔` 
            : `Searching within ${domainLabel}. Under this legal framework, you are granted full protection.`);
      }

      setAnswer(result);
      setHistory(prev => [{ id: Date.now(), query: activeQuery, answer: result, resLang: targetLang }, ...prev]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in duration-1000">
      
      {/* DOMAIN TAG */}
      {(initialCategory || detectedCategory) && (
        <div className="flex justify-center mb-10">
          <span className={`px-8 py-2 bg-gradient-to-r from-[#A68A56] to-[#2C2621] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl ${lang === 'ur' ? 'font-urdu text-lg tracking-normal' : ''}`}>
            {initialCategory || detectedCategory}
          </span>
        </div>
      )}

      {/* ENHANCED SEARCH BAR */}
      <div className="relative max-w-4xl mx-auto group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#A68A56] to-[#2C2621] rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <div className="relative flex items-center bg-[#FDFBF7] border-2 border-[#2C2621]/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group-focus-within:border-[#A68A56]">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={lang === 'ur' ? 'اپنا قانونی سوال یہاں درج کریں...' : 'Ask your legal question here...'}
            className={`flex-1 bg-transparent py-8 px-10 text-2xl outline-none placeholder:text-[#2C2621]/20 ${containsUrdu(query) || lang === 'ur' ? 'text-right font-urdu text-3xl' : 'text-left font-serif'}`}
          />
          <button 
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="mr-4 px-10 py-5 bg-[#2C2621] text-[#FDFBF7] rounded-2xl font-black uppercase tracking-widest hover:bg-[#A68A56] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? '...' : (lang === 'ur' ? 'تلاش' : 'Search')}
          </button>
        </div>
      </div>

      {/* ANSWER DISPLAY */}
      <div className="mt-16 min-h-[350px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-[#A68A56]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#A68A56] rounded-full animate-spin"></div>
            </div>
          </div>
        ) : answer && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="bg-white p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(44,38,33,0.15)] border border-[#2C2621]/5">
              <div className={`whitespace-pre-line leading-[1.8] text-[#2C2621] ${displayLang === 'ur' ? 'text-right font-urdu text-3xl' : 'text-xl font-serif italic text-left'}`}>
                {answer}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENTS & FAQS */}
      <div className="mt-24">
        <h3 className={`text-center mb-10 font-black tracking-[0.5em] text-[#2C2621]/30 uppercase text-xs ${lang === 'ur' ? 'font-urdu text-2xl tracking-normal opacity-50' : ''}`}>
          {lang === 'ur' ? 'حالیہ اور اکثر پوچھے گئے سوالات' : 'Recents & FAQs'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setQuery(item.query);
                setAnswer(item.answer);
                setLastResultLang(item.resLang); // Use the history item's specific language
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group p-8 bg-[#FDFBF7] border border-[#2C2621]/5 rounded-[2rem] hover:border-[#A68A56] hover:shadow-xl transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-[#A68A56] rounded-full"></div>
              </div>
              <p className={`font-bold text-[#2C2621]/80 group-hover:text-[#2C2621] line-clamp-2 ${item.resLang === 'ur' ? 'text-right font-urdu text-2xl' : 'text-lg'}`}>
                {item.query}
              </p>
              <p className={`mt-4 text-[10px] font-black tracking-widest text-[#A68A56] uppercase ${item.resLang === 'ur' ? 'text-right' : ''}`}>
                {lang === 'ur' ? 'دوبارہ دیکھیں' : 'View Response'} →
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;