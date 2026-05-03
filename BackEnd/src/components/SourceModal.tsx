import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileText } from 'lucide-react';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: { source: string; section?: string } | null;
  lang: string;
}

const SourceModal: React.FC<SourceModalProps> = ({ isOpen, onClose, source, lang }) => {
  if (!source) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2C2621]/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden border border-[#A68A56]/20"
          >
            <div className="p-8 flex justify-between items-center border-b border-[#2C2621]/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#A68A56]/10 flex items-center justify-center text-[#A68A56]">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#2C2621] uppercase tracking-tighter">
                    {lang === 'ur' ? 'قانونی ماخذ' : 'Legal Source'}
                  </h3>
                  <p className="text-[10px] text-[#A68A56] font-black uppercase tracking-widest">
                    Verified Documentation
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-[#2C2621]/5 rounded-full transition-colors text-[#2C2621]/40 hover:text-[#2C2621]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10">
              <div className="mb-8">
                <span className="text-[10px] font-black text-[#A68A56] uppercase tracking-[0.3em] block mb-2">
                  {lang === 'ur' ? 'دستاویز کا نام' : 'Document Name'}
                </span>
                <h4 className={`text-2xl font-bold text-[#2C2621] ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {source.source}
                </h4>
              </div>

              {source.section && (
                <div className="mb-8">
                  <span className="text-[10px] font-black text-[#A68A56] uppercase tracking-[0.3em] block mb-2">
                    {lang === 'ur' ? 'سیکشن / حصہ' : 'Relevant Section'}
                  </span>
                  <div className="p-6 bg-[#FDFBF7] rounded-2xl border border-[#A68A56]/10">
                    <p className={`text-[#2C2621]/70 leading-relaxed ${lang === 'ur' ? 'font-urdu text-lg' : 'font-serif'}`}>
                      {source.section}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <a 
                  href={`/api/source/download?name=${encodeURIComponent(source.source)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 bg-[#2C2621] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 hover:bg-[#A68A56] transition-all shadow-xl"
                >
                  <FileText size={16} />
                  {lang === 'ur' ? 'پی ڈی ایف دیکھیں' : 'View Full PDF'}
                </a>
                <button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(source.source + " Pakistan Law")}`, '_blank')}
                  className="px-6 py-4 border-2 border-[#2C2621] text-[#2C2621] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2C2621] hover:text-white transition-all flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  {lang === 'ur' ? 'آن لائن تلاش کریں' : 'Search Online'}
                </button>
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-6 text-center border-t border-[#2C2621]/5">
              <p className="text-[9px] text-[#A68A56] font-black uppercase tracking-[0.5em]">
                Authenticity Guaranteed by Qaanoon Sathi Intelligence
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SourceModal;
