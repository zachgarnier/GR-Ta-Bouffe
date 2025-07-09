let currentIndex = null;

  const API_VOYAGES = '/api/voyages';
  const API_RECIPES = '/api/recipes';
  const API_INGREDIENTS = '/api/ingredients';

  let allRecipes = [];
  let allIngredients = [];
  let currentVoyage = null;

  async function main() {
    const params = new URLSearchParams(window.location.search);
    const index = parseInt(params.get('index'));

    currentIndex = index;

    const [voyages, recettes, ingredients] = await Promise.all([
      fetch(API_VOYAGES).then(res => res.json()),
      fetch(API_RECIPES).then(res => res.json()),
      fetch(API_INGREDIENTS).then(res => res.json())
    ]);

    allRecipes = recettes;
    allIngredients = ingredients;
    currentVoyage = voyages[index];

    if (!currentVoyage) {
      document.body.innerHTML = "<p>Voyage introuvable.</p>";
      return;
    }

    document.getElementById('titre').textContent = currentVoyage.titre || '';
    document.getElementById('description').textContent = currentVoyage.description || '';
    document.getElementById('dateDepart').textContent = currentVoyage.dateDepart || '';
    document.getElementById('dateFin').textContent = currentVoyage.dateFin || '';
    document.getElementById('commentaires').textContent = currentVoyage.commentaires || '';


    afficherJours(currentVoyage.jours || []);
    afficherListeCourses(currentVoyage.jours || []);
  }

  function afficherJours(jours) {
    const container = document.getElementById('journees');
    container.innerHTML = '';

    const snacksParPers = currentVoyage.snacksParPersonneParJour || 0;
    const nbBarresParPers = currentVoyage.barresParPersonneParJour || 0;
    const poidsBarre = currentVoyage.grammeParBarre || 0;
    const kcalParBarre = currentVoyage.kcalParBarre || 0;
    const kcalParSnacks = currentVoyage.kcalParSnacks || 0;

    jours.forEach((jour, index) => {
        const div = document.createElement('div');
        div.classList.add('day');
        div.style.marginBottom = '1.5rem';

        const nbPers = jour.nbPersonnes || 0;
        const poidsSnacks = nbPers * snacksParPers;
        const nbBarres = nbPers * nbBarresParPers;
        const poidsBarres = nbBarres * poidsBarre;
        const kcalBarres = nbBarres * kcalParBarre;
        const kcalSnacks = (poidsSnacks / 100) * kcalParSnacks;

        // Initialisation des totaux avec snacks et barres
        let poidsTotalJour = poidsSnacks + poidsBarres;
        let kcalTotalJour = kcalBarres + kcalSnacks;

        // Calcul des totaux pour les recettes
        jour.recettes.forEach(recette => {
            const recetteRef = allRecipes.find(r => r.name === recette.nom);
            const multiplicateur = recette.multiplicateur || 1;

            if (recetteRef?.totalWeight) {
                poidsTotalJour += recetteRef.totalWeight * multiplicateur;
            }
            if (recetteRef?.totalKcal) {
                kcalTotalJour += recetteRef.totalKcal * multiplicateur;
            }
        });

        // En-tête de journée
        const header = document.createElement('div');
        header.classList.add('day-header');
        
        const title = document.createElement('div');
        title.classList.add('day-title');
        title.textContent = `Jour ${index + 1} — ${nbPers} pers.`;
        
        const stats = document.createElement('div');
        stats.classList.add('day-stats');
        stats.textContent = `Total: ${Math.round(poidsTotalJour)}g • ${Math.round(kcalTotalJour)} kcal`;
        
        header.appendChild(title);
        header.appendChild(stats);
        div.appendChild(header);

        // Détails snacks et barres
        const extras = document.createElement('div');
        extras.classList.add('day-extras');
        
        const snacksInfo = document.createElement('div');
        snacksInfo.textContent = `Snacks: ${poidsSnacks}g (${Math.round(kcalSnacks)} kcal)`;
        
        const barsInfo = document.createElement('div');
        barsInfo.textContent = `Barres: ${nbBarres} × ${poidsBarre}g (${Math.round(kcalBarres)} kcal)`;
        
        extras.appendChild(snacksInfo);
        extras.appendChild(barsInfo);
        div.appendChild(extras);

        // Liste des recettes
        jour.recettes.forEach(recette => {
            const recetteRef = allRecipes.find(r => r.name === recette.nom);
            const multiplicateur = recette.multiplicateur || 1;

            const poidsTotal = recetteRef?.totalWeight == null ? NaN : recetteRef.totalWeight * multiplicateur;
            const kcalTotal  = recetteRef?.totalKcal  == null ? NaN : recetteRef.totalKcal  * multiplicateur;

            const poidsAffiche = isNaN(poidsTotal) ? 'NaN' : Math.round(poidsTotal);
            const kcalAffiche = isNaN(kcalTotal) ? 'NaN' : Math.round(kcalTotal);

            const recDiv = document.createElement('div');
            recDiv.classList.add('recipe');

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('recipe-name');
            nameDiv.textContent = `${recette.nom} ${multiplicateur > 1 ? `(${multiplicateur})` : ''}`;

            const statsDiv = document.createElement('div');
            statsDiv.classList.add('recipe-stats');
            statsDiv.textContent = `${poidsAffiche}g • ${kcalAffiche}kcal`;

            recDiv.appendChild(nameDiv);
            recDiv.appendChild(statsDiv);
            div.appendChild(recDiv);
        });

        container.appendChild(div);
    });
}

  // Les autres fonctions (afficherListeCourses, telechargerListeCourses) restent inchangées
  function afficherListeCourses(jours) {
    const container = document.getElementById('listeCourses');
    container.innerHTML = '';

    // Calcul des ingrédients pour les repas
    const ingredientsMap = new Map();
    let totalSnacks = 0;
    let totalBarres = 0;

    const snacksParPers = currentVoyage.snacksParPersonneParJour || 0;
    const nbBarresParPers = currentVoyage.barresParPersonneParJour || 0;

    jours.forEach(jour => {
      const nbPers = jour.nbPersonnes || 0;
      
      // Calcul snacks et barres
      totalSnacks += nbPers * snacksParPers;
      totalBarres += nbPers * nbBarresParPers;

      // Calcul ingrédients repas
      jour.recettes.forEach(recette => {
        const recetteRef = allRecipes.find(r => r.name === recette.nom);
        const mult = recette.multiplicateur || 1;

        if (!recetteRef || !Array.isArray(recetteRef.ingredients)) return;

        recetteRef.ingredients.forEach(ingredient => {
          const nom = ingredient.name;  
          const quantite = ingredient.quantity * mult;  

          if (ingredientsMap.has(nom)) {
            ingredientsMap.set(nom, ingredientsMap.get(nom) + quantite);
          } else {
            ingredientsMap.set(nom, quantite);
          }
        });
      });
    });

    // Affichage REPAS
    const repasTitle = document.createElement('h3');
    repasTitle.textContent = 'REPAS :';
    container.appendChild(repasTitle);

    const ulRepas = document.createElement('ul');
    ingredientsMap.forEach((quantite, nom) => {
      const ingrRef = allIngredients.find(i => i.name === nom);
      const unit = ingrRef?.unit || 'g';

      const li = document.createElement('li');
      li.textContent = `${nom}: ${quantite} ${unit}`;
      ulRepas.appendChild(li);
    });
    container.appendChild(ulRepas);

    // Affichage SNACKS
    if (totalSnacks > 0) {
      const snacksTitle = document.createElement('h3');
      snacksTitle.textContent = 'SNACKS :';
      container.appendChild(snacksTitle);

      const pSnacks = document.createElement('p');
      pSnacks.textContent = `${totalSnacks}g de snacks en tout`;
      container.appendChild(pSnacks);
    }

    // Affichage BARRES
    if (totalBarres > 0) {
      const barresTitle = document.createElement('h3');
      barresTitle.textContent = 'BARRES :';
      container.appendChild(barresTitle);

      const pBarres = document.createElement('p');
      pBarres.textContent = `${totalBarres} barres en tout`;
      container.appendChild(pBarres);
    }
  }

  function telechargerListeCourses() {
    const ingredientsMap = new Map();
    let totalSnacks = 0;
    let totalBarres = 0;

    const snacksParPers = currentVoyage.snacksParPersonneParJour || 0;
    const nbBarresParPers = currentVoyage.barresParPersonneParJour || 0;

    currentVoyage.jours.forEach(jour => {
      const nbPers = jour.nbPersonnes || 0;
      totalSnacks += nbPers * snacksParPers;
      totalBarres += nbPers * nbBarresParPers;

      jour.recettes.forEach(recette => {
        const recetteRef = allRecipes.find(r => r.name === recette.nom);
        const mult = recette.multiplicateur || 1;

        if (!recetteRef || !recetteRef.ingredients) return;

        recetteRef.ingredients.forEach(ingredient => {
          const nom = ingredient.name;
          const quantite = ingredient.quantity * mult;

          if (ingredientsMap.has(nom)) {
            ingredientsMap.set(nom, ingredientsMap.get(nom) + quantite);
          } else {
            ingredientsMap.set(nom, quantite);
          }
        });
      });
    });

    let contenu = `🧺 Liste de courses — ${currentVoyage.titre}\n\n`;
    
    // Section REPAS
    contenu += "REPAS :\n";
    ingredientsMap.forEach((quantite, nom) => {
      const ingrRef = allIngredients.find(i => i.name === nom);
      const unit = ingrRef?.unit || 'g';
      contenu += `- ${nom}: ${quantite} ${unit}\n`;
    });
    
    // Section SNACKS
    if (totalSnacks > 0) {
      contenu += `\nSNACKS :\n${totalSnacks}g de snacks en total\n`;
    }
    
    // Section BARRES
    if (totalBarres > 0) {
      contenu += `\nBARRES :\n${totalBarres} barres en total\n`;
    }

    const blob = new Blob([contenu], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `liste_courses_${currentVoyage.titre.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', main);