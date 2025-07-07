const API_URL = '/api/ingredients';

async function fetchIngredients() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function saveIngredientsToServer(ingredients) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredients)
  });
  if (!res.ok) alert("Erreur lors de l'enregistrement.");
}

function createRow({ name = '', unit = '', description = '', gramsPerUnit = '' } = {}, ingredients, index = null) {
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

  const tdName = document.createElement('td');
  const tdUnit = document.createElement('td');
  const tdDesc = document.createElement('td');
  const tdGrams = document.createElement('td');
  const tdSave = document.createElement('td');
  const tdDelete = document.createElement('td');

  tdName.appendChild(nameInput);
  tdUnit.appendChild(unitInput);
  tdDesc.appendChild(descInput);
  tdGrams.appendChild(gramsInput);


  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Enregistrer';
  saveBtn.classList.add('save');

  saveBtn.onclick = async () => {
    const newName = nameInput.value.trim();
    const newUnit = unitInput.value.trim();
    const newDesc = descInput.value.trim();
    const newGrams = gramsInput.value.trim();

    if (!newName) {
      alert("Le nom est obligatoire.");
      return;
    }

    const existingIndex = ingredients.findIndex(i => i.name === newName);

    if (index === null) {
      if (existingIndex !== -1) {
        alert("Un ingrédient avec ce nom existe déjà.");
        return;
      }
      ingredients.push({
      name: newName,
      unit: newUnit,
      description: newDesc,
      gramsPerUnit: newGrams ? Number(newGrams) : ''
    });
    } else {
      // Si le nom a changé ET qu’un autre ingrédient porte déjà ce nouveau nom
      if (newName !== ingredients[index].name && existingIndex !== -1) {
        alert("Un autre ingrédient a déjà ce nom.");
        return;
      }
      ingredients[index] = {
      name: newName,
      unit: newUnit,
      description: newDesc,
      gramsPerUnit: newGrams ? Number(newGrams) : ''
    };
    }

    await saveIngredientsToServer(ingredients);
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
