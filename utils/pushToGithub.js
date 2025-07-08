const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoPath = path.resolve(__dirname, '..');
const message = '✅ Auto-push depuis Render';

function pushToGithub(token, callback) {
  const remoteUrl = `https://${token}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  // S'assurer que le repo est bien initialisé
  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    try {
      execSync('git init', { cwd: repoPath });
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: repoPath });
    } catch (e) {
      return callback(e);
    }
  } else {
    try {
      execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });
    } catch (e) {
      return callback(e);
    }
  }

  // Commande complète pour forcer la branche + push
  const gitCommand = `
    git checkout -B main &&
    git add data/*.json &&
    git diff --cached --quiet || git commit -m ${JSON.stringify(message)} &&
    git push origin main
  `;

  exec(gitCommand, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Erreur backup GitHub :", stderr.trim());
      return callback(new Error(stderr.trim()));
    }
    console.log("✅ Données poussées sur GitHub :", stdout.trim());
    callback(null, '✅ Push réussi');
  });
}

module.exports = pushToGithub;
