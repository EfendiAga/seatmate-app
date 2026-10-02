const fs = require('fs');
let c = fs.readFileSync('src/hooks/useVenuePersistence.ts', 'utf8');
c = c.replace(/(\s*)([`"'])Persistence Hook:(.*?)\2,\n\s*\);/g, '$1console.log($2Persistence Hook:$3$2);');
fs.writeFileSync('src/hooks/useVenuePersistence.ts', c);

let p = fs.readFileSync('server/package.json', 'utf8');
p = p.replace('npx ts-node-dev', 'npx tsx watch');
fs.writeFileSync('server/package.json', p);
