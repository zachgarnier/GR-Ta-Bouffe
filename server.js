// === IMPORTS ===
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === INIT ===
const app = express();
const PORT = process.env.PORT || 3000;
const GIT_PASSWORD = process.env.GIT_PASSWORD || "8245"; // 🔐 Met ton mot de passe Render ici
const GH_TOKEN = process.env.GH_TOKEN || ""; // 🔐 Ton token GitHub sécurisé
const repoPath = __dirname;
const branch = 'main';

// === MIDDLEWARES ===
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === UTILS ===
const getFilePath = (filename) => path.join(__dirname, 'data', filename);

// === API INGREDIENTS ===
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

// === API RECIPES ===
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

// === API VOYAGES ===
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

// === API PUSH GIT ===
app.post('/api/git-push', (req, res) => {
  const { password } = req.body;
  if (password !== GIT_PASSWORD) {
    return res.status(401).send("Mot de passe incorrect.");
  }

  if (!GH_TOKEN) {
    return res.status(500).send("GH_TOKEN non défini dans les variables d'environnement.");
  }

  try {
    // Configure Git en mémoire
    execSync(`git config user.email "autobot@example.com"`, { cwd: repoPath });
    execSync(`git config user.name "Render Backup Bot"`, { cwd: repoPath });

    // Définit temporairement l'URL sécurisée pour origin
    const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;
    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });

    // Push
    const commitMessage = `Backup auto @ ${new Date().toISOString()}`;
    execSync(`git add .`, { cwd: repoPath });

    try {
      execSync(`git diff --cached --quiet`, { cwd: repoPath });
      return res.send("✅ Aucun changement à pousser.");
    } catch {
      execSync(`git commit -m ${JSON.stringify(commitMessage)}`, { cwd: repoPath });
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
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
