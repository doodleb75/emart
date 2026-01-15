const fs = require('fs');
const path = 'c:\\emart-everyday\\index.html';
let content = fs.readFileSync(path, 'utf8');

// Regex for Folder icon based on its unique path data
const folderRegex = /<svg[\s\S]*?M8\.33329 3\.33301H3\.33329[\s\S]*?<\/svg>/g;
content = content.replace(folderRegex, '<i class="icon-folder"></i>');

// Regex for Megaphone icon
const megaphoneRegex = /<svg[\s\S]*?M15 9\.16634V10\.833H18\.3333V9\.16634H15[\s\S]*?<\/svg>/g;
content = content.replace(megaphoneRegex, '<i class="icon-megaphone"></i>');

fs.writeFileSync(path, content);
console.log('Robust replacement done.');
