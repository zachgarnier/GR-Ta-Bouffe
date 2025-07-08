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



// === LECTURE DU TOKEN GITHUB ===
let GH_TOKEN = '';

try {
  GH_TOKEN = fs.readFileSync(GH_TOKEN_PATH, 'utf8').trim();
  console.log("✅ Token GitHub lu depuis les secrets");

  const repoPath = __dirname;
  const branch = 'main';
  const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  process.chdir(repoPath);

  try {
    execSync('git status', { stdio: 'ignore' });
    console.log('✅ Repo Git déjà initialisé.');

    // Vérifie si remote 'origin' existe
    try {
      const remotes = execSync('git remote').toString().trim().split('\n');
      if (!remotes.includes('origin')) {
        console.log('🔗 Remote "origin" manquant, ajout en cours...');
        execSync(`git remote add origin ${remoteUrl}`);
        console.log('✅ Remote "origin" ajoutée.');
      } else {
        console.log('✅ Remote "origin" déjà configurée.');
      }
    } catch (err) {
      console.error("❌ Erreur vérif remote origin :", err.message);
    }

  } catch {
    console.log('🔧 Initialisation du repo Git...');
    execSync('git init');
    execSync(`git checkout -b ${branch}`);
    execSync(`git remote add origin ${remoteUrl}`);
    console.log('✅ Remote "origin" ajoutée.');
  }

  // Configuration git globale
  execSync(`git config --global user.email "autobot@example.com"`);
  execSync(`git config --global user.name "Render Backup Bot"`);
  console.log("✅ Git configuré pour push");

} catch (err) {
  console.error("❌ Erreur config GitHub :", err.message);
}

try {
  execSync(`git checkout -B main`); // force la branche main, même en détaché
  console.log('✅ Branche main utilisée.');
} catch (err) {
  console.error("❌ Impossible de passer sur main :", err.message);
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
