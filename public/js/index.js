function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336'; // vert ou rouge
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // disparaît après 3 secondes
}

document.getElementById('gitForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('gitPassword').value;

  showToast('⏳ Sauvegarde en cours...', true);

  try {
    const res = await fetch('/api/git-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      showToast('✅ Sauvegarde réussie !', true);
    } else {
      const msg = await res.text();
      showToast(`❌ ${msg}`, false);
    }
  } catch (err) {
    showToast('❌ Erreur de connexion au serveur.', false);
  }
});