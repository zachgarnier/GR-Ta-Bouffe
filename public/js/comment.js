document.addEventListener('DOMContentLoaded', function () {
  const commentsList = document.getElementById('comments-list');
  const newCommentBtn = document.getElementById('new-comment-btn');
  const commentFormContainer = document.getElementById('comment-form-container');
  const commentForm = document.getElementById('comment-form');

  loadComments();

  newCommentBtn.addEventListener('click', function () {
    commentFormContainer.style.display = commentFormContainer.style.display === 'none' ? 'block' : 'none';
  });

  commentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const text = document.getElementById('comment-text').value;
    const password = document.getElementById('comment-password').value;

    if (!text || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('../api/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, password }),
      });

      if (response.ok) {
        loadComments();
        commentForm.reset();
        commentFormContainer.style.display = 'none';
      } else {
        alert(await response.text());
      }
    } catch (err) {
      alert("Erreur lors de l'ajout du commentaire");
    }
  });

  async function loadComments() {
    try {
      const response = await fetch('../api/comments');
      const comments = await response.json();
      commentsList.innerHTML = '';

      if (!comments.length) {
        commentsList.innerHTML = '<p>Aucun commentaire pour le moment.</p>';
        return;
      }

      comments.forEach((comment, index) => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';

        const date = comment.date ? new Date(comment.date).toLocaleString() : 'Date inconnue';

        commentDiv.innerHTML = `
          <p><strong>Commentaire :</strong> ${comment.text}</p>
          <p><small><em>Posté le : ${date}</em></small></p>

          <button class="edit-btn" data-index="${index}">Modifier</button>
          <button class="delete-btn" data-index="${index}">Supprimer</button>

          <div class="edit-form" id="edit-form-${index}" style="display: none;">
            <textarea id="edit-text-${index}" rows="3">${comment.text}</textarea><br>
            <input type="password" id="edit-password-${index}" placeholder="Mot de passe" />
            <button class="confirm-edit-btn" data-index="${index}">Enregistrer</button>
          </div>

          <div class="delete-form" id="delete-form-${index}" style="display: none;">
            <input type="password" id="delete-password-${index}" placeholder="Mot de passe" />
            <button class="confirm-delete-btn" data-index="${index}">Confirmer suppression</button>
          </div>
        `;

        commentsList.appendChild(commentDiv);
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const deleteForm = document.getElementById(`delete-form-${index}`);
            // Basculer l'affichage du formulaire
            deleteForm.style.display = deleteForm.style.display === 'none' ? 'block' : 'none';
            // Réinitialiser le champ mot de passe
            document.getElementById(`delete-password-${index}`).value = '';
        });
        });

      document.querySelectorAll('.confirm-delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = this.getAttribute('data-index');
            const password = document.getElementById(`delete-password-${index}`).value;
            const deleteForm = document.getElementById(`delete-form-${index}`);

            if (!password) {
            alert('Veuillez entrer le mot de passe');
            return;
            }

            try {
            const response = await fetch('../api/delete-comment', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, password }),
            });
            
            if (response.ok) {
                loadComments();
            } else {
                const error = await response.text();
                alert(`Erreur: ${error}`);
                // Masquer le formulaire de suppression en cas d'erreur
                deleteForm.style.display = 'none';
            }
            } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression du commentaire');
            // Masquer le formulaire de suppression en cas d'erreur
            deleteForm.style.display = 'none';
            }
        });
        });

      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const editForm = document.getElementById(`edit-form-${index}`);
            // Basculer l'affichage du formulaire
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
            // Réinitialiser le champ mot de passe
            document.getElementById(`edit-password-${index}`).value = '';
        });
        });

      document.querySelectorAll('.confirm-edit-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = this.getAttribute('data-index');
            const newText = document.getElementById(`edit-text-${index}`).value;
            const password = document.getElementById(`edit-password-${index}`).value;
            const editForm = document.getElementById(`edit-form-${index}`);

            //if (!newText || !password) {
            //alert('Veuillez remplir tous les champs');
            //return;
            //}

            try {
            const response = await fetch('../api/edit-comment', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, newText, password }),
            });
            
            if (response.ok) {
                loadComments();
            } else {
                const error = await response.text();
                alert(`Erreur: ${error}`);
                // Masquer le formulaire d'édition en cas d'erreur
                editForm.style.display = 'none';
            }
            } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du commentaire');
            // Masquer le formulaire d'édition en cas d'erreur
            editForm.style.display = 'none';
            }
        });
        });


    } catch (err) {
      commentsList.innerHTML = '<p>Erreur lors du chargement des commentaires</p>';
    }
  }
});
