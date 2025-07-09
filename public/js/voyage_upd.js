const API_VOYAGES = '/api/voyages';
const API_RECIPES = '/api/recipes';

let voyageIndex = null;
let voyageData = null;
let allRecipes = [];
let jourIndexCourant = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Récupère index
  const params = new URLSearchParams(window.location.search);
  voyageIndex = params.get('index');

  // Charge voyages et recettes
  const [voyages, recipes] = await Promise.all([
    fetch(API_VOYAGES).then(r => r.json()),
    fetch(API_RECIPES).then(r => r.json())
  ]);

  allRecipes = recipes;

  // Initialise voyage
  voyageData = voyageIndex !== null ? voyages[voyageIndex] : {
    titre: '',
    description: '',
    dateDepart: '',
    dateFin: '',
    jours: []
  };
  

  // Remplit les champs
  document.getElementById('titreVoyage').value = voyageData.titre || '';
  document.getElementById('descriptionVoyage').value = voyageData.description || '';
  document.getElementById('dateDepart').value = voyageData.dateDepart || '';
  document.getElementById('dateFin').value = voyageData.dateFin || '';

  document.getElementById('commentairesVoyage').value = voyageData.commentaires || '';

  // Initialise les extras
  document.getElementById('barsInput').value = voyageData.barresParPersonneParJour || 0;
  document.getElementById('barWeightInput').value = voyageData.grammeParBarre || 30;
  document.getElementById('barKcalInput').value = voyageData.kcalParBarre || 100;
  document.getElementById('useBars').checked = (voyageData.barresParPersonneParJour || 0) > 0;
  toggleBarFields(document.getElementById('useBars').checked);

  document.getElementById('snacksInput').value = voyageData.snacksParPersonneParJour || 0;
  document.getElementById('snackKcalInput').value = voyageData.kcalParSnacks || 400;
  document.getElementById('useSnacks').checked = (voyageData.snacksParPersonneParJour || 0) > 0;
  toggleSnackFields(document.getElementById('useSnacks').checked);

  // Fonction pour mettre à jour les libellés
  const updateLabels = () => {
    const useBars = document.getElementById('useBars').checked;
    const useSnacks = document.getElementById('useSnacks').checked;
    
    document.getElementById('barsLabel').textContent = 
      useBars ? 'Barres par personne / jour' : 'Barres';
    
    document.getElementById('snacksLabel').textContent = 
      useSnacks ? 'Snacks par personne / jour (en grammes)' : 'Snacks';
  };

  // Écouteurs d'événements pour les cases à cocher
  document.getElementById('useBars').onchange = function() {
    toggleBarFields(this.checked);
    updateLabels(); // Mise à jour du libellé
    if (!this.checked) {
      document.getElementById('barsInput').value = 0;
      document.getElementById('barWeightInput').value = 30;
      document.getElementById('barKcalInput').value = 100;
    }
  };

  document.getElementById('useSnacks').onchange = function() {
    toggleSnackFields(this.checked);
    updateLabels(); // Mise à jour du libellé
    if (!this.checked) {
      document.getElementById('snacksInput').value = 0;
      document.getElementById('snackKcalInput').value = 400;
    }
  };

  // Initialisation des libellés
  updateLabels();

  document.getElementById('dateDepart').addEventListener('input', updateJoursSelonDates);
  document.getElementById('dateFin').addEventListener('input', updateJoursSelonDates);






  document.getElementById('saveBtn').onclick = async () => {
    // Met à jour voyageData
    voyageData.titre = document.getElementById('titreVoyage').value.trim();
    voyageData.description = document.getElementById('descriptionVoyage').value.trim();
    voyageData.dateDepart = document.getElementById('dateDepart').value;
    voyageData.dateFin = document.getElementById('dateFin').value;
    voyageData.commentaires = document.getElementById('commentairesVoyage').value.trim();

    // Gestion des barres
    if (document.getElementById('useBars').checked) {
      voyageData.barresParPersonneParJour = parseInt(document.getElementById('barsInput').value) || 0;
      voyageData.grammeParBarre = parseInt(document.getElementById('barWeightInput').value) || 30;
      voyageData.kcalParBarre = parseInt(document.getElementById('barKcalInput').value) || 100;
    } else {
      voyageData.barresParPersonneParJour = 0;
      voyageData.grammeParBarre = 0;
      voyageData.kcalParBarre = 0;
    }

    // Gestion des snacks
    if (document.getElementById('useSnacks').checked) {
      voyageData.snacksParPersonneParJour = parseInt(document.getElementById('snacksInput').value) || 0;
      voyageData.kcalParSnacks = parseInt(document.getElementById('snackKcalInput').value) || 400;
    } else {
      voyageData.snacksParPersonneParJour = 0;
      voyageData.kcalParSnacks = 0;
    }


    // Enregistre
    const voyages = await fetch(API_VOYAGES).then(r => r.json());
    if (voyageIndex !== null) {
      voyages[voyageIndex] = voyageData;
    } else {
      voyages.push(voyageData);
    }

    await fetch(API_VOYAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voyages, null, 2)
    });

    alert('Voyage sauvegardé avec succès');
    window.location.href = 'voyages.html';
  };

  document.getElementById('deleteBtn').onclick = async () => {
    if (!confirm('Confirmer la suppression du voyage ?')) return;
    if (voyageIndex === null) return alert('Ce voyage n’est pas enregistré.');

    const voyages = await fetch(API_VOYAGES).then(r => r.json());
    voyages.splice(voyageIndex, 1);
    await fetch(API_VOYAGES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voyages, null, 2)
    });

    alert('Voyage supprimé.');
    window.location.href = 'voyages.html';
  };

  renderDays();
});

// Fonctions helper existantes
function toggleBarFields(show) {
  document.getElementById('barsInput').style.display = show ? 'inline-block' : 'none';
  document.getElementById('barDetailsSpan').style.display = show ? 'inline-block' : 'none';
}

function toggleSnackFields(show) {
  document.getElementById('snacksInput').style.display = show ? 'inline-block' : 'none';
  document.getElementById('snackKcalSpan').style.display = show ? 'inline-block' : 'none';
}

function renderDays() {
  const container = document.getElementById('listeJournees');
  container.innerHTML = '';

  (voyageData.jours || []).forEach((jour, jourIndex) => {
      const div = document.createElement('div');
      div.classList.add('day');

      // Titre jour avec nb personnes modifiable
      const titre = document.createElement('h3');
      titre.textContent = `Jour ${jourIndex + 1} pour `;

      const inputNb = document.createElement('input');
      inputNb.type = 'number';
      inputNb.min = 1;
      inputNb.value = jour.nbPersonnes || 1;
      inputNb.style.width = '60px';
      inputNb.oninput = () => {
        voyageData.jours[jourIndex].nbPersonnes = parseInt(inputNb.value) || 1;
      };

      titre.appendChild(inputNb);
      titre.appendChild(document.createTextNode(' personnes'));
      div.appendChild(titre);

      // Recettes
      (jour.recettes || []).forEach((recette, recetteIndex) => {
    const ligne = document.createElement('div');
    ligne.classList.add('recipe-line');

    // Nom recette
    const nom = document.createElement('div');
    nom.textContent = recette.nom;

    // Multiplicateur input
    const multInput = document.createElement('input');
    multInput.type = 'number';
    multInput.min = 0;
    multInput.value = recette.multiplicateur || 1;
    multInput.style.width = '60px';
    multInput.title = 'Multiplicateur pour cette recette';
    multInput.oninput = () => {
      recette.multiplicateur = parseFloat(multInput.value) || 1;
      renderDays(); 
    };



    // Bouton supprimer
    const btnDel = document.createElement('button');
    btnDel.textContent = '✕';
    btnDel.title = 'Supprimer';
    btnDel.style.backgroundColor = '#f88';
    btnDel.style.borderColor = '#f44';
    btnDel.onclick = () => {
      if (confirm(`Supprimer "${recette.nom}" ?`)) {
        voyageData.jours[jourIndex].recettes.splice(recetteIndex, 1);
        renderDays();
      }
    };

    ligne.appendChild(nom);
    ligne.appendChild(multInput);
    ligne.appendChild(btnDel);
    div.appendChild(ligne);
  });


    // Bouton ajouter recette
    const btnAjout = document.createElement('button');
    btnAjout.textContent = '+ Ajouter une recette';
    btnAjout.onclick = () => {
      if (jourIndexCourant === jourIndex) {
        jourIndexCourant = null;
      } else {
        jourIndexCourant = jourIndex;
      }
      renderDays();
    };
    div.appendChild(btnAjout);

    // Formulaire ajout recette
    if (jourIndexCourant === jourIndex) {
      const ajoutDiv = document.createElement('div');
      ajoutDiv.classList.add('ajout-recette');

      const select = document.createElement('select');
      allRecipes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.name;
        opt.textContent = r.name;
        select.appendChild(opt);
      });

      const btnConfirmer = document.createElement('button');
      btnConfirmer.textContent = 'Ajouter';
      btnConfirmer.onclick = () => {
        const nom = select.value;
        if (allRecipes.find(r => r.name === nom)) {
          voyageData.jours[jourIndexCourant].recettes.push({
            nom,
            multiplicateur: 1
          });

          jourIndexCourant = null;
          renderDays();
        }
      };

      const btnAnnuler = document.createElement('button');
      btnAnnuler.textContent = 'Annuler';
      btnAnnuler.onclick = () => {
        jourIndexCourant = null;
        renderDays();
      };

      ajoutDiv.appendChild(select);
      ajoutDiv.appendChild(btnConfirmer);
      ajoutDiv.appendChild(btnAnnuler);
      div.appendChild(ajoutDiv);
    }

    container.appendChild(div);
  });
}


function ouvrirAjoutRecette(jourIndex) {
  jourIndexCourant = jourIndex;
  document.getElementById('ajoutRecetteContainer').style.display = 'block';
}

function ouvrirAjoutRecette(jourIndex) {
  jourIndexCourant = jourIndex;
  renderDays();
}


function calculerNombreDeJours(departStr, finStr) {
  const depart = new Date(departStr);
  const fin = new Date(finStr);
  const diff = (fin - depart) / (1000 * 60 * 60 * 24);
  return isNaN(diff) || diff < 0 ? 0 : Math.floor(diff) + 1;
}


function updateJoursSelonDates() {
  const depart = document.getElementById('dateDepart').value;
  const fin = document.getElementById('dateFin').value;

  const nbJours = calculerNombreDeJours(depart, fin);

  if (nbJours === 0) return;

  // Initialiser le tableau si besoin
  voyageData.jours = voyageData.jours || [];

  const actuel = voyageData.jours.length;

  if (nbJours > actuel) {
    // On ajoute des jours vides
    for (let i = actuel; i < nbJours; i++) {
      voyageData.jours.push({
        nbPersonnes: 1,  // 👈 minimum par défaut
        recettes: []
      });
    }
  } else if (nbJours < actuel) {
    // On retire les jours en trop (y compris leurs recettes)
    voyageData.jours.splice(nbJours);
  }

  renderDays();
}
