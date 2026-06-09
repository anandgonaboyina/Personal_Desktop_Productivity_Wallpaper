'use client';
import { X, Quote as QuoteIcon } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchQuote } from '@/utils/quoteEngine';

export default function QuotePopup() {
  const { currentQuote, isQuotePopupOpen, hideQuotePopup, showQuotePopup } = useDashboardStore();

  const handleNextQuote = async () => {
    const q = await fetchQuote();
    showQuotePopup(q);
  };

  if (!isQuotePopupOpen || !currentQuote) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[75vw] max-w-5xl pointer-events-none px-4 animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="relative p-6 text-white overflow-hidden group text-center drop-shadow-xl">

        <div
          className="relative z-10 pl-2 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto inline-block"
          onClick={handleNextQuote}
          title="Click for another quote"
        >
          <p className="text-lg md:text-xl font-bold tracking-wide leading-relaxed italic text-white/90">
            "{currentQuote.text}"
          </p>
          <p className="mt-4 text-sm font-semibold tracking-widest text-blue-300 uppercase opacity-80">
            — {currentQuote.author || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
