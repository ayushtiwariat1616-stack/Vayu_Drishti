const fs = require('fs');
// glob removed

// I will just use basic recursive readdir
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.jsx')) files.push(name);
    }
  }
  return files;
}

const colorMap = {
  '#2a7a7b': 'rgb(var(--color-teal))',
  '#5a9db5': 'rgb(var(--color-sky))',
  '#4caf8a': 'rgb(var(--color-mint))',
  '#d97706': 'rgb(var(--color-amber))',
  '#c0392b': 'rgb(var(--color-critical))',
  '#5c7a82': 'rgb(var(--color-atmo-muted))',
  'rgba(42,122,123,0.08)': 'rgba(var(--color-teal), 0.08)',
  'rgba(42,122,123,0.15)': 'rgba(var(--color-teal), 0.15)',
  'rgba(42,122,123,0.2)': 'rgba(var(--color-teal), 0.2)',
  'rgba(42,122,123,0.3)': 'rgba(var(--color-teal), 0.3)',
  'rgba(42,122,123,0.4)': 'rgba(var(--color-teal), 0.4)',
  'rgba(42,122,123,0.12)': 'rgba(var(--color-teal), 0.12)',
  'rgba(42,122,123,0.1)': 'rgba(var(--color-teal), 0.1)',
  'rgba(238,243,242,0.8)': 'rgba(var(--color-atmo-bg), 0.8)'
};

const files = getFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [hex, cssVar] of Object.entries(colorMap)) {
    // Escape regex chars
    const regex = new RegExp(hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, cssVar);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
