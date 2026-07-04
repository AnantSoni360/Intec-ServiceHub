import fs from 'fs';
import path from 'path';

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000/api')) {
        content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
        content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

traverseAndReplace('./src');
