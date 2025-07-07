// === IMPORTS ===
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === INIT ===
const app = express();
const PORT = process.env.PORT || 3000;
const GIT_PASSWORD = "8245"; // 🔐 change si besoin
const GH_TOKEN_PATH = "/etc/secrets/GH_TOKEN"; // 🔐 fichier secret Render
const repoPath = __dirname;
const branch = 'main';

// === LECTURE DU TOKEN GITHUB ===
let GH_TOKEN = "";
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

  try {
    execSync(`git config user.email "autobot@example.com"`, { cwd: repoPath });
    execSync(`git config user.name "Render Backup Bot"`, { cwd: repoPath });

    // Force l’URL sécurisée avec le token
    const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

    try {
      execSync(`git remote get-url origin`, { cwd: repoPath });
      // Si la remote existe, on la met à jour
      execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });
      console.log("✅ Remote origin mise à jour");
    } catch {
      // Si la remote n'existe pas, on la crée
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: repoPath });
      console.log("✅ Remote origin ajoutée");
    }


    // Commit si changement
    execSync(`git add .`, { cwd: repoPath });
    try {
      execSync(`git diff --cached --quiet`, { cwd: repoPath });
      return res.send("✅ Aucun changement à push");
    } catch {
      const msg = `Backup auto @ ${new Date().toISOString()}`;
      execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: repoPath });
      execSync(`git push origin ${branch}`, { cwd: repoPath });
      return res.send("✅ Push Git réussi !");
    }

  } catch (err) {
    console.error("❌ Git Push Error:", err.message);
    return res.status(500).send("Erreur lors du push Git : " + err.message);
  }
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé : http://localhost:${PORT}`);
});
