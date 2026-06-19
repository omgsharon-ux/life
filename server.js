const express = require("express");
const fs      = require("fs").promises;
const path    = require("path");

const app      = express();
const PORT     = 3000;
const PLANS_DIR = path.join(__dirname, "meal-plans");

app.use(express.json());
app.use(express.static(__dirname));

// Ensure meal-plans directory exists on startup
fs.mkdir(PLANS_DIR, { recursive: true }).catch(console.error);

// ── GET a single week plan ──
// weekKey = "2026-06-16" (Monday's date)
app.get("/api/plan/:weekKey", async (req, res) => {
    const file = path.join(PLANS_DIR, `${req.params.weekKey}.json`);
    try {
        const data = await fs.readFile(file, "utf8");
        res.json(JSON.parse(data));
    } catch {
        res.json({});
    }
});

// ── SAVE a week plan ──
app.post("/api/plan/:weekKey", async (req, res) => {
    const file = path.join(PLANS_DIR, `${req.params.weekKey}.json`);
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
});

// ── LIST all saved weeks ──
app.get("/api/plans", async (req, res) => {
    try {
        const files = await fs.readdir(PLANS_DIR);
        const weeks = files
            .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/))
            .map(f => f.replace(".json", ""))
            .sort();
        res.json(weeks);
    } catch {
        res.json([]);
    }
});

// ── GET dinner history ──
app.get("/api/history", async (req, res) => {
    const file = path.join(PLANS_DIR, "dinner-history.json");
    try {
        const data = await fs.readFile(file, "utf8");
        res.json(JSON.parse(data));
    } catch {
        res.json([]);
    }
});

// ── SAVE dinner history ──
app.post("/api/history", async (req, res) => {
    const file = path.join(PLANS_DIR, "dinner-history.json");
    await fs.writeFile(file, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Life Dashboard → http://localhost:${PORT}`);
});
