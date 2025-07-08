const { execSync } = require('child_process');
const path = require('path');

const repoPath = path.resolve(__dirname, '..'); // Assuming root folder

function pushToGithub(token, callback) {
  try {
    const remoteUrl = `https://${token}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });
    execSync('git add .', { cwd: repoPath });
    execSync('git commit -m "✅ Auto-push depuis Render"', { cwd: repoPath });
    execSync('git push origin main', { cwd: repoPath });

    callback(null, '✅ Push réussi');
  } catch (err) {
    callback(err, null);
  }
}

module.exports = pushToGithub;
