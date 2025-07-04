const { exec } = require('child_process');
const path = require('path');

const message = `Backup auto @ ${new Date().toISOString()}`;

exec(`
  git status &&
  git add data/*.json &&
  git diff --cached --quiet || git commit -m ${JSON.stringify(message)} &&
  git push origin main
`, 
{
  cwd: path.resolve(__dirname, '..'), // revient au dossier racine du projet
}, 
(err, stdout, stderr) => {
  if (err) {
    console.error("❌ Erreur backup GitHub :", stderr.trim());
  } else {
    console.log("✅ Données poussées sur GitHub :", stdout.trim());
  }
});
