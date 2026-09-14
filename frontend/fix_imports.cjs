const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // We moved pages one level deeper (e.g. pages/CommandCenter.jsx -> pages/CommandCenter/CommandCenter.jsx)
    // So '../context/AppContext' -> '../../context/AppContext'
    // '../components/' -> '../../components/'
    if (filePath.includes('pages')) {
        content = content.replace(/from '\.\.\//g, "from '../../");
    }

    // App.jsx was moved from src/App.jsx to src/app/App.jsx
    if (filePath.endsWith('App.jsx')) {
        content = content.replace(/from '\.\//g, "from '../");
        content = content.replace(/from '\.\.\/pages/g, "from '../pages");
        // Fix the TopBar to Header rename in imports
        content = content.replace(/TopBar/g, 'Header');
        // Fix AnomalyList and AnomalyDetail to Anomalies/Anomalies and Anomalies/AnomalyInvestigation
        content = content.replace(/AnomalyList/g, 'Anomalies/Anomalies');
        content = content.replace(/AnomalyDetail/g, 'Anomalies/AnomalyInvestigation');
        // Same for others
        content = content.replace(/StationDetail/g, 'Stations/StationDetail');
        content = content.replace(/Stations/g, 'Stations/Stations');
        content = content.replace(/HistoricalAnalysis/g, 'Historical/HistoricalAnalysis');
        content = content.replace(/SimulationLab/g, 'Simulation/SimulationLab');
        content = content.replace(/CommandCenter/g, 'CommandCenter/CommandCenter');
        content = content.replace(/LiveMonitor/g, 'LiveMonitor/LiveMonitor');
    }
    
    // TopBar was renamed to Header
    if (filePath.endsWith('Header.jsx')) {
        content = content.replace(/TopBar/g, 'Header');
    }
    
    // EventStream was renamed to LiveEventStream
    if (filePath.endsWith('LiveEventStream.jsx')) {
        content = content.replace(/EventStream/g, 'LiveEventStream');
    }

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
console.log('Imports fixed.');
