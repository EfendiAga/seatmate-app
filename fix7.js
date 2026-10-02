const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/Header.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add lucide imports
code = code.replace(/import \{([\s\S]*?)Moon,/, 'import { Undo2, Redo2, $1Moon,');

// 2. Add jotai imports
if (!code.includes('undoAtom')) {
  code = code.replace(/eventTitleAtom,/, 'eventTitleAtom, undoAtom, redoAtom,');
}

// 3. Add hooks to Header component
const headerHookAnchor = 'const [eventTitle, setEventTitle] = useAtom(eventTitleAtom);';
if (!code.includes('const [canUndo, undo]')) {
  code = code.replace(headerHookAnchor, `${headerHookAnchor}\n  const [canUndo, undo] = useAtom(undoAtom);\n  const [canRedo, redo] = useAtom(redoAtom);`);
}

// 4. Inject buttons before Reset button
const resetBtnAnchor = '<Button\nvariant="destructive"\nonClick={onReset}';
const undoRedoButtons = `
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        onClick={() => undo()}
        disabled={!canUndo || !editMode}
        className="mr-2"
      >
        <Undo2 size={16} />
      </Button>
    </TooltipTrigger>
    <TooltipContent><p>Undo</p></TooltipContent>
  </Tooltip>
</TooltipProvider>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        onClick={() => redo()}
        disabled={!canRedo || !editMode}
        className="mr-4"
      >
        <Redo2 size={16} />
      </Button>
    </TooltipTrigger>
    <TooltipContent><p>Redo</p></TooltipContent>
  </Tooltip>
</TooltipProvider>

`;

if (!code.includes('<Undo2')) {
  code = code.replace(resetBtnAnchor, undoRedoButtons + resetBtnAnchor);
}

fs.writeFileSync(path, code, 'utf8');
