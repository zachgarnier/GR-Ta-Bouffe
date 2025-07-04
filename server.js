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
    res.sendStatus(200);
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
