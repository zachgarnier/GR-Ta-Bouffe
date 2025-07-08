const { execSync } = require('child_process');
const path = require('path');

module.exports = function pushToGithub(GH_TOKEN, callback) {
  const repoPath = path.resolve(__dirname, '..');
  const branch = 'main';
  const message = `Backup auto @ ${new Date().toISOString()}`;
  const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  try {
    // Configuration de l'auteur Git
    execSync(`git config user.email "autobot@example.com"`, { cwd: repoPath });
    execSync(`git config user.name "Render Backup Bot"`, { cwd: repoPath });

    // Si 'origin' n'existe pas, on l'ajoute
    try {
      execSync('git remote get-url origin', { cwd: repoPath });
    } catch {
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: repoPath });
      console.log('✅ Remote origin ajoutée');
    }

    // On met à jour l'URL d'origine à chaque appel pour être sûr
    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });

    // On ajoute tous les fichiers
    execSync('git add .', { cwd: repoPath });

    // Vérifie s’il y a des changements à commit
    try {
      execSync('git diff --cached --quiet', { cwd: repoPath });
      // Aucun changement => commit vide forcé (optionnel)
      execSync(`git commit --allow-empty -m ${JSON.stringify(message)}`, { cwd: repoPath });
    } catch {
      // Changement détecté => commit normal
      execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: repoPath });
    }

    // Push forcé (⚠️ uniquement si tu veux forcer la réécriture)
    execSync(`git push --force origin ${branch}`, { cwd: repoPath });

    callback(null, '✅ Push Git réussi !');
  } catch (err) {
    callback(err, err.stderr?.toString() || err.message || err);
  }
};
