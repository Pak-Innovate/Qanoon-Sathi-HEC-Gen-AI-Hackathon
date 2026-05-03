import React, { useState, useRef } from 'react';

const SearchPage = ({ t, lang, initialCategory, userName }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState(initialCategory || '');
  const [lastResultLang, setLastResultLang] = useState(null);
  
  const utteranceRef = useRef(null);

  const [history, setHistory] = useState([
    {
      id: 1,
      query: lang === 'ur' ? "بنیادی انسانی حقوق کیا ہیں؟" : "What are basic fundamental rights?",
      answer: lang === 'ur' ? "آئین پاکستان کے تحت ہر شہری کو زندگی، آزادی اور برابری کا حق حاصل ہے۔" : "Under the Constitution of Pakistan, every citizen is entitled to life, liberty, and equality.",
      resLang: lang
    }
  ]);

  const containsUrdu = (text) => /[\u0600-\u06FF]/.test(text);
  const displayLang = lastResultLang || lang;

  const getGreeting = (targetLang) => {
    if (userName) return targetLang === 'ur' ? `محترمہ ${userName}` : `Dear ${userName}`;
    return targetLang === 'ur' ? 'معزز پاکستانی شہری' : 'Dear Pakistani Citizen';
  };

  // --- Speech to Text (Voice Input) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

  // --- Text to Speech (Audio Response) ---
  const speakResponse = (text, targetLang) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  };

  // --- Utility Actions ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'ur' ? "کاپی کر لیا گیا!" : "Response copied!");
  };

  const handleSearch = (customQuery = null) => {
    const activeQuery = typeof customQuery === 'string' ? customQuery : query;
    if (!activeQuery.trim()) return;
    
    setIsLoading(true);
    setAnswer('');

    const isUrduInput = containsUrdu(activeQuery);
    const targetLang = isUrduInput ? 'ur' : lang;
    setLastResultLang(targetLang);

    // Mock AI Response Logic
    setTimeout(() => {
      const currentGreeting = getGreeting(targetLang);
      const domainLabel = targetLang === 'ur' ? (detectedCategory || 'عمومی قوانین') : (detectedCategory || 'General Laws');
      
      const result = `${currentGreeting},\n\n` +
        (targetLang === 'ur' 
          ? `آپ ${domainLabel} کے زمرے میں تلاش کر رہے ہیں۔ قانونِ پاکستان کے تحت آپ کو اس حوالے سے مکمل تحفظ اور رہنمائی حاصل ہے۔` 
          : `Searching within ${domainLabel}. Under the legal framework of Pakistan, you are granted full protection and guidance regarding this matter.`);

      setAnswer(result);
      setHistory(prev => [{ id: Date.now(), query: activeQuery, answer: result, resLang: targetLang }, ...prev]);
      setIsLoading(false);
      speakResponse(result, targetLang);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in duration-1000">
      
      {/* CATEGORY TAG */}
      {(initialCategory || detectedCategory) && (
        <div className="flex justify-center mb-10">
          <span className={`px-8 py-2 bg-gradient-to-r from-[#065016] to-[#A68A56] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl ${lang === 'ur' ? 'font-urdu text-lg tracking-normal' : ''}`}>
            {initialCategory || detectedCategory}
          </span>
        </div>
      )}

      {/* PROFESSIONAL SEARCH BAR */}
      <div className="relative max-w-4xl mx-auto group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#065016] via-[#087820] to-[#A68A56] rounded-[2.5rem] blur-md opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
        
        <div className="relative flex items-center bg-white border border-[#065016]/10 rounded-[2.2rem] overflow-hidden shadow-2xl transition-all duration-500 group-focus-within:border-[#065016]/30">
          
          <button 
            onClick={startListening}
            className={`pl-8 pr-4 text-2xl transition-all duration-300 hover:scale-110 ${isListening ? 'text-red-500 animate-pulse' : 'text-[#065016]/40 hover:text-[#065016]'}`}
          >
            {isListening ? '●' : '🎤'}
          </button>

          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={lang === 'ur' ? 'اپنا قانونی سوال یہاں درج کریں...' : 'Ask your legal question here...'}
            className={`flex-1 bg-transparent py-7 px-2 text-xl outline-none placeholder:text-[#2C2621]/20 ${containsUrdu(query) || lang === 'ur' ? 'text-right font-urdu text-2xl' : 'text-left font-serif'}`}
          />
          
          <button 
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="relative mr-3 my-2 px-12 py-4 bg-[#065016] text-white rounded-[1.5rem] font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 hover:bg-[#087820] active:scale-95 disabled:opacity-50 group/btn"
          >
            {/* Shine Animation Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shine_1.5s_infinite]"></div>
            
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {lang === 'ur' ? 'تلاش کریں' : 'Search'}
                  <span className="text-xs opacity-50 group-hover/btn:translate-x-1 transition-transform">→</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* RESPONSE AREA */}
      <div className="mt-16 min-h-[350px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-[#065016]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#065016] rounded-full animate-spin"></div>
            </div>
          </div>
        ) : answer && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="bg-white p-12 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(6,80,22,0.1)] border border-[#065016]/5">
              
              <div className={`flex gap-3 mb-8 ${displayLang === 'ur' ? 'justify-start' : 'justify-end'}`}>
                <button onClick={() => speakResponse(answer, displayLang)} className="p-3 bg-[#FDFBF7] border border-[#065016]/20 rounded-full hover:bg-[#065016]/10 transition-all" title="Listen">🔊</button>
                <button onClick={() => copyToClipboard(answer)} className="p-3 bg-[#FDFBF7] border border-[#065016]/20 rounded-full hover:bg-[#065016]/10 transition-all" title="Copy">📋</button>
                <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(answer)}`} download="Qanoon_Sathi_Legal_Advice.txt" className="p-3 bg-[#FDFBF7] border border-[#065016]/20 rounded-full hover:bg-[#065016]/10 transition-all" title="Download">💾</a>
              </div>

              <div className={`whitespace-pre-line leading-[1.9] text-[#2C2621] ${displayLang === 'ur' ? 'text-right font-urdu text-3xl' : 'text-xl font-serif italic text-left'}`}>
                {answer}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENT QUESTIONS */}
      <div className="mt-24">
        <h3 className={`text-center mb-10 font-black tracking-[0.4em] text-[#065016]/30 uppercase text-xs ${lang === 'ur' ? 'font-urdu text-2xl tracking-normal opacity-50' : ''}`}>
          {lang === 'ur' ? 'حالیہ سوالات' : 'Recent Queries'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setQuery(item.query);
                setAnswer(item.answer);
                setLastResultLang(item.resLang);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                speakResponse(item.answer, item.resLang);
              }}
              className="group p-8 bg-[#FDFBF7] border border-[#065016]/5 rounded-[2rem] hover:border-[#065016] hover:shadow-xl transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-[#A68A56] rounded-full animate-ping"></div>
              </div>
              <p className={`font-bold text-[#2C2621]/80 group-hover:text-[#065016] line-clamp-2 ${item.resLang === 'ur' ? 'text-right font-urdu text-2xl' : 'text-lg'}`}>
                {item.query}
              </p>
              <p className={`mt-4 text-[10px] font-black tracking-widest text-[#A68A56] uppercase ${item.resLang === 'ur' ? 'text-right' : ''}`}>
                {lang === 'ur' ? 'دوبارہ پڑھیں' : 'Review Response'} →
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;