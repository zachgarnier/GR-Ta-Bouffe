const API_URL = '/api/voyages';

async function fetchVoyages() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function renderTable() {
  const tbody = document.querySelector('#voyageTable tbody');
  tbody.innerHTML = '';

  const voyages = await fetchVoyages();
  console.log(voyages); // 👈 Ajoute cette ligne

  voyages.forEach((voyage, index) => {
    const row = createRow(voyage, index);
    tbody.appendChild(row);
  });
}

function createRow(voyage, index) {
  const tr = document.createElement('tr');

  const tdTitle = document.createElement('td');
  tdTitle.textContent = voyage.titre || '';

  const tdStart = document.createElement('td');
  tdStart.textContent = voyage.dateDepart  || '';

  const tdEnd = document.createElement('td');
  tdEnd.textContent = voyage.dateFin || '';

  const tdDesc = document.createElement('td');
  tdDesc.textContent = voyage.description || '';

  const tdDetail = document.createElement('td');
  const detailBtn = document.createElement('button');
  detailBtn.textContent = 'Détails';
  detailBtn.onclick = () => {
    window.location.href = `voyage_details.html?index=${index}`;
  };
  tdDetail.appendChild(detailBtn);

  const tdModify = document.createElement('td');
  const modifyBtn = document.createElement('button');
  modifyBtn.textContent = 'Modifier';
  modifyBtn.onclick = () => {
    window.location.href = `voyage_upd.html?index=${index}`;
  };
  tdModify.appendChild(modifyBtn);

  

  tr.appendChild(tdTitle);
  tr.appendChild(tdStart);
  tr.appendChild(tdEnd);
  tr.appendChild(tdDesc);
  tr.appendChild(tdDetail);
  tr.appendChild(tdModify);

  return tr;
}

async function renderTable() {
  const tbody = document.querySelector('#voyageTable tbody');
  tbody.innerHTML = '';

  const voyages = await fetchVoyages();

  voyages.forEach((voyage, index) => {
    const row = createRow(voyage, index);
    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();

  document.getElementById('addBtn').addEventListener('click', () => {
    window.location.href = 'voyage_upd.html';
  });
});
