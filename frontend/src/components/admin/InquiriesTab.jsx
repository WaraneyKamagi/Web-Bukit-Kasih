import { useState } from 'react';
import { useFeedback } from '../../context/FeedbackContext';

export default function InquiriesTab({ showToast }) {
  const { inquiries, replyInquiry } = useFeedback();

  const [selectedInqId, setSelectedInqId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (inqId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyInquiry(inqId, replyText);
    showToast('Balasan Anda telah dikirim dan dapat dilihat oleh wisatawan.', 'success');
    setReplyText('');
    setSelectedInqId(null);
  };

  return (
    <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 animate-fade-in">
      <h3 className="text-lg font-bold text-on-surface mb-6">Pesan & Pertanyaan Masuk</h3>
      <div className="space-y-6">
        {inquiries.length > 0 ? (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`p-6 border rounded-2xl flex flex-col gap-4 text-left transition-colors ${inq.status === 'Menunggu Balasan'
                ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5'
                : 'border-outline-variant/20'
                }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-outline-variant/10 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-on-surface text-sm">{inq.name}</span>
                  <span className="text-subtext">({inq.email})</span>
                  <span className="text-subtext">{inq.date}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold uppercase text-[9px] ${inq.status === 'Menunggu Balasan'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    }`}
                >
                  {inq.status}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-subtext uppercase tracking-wider block">
                  Pertanyaan:
                </span>
                <p className="text-on-surface-variant dark:text-slate-200 text-sm leading-relaxed">
                  {inq.message}
                </p>
              </div>

              {/* Display Reply if already answered */}
              {inq.reply && (
                <div className="p-4 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider block">
                    Balasan Admin:
                  </span>
                  <p className="text-on-surface dark:text-slate-350 text-sm leading-relaxed italic">
                    "{inq.reply}"
                  </p>
                </div>
              )}

              {/* Reply Form Trigger */}
              {inq.status === 'Menunggu Balasan' && selectedInqId !== inq.id && (
                <button
                  onClick={() => {
                    setSelectedInqId(inq.id);
                    setReplyText('');
                  }}
                  className="self-start px-5 py-2 border border-primary text-primary hover:bg-primary/5 dark:border-secondary dark:text-secondary-fixed dark:hover:bg-secondary/5 rounded-full font-body-md text-xs font-semibold cursor-pointer transition-colors"
                >
                  Tulis Balasan
                </button>
              )}

              {/* Reply Form Input */}
              {selectedInqId === inq.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(inq.id, e)}
                  className="space-y-4 border-t border-outline-variant/10 pt-4"
                >
                  <div>
                    <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2">
                      Teks Balasan
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tulis balasan Anda di sini..."
                      className="w-full p-4 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-full font-body-md text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Kirim Balasan
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInqId(null)}
                      className="px-6 border border-outline-variant text-subtext py-2.5 rounded-full font-body-md text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        ) : (
          <p className="text-subtext dark:text-slate-400 py-6 text-center">
            Tidak ada pesan masuk.
          </p>
        )}
      </div>
    </div>
  );
}
