const API_ING = '/api/ingredients';
const API_REC = '/api/recipes';

async function fetchIngredients() {
  const res = await fetch(API_ING);
  return await res.json();
}

async function fetchRecipes() {
  const res = await fetch(API_REC);
  return await res.json();
}

async function saveRecipes(recipes) {
  const res = await fetch(API_REC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipes)
  });
  if (!res.ok) alert("Erreur lors de l'enregistrement.");
}

function createIngredientLine(filteredIngredients, ingredient = {}, ingredientLines = []) {
  const line = document.createElement('div');
  line.classList.add('ingredient-line');

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.placeholder = 'Quantité';
  qtyInput.value = ingredient.quantity || '';

  const select = document.createElement('select');

  filteredIngredients.forEach(ing => {
    const opt = document.createElement('option');
    opt.value = ing.name;
    opt.textContent = `${ing.name} (${ing.unit})`;
    if (ingredient.name === ing.name) opt.selected = true;
    select.appendChild(opt);
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';
  delBtn.style.backgroundColor = '#ccc';

  const entry = {
    line,
    getData: () => ({
      name: select.value,
      quantity: parseFloat(qtyInput.value || 0)
    })
  };

  delBtn.onclick = () => {
    const index = ingredientLines.indexOf(entry);
    if (index !== -1) ingredientLines.splice(index, 1);
    line.remove();
  };

  // 👇 Ingrédient d'abord
  line.appendChild(select);
  line.appendChild(qtyInput);
  line.appendChild(delBtn);

  ingredientLines.push(entry);
  return entry;
}


function createRecipeRow(recipe = {}, recipes, index = null, allIngredients = []) {
  const tr = document.createElement('tr');

  const nameInput = document.createElement('input');
  nameInput.value = recipe.name || '';

  const descInput = document.createElement('textarea');
  descInput.rows = 2;
  descInput.value = recipe.description || '';

  const ingredientsDiv = document.createElement('div');
  const ingredientLines = [];

(recipe.ingredients || []).forEach(i => {
  const { line } = createIngredientLine(allIngredients, i, ingredientLines);
  ingredientsDiv.appendChild(line);
});

const addBtn = document.createElement('button');
addBtn.textContent = '+ Ajouter ingrédient';
addBtn.onclick = () => {
  const existingNames = ingredientLines.map(entry => entry.getData().name);

  // 👇 Ne proposer QUE les ingrédients non encore utilisés
  const availableIngredients = allIngredients.filter(
    ing => !existingNames.includes(ing.name)
  );

  if (availableIngredients.length === 0) {
    alert("Tous les ingrédients disponibles ont déjà été ajoutés !");
    return;
  }

  const defaultIngredient = availableIngredients[0];
  const { line } = createIngredientLine(availableIngredients, { name: defaultIngredient.name }, ingredientLines);

  // On insère avant le bouton pour garder l’ordre
  ingredientsDiv.insertBefore(line, addBtn);
};


ingredientsDiv.appendChild(addBtn);

  const tdName = document.createElement('td');
  const tdIngs = document.createElement('td');
  const tdDesc = document.createElement('td');
  const tdSave = document.createElement('td');
  const tdDelete = document.createElement('td');

  tdName.appendChild(nameInput);
  tdIngs.appendChild(ingredientsDiv);
  tdDesc.appendChild(descInput);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Enregistrer';
  saveBtn.classList.add('save');

  saveBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (!name) return alert("Le nom est obligatoire.");

    const ingredients = ingredientLines.map(entry => entry.getData()).filter(i => i.name && i.quantity > 0);

    const existingIndex = recipes.findIndex(r => r.name === name);

    if (index === null && existingIndex !== -1) {
      return alert("Une recette avec ce nom existe déjà.");
    }

    const newRecipe = { name, description, ingredients };

    if (index === null) {
      recipes.push(newRecipe);
    } else {
      recipes[index] = newRecipe;
    }

    await saveRecipes(recipes);
    renderTable();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Supprimer';
  deleteBtn.classList.add('delete');
  deleteBtn.onclick = async () => {
    if (index !== null) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
        recipes.splice(index, 1);
        await saveRecipes(recipes);
        renderTable();
      }
    } else {
  nameInput.value = '';
  descInput.value = '';

  // Supprimer toutes les lignes d'ingrédients sauf le bouton
  [...ingredientsDiv.children].forEach(child => {
    if (child !== addBtn) child.remove();
  });

  // Réinitialiser le tableau des entrées
  ingredientLines.length = 0;
}
  };

  tdSave.appendChild(saveBtn);
  tdDelete.appendChild(deleteBtn);

  tr.appendChild(tdName);
  tr.appendChild(tdIngs);
  tr.appendChild(tdDesc);
  tr.appendChild(tdSave);
  tr.appendChild(tdDelete);

  return tr;
}

async function renderTable() {
  const tbody = document.querySelector('#recipeTable tbody');
  tbody.innerHTML = '';

  const [allIngredients, recipes] = await Promise.all([
    fetchIngredients(),
    fetchRecipes()
  ]);

  recipes.forEach((recipe, index) => {
    const row = createRecipeRow(recipe, recipes, index, allIngredients);
    tbody.appendChild(row);
  });

  const emptyRow = createRecipeRow({}, recipes, null, allIngredients);
  tbody.appendChild(emptyRow);
}

document.addEventListener('DOMContentLoaded', renderTable);
