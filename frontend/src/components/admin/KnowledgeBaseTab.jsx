import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function KnowledgeBaseTab({ showToast }) {
  const { token, user } = useAuth();
  
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  
  const [kTitle, setKTitle] = useState('');
  const [kCategory, setKCategory] = useState('');
  const [kContent, setKContent] = useState('');
  const [kKeywords, setKKeywords] = useState('');

  const fetchKnowledgeDocs = async () => {
    try {
      const res = await fetch('/api/knowledge', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKnowledgeDocs(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data knowledge base:", error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Pengelola') {
      fetchKnowledgeDocs();
    }
  }, [user, token]);

  const handleSaveKnowledge = async (e) => {
    e.preventDefault();
    const payload = { title: kTitle, category: kCategory, content: kContent, keywords: kKeywords };
    const method = editingDocId ? 'PUT' : 'POST';
    const url = editingDocId ? `/api/knowledge/${editingDocId}` : '/api/knowledge';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Artikel berhasil ${editingDocId ? 'diperbarui' : 'ditambahkan'}.`, 'success');
        setShowKnowledgeForm(false);
        setEditingDocId(null);
        setKTitle(''); setKCategory(''); setKContent(''); setKKeywords('');
        fetchKnowledgeDocs();
      } else {
        showToast('Gagal menyimpan artikel.', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const handleDeleteKnowledge = async (id, title) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) return;

    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast(`Artikel "${title}" berhasil dihapus.`, 'info');
        fetchKnowledgeDocs();
      } else {
        showToast('Gagal menghapus artikel.', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const openEditForm = (doc) => {
    setEditingDocId(doc.ID);
    setKTitle(doc.title);
    setKCategory(doc.category);
    setKContent(doc.content);
    setKKeywords(doc.keywords || '');
    setShowKnowledgeForm(true);
  };

  const openAddForm = () => {
    setEditingDocId(null);
    setKTitle(''); setKCategory(''); setKContent(''); setKKeywords('');
    setShowKnowledgeForm(true);
  };

  return (
    <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Kelola Basis Pengetahuan (RAG)</h3>
          <p className="text-xs text-subtext">Sumber Pengetahuan untuk Chatbot.</p>
        </div>
        {!showKnowledgeForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-body-md text-xs font-bold cursor-pointer transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Artikel
          </button>
        )}
      </div>

      {showKnowledgeForm ? (
        <div className="bg-surface/50 dark:bg-black/20 p-6 rounded-2xl border border-outline-variant/30 animate-fade-in">
          <h4 className="text-md font-bold mb-4">{editingDocId ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h4>
          <form onSubmit={handleSaveKnowledge} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  value={kTitle}
                  onChange={(e) => setKTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/40 focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface"
                  placeholder="Misal: Harga Tiket Masuk"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={kCategory}
                  onChange={(e) => setKCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/40 focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface"
                  placeholder="Misal: Informasi Umum"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Konten / Isi Artikel</label>
              <textarea
                rows="5"
                required
                value={kContent}
                onChange={(e) => setKContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/40 focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface"
                placeholder="Masukkan informasi detail di sini..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Kata Kunci (Pisahkan dengan koma)</label>
              <input
                type="text"
                value={kKeywords}
                onChange={(e) => setKKeywords(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/40 focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface"
                placeholder="Misal: tiket, harga, biaya, masuk"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-full font-bold text-xs hover:bg-primary/90 transition-colors"
              >
                Simpan Artikel
              </button>
              <button
                type="button"
                onClick={() => setShowKnowledgeForm(false)}
                className="px-6 py-2 border border-outline-variant/50 text-subtext rounded-full font-bold text-xs hover:bg-surface/50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgeDocs.length > 0 ? (
            knowledgeDocs.map((doc) => (
              <div key={doc.ID} className="p-4 border border-outline-variant/20 rounded-xl hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-white/10 dark:text-slate-300 font-semibold">{doc.category}</span>
                    <h5 className="font-bold text-sm text-on-surface">{doc.title}</h5>
                  </div>
                  <p className="text-xs text-subtext line-clamp-2 leading-relaxed">{doc.content}</p>
                  {doc.keywords && <p className="text-[10px] text-subtext italic mt-1">Keywords: {doc.keywords}</p>}
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  <button
                    onClick={() => openEditForm(doc)}
                    className="p-1.5 border border-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9]/10 rounded-lg transition-colors"
                    title="Edit Artikel"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteKnowledge(doc.ID, doc.title)}
                    className="p-1.5 border border-red-500/20 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Hapus Artikel"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-outline-variant/30 rounded-xl">
              <p className="text-xs text-subtext">Belum ada dokumen pengetahuan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
