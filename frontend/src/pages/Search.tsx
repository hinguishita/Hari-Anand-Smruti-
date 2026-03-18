import { useState, useEffect } from "react";
import { Search as SearchIcon, Tag, ChevronRight } from "lucide-react";
import DecorationCard from "../components/DecorationCard";
import { motion } from "motion/react";

interface Decoration {
  id: number;
  title: string;
  theme: string;
  haar_style: string;
  image_url: string;
  category: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ["Festive", "Aesthetic", "Spiritual", "Theme-based", "Traditional"];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query || category) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, category]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (category) params.append("category", category);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/decorations?${params.toString()}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-bold text-stone-800 mb-6">Explore by Theme</h1>
        
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={24} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keywords like 'Rose', 'Peacock', 'Traditional'..."
            className="w-full pl-14 pr-4 py-5 bg-white border border-stone-200 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none shadow-lg text-lg transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCategory("")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              category === "" ? "bg-amber-500 text-white shadow-md" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                category === cat ? "bg-amber-500 text-white shadow-md" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {results.length > 0 ? (
            <div className="image-grid">
              {results.map((decoration) => (
                <DecorationCard key={decoration.id} decoration={decoration} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200">
              <Tag className="mx-auto text-stone-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-stone-400">Start exploring themes</h3>
              <p className="text-stone-400">Search for specific styles or select a category above</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
