const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.{jsx,js}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000/api')) {
    // Replace 'http://localhost:5000/api...' with `${import.meta.env.VITE_API_URL}...`
    content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
    // Replace `http://localhost:5000/api...` with `${import.meta.env.VITE_API_URL}...`
    content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
