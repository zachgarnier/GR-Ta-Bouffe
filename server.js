const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON du corps des requêtes
app.use(express.json());

// Servir les fichiers statiques depuis /public
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTES API ===

// Lire les ingrédients
app.get('/api/ingredients', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'ingredients.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data));
  });
});

// Écrire les ingrédients
app.post('/api/ingredients', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'ingredients.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    res.sendStatus(200);
  });
});

// Pareil pour les recettes
app.get('/api/recipes', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'recipes.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data));
  });
});

app.post('/api/recipes', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'recipes.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    res.sendStatus(200);
  });
});

// Pareil pour les voyages
app.get('/api/voyages', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'voyages.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture fichier');
    res.json(JSON.parse(data));
  });
});

app.post('/api/voyages', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'voyages.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).send('Erreur écriture fichier');
    res.sendStatus(200);
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
