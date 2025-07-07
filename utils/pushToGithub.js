function pushToGithub(callback) {
  const message = `Backup auto @ ${new Date().toISOString()}`;
  const token = process.env.GH_TOKEN;
  const remoteUrl = `https://${token}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  try {
    execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });
    execSync('git add .', { cwd: repoPath });
    execSync('git commit -m ' + JSON.stringify(message), { cwd: repoPath });
    execSync('git push origin main', { cwd: repoPath });
    callback(null, '✅ Push réussi');
  } catch (err) {
    callback(err, err.message);
  }
}
