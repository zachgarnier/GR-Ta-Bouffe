const API_URL = '/api/ingredients';
const API_RECIPES = '/api/recipes';


async function fetchIngredients() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function fetchRecipes() {
  const res = await fetch(API_RECIPES);
  return await res.json();
}

async function saveIngredientsToServer(ingredients) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredients)
  });
  return res.ok;
}

async function saveRecipes(recipes) {
  const res = await fetch(API_RECIPES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipes)
  });
  return res.ok;
}

async function updateRecipesWithModifiedIngredient(oldName, newName, newUnit, newGrams, newKcal) {
  const [recipes, allIngredients] = await Promise.all([
    fetchRecipes(),
    fetchIngredients()
  ]);
  
  let recipesUpdated = false;

  for (const recipe of recipes) {
    if (!recipe.ingredients) continue;

    let needsUpdate = false;
    
    recipe.ingredients = recipe.ingredients.map(ing => {
      // Convertir string en objet si nécessaire
      if (typeof ing === 'string') {
        ing = { name: ing, quantity: 1 };
        needsUpdate = true;
      }
      
      // Si l'ingrédient correspond (ancien ou nouveau nom)
      if (ing.name === oldName) {
        // Créer une copie mise à jour
        const updatedIng = { 
          ...ing, 
          name: newName,
          unit: newUnit,
          gramsPerUnit: newGrams,
          Kcal: newKcal
        };
        
        // Vérifier si une propriété a réellement changé
        if (JSON.stringify(ing) !== JSON.stringify(updatedIng)) {
          needsUpdate = true;
          return updatedIng;
        }
      }
      
      return ing;
    });

    // Recalculer les totaux si modification
    if (needsUpdate) {
      recipesUpdated = true;
      const { totalWeight, totalKcal } = calculateRecipeTotals(recipe, allIngredients);
      recipe.totalWeight = totalWeight;
      recipe.totalKcal = totalKcal;
    }
  }

  if (recipesUpdated) {
    await saveRecipes(recipes);
  }
}

// Fonction helper pour calculer les totaux
function calculateRecipeTotals(recipe, allIngredients) {
  let totalWeight = 0;
  let totalKcal = 0;
  let isValid = true;

  for (const ing of recipe.ingredients) {
    const ingredient = allIngredients.find(i => i.name === ing.name);
    
    if (!ingredient || !ingredient.gramsPerUnit || !ingredient.Kcal) {
      isValid = false;
      continue;
    }

    totalWeight += ing.quantity * ingredient.gramsPerUnit;
    totalKcal += ing.quantity * ingredient.gramsPerUnit * (ingredient.Kcal / 100);
  }

  return {
    totalWeight: isValid ? Math.round(totalWeight) : NaN,
    totalKcal: isValid ? Math.round(totalKcal) : NaN
  };
}

function createRow({ name = '', unit = '', description = '', gramsPerUnit = '', Kcal = '' } = {}, ingredients, index = null) {
  const tr = document.createElement('tr');

  const nameInput = document.createElement('input');
  nameInput.value = name;

  const unitInput = document.createElement('input');
  unitInput.value = unit;

  const descInput = document.createElement('input');
  descInput.value = description;

  const gramsInput = document.createElement('input');
  gramsInput.value = gramsPerUnit || '';
  gramsInput.type = 'number';
  gramsInput.min = '0';
  gramsInput.placeholder = 'ex: 30';

  const kcalInput = document.createElement('input');
  kcalInput.value = Kcal || '';
  kcalInput.type = 'number';
  kcalInput.min = '0';
  kcalInput.placeholder = 'ex: 130';


  const tdName = document.createElement('td');
  const tdUnit = document.createElement('td');
  const tdDesc = document.createElement('td');
  const tdGrams = document.createElement('td');
  const tdKcal = document.createElement('td');
  const tdSave = document.createElement('td');
  const tdDelete = document.createElement('td');

  tdName.appendChild(nameInput);
  tdUnit.appendChild(unitInput);
  tdDesc.appendChild(descInput);
  tdGrams.appendChild(gramsInput);
  tdKcal.appendChild(kcalInput);


  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Enregistrer';
  saveBtn.classList.add('save');

  saveBtn.onclick = async () => {
    const newName = nameInput.value.trim();
    const newUnit = unitInput.value.trim();
    const newGrams = gramsInput.value.trim();
    const newKcal = kcalInput.value.trim();
    const oldName = index !== null ? ingredients[index].name : null;

    if (!newName) {
      alert("Le nom est obligatoire.");
      return;
    }

    // Vérification nom unique
    const existingIndex = ingredients.findIndex(i => i.name === newName && i !== ingredients[index]);
    if (existingIndex !== -1) {
      alert("Un ingrédient avec ce nom existe déjà.");
      return;
    }

    // Sauvegarde de l'ingrédient
    const ingredientData = {
      name: newName,
      unit: newUnit,
      gramsPerUnit: newGrams ? Number(newGrams) : '',
      Kcal: newKcal ? Number(newKcal) : ''
    };

    if (index === null) {
      ingredients.push(ingredientData);
    } else {
      ingredients[index] = ingredientData;
    }

    const saveSuccess = await saveIngredientsToServer(ingredients);
    if (!saveSuccess) {
      alert("Erreur lors de l'enregistrement.");
      return;
    }

    await updateRecipesWithModifiedIngredient(oldName, newName, newUnit, newGrams, newKcal);
    
    renderTable();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Supprimer';
  deleteBtn.classList.add('delete');

  deleteBtn.onclick = async () => {
  if (index === null) {
    nameInput.value = '';
    unitInput.value = '';
    descInput.value = '';
    return;
  }

  const ingredientToDelete = ingredients[index].name;

  // On va chercher toutes les recettes
  const recipesRes = await fetch('/api/recipes');
  const recipes = await recipesRes.json();

  // Vérifie si l'ingrédient est utilisé dans une recette
  const usedInRecipes = recipes.filter(recipe =>
    recipe.ingredients && recipe.ingredients.some(ing =>
      (typeof ing === 'string' && ing === ingredientToDelete) ||
      (typeof ing === 'object' && ing.name === ingredientToDelete)
    )
  );

  if (usedInRecipes.length > 0) {
    alert(`Impossible de supprimer : l'ingrédient est utilisé dans ${usedInRecipes.length} recette(s).`);
    return;
  }

  // Si non utilisé, on peut le supprimer
  ingredients.splice(index, 1);
  await saveIngredientsToServer(ingredients);
  renderTable();
};


  tdSave.appendChild(saveBtn);
  tdDelete.appendChild(deleteBtn);

  tr.appendChild(tdName);
  tr.appendChild(tdUnit);
  tr.appendChild(tdDesc);
  tr.appendChild(tdGrams);
  tr.appendChild(tdKcal);
  tr.appendChild(tdSave);
  tr.appendChild(tdDelete);

  return tr;
}

async function renderTable() {
  const tbody = document.querySelector('#ingredientTable tbody');
  tbody.innerHTML = '';

  const ingredients = await fetchIngredients();

  ingredients.forEach((ingredient, index) => {
    const row = createRow(ingredient, ingredients, index);
    tbody.appendChild(row);
  });

  // Ligne vide en bas
  const emptyRow = createRow({}, ingredients, null);
  tbody.appendChild(emptyRow);
}

document.addEventListener('DOMContentLoaded', renderTable);
