import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAnnouncement } from '../../context/AnnouncementContext';
import { useFeedback } from '../../context/FeedbackContext';
import { bookmarkService } from '../../services/api';

export default function SummaryTab() {
  const { user, token } = useAuth();
  const { announcement } = useAnnouncement();
  const { inquiries, reviews } = useFeedback();

  const [bookmarkStats, setBookmarkStats] = useState([]);

  useEffect(() => {
    if (user && user.role === 'Pengelola') {
      const fetchBookmarkStats = async () => {
        try {
          const data = await bookmarkService.getStats();
          if (data && data.length > 0) {
            setBookmarkStats(data);
          }
        } catch (error) {
          console.error("Gagal mengambil statistik bookmark:", error);
        }
      };
      fetchBookmarkStats();
    }
  }, [user, token]);

  const pendingInquiriesCount = inquiries.filter((inq) => inq.status === 'pending').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const fiveStarReviewsCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-subtext uppercase tracking-wider">
              Total Ulasan
            </span>
            <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">
              reviews
            </span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">{reviews.length}</span>
          <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            {avgRating} Rata-rata kepuasan
          </span>
        </div>

        <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-subtext uppercase tracking-wider">
              Pesan Tertunda
            </span>
            <span className="material-symbols-outlined text-amber-500 text-2xl">
              pending_actions
            </span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">{pendingInquiriesCount}</span>
          <span className="block text-xs text-subtext mt-2">Butuh tanggapan segera</span>
        </div>

        <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-subtext uppercase tracking-wider">
              Ulasan Bintang 5
            </span>
            <span className="material-symbols-outlined text-accent-gold text-2xl">star</span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">{fiveStarReviewsCount}</span>
          <span className="block text-xs text-subtext mt-2">Kandidat promosi Hermes AI</span>
        </div>

        <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-subtext uppercase tracking-wider">
              Banner Wisata
            </span>
            <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">campaign</span>
          </div>
          <span className="text-lg font-bold text-on-surface truncate block">
            {announcement ? 'Pengumuman Aktif' : 'Normal / Aman'}
          </span>
          <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            {announcement ? 'Push notifikasi tersiar' : 'Jalur beroperasi normal'}
          </span>
        </div>
      </div>

      {/* Mock Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Checkpoints Table */}
        <div className="lg:col-span-3 glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
          <h3 className="text-lg font-bold text-on-surface mb-4">
            Statistik Penanda Objek Wisata (Bookmark)
          </h3>
          <div className="space-y-4">
            {bookmarkStats.length > 0 ? bookmarkStats.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-on-surface">{item.name}</span>
                  <span className="text-subtext">{item.count} Bookmark</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="py-8 text-center border-2 border-dashed border-outline-variant/30 rounded-xl">
                <span className="material-symbols-outlined text-3xl text-subtext/50 mb-2">bookmark_border</span>
                <p className="text-xs text-subtext">Belum ada data bookmark wisatawan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
