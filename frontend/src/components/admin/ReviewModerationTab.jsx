import { useFeedback } from '../../context/FeedbackContext';

export default function ReviewModerationTab({ handleSendToTelegram, showToast }) {
  const { reviews, deleteReview } = useFeedback();

  const handleDeleteReview = (revId, author) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ulasan dari "${author}"?`)) {
      deleteReview(revId);
      showToast(`Ulasan dari "${author}" berhasil dihapus.`, 'info');
    }
  };

  return (
    <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 animate-fade-in">
      <h3 className="text-lg font-bold text-on-surface mb-6">Moderasi Ulasan Wisatawan</h3>
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 border border-outline-variant/20 rounded-2xl flex justify-between items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-on-surface text-sm">{rev.author}</span>
                  <span className="text-xs text-subtext">{rev.date}</span>
                  <span className="flex text-accent-gold text-sm items-center font-bold">
                    <span
                      className="material-symbols-outlined text-[16px] mr-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {rev.rating}
                  </span>
                </div>
                <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed text-left">
                  "{rev.text}"
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {rev.rating >= 4 && (
                  <button
                    onClick={() => handleSendToTelegram('review', rev.text, rev.author)}
                    className="p-2 border border-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9]/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    title="Kirim Testimoni ke Telegram Hermes"
                  >
                    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReview(rev.id, rev.author)}
                  className="p-2 border border-red-500/20 text-red-600 hover:bg-red-500/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  title="Hapus Ulasan"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-subtext dark:text-slate-400 py-6 text-center">
            Tidak ada ulasan ditemukan untuk dimoderasi.
          </p>
        )}
      </div>
    </div>
  );
}
