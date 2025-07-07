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
  document.getElementById('dateDepart').addEventListener('input', updateJoursSelonDates);
  document.getElementById('dateFin').addEventListener('input', updateJoursSelonDates);




  document.getElementById('saveBtn').onclick = async () => {
    // Met à jour voyageData
    voyageData.titre = document.getElementById('titreVoyage').value.trim();
    voyageData.description = document.getElementById('descriptionVoyage').value.trim();
    voyageData.dateDepart = document.getElementById('dateDepart').value;
    voyageData.dateFin = document.getElementById('dateFin').value;

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

function renderDays() {
  const container = document.getElementById('listeJournees');
  container.innerHTML = '';

  (voyageData.jours || []).forEach((jour, jourIndex) => {
    const div = document.createElement('div');
    div.classList.add('jour');

    const titre = document.createElement('h3');
    titre.textContent = `Jour ${jourIndex + 1}`;

    const btnAjout = document.createElement('button');
    btnAjout.textContent = '+ Ajouter recette';
    btnAjout.onclick = () => ouvrirAjoutRecette(jourIndex);

    titre.appendChild(btnAjout);
    div.appendChild(titre);

    (jour.recettes || []).forEach((recette, recetteIndex) => {
      const ligne = document.createElement('div');
      ligne.classList.add('recette');

      const nom = document.createElement('div');
      nom.textContent = recette.nom;

      const mult = document.createElement('input');
      mult.type = 'number';
      mult.min = 1;
      mult.value = recette.multiplicateur || 1;
      mult.oninput = () => {
        recette.multiplicateur = parseInt(mult.value);
      };

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
      ligne.appendChild(mult);
      ligne.appendChild(btnDel);
      div.appendChild(ligne);
    });

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
      voyageData.jours.push({ recettes: [] });
    }
  } else if (nbJours < actuel) {
    // On retire les jours en trop (y compris leurs recettes)
    voyageData.jours.splice(nbJours);
  }

  renderDays();
}
