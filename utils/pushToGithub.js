function pushToGithub(callback) {
  const message = `Backup auto @ ${new Date().toISOString()}`;
  const token = process.env.GH_TOKEN;
  const remoteUrl = `https://${token}@github.com/zachgarnier/GR-Ta-Bouffe.git`;

  try {
  execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: repoPath });

  execSync('git add .', { cwd: repoPath });

  // Force un commit même si rien n’a changé
  try {
    execSync('git diff --cached --quiet', { cwd: repoPath });
    // Rien à commit => on fait un commit vide pour forcer
    execSync(`git commit --allow-empty -m ${JSON.stringify(message)}`, { cwd: repoPath });
  } catch {
    // Changement détecté => commit normal
    execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: repoPath });
  }

  // Force le push
  execSync('git push --force origin main', { cwd: repoPath });

  callback(null, '✅ Push forcé effectué');
} catch (err) {
  callback(err, err.message);
}

}
