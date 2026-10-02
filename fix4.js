const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/TableCircle.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update limits
code = code.replace(/const MIN_CAPACITY = \d+;/, 'const MIN_CAPACITY = 0;');
code = code.replace(/const MAX_CAPACITY = \d+;/, 'const MAX_CAPACITY = 1000;');

// Update minus button onClick/onTap
code = code.replace(/onClick=\{\(\) => handleCapacityChange\(-1\)\}/g, 'onClick={(e) => { e.cancelBubble = true; handleCapacityChange(-1); }}');
code = code.replace(/onTap=\{\(\) => handleCapacityChange\(-1\)\}/g, 'onTap={(e) => { e.cancelBubble = true; handleCapacityChange(-1); }}');

// Update plus button onClick/onTap
code = code.replace(/onClick=\{editMode \? \(\) => handleCapacityChange\(1\) : undefined\}/g, 'onClick={editMode ? (e) => { e.cancelBubble = true; handleCapacityChange(1); } : undefined}');
code = code.replace(/onTap=\{editMode \? \(\) => handleCapacityChange\(1\) : undefined\}/g, 'onTap={editMode ? (e) => { e.cancelBubble = true; handleCapacityChange(1); } : undefined}');

fs.writeFileSync(path, code, 'utf8');
