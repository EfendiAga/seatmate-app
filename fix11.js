const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/TableCircle.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/updateShape\(\{ \.\.\.shape, name: newName \}\);/g, 'saveHistory();\n                setShape({ ...shape, name: newName });');

fs.writeFileSync(path, code, 'utf8');
