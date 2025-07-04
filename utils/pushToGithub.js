const { exec } = require('child_process');
const path = require('path');

const message = `Backup auto @ ${new Date().toISOString()}`;

exec(`
  git add data/*.json &&
  git commit -m ${JSON.stringify(message)} &&
  git push origin main
`, { cwd: path.resolve(__dirname, '..') }, (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Erreur backup GitHub :", stderr);
  } else {
    console.log("✅ Données poussées sur GitHub :", stdout);
  }
});
