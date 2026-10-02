const fs = require('fs');
let c = fs.readFileSync('src/hooks/useVenuePersistence.ts', 'utf8');
c = c.replace(/console\.warn\(\s*console\.log\((.*?)\);\s*\)/g, 'console.warn($1);');
c = c.replace(/console\.error\(\s*console\.log\((.*?)\);\s*\)/g, 'console.error($1);');
c = c.replace(/console\.warn\(\s*console\.log\((.*?)\);/g, 'console.warn($1);');
fs.writeFileSync('src/hooks/useVenuePersistence.ts', c);
