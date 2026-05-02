import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SearchPage from './components/SearchPage'
import License from './components/Licence' 
import Emergency from './components/Emergency' 

/**
 * App Component
 * Built by Team Pak-Innovate
 * Featured at Gen-AI Hackathon
 */
function App() {
  const [lang, setLang] = useState('en')
  const [currentPage, setCurrentPage] = useState('home')
  const [userName, setUserName] = useState('') 
  const [searchCategory, setSearchCategory] = useState('') 

  const handleLogin = () => {
    const name = prompt(lang === 'ur' ? "براہ کرم اپنا نام درج کریں:" : "Please enter your name:");
    if (name) setUserName(name);
  }

  const navigateTo = (page) => {
    if (page !== 'search') setSearchCategory('');
    setCurrentPage(page);
  }

  const content = {
    en: { 
      nav: "Qanoon Sathi",
      license: "License",
      emergency: "Emergency",
      login: "Login",
      logout: "Logout",
      heroTitle: "Know Your Legal Rights",
      islamicLaw: "Islamic Law",
      islamicDesc: "Detailed guidance on Sharia, Nikah, Mehr, and Talaq procedures.",
      harassment: "Harassment",
      harassmentDesc: "Legal protection against workplace harassment and PECA laws.",
      inheritance: "Inheritance",
      inheritanceDesc: "Understanding Faraid, Wills, and your rightful share in Hiba.",
      verify: "Verify a law",
      verifyDesc: "Check if a specific legal rule is official or just a rumor."
    },
    ur: { 
      nav: "قانون ساتھی",
      license: "لائسنس",
      emergency: "ہنگامی نمبر",
      login: "لاگ ان",
      logout: "لاگ آؤٹ",
      heroTitle: "اپنے قانونی حقوق جانیں",
      islamicLaw: "اسلامی قانون",
      islamicDesc: "شریعہ ،  نکاح ،  مہر اور طلاق کے متعلق مکمل قانونی معلومات حاصل کریں۔", 
      harassment: "ہراساں کرنا",
      harassmentDesc: "کام کی جگہ پر ہراساں کرنے اور پیکا قوانین کے خلاف تحفظ کی تفصیلات۔",
      inheritance: "وراثت کا قانون",
      inheritanceDesc: "فرائض ،  وصیت اور ہبہ میں اپنے جائزی حصے کے بارے میں جانیں۔",
      verify: "قانون کی تصدیق",
      verifyDesc: "پتہ لگائیں کہ کیا یہ قانونی اصول حقیقت ہے یا صرف ایک افواہ۔"
    }
  }

  const t = content[lang]

  return (
    <div className={`min-h-screen bg-[#FDFBF7] ${lang === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        t={t} 
        setCurrentPage={navigateTo} 
        userName={userName}
        setUserName={setUserName}
        onLogin={handleLogin}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-12" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        {currentPage === 'home' && (
          <Hero 
            t={t} 
            lang={lang} 
            onCategoryClick={(cat) => {
              setSearchCategory(cat);
              setCurrentPage('search');
            }} 
          />
        )}
        
        {currentPage === 'search' && (
          <SearchPage 
            t={t} 
            lang={lang} 
            initialCategory={searchCategory} 
            userName={userName} 
          />
        )}

        {currentPage === 'license' && (
          <License lang={lang} />
        )}

        {/* Handled by the dedicated Emergency component */}
        {currentPage === 'emergency' && (
          <Emergency lang={lang} t={t} />
        )}
      </main>
    </div>
  )
}

export default App