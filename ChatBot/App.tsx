import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchPage from "./components/SearchPage";
import License from "./components/Licence";
import Emergency from "./components/Emergency";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import { apiCall } from "./services/apiClient";

/**
 * App Component
 * Built by Team Pak-Innovate
 */
function App() {
  const [lang, setLang] = useState("en");
  const [currentPage, setCurrentPage] = useState("home");
  const [searchCategory, setSearchCategory] = useState("");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("qanoonsathi_token"),
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await apiCall("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem("qanoonsathi_token");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("qanoonsathi_token");
    setCurrentPage("home");
  };

  const navigateTo = (page: string) => {
    if (page !== "search") setSearchCategory("");
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content: Record<string, any> = {
    en: {
      nav: "Qanoon Sathi",
      license: "License",
      emergency: "Emergency",
      login: "Login",
      logout: "Logout",
      heroTitle: "Know Your Legal Rights",
      islamicLaw: "Islamic Law",
      islamicDesc:
        "Detailed guidance on Sharia, Nikah, Mehr, and Talaq procedures.",
      harassment: "Harassment",
      harassmentDesc:
        "Legal protection against workplace harassment and PECA laws.",
      inheritance: "Inheritance",
      inheritanceDesc:
        "Understanding Faraid, Wills, and your rightful share in Hiba.",
      verify: "Verify a law",
      verifyDesc: "Check if a specific legal rule is official or just a rumor.",
    },
    ur: {
      nav: "قانون ساتھی",
      license: "لائسنس",
      emergency: "ہنگامی نمبر",
      login: "لاگ ان",
      logout: "لاگ آؤٹ",
      heroTitle: "اپنے قانونی حقوق جانیں",
      islamicLaw: "اسلامی قانون",
      islamicDesc:
        "شریعہ ،  نکاح ،  مہر اور طلاق کے متعلق مکمل قانونی معلومات حاصل کریں۔",
      harassment: "ہراساں کرنا",
      harassmentDesc:
        "کام کی جگہ پر ہراساں کرنے اور پیکا قوانین کے خلاف تحفظ کی تفصیلات۔",
      inheritance: "وراثت کا قانون",
      inheritanceDesc:
        "فرائض ،  وصیت اور ہبہ میں اپنے جائزی حصے کے بارے میں جانیں۔",
      verify: "قانون کی تصدیق",
      verifyDesc: "پتہ لگائیں کہ کیا یہ قانونی اصول حقیقت ہے یا صرف ایک افواہ۔",
    },
  };

  const t = content[lang];

  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] overflow-x-hidden ${lang === "ur" ? "font-urdu" : "font-law"}`}
    >
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t}
        setCurrentPage={navigateTo}
        user={user}
        onLogout={handleLogout}
      />

      <main
        className="max-w-[1440px] mx-auto px-6 py-12"
        dir={lang === "ur" ? "rtl" : "ltr"}
      >
        {currentPage === "home" && (
          <Hero
            t={t}
            lang={lang}
            onCategoryClick={(cat: string) => {
              setSearchCategory(cat);
              setCurrentPage("search");
            }}
          />
        )}

        {currentPage === "search" && (
          <SearchPage
            t={t}
            lang={lang}
            initialCategory={searchCategory}
            token={token}
          />
        )}

        {currentPage === "auth" && (
          <Auth
            t={t}
            lang={lang}
            setToken={setToken}
            setUser={setUser}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === "dashboard" && (
          <Dashboard
            user={user}
            lang={lang}
            token={token}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === "license" && <License lang={lang} />}

        {currentPage === "emergency" && <Emergency lang={lang} t={t} />}
      </main>
    </div>
  );
}

export default App;
