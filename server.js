// === IMPORTS ===
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const bodyParser = require('body-parser');
const pushToGithub = require('./utils/pushToGithub');

// === INIT ===
const app = express();
const PORT = process.env.PORT || 3000;
const GIT_PASSWORD = "8245"; // 🔐 change si besoin
const GH_TOKEN_PATH = "/etc/secrets/GH_TOKEN"; // 🔐 fichier secret Render
const repoPath = __dirname;
const branch = 'main';

// === LECTURE DU TOKEN GITHUB ===
let GH_TOKEN = null;
try {
  GH_TOKEN = fs.readFileSync(GH_TOKEN_PATH, 'utf8').trim();
  console.log("✅ Token GitHub lu depuis le fichier secret");
} catch (err) {
  console.warn("❌ Token GitHub introuvable : " + err.message);
}

// === MIDDLEWARES ===
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === UTILS ===
const getFilePath = (filename) => path.join(__dirname, 'data', filename);

// === ROUTES API ===

// --- INGREDIENTS ---
app.get('/api/ingredients', (req, res) => {
  fs.readFile(getFilePath('ingredients.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture ingrédients');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/ingredients', (req, res) => {
  fs.writeFile(getFilePath('ingredients.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture ingrédients');
    res.sendStatus(200);
  });
});

// --- RECETTES ---
app.get('/api/recipes', (req, res) => {
  fs.readFile(getFilePath('recipes.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture recettes');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/recipes', (req, res) => {
  fs.writeFile(getFilePath('recipes.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture recettes');
    res.sendStatus(200);
  });
});

// --- VOYAGES ---
app.get('/api/voyages', (req, res) => {
  fs.readFile(getFilePath('voyages.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture voyages');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/voyages', (req, res) => {
  fs.writeFile(getFilePath('voyages.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture voyages');
    res.sendStatus(200);
  });
});

// === GIT PUSH (manuel, via bouton) ===
app.post('/api/git-push', (req, res) => {
  const { password } = req.body;

  if (password !== GIT_PASSWORD) {
    return res.status(401).send("Mot de passe incorrect.");
  }

  if (!GH_TOKEN) {
    return res.status(500).send("❌ GH_TOKEN non trouvé (fichier manquant ?)");
  }

  pushToGithub(GH_TOKEN, (err, message) => {
    if (err) {
      console.error("❌ Erreur lors du push :", err.stderr?.toString() || err.message || err);
      return res.status(500).send("Erreur lors du push Git.");
    }
    res.send(message);
  });

});


// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé : http://localhost:${PORT}`);
});
