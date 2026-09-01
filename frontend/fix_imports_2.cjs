const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix EventStream -> LiveEventStream
    content = content.replace(/components\/ui\/EventStream/g, 'components/system/LiveEventStream');
    content = content.replace(/EventStream/g, 'LiveEventStream');
    
    // Fix utils/time -> utils/formatters
    content = content.replace(/components\/utils\/time/g, 'utils/formatters');
    
    fs.writeFileSync(filePath, content);
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            fixImports(fullPath);
        }
    });
}

walk(srcDir);
console.log('Imports fixed part 2.');
