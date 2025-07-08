const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoPath = path.resolve(__dirname, '..');

function pushToGithub(token, callback) {
  try {
    const remoteUrl = `https://${token}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

    // Sanity check
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      execSync('git init', { cwd: repoPath });
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: repoPath });
    } else {
      execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });
    }

    execSync('git add .', { cwd: repoPath });
    execSync('git commit -m "✅ Auto-push depuis Render"', { cwd: repoPath });
    execSync('git branch -M main', { cwd: repoPath }); // Force branch name
    execSync('git push origin main', { cwd: repoPath });

    callback(null, '✅ Push réussi');
  } catch (err) {
    callback(err, null);
  }
}

module.exports = pushToGithub;
