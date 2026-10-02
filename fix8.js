const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/Header.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

const undoRedoButtons = `
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => undo()}
                  disabled={!canUndo || !editMode}
                  className="mr-2 border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-sm h-10 w-10 p-0 flex items-center justify-center"
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
                  className="mr-4 border-border bg-card hover:bg-accent hover:text-accent-foreground shadow-sm h-10 w-10 p-0 flex items-center justify-center"
                >
                  <Redo2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Redo</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
`;

lines.splice(461, 0, undoRedoButtons);
fs.writeFileSync(path, lines.join('\n'), 'utf8');
