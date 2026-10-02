const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/lib/atoms.ts';
let code = fs.readFileSync(path, 'utf8');

const historyCode = `
export const pastShapesAtom = atom<Shape[][]>([]);
export const futureShapesAtom = atom<Shape[][]>([]);

export const updateBaseShapesAtom = atom(
  null,
  (get, set, newShapes: Shape[] | ((prev: Shape[]) => Shape[])) => {
    const currentShapes = get(baseShapesAtom);
    const nextShapes = typeof newShapes === 'function' ? newShapes(currentShapes) : newShapes;
    
    if (JSON.stringify(currentShapes) !== JSON.stringify(nextShapes)) {
      const past = get(pastShapesAtom);
      set(pastShapesAtom, [...past.slice(-9), currentShapes]);
      set(futureShapesAtom, []);
    }
    
    set(baseShapesAtom, nextShapes);
  }
);

export const undoAtom = atom(
  (get) => get(pastShapesAtom).length > 0,
  (get, set) => {
    const past = get(pastShapesAtom);
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const current = get(baseShapesAtom);
    const future = get(futureShapesAtom);
    set(pastShapesAtom, newPast);
    set(futureShapesAtom, [current, ...future]);
    set(baseShapesAtom, previous);
  }
);

export const redoAtom = atom(
  (get) => get(futureShapesAtom).length > 0,
  (get, set) => {
    const future = get(futureShapesAtom);
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const current = get(baseShapesAtom);
    const past = get(pastShapesAtom);
    set(futureShapesAtom, newFuture);
    set(pastShapesAtom, [...past, current]);
    set(baseShapesAtom, next);
  }
);
`;

code = code + '\n' + historyCode;
fs.writeFileSync(path, code, 'utf8');
