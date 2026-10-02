const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/TableCircle.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/text=\{shape\.name[\s\S]*?\}/, 'text={shape.name || `Table ${shape.number}`}');
code = code.replace(/const newName = window\.prompt\('Enter new table name:', shape\.name \|\|[\s\S]*?\);/, 'const newName = window.prompt("Enter new table name:", shape.name || `Table ${shape.number}`);');

fs.writeFileSync(path, code, 'utf8');
