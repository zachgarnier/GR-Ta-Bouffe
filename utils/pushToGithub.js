// utils/pushToGithub.js
const { exec } = require('child_process');
const path = require('path');

module.exports = function pushToGithub(GH_TOKEN, callback) {
  const repoPath = path.resolve(__dirname, '..');
  const remoteUrl = `https://${GH_TOKEN}@github.com/zachgarnier/GR-Ta-Bouffe.git`;
  const message = `Backup auto @ ${new Date().toISOString()}`;

  const cmd = `
    git remote set-url origin "${remoteUrl}" &&
    git checkout -B main &&
    git add data/*.json &&
    git diff --cached --quiet || git commit -m ${JSON.stringify(message)} &&
    git push origin main
  `;

  exec(cmd, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Erreur backup GitHub :", stderr.trim());
      return callback(err);
    } else {
      console.log("✅ Données poussées sur GitHub :", stdout.trim());
      return callback(null, '✅ Push Git réussi !');
    }
  });
};
