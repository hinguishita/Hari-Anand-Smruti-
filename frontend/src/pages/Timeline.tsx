import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Calendar, Plus, Clock, CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface Task {
  day: string;
  task: string;
}

interface Timeline {
  id: number;
  event_date: string;
  tasks: Task[];
}

export default function Timeline() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("Traditional");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/user/timelines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTimelines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/timeline/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventDate, eventType }),
      });
      const data = await response.json();
      setTimelines([{ id: Date.now(), event_date: eventDate, tasks: data }, ...timelines]);
      setEventDate("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 sticky top-24"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-amber-500" size={24} />
              <h2 className="font-serif text-2xl font-bold text-stone-800">Timeline Generator</h2>
            </div>
            
            <p className="text-stone-500 text-sm mb-6">
              Generate a smart preparation guide for your upcoming Guruhari Padhramni based on your event date and theme.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Decoration Theme</label>
                <select
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option>Traditional</option>
                  <option>Floral</option>
                  <option>Royal</option>
                  <option>Modern</option>
                  <option>Peacock Theme</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={20} />
                    Generate Timeline
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Timelines List */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-amber-500" size={24} />
            <h2 className="font-serif text-2xl font-bold text-stone-800">Your Preparation Guides</h2>
          </div>

          {fetching ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : timelines.length > 0 ? (
            <div className="space-y-8">
              {timelines.map((timeline) => (
                <motion.div
                  key={timeline.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 overflow-hidden relative"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-stone-800">
                        Padhramni Preparation
                      </h3>
                      <p className="text-amber-600 font-bold text-sm">
                        Event Date: {new Date(timeline.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100">
                    {timeline.tasks.map((task, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center z-10">
                          <CheckCircle2 size={14} className="text-amber-500" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                            {task.day}
                          </span>
                          <p className="text-stone-700 font-medium">{task.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
              <Calendar className="mx-auto text-stone-200 mb-4" size={48} />
              <h3 className="text-xl font-bold text-stone-400">No timelines yet</h3>
              <p className="text-stone-400">Generate your first preparation guide to stay organized</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
