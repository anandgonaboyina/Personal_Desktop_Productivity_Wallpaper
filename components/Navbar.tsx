'use client';
import { Globe, StickyNote, Sparkles, MessageCircle, Send } from 'lucide-react';

interface DockProps {
    onOpenNotes: () => void;
}

export default function Dock({ onOpenNotes }: DockProps) {
    return (
        <div className="relative flex items-end justify-center gap-4 px-4 pb-2 pt-4 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-b before:from-white/10 before:to-transparent pointer-events-auto">
            {/* Translate */}
            <button
                onClick={() => window.open('https://translate.google.com', '_blank')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ffffff] text-[#4285F4] shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="Google Translate"
            >
                <svg className="group-hover:scale-150 transition-transform duration-300 w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
            </button>

            {/* Notes */}
            <button
                onClick={onOpenNotes}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FADB5F]/90 to-[#e3c02d] text-amber-900 shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="Quick Notes"
            >
                <StickyNote size={28} className="group-hover:scale-150 transition-transform duration-300" />
            </button>

            {/* Gemini */}
            <button
                onClick={() => window.open('https://gemini.google.com', '_blank')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-transparent shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="Google Gemini"
            >
                <svg className="group-hover:scale-150 transition-transform duration-300 w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4A90E2" />
                            <stop offset="50%" stopColor="#D0021B" />
                            <stop offset="100%" stopColor="#F5A623" />
                        </linearGradient>
                    </defs>
                    <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="url(#gemini-grad)"/>
                    <path d="M18.5 16C18.5 17.38 19.62 18.5 21 18.5C19.62 18.5 18.5 19.62 18.5 21C18.5 19.62 17.38 18.5 16 18.5C17.38 18.5 18.5 17.38 18.5 16Z" fill="url(#gemini-grad)"/>
                </svg>
            </button>

            {/* WhatsApp */}
            <button
                onClick={() => window.open('whatsapp://', '_self')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-[#25D366]/90 to-[#128c7e] text-white shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="WhatsApp"
            >
                <MessageCircle size={28} className="group-hover:scale-150 transition-transform duration-300" />
            </button>

            {/* Telegram */}
            <button
                onClick={() => window.open('tg://', '_self')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-[#0088cc]/90 to-[#006699] text-white shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="Telegram"
            >
                <Send size={28} className="group-hover:scale-150 transition-transform duration-300" />
            </button>

            {/* VS Code */}
            <button
                onClick={() => window.open('vscode://', '_self')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0066b8] text-white shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl"
                title="VS Code"
            >
                <svg className="group-hover:scale-150 transition-transform duration-300 w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.8 2.8C17.4 2.5 16.9 2.5 16.5 2.7L9.5 7.7L4.7 4.1C4.4 3.9 4 3.9 3.7 4.1C3.4 4.3 3.2 4.7 3.2 5V19C3.2 19.3 3.4 19.7 3.7 19.9C3.9 20 4.1 20 4.3 20C4.5 20 4.6 20 4.7 19.9L9.5 16.3L16.5 21.3C16.7 21.5 16.9 21.5 17.2 21.5C17.4 21.5 17.6 21.4 17.8 21.2C18.1 21 18.2 20.6 18.2 20.3V3.7C18.2 3.4 18.1 3 17.8 2.8ZM9.1 14.3L5.2 17.2V6.8L9.1 9.7V14.3ZM16.2 18.6L11.1 15L13.6 13L16.2 15V18.6ZM16.2 9L13.6 11L11.1 9L16.2 5.4V9Z" />
                </svg>
            </button>

            {/* Antigravity */}
            <button
                onClick={() => window.open('antigravity://', '_self')}
                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-gray-800 to-black text-white shadow-lg transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 hover:shadow-2xl border border-white/10"
                title="Antigravity"
            >
                <svg className="group-hover:scale-150 transition-transform duration-300 w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 21H7.5L9.5 16H14.5L16.5 21H21L12 2ZM10.5 13L12 9L13.5 13H10.5Z" fill="currentColor" />
                    <circle cx="12" cy="7" r="2" fill="#F5A623"/>
                </svg>
            </button>
        </div>
    );
}
