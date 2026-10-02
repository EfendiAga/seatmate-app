const fs = require('fs');

// 1. Add saveHistoryAtom to atoms.ts
let atomsPath = 'W:/Wedding Planner/seatmate/src/lib/atoms.ts';
let atomsCode = fs.readFileSync(atomsPath, 'utf8');
if (!atomsCode.includes('saveHistoryAtom')) {
  const saveHistoryCode = `
export const saveHistoryAtom = atom(
  null,
  (get, set) => {
    const currentShapes = get(baseShapesAtom);
    const past = get(pastShapesAtom);
    if (past.length > 0 && JSON.stringify(past[past.length - 1]) === JSON.stringify(currentShapes)) {
       return;
    }
    set(pastShapesAtom, [...past.slice(-9), currentShapes]);
    set(futureShapesAtom, []);
  }
);
`;
  atomsCode = atomsCode + '\n' + saveHistoryCode;
  fs.writeFileSync(atomsPath, atomsCode, 'utf8');
}

// 2. Inject saveHistory into TableCircle.tsx
let tablePath = 'W:/Wedding Planner/seatmate/src/components/TableCircle.tsx';
let tableCode = fs.readFileSync(tablePath, 'utf8');

// Add import
tableCode = tableCode.replace(/import\s*\{(.*?)\}\s*from\s*["']@\/lib\/atoms["'];/, (match, p1) => {
  if (!p1.includes('saveHistoryAtom')) {
    return match.replace(p1, p1 + ', saveHistoryAtom');
  }
  return match;
});

// Add hook inside component
const hookAnchor = 'const [shape, setShape] = useAtom(shapeAtom);';
if (!tableCode.includes('const saveHistory = useSetAtom(saveHistoryAtom);')) {
  tableCode = tableCode.replace(hookAnchor, `${hookAnchor}\n  const saveHistory = useSetAtom(saveHistoryAtom);`);
}

// Intercept setShape
tableCode = tableCode.replace(/setShape\(\{/g, 'saveHistory();\n    setShape({');

// But handleCapacityChange does `setShape(prev => ...)`
// Let's replace setShape(prev => { with saveHistory(); setShape(prev => {
tableCode = tableCode.replace(/setShape\(\(prev\) =>/g, 'saveHistory();\n    setShape((prev) =>');

fs.writeFileSync(tablePath, tableCode, 'utf8');
