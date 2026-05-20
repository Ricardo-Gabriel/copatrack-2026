const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/stickers.json', 'utf8'));
let imports = '';
let mapping = 'export const FLAG_IMAGES: Record<string, string> = {\n';

data.forEach((team, i) => {
  if (team.flag && team.flag.startsWith('/src/assets/Flags/')) {
    const file = team.flag.split('/').pop();
    const name = 'f' + i;
    imports += `import ${name} from '../assets/Flags/${file}';\n`;
    mapping += `  '${team.flag}': ${name},\n`;
  }
});

fs.writeFileSync('./src/data/flags.ts', imports + '\n' + mapping + '};\n');
