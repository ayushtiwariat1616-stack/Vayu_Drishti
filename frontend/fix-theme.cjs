const fs = require('fs');

const tailwindConfigPath = 'tailwind.config.js';
const globalsCssPath = 'src/styles/globals.css';

const updateTailwind = () => {
  let content = fs.readFileSync(tailwindConfigPath, 'utf8');
  content = content.replace(/'var\(--color-([a-zA-Z0-9-]+)\)'/g, "'rgb(var(--color-$1) / <alpha-value>)'");
  fs.writeFileSync(tailwindConfigPath, content);
};

const updateGlobals = () => {
  let content = fs.readFileSync(globalsCssPath, 'utf8');
  
  // Replace all hex codes with RGB values inside :root and .dark
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r} ${g} ${b}`;
  };

  content = content.replace(/--color-([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{3,6});/g, (match, name, hex) => {
    return `--color-${name}: ${hexToRgb(hex)};`;
  });

  fs.writeFileSync(globalsCssPath, content);
};

updateTailwind();
updateGlobals();
console.log('Done mapping themes to rgb format!');
