const fs = require('fs');
const files = [
  'W:/Wedding Planner/seatmate/src/components/CanvasStage.tsx',
  'W:/Wedding Planner/seatmate/src/components/RenameElementModal.tsx',
  'W:/Wedding Planner/seatmate/src/components/SeatingChartApp.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf8');
  
  code = code.replace(/useSetAtom\(baseShapesAtom,\s*updateBaseShapesAtom\)/g, 'useSetAtom(updateBaseShapesAtom)');
  code = code.replace(/useAtom\(baseShapesAtom,\s*updateBaseShapesAtom\)/g, 'useAtom(baseShapesAtom)');
  
  fs.writeFileSync(path, code, 'utf8');
});
