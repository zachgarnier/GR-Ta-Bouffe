const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// GET ingredients
app.get('/api/ingredients', (req, res) => {
  fs.readFile('./data/ingredients.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture');
    res.json(JSON.parse(data || '[]'));
  });
});

// POST ingredients
app.post('/api/ingredients', (req, res) => {
  fs.writeFile('./data/ingredients.json', JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send('Erreur écriture');
    res.sendStatus(200);
  });
});

// même chose pour recipes :
app.get('/api/recipes', (req, res) => {
  fs.readFile('./data/recipes.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture');
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/recipes', (req, res) => {
  fs.writeFile('./data/recipes.json', JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send('Erreur écriture');
    res.sendStatus(200);
  });
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
