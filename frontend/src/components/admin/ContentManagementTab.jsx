import React, { useState, useEffect } from 'react';
import { destinationService, activityService, uploadService } from '../../services/api';

const ContentManagementTab = () => {
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('destinations');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [destData, actData] = await Promise.all([
        destinationService.getAll(),
        activityService.getAll()
      ]);
      setDestinations(destData);
      setActivities(actData);
    } catch (error) {
      console.error('Error fetching content:', error);
      setFetchError(error.message || 'Gagal memuat data konten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDest = async (id) => {
    if (!window.confirm('Yakin ingin menghapus destinasi ini?')) return;
    try {
      await destinationService.delete(id);
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menghapus');
    }
  };

  const handleDeleteAct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus aktivitas ini?')) return;
    try {
      await activityService.delete(id);
      fetchData();
    } catch (error) {
      alert(error.message || 'Gagal menghapus');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData(activeSubTab === 'destinations' ? {
      title: '', image: '', altText: '', detailsTitle: '', detailsText: '', detailsTips: '', detailsHours: '', detailsDifficulty: ''
    } : {
      id: `act${Date.now()}`, title: '', location: '', description: '', image: '', categories: '', hours: '', meta: '', isFav: false, difficulty: '', tips: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await uploadService.uploadImage(file);
      const backendUrl = 'http://localhost:8080'; // Default backend URL
      setFormData(prev => ({
        ...prev,
        image: backendUrl + data.url
      }));
    } catch (error) {
      alert(error.message || 'Gagal mengunggah gambar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeSubTab === 'destinations') {
        if (isEditing) {
          await destinationService.update(formData.ID, formData);
        } else {
          await destinationService.create(formData);
        }
      } else {
        if (isEditing) {
          await activityService.update(formData.ID, formData);
        } else {
          await activityService.create(formData);
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-white/5 rounded-24">
      <span className="material-symbols-outlined text-[48px] text-primary mb-2 animate-spin">refresh</span>
      <p className="text-subtext dark:text-slate-400">Memuat data konten...</p>
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center p-20 bg-red-50 dark:bg-red-500/10 rounded-24">
      <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">error</span>
      <p className="text-red-500">{fetchError}</p>
    </div>
  );

  return (
    <div className="text-on-surface">
      <h3 className="text-xl font-bold mb-4">Manajemen Konten (Destinasi & Aktivitas)</h3>
      
      {/* Sub Tabs */}
      <div className="flex space-x-4 border-b border-outline-variant/30 mb-6">
        <button
          className={`pb-2 px-4 transition-colors ${activeSubTab === 'destinations' ? 'border-b-2 border-primary text-primary font-semibold dark:border-secondary-fixed dark:text-secondary-fixed' : 'text-subtext hover:text-on-surface'}`}
          onClick={() => setActiveSubTab('destinations')}
        >
          Destinasi
        </button>
        <button
          className={`pb-2 px-4 transition-colors ${activeSubTab === 'activities' ? 'border-b-2 border-primary text-primary font-semibold dark:border-secondary-fixed dark:text-secondary-fixed' : 'text-subtext hover:text-on-surface'}`}
          onClick={() => setActiveSubTab('activities')}
        >
          Aktivitas
        </button>
      </div>

      {/* Destinations List */}
      {activeSubTab === 'destinations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-on-surface">Daftar Destinasi</h4>
            <button onClick={openAddModal} className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors">
              + Tambah Destinasi
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinations.map(d => (
              <div key={d.ID} className="glass-panel-light dark:glass-panel border border-outline-variant/30 rounded-lg p-4 shadow-sm flex items-start space-x-4">
                <img src={d.image} alt={d.title} className="w-24 h-24 object-cover rounded bg-surface/50" />
                <div className="flex-1">
                  <h5 className="font-bold text-lg text-on-surface">{d.title}</h5>
                  <p className="text-sm text-subtext line-clamp-2 mt-1">{d.detailsText}</p>
                  <div className="mt-3 flex space-x-3">
                    <button onClick={() => openEditModal(d)} className="text-primary dark:text-secondary-fixed hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => handleDeleteDest(d.ID)} className="text-red-500 hover:underline text-sm font-medium">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities List */}
      {activeSubTab === 'activities' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-on-surface">Daftar Aktivitas</h4>
            <button onClick={openAddModal} className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors">
              + Tambah Aktivitas
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(a => (
              <div key={a.ID} className="glass-panel-light dark:glass-panel border border-outline-variant/30 rounded-lg p-4 shadow-sm flex items-start space-x-4">
                <img src={a.image} alt={a.title} className="w-24 h-24 object-cover rounded bg-surface/50" />
                <div className="flex-1">
                  <h5 className="font-bold text-lg text-on-surface">{a.title}</h5>
                  <p className="text-xs font-semibold text-primary/80 dark:text-secondary-fixed/80 uppercase">{a.location}</p>
                  <p className="text-sm text-subtext line-clamp-2 mt-1">{a.description}</p>
                  <div className="mt-3 flex space-x-3">
                    <button onClick={() => openEditModal(a)} className="text-primary dark:text-secondary-fixed hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => handleDeleteAct(a.ID)} className="text-red-500 hover:underline text-sm font-medium">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface dark:bg-[#1A1A1A] border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-on-surface">{isEditing ? 'Edit' : 'Tambah'} {activeSubTab === 'destinations' ? 'Destinasi' : 'Aktivitas'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-subtext hover:text-on-surface text-3xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Judul</label>
                <input required type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Gambar (Unggah File / Tulis URL)</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full md:w-1/3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-2 text-on-surface outline-none transition-colors" />
                  <input required type="text" name="image" value={formData.image || ''} onChange={handleInputChange} className="w-full md:w-2/3 bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" placeholder="http://..." />
                </div>
              </div>

              {activeSubTab === 'destinations' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Deskripsi Singkat (AltText)</label>
                    <input type="text" name="altText" value={formData.altText || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Judul Detail</label>
                    <input type="text" name="detailsTitle" value={formData.detailsTitle || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Teks Detail</label>
                    <textarea rows="3" name="detailsText" value={formData.detailsText || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Tips Berkunjung</label>
                    <textarea rows="2" name="detailsTips" value={formData.detailsTips || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1">Jam Operasional</label>
                      <input type="text" name="detailsHours" value={formData.detailsHours || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1">Tingkat Kesulitan</label>
                      <input type="text" name="detailsDifficulty" value={formData.detailsDifficulty || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Lokasi</label>
                    <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Deskripsi</label>
                    <textarea rows="3" name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Tips Berkunjung</label>
                    <textarea rows="2" name="tips" value={formData.tips || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1">Kategori (Pisahkan Koma)</label>
                      <input type="text" name="categories" value={formData.categories || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1">Jam Operasional</label>
                      <input type="text" name="hours" value={formData.hours || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1">Tingkat Kesulitan</label>
                      <input type="text" name="difficulty" value={formData.difficulty || ''} onChange={handleInputChange} className="w-full bg-surface-variant/50 dark:bg-white/5 border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex items-center space-x-3 pt-6">
                      <input type="checkbox" id="isFav" name="isFav" checked={formData.isFav || false} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                      <label htmlFor="isFav" className="text-sm font-semibold text-on-surface cursor-pointer">Tandai Favorit Utama</label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full border border-outline-variant/50 hover:bg-surface-variant/50 text-sm font-bold text-on-surface transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 text-sm font-bold shadow-md shadow-primary/20 transition-all">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagementTab;
