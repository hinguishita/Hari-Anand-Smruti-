import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Search as SearchIcon, Filter, Sparkles, Plus, X, Image as ImageIcon } from "lucide-react";
import DecorationCard from "../components/DecorationCard";
import { motion, AnimatePresence } from "motion/react";

interface Decoration {
  id: number;
  title: string;
  theme: string;
  haar_style: string;
  image_url: string;
  category: string;
}

export default function Home() {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: "",
    theme: "",
    haar_style: "",
    image_url: "",
    category: "Traditional",
  });
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    fetchDecorations();
    fetchSavedImages();
  }, []);

  const fetchDecorations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/decorations`);
      const data = await response.json();
      setDecorations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedImages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/saved-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSavedIds(data.map((d: Decoration) => d.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const isCurrentlySaved = savedIds.includes(id);
    try {
      if (isCurrentlySaved) {
        await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/save-image/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedIds(savedIds.filter((savedId) => savedId !== id));
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/save-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decoration_id: id }),
        });
        setSavedIds([...savedIds, id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to share your smruti");
      return;
    }
    setPostLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/decorations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postFormData),
      });
      if (response.ok) {
        setIsPostModalOpen(false);
        setPostFormData({
          title: "",
          theme: "",
          haar_style: "",
          image_url: "",
          category: "Traditional",
        });
        fetchDecorations();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to post");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-4"
        >
          <Sparkles size={16} />
          <span>Divine Inspirations</span>
        </motion.div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 mb-4">
          Guruhari Padhramni Decorations
        </h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-xl font-serif italic">
          "ભેગા મળીને એક રુચિ ને એક દિલથી દોડીએ તો ભગવાન રાજી થઈ જાય."
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search by theme, haar style or keyword..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="font-medium">My Smruti</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="image-grid">
          {decorations.map((decoration) => (
            <DecorationCard
              key={decoration.id}
              decoration={decoration}
              onSave={handleSave}
              isSaved={savedIds.includes(decoration.id)}
            />
          ))}
        </div>
      )}

      {!loading && decorations.length === 0 && (
        <div className="text-center py-20">
          <p className="text-stone-500 text-lg">No inspirations found. Try a different search.</p>
        </div>
      )}

      {/* Post Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-stone-800">My Smruti</h2>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-stone-400" />
                </button>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Divine Floral Arch"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={postFormData.title}
                    onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Theme</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Traditional"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      value={postFormData.theme}
                      onChange={(e) => setPostFormData({ ...postFormData, theme: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Haar Style</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rose & Jasmine"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      value={postFormData.haar_style}
                      onChange={(e) => setPostFormData({ ...postFormData, haar_style: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                  >
                    <option>Traditional</option>
                    <option>Festive</option>
                    <option>Aesthetic</option>
                    <option>Spiritual</option>
                    <option>Theme-based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      value={postFormData.image_url}
                      onChange={(e) => setPostFormData({ ...postFormData, image_url: e.target.value })}
                    />
                  </div>
                </div>

                {postFormData.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-stone-200 aspect-video">
                    <img
                      src={postFormData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://picsum.photos/seed/error/800/600")}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={postLoading}
                  className="w-full py-4 bg-stone-800 text-white font-bold rounded-2xl hover:bg-stone-700 transition-all disabled:opacity-50 mt-4"
                >
                  {postLoading ? "Sharing..." : "Share Smruti"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
