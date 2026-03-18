import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "hari-anand-smruti-secret";

app.use(express.json());

// Initialize Database
const db = new Database("database.sqlite");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT,
    profile_image TEXT
  );

  CREATE TABLE IF NOT EXISTS decorations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    theme TEXT NOT NULL,
    haar_style TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS saved_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    decoration_id INTEGER NOT NULL,
    UNIQUE(user_id, decoration_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (decoration_id) REFERENCES decorations(id)
  );

  CREATE TABLE IF NOT EXISTS timelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_date TEXT NOT NULL,
    tasks TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed Data
const seedDecorations = [
  { title: "Divine Padhramni", theme: "Spiritual", haar_style: "Traditional Rose", image_url: "https://img.sanishtech.com/u/ae783efdd57d1e9091b52342d52cb2bf.png", category: "Traditional" },
  { title: "Spiritual Setup", theme: "Peaceful", haar_style: "White Jasmine", image_url: "https://img.sanishtech.com/u/3ab7f067c79c2d05b5e01fba36831133.png", category: "Aesthetic" },
  { title: "Guruhari Darshan", theme: "Divine", haar_style: "Royal Gold", image_url: "https://img.sanishtech.com/u/fba435d9ea85cde5931132c42c6533e6.png", category: "Festive" },
  { title: "Sacred Decoration", theme: "Traditional", haar_style: "Mixed Flowers", image_url: "https://img.sanishtech.com/u/a5f402d8299192b4cf9a86a8ea740976.png", category: "Theme-based" },
  { title: "Devotional Theme", theme: "Nature", haar_style: "Lotus Petals", image_url: "https://img.sanishtech.com/u/9ad6cd2d85c4f9b22edcf382ccebdac6.png", category: "Spiritual" },
  { title: "Divine Aura", theme: "Traditional", haar_style: "Sandalwood Garland", image_url: "https://img.sanishtech.com/u/3b47e5a28f286017b7ed6311c75dd788.png", category: "Traditional" },
  { title: "Sacred Space", theme: "Peaceful", haar_style: "Marigold Mix", image_url: "https://img.sanishtech.com/u/d0ee947beaa367d02cbe748faf4b3127.png", category: "Aesthetic" },
  { title: "Guruhari Padhramni", theme: "Royal", haar_style: "Velvet & Gold", image_url: "https://img.sanishtech.com/u/4d0a7c3a1ffbe2de3dc722a9ac4ddd4d.png", category: "Festive" },
  { title: "Devotional Arrangement", theme: "Theme-based", haar_style: "Peacock Feathers", image_url: "https://img.sanishtech.com/u/ca0fd6a8a0ede736e68be49c13216b73.png", category: "Theme-based" },
  { title: "Divine Presence", theme: "Spiritual", haar_style: "Fresh Jasmine", image_url: "https://img.sanishtech.com/u/8ad6d23645a48d2f2574cd4194c54425.png", category: "Spiritual" },
  { title: "Sacred Vibe", theme: "Peaceful", haar_style: "Rose Petals", image_url: "https://img.sanishtech.com/u/9396ed5872a03fc95a247e534ff49e50.png", category: "Aesthetic" },
  { title: "Floral Elegance", theme: "Traditional", haar_style: "Rose & Jasmine", image_url: "https://picsum.photos/seed/floral/800/600", category: "Festive" },
  { title: "Royal Gold", theme: "Royal", haar_style: "Gold Plated", image_url: "https://picsum.photos/seed/gold/800/600", category: "Aesthetic" },
  { title: "Divine White", theme: "Peaceful", haar_style: "White Lily", image_url: "https://picsum.photos/seed/white/800/600", category: "Spiritual" },
];

// Clear and re-seed to ensure new URLs are present
db.prepare("DELETE FROM decorations").run();
const insert = db.prepare("INSERT INTO decorations (title, theme, haar_style, image_url, category) VALUES (?, ?, ?, ?, ?)");
seedDecorations.forEach(d => insert.run(d.title, d.theme, d.haar_style, d.image_url, d.category));

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/auth/register", async (req, res) => {
  const { name, phone, password } = req.body;
  const trimmedPhone = phone.trim();
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = db.prepare("INSERT INTO users (name, phone, password) VALUES (?, ?, ?)").run(name, trimmedPhone, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, phone: trimmedPhone }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, name, phone: trimmedPhone } });
  } catch (e) {
    res.status(400).json({ error: "Phone number already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { phone, password } = req.body;
  const trimmedPhone = phone.trim();
  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(trimmedPhone) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, bio: user.bio, profile_image: user.profile_image } });
});

app.get("/api/user/profile", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, name, phone, bio, profile_image FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

app.put("/api/user/profile", authenticateToken, (req: any, res) => {
  const { name, phone, bio, profile_image } = req.body;
  db.prepare("UPDATE users SET name = ?, phone = ?, bio = ?, profile_image = ? WHERE id = ?").run(name, phone, bio, profile_image, req.user.id);
  res.json({ success: true });
});

app.get("/api/decorations", (req, res) => {
  const { search, category } = req.query;
  let query = "SELECT * FROM decorations";
  const params: any[] = [];
  if (search || category) {
    query += " WHERE";
    if (search) {
      query += " (title LIKE ? OR theme LIKE ? OR haar_style LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      if (search) query += " AND";
      query += " category = ?";
      params.push(category);
    }
  }
  query += " ORDER BY id DESC"; // Show newest first
  const decorations = db.prepare(query).all(...params);
  res.json(decorations);
});

app.post("/api/decorations", authenticateToken, (req: any, res) => {
  const { title, theme, haar_style, image_url, category } = req.body;
  if (!title || !theme || !haar_style || !image_url || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const result = db.prepare("INSERT INTO decorations (title, theme, haar_style, image_url, category, user_id) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title, theme, haar_style, image_url, category, req.user.id);
    res.json({ id: result.lastInsertRowid, title, theme, haar_style, image_url, category });
  } catch (e) {
    res.status(500).json({ error: "Failed to post decoration" });
  }
});

app.post("/api/user/save-image", authenticateToken, (req: any, res) => {
  const { decoration_id } = req.body;
  try {
    db.prepare("INSERT OR IGNORE INTO saved_images (user_id, decoration_id) VALUES (?, ?)").run(req.user.id, decoration_id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save image" });
  }
});

app.delete("/api/user/save-image/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM saved_images WHERE user_id = ? AND decoration_id = ?").run(req.user.id, req.params.id);
  res.json({ success: true });
});

app.get("/api/user/saved-images", authenticateToken, (req: any, res) => {
  const saved = db.prepare(`
    SELECT d.* FROM decorations d
    JOIN saved_images s ON d.id = s.decoration_id
    WHERE s.user_id = ?
  `).all(req.user.id);
  res.json(saved);
});

// Timeline Generator API
app.post("/api/timeline/generate", authenticateToken, async (req: any, res) => {
  const { eventDate, eventType } = req.body;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `Generate a detailed preparation timeline for a Guruhari Padhramni event on ${eventDate}. The theme is ${eventType}. 
    Provide a list of tasks with recommended days before the event (e.g., "7 days before", "1 day before", "On the day"). 
    Format the output as a JSON array of objects with 'day' and 'task' properties.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const tasks = JSON.parse(response.text);
    db.prepare("INSERT INTO timelines (user_id, event_date, tasks) VALUES (?, ?, ?)").run(req.user.id, eventDate, JSON.stringify(tasks));
    res.json(tasks);
  } catch (e) {
    // Fallback timeline if AI fails
    const fallback = [
      { day: "7 days before", task: "Finalize decoration theme and order materials." },
      { day: "5 days before", task: "Invite guests and volunteers." },
      { day: "3 days before", task: "Clean the padhramni area and check lighting." },
      { day: "1 day before", task: "Prepare the haar and floral arrangements." },
      { day: "On the day", task: "Final setup and welcoming of Guruhari." }
    ];
    res.json(fallback);
  }
});

app.get("/api/user/timelines", authenticateToken, (req: any, res) => {
  const timelines = db.prepare("SELECT * FROM timelines WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json(timelines.map((t: any) => ({ ...t, tasks: JSON.parse(t.tasks) })));
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

