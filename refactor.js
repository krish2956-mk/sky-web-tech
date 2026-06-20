import fs from 'fs';
import path from 'path';

const files = [
  'src/components/ClientDashboard.jsx',
  'src/components/AdminDashboard.jsx',
  'src/components/AuthPage.jsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { API_URL } from '../config.js';") && !content.includes("import { API_URL }")) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + "import { API_URL } from '../config.js';\n" + content.slice(endOfLastImport + 1);
  }

  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_URL}$1`');
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_URL}$1`');
  content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
  content = content.replace(/io\(`\$\{API_URL\}`\)/g, 'io(API_URL)');

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${file}`);
});
