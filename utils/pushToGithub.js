const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = function pushToGithub(GH_TOKEN, callback) {
  const repoPath = path.resolve(__dirname, '..');
  const branch = 'main';
  const message = `Backup auto @ ${new Date().toISOString()}`;
  const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  try {
    // 📦 Initialise le repo Git si nécessaire
    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
      console.log("📦 Initialisation du dépôt Git");
      execSync('git init', { cwd: repoPath });
    }

    // 🧑‍💼 Configuration de l'auteur Git
    execSync(`git config user.email "autobot@example.com"`, { cwd: repoPath });
    execSync(`git config user.name "Render Backup Bot"`, { cwd: repoPath });

    // 🔗 Ajout du remote si absent
    try {
      execSync('git remote get-url origin', { cwd: repoPath });
    } catch {
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: repoPath });
      console.log('✅ Remote origin ajoutée');
    }

    // 🔄 Mise à jour de l’URL du remote (toujours)
    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });

    // 🧠 Forcer la branche main (même détaché)
    execSync(`git checkout -B ${branch}`, { cwd: repoPath });

    // 📥 Ajout des fichiers
    execSync('git add .', { cwd: repoPath });

    // ✅ Commit (vide si aucun changement détecté)
    try {
      execSync('git diff --cached --quiet', { cwd: repoPath }); // retourne 1 si modif
      execSync(`git commit --allow-empty -m ${JSON.stringify(message)}`, { cwd: repoPath });
    } catch {
      execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: repoPath });
    }

    // 🚀 Push vers GitHub
    execSync(`git push --force origin ${branch}`, { cwd: repoPath });

    callback(null, '✅ Push Git réussi !');
  } catch (err) {
    callback(err, err.stderr?.toString() || err.message || err);
  }
};
