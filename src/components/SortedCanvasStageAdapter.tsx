"use client";
import React, { useMemo } from "react";
import { atom, useAtomValue, PrimitiveAtom } from "jotai";
import { Shape } from "../lib/atoms"; // Corrected import path
import { CanvasStage } from "./CanvasStage"; // Adjust path if needed

interface SortedCanvasStageAdapterProps {
  shapeAtoms: PrimitiveAtom<Shape>[];
  isStatic?: boolean;
}

export const SortedCanvasStageAdapter: React.FC<
  SortedCanvasStageAdapterProps
> = ({ shapeAtoms, isStatic = false }) => {
  // Create a memoized derived atom that reads all shape values from the passed atoms.
  const getShapeValuesAtom = useMemo(
    () => atom((get) => shapeAtoms.map((primitiveAtom) => get(primitiveAtom))),
    [shapeAtoms], // Recreate this derived atom only if the shapeAtoms array instance changes
  );
  const shapeValues = useAtomValue(getShapeValuesAtom);

  const sortedAtomsForCanvas = useMemo(() => {
    // Combine atoms with their current values for sorting
    const atomsWithValues = shapeAtoms.map((primitiveAtom, index) => ({
      atom: primitiveAtom,
      value: shapeValues[index] as Shape, // Relies on order preservation from map
    }));

    // Sort: Floor Plan Space ALWAYS first (bottom-most layer under everything),
    // then other venue elements, then tables on top.
    atomsWithValues.sort((itemA, itemB) => {
      const isFloorPlanSpaceA =
        itemA.value.type === "venue" &&
        (itemA.value.id.startsWith("venuespace") || itemA.value.title === "Venue Space");
      const isFloorPlanSpaceB =
        itemB.value.type === "venue" &&
        (itemB.value.id.startsWith("venuespace") || itemB.value.title === "Venue Space");

      if (isFloorPlanSpaceA && !isFloorPlanSpaceB) return -1;
      if (!isFloorPlanSpaceA && isFloorPlanSpaceB) return 1;

      const orderPriority: Record<Shape["type"], number> = {
        venue: 1, // Rendered first
        table: 2, // Rendered second (on top of venue)
      };

      const priorityA = orderPriority[itemA.value.type] || 99;
      const priorityB = orderPriority[itemB.value.type] || 99;

      return priorityA - priorityB;
    });

    // Return just the sorted atoms
    return atomsWithValues.map((item) => item.atom);
  }, [shapeAtoms, shapeValues]); // Re-sort if atoms array or their values change

  return <CanvasStage shapeAtoms={sortedAtomsForCanvas} isStatic={isStatic} />;
};
