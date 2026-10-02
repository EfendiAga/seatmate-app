const fs = require('fs');
const files = [
  'W:/Wedding Planner/seatmate/src/components/CanvasStage.tsx',
  'W:/Wedding Planner/seatmate/src/components/RenameElementModal.tsx',
  'W:/Wedding Planner/seatmate/src/components/SeatingChartApp.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Replace the import
  code = code.replace(/baseShapesAtom(?!, updateBaseShapesAtom)/g, 'baseShapesAtom, updateBaseShapesAtom');
  
  // Update setters
  code = code.replace(/useSetAtom\(baseShapesAtom\)/g, 'useSetAtom(updateBaseShapesAtom)');
  
  fs.writeFileSync(path, code, 'utf8');
});
