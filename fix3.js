const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/SeatingChartApp.tsx';
let code = fs.readFileSync(path, 'utf8');

const startIdx = code.indexOf('const handleAddTable =');
const endIdx = code.indexOf('const handleAddVenueElement =');

const replacement = `const handleAddTable = (shapeType?: Table['tableShape']) => {
    if (editMode === false) {
      toast({
        title: "View-Only Mode",
        description: "Cannot add tables while in view-only mode.",
        variant: "destructive",
      });
      return;
    }
    const currentTableCounter = tableCounterValue;
    
    // SMART PLACEMENT LOGIC
    let nextX = 100;
    let nextY = 100;
    if (baseShapesValue.length > 0) {
      const tables = baseShapesValue.filter(s => s.type === 'table');
      if (tables.length > 0) {
        // Find the right-most table
        const rightMostTable = tables.reduce((prev, current) => (prev.x > current.x) ? prev : current);
        nextX = rightMostTable.x + 180;
        nextY = rightMostTable.y;
        
        // Wrap around if it goes too far right
        if (nextX > 800) {
           nextX = 100;
           nextY = nextY + 180;
        }
      }
    }

    const newTable: Table = {
      id: "table-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      type: "table",
      number: currentTableCounter,
      tableShape: shapeType || 'round',
      x: nextX,
      y: nextY,
      radius: 60,
      width: 120,
      height: 60,
      capacity: 8,
    };
    setBaseShapes((prevShapes) => [...prevShapes, newTable]);
    setTableCounter((prev) => prev + 1);

    toast({
      title: "Table Added",
      description: \`Table \${newTable.number} added.\`,
    });
  };

  `;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync(path, code, 'utf8');
