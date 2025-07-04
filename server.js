const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GH_TOKEN_PATH = '/etc/secrets/GH_TOKEN';
let GH_TOKEN = '';

try {
  GH_TOKEN = fs.readFileSync(GH_TOKEN_PATH, 'utf8').trim();
  console.log("✅ Token GitHub lu depuis les secrets");

  // Remplace ici :
  const githubUsername = 'zachgarnier';     // ← Ton nom GitHub
  const githubRepo = 'GR-Ta-Bouffe';             // ← Nom du repo
  const branch = 'main';                     // ← ou 'master' selon ton repo

  const remoteUrl = `https://${GH_TOKEN}@github.com/${githubUsername}/${githubRepo}.git`;

  // === Initialiser git s’il n’existe pas
  try {
    execSync('git rev-parse --is-inside-work-tree');
    console.log('✅ Git déjà initialisé');
  } catch {
    console.log('🔧 Git non initialisé, création en cours...');
    execSync('git init');
    execSync(`git remote add origin ${remoteUrl}`);
    execSync('git fetch origin');
    execSync(`git checkout -b ${branch}`);
  }

  // Configure git user
  execSync(`git config --global user.email "autobot@example.com"`);
  execSync(`git config --global user.name "Render Backup Bot"`);

  console.log("✅ Git configuré pour push");
} catch (err) {
  console.error("❌ Erreur config GitHub :", err.message);
}




const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON du corps des requêtes
app.use(express.json());

// Servir les fichiers statiques depuis /public
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTES API ===
const getFilePath = (filename) => path.join(__dirname, 'data', filename);

// Ingrédients
app.get('/api/ingredients', (req, res) => {
  fs.readFile(getFilePath('ingredients.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/ingredients', (req, res) => {
  fs.writeFile(getFilePath('ingredients.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    require('./utils/pushToGithub');
    res.sendStatus(200);
  });
});

// Recettes
app.get('/api/recipes', (req, res) => {
  fs.readFile(getFilePath('recipes.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/recipes', (req, res) => {
  fs.writeFile(getFilePath('recipes.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    require('./utils/pushToGithub');
    res.sendStatus(200);
  });
});

// Voyages
app.get('/api/voyages', (req, res) => {
  fs.readFile(getFilePath('voyages.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/voyages', (req, res) => {
  fs.writeFile(getFilePath('voyages.json'), JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    require('./utils/pushToGithub');
    res.sendStatus(200);
  });
});


app.post('/backup', (req, res) => {
  const backupScript = path.join(__dirname, 'utils', 'pushToGithub.js');
  try {
    require(backupScript);
    res.send("✅ Backup lancé !");
  } catch (err) {
    res.status(500).send("❌ Échec backup : " + err.message);
  }
});


// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
