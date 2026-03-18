import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { User, Phone, FileText, Save, Bookmark, Camera } from "lucide-react";
import DecorationCard from "../components/DecorationCard";
import { motion } from "motion/react";

interface UserProfile {
  name: string;
  phone: string;
  bio: string;
  profile_image: string;
}

interface Decoration {
  id: number;
  title: string;
  theme: string;
  haar_style: string;
  image_url: string;
  category: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    bio: "",
    profile_image: "",
  });
  const [savedImages, setSavedImages] = useState<Decoration[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchSavedImages();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedImages = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/saved-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSavedImages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <img
                src={profile.profile_image || `https://ui-avatars.com/api/?name=${profile.name}&background=f59e0b&color=fff`}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-4 border-amber-100"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-stone-800">{profile.name}</h2>
              <p className="text-stone-500 text-sm">{profile.phone}</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-70"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-70"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-stone-300" size={18} />
                  <textarea
                    disabled={!isEditing}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-70 resize-none"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about your devotional interests..."
                  />
                </div>
              </div>

              {message && <p className="text-green-600 text-xs text-center font-bold">{message}</p>}

              {isEditing ? (
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 transition-all"
                >
                  Edit Profile
                </button>
              )}
            </form>
          </motion.div>
        </div>

        {/* Saved Images */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="text-amber-500" size={24} />
            <h2 className="font-serif text-2xl font-bold text-stone-800">Saved Inspirations</h2>
            <span className="ml-auto bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">
              {savedImages.length} items
            </span>
          </div>

          {savedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedImages.map((decoration) => (
                <DecorationCard key={decoration.id} decoration={decoration} isSaved={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
              <Bookmark className="mx-auto text-stone-200 mb-4" size={48} />
              <h3 className="text-xl font-bold text-stone-400">No saved items yet</h3>
              <p className="text-stone-400">Start exploring and save your favorite decoration ideas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
