import { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya Kawan Kasih, asisten informasi pariwisata Bukit Kasih Kanonang. Ada yang bisa saya bantu terkait destinasi, rute pendakian, sejarah, atau fasilitas di sini?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Only render for logged-in Wisatawan (tourist)
  if (!user || user.role !== 'Wisatawan') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to history
    const userMsgId = 'user_' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('bukit_kasih_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      setMessages(prev => [...prev, { id: 'bot_' + Date.now(), role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: 'err_' + Date.now(), 
        role: 'assistant', 
        content: 'Maaf, koneksi ke asisten AI terputus. Silakan coba beberapa saat lagi.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#0F4C81] text-white flex items-center justify-center shadow-lg hover:bg-[#0d416f] transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative"
        title="Tanya Kawan Kasih"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-2xl">close</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-2xl">chat</span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[320px] sm:w-[360px] h-[480px] rounded-24 border border-outline-variant/30 bg-surface/90 dark:bg-background/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          
          {/* Header */}
          <div className="bg-[#0F4C81] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white relative">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0F4C81]"></span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Kawan Kasih</h4>
                <p className="text-[10px] text-white/70">Asisten AI Bukit Kasih</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-black/10">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} text-left`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                    isUser 
                      ? 'bg-[#0F4C81] text-white rounded-br-none' 
                      : 'bg-white dark:bg-neutral-800 text-on-surface border border-outline-variant/10 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start text-left">
                <div className="max-w-[80%] p-3 rounded-2xl bg-white dark:bg-neutral-800 text-on-surface border border-outline-variant/10 rounded-bl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81] animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81] animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-outline-variant/20 flex gap-2 bg-surface dark:bg-background">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya kriteria, rute, tiket..."
              className="flex-grow px-4 py-2 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-on-surface"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#0F4C81] text-white flex items-center justify-center hover:bg-[#0d416f] disabled:bg-slate-350 dark:disabled:bg-neutral-800 disabled:text-slate-500 transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
          
        </div>
      )}
    </div>
  );
}
