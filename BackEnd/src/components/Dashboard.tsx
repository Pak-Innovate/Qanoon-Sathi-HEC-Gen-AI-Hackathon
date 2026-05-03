import React, { useState, useEffect } from "react";
import { apiCall } from "../services/apiClient";

interface DashboardProps {
  user: any;
  lang: string;
  token: string | null;
  setCurrentPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  lang,
  token,
  setCurrentPage,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiCall("/api/auth/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  return (
    <div
      className="max-w-5xl mx-auto py-10 px-6 animate-in"
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-[#A68A56]/20 mb-10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#A68A56] text-white flex items-center justify-center text-3xl font-black shadow-inner">
          {user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
            user?.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#2C2621] tracking-tighter">
            {lang === "ur"
              ? `خوش آمدید، ${user?.user_metadata?.full_name || "پاکستانی"}`
              : `Welcome, ${user?.user_metadata?.full_name || "Citizen"}`}
          </h2>
          <p className="text-[#A68A56] font-bold uppercase tracking-widest text-sm mt-1">
            {user?.email}
          </p>
        </div>
        <div
          className={`mt-4 md:mt-0 ${lang === "ur" ? "mr-auto" : "ml-auto"}`}
        >
          <button
            onClick={() => setCurrentPage("search")}
            className="px-6 py-3 bg-[#2C2621] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#A68A56] transition-colors cursor-pointer"
          >
            {lang === "ur" ? "نیا سوال پوچھیں" : "Ask a Question"}
          </button>
        </div>
      </div>

      {/* History Section */}
      <h3 className="text-xl font-black text-[#2C2621]/50 uppercase tracking-widest mb-6">
        {lang === "ur" ? "آپ کی ہسٹری" : "Your Chat History"}
      </h3>

      {loading ? (
        <div className="text-center py-10 text-[#A68A56] font-bold animate-pulse">
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div className="bg-[#FDFBF7] p-10 rounded-[2rem] text-center border-2 border-dashed border-[#2C2621]/10">
          <p className="text-[#2C2621]/40 font-serif text-lg">
            {lang === "ur"
              ? "آپ نے ابھی تک کوئی سوال نہیں پوچھا۔"
              : "You have not asked any questions yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#2C2621]/10 hover:border-[#A68A56]/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black text-[#A68A56] uppercase tracking-[0.2em] bg-[#FDFBF7] px-3 py-1 rounded-full">
                  {item.category || "General"}
                </span>
                <span className="text-xs text-[#2C2621]/40 font-bold">
                  {new Date(item.created_at).toLocaleDateString(
                    lang === "ur" ? "ur-PK" : "en-US",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
              </div>
              <h4
                className={`text-xl font-bold text-[#2C2621] mb-4 ${item.lang === "ur" ? "font-urdu" : "font-law"}`}
              >
                Q: {item.query}
              </h4>
              <div
                className={`p-6 bg-[#FDFBF7] rounded-xl text-[#2C2621]/80 font-serif line-clamp-3 hover:line-clamp-none transition-all ${item.lang === "ur" ? "font-urdu text-lg" : ""}`}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
