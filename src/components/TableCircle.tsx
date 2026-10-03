"use client";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Circle, Text, Group, Transformer, Rect } from "react-konva";
import Konva from "konva";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  selectedShapeIdsAtom,
  guestsAtom,
  isPanningAtom,
  isDraggingAtom,
  hoveredTableIdAtom,
  venueSpaceLockedAtom,
  editModeAtom,
  baseShapesAtom,
  renameModalStateAtom,
} from "@/lib/atoms";
import { PrimitiveAtom } from "jotai";
import type { Table } from "../types/seatingChart";
import { Shape , saveHistoryAtom} from "@/lib/atoms";
import { ChairCircle } from "./ChairCircle";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ui/use-toast";

interface TableCircleProps {
  shapeAtom: PrimitiveAtom<Shape>;
  highlightedGuestId?: string | null;
  registerRef?: (guestId: string | null, node: Konva.Group | null) => void;
  registerShapeRef?: (id: string, node: Konva.Group | null) => void;
  isStatic?: boolean;
}

const MIN_CAPACITY = 0;
const MAX_CAPACITY = 1000;
const MIN_TABLE_RADIUS = 30;
const MAX_TABLE_RADIUS = 2000;

// Colors for light and dark mode
const LIGHT_COLORS = {
  tableFill: "#FFFFFF", // Warm beige
  tableStroke: "#E5E7EB", // Darker brown for contrast
  highlightedTableStroke: "#EF4444", // Brighter Gold/Amber for highlight
  highlightedTableStrokeWidth: 4, // Thicker border for highlight (was 3)
  tableTextPrimary: "#111827", // Rich dark brown for text
  tableTextSecondary: "#6B7280", // Darker soft brown
  minusButtonFill: "#F0E4EA", // Soft pink
  minusButtonHoverFill: "#F8D7E6", // Lighter pink for hover
  minusButtonStroke: "#A15E7A", // Muted plum
  minusButtonHoverStroke: "#C2779A", // Brighter plum for hover
  minusButtonText: "#5E3345", // Deep plum
  plusButtonFill: "#E3EAE0", // Soft sage
  plusButtonHoverFill: "#D6E9CB", // Lighter sage for hover
  plusButtonStroke: "#7E8F75", // Sage green
  plusButtonHoverStroke: "#98AB8C", // Brighter sage for hover
  plusButtonText: "#5A684C", // Deep moss
  shadowColor: "rgba(0, 0, 0, 0.08)", // Brown shadow with transparency
  countBadgeFill: "rgba(145, 170, 157, 0.8)", // Sage green with transparency
  countBadgeStroke: "#66755C", // Darker green
  countBadgeText: "#FFFFFF", // White text
};

const DARK_COLORS = {
  tableFill: "#1F2937", // Lighter blue-grey
  tableStroke: "#374151", // Softer gold/ochre
  highlightedTableStroke: "#EF4444", // Kept previous dark mode gold, but might be overridden by LIGHT_COLORS logic
  highlightedTableStrokeWidth: 4, // Thicker border for highlight (was 3)
  tableTextPrimary: "#F9FAFB", // Soft warm beige
  tableTextSecondary: "#9CA3AF", // Slightly darker beige
  minusButtonFill: "#6F4757", // Deep plum background
  minusButtonHoverFill: "#8B5B6D", // Lighter plum for hover
  minusButtonStroke: "#BB7C96", // Lighter plum
  minusButtonHoverStroke: "#D594AF", // Brighter plum for hover
  minusButtonText: "#EAE3D4", // Soft warm beige
  plusButtonFill: "#4D5647", // Deep moss
  plusButtonHoverFill: "#5F6B58", // Lighter moss for hover
  plusButtonStroke: "#8A9880", // Lighter sage
  plusButtonHoverStroke: "#A6B49B", // Brighter sage for hover
  plusButtonText: "#EAE3D4", // Soft warm beige
  shadowColor: "rgba(0, 0, 0, 0.08)", // Brown shadow with transparency
  countBadgeFill: "rgba(145, 170, 157, 0.7)", // Sage green with transparency
  countBadgeStroke: "#A3B097", // Lighter green
  countBadgeText: "#EAE3D4", // Soft warm beige
};

// Inner component assumes shapeAtom is for a Table
const TableCircleContent: React.FC<{
  shapeAtom: PrimitiveAtom<Table>;
  highlightedGuestId?: string | null;
  registerRef?: (guestId: string | null, node: Konva.Group | null) => void;
  registerShapeRef?: (id: string, node: Konva.Group | null) => void;
  isStatic?: boolean;
}> = ({ shapeAtom, highlightedGuestId, registerRef, registerShapeRef, isStatic = false }) => {
  const [shape, setShape] = useAtom(shapeAtom);
  const saveHistory = useSetAtom(saveHistoryAtom);
  const [selectedShapeIds, setSelectedShapeIds] = useAtom(selectedShapeIdsAtom);
  const currentlyHoveredTableId = useAtomValue(hoveredTableIdAtom);
  const guests = useAtomValue(guestsAtom);
  const isPanning = useAtomValue(isPanningAtom);
  const setIsDragging = useSetAtom(isDraggingAtom);
  const currentVenueLockState = useAtomValue(venueSpaceLockedAtom);
  const editMode = useAtomValue(editModeAtom);
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isSelected = selectedShapeIds.includes(shape.id);
  const baseShapes = useAtomValue(baseShapesAtom);
  const setRenameModalState = useSetAtom(renameModalStateAtom);
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleRename = (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e) {
      e.cancelBubble = true;
    }
    if (!editMode) return;
    setRenameModalState({
      isOpen: true,
      elementId: shape.id,
      currentTitle: shape.name || `Table ${shape.number}`,
    });
  };

  // State for button hover effects (these are for the buttons themselves, not the table)
  const [isMinusHovered, setIsMinusHovered] = useState(false);
  const [isPlusHovered, setIsPlusHovered] = useState(false);
  const [isMinusPressed, setIsMinusPressed] = useState(false);
  const [isPlusPressed, setIsPlusPressed] = useState(false);
  const [isTableHovered, setIsTableHovered] = useState(false); // <-- New state for table hover

  // Choose colors based on theme
  const COLORS = LIGHT_COLORS;

  // Draggability depends on shape prop, not panning, AND edit mode, and not locked
  const isDraggable = shape.draggable !== false && !isPanning && editMode && !shape.isLocked;

  useEffect(() => {
    if (registerShapeRef) {
      registerShapeRef(shape.id, shapeRef.current);
    }
    return () => {
      if (registerShapeRef) registerShapeRef(shape.id, null);
    };
  }, [shape.id, registerShapeRef]);

  // Effect to ensure the table color is correctly set initially and after any theme changes
  useEffect(() => {
    // Force redraw to ensure theme colors are properly applied
    // Also ensures redraw if highlight state changes
    if (shapeRef.current) {
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [theme, currentlyHoveredTableId]); // Re-run when theme or hoveredTableId changes

  const currentChairRadius = useMemo(() => {
    let baseDim = 60;
    if (shape.tableShape === "rectangular") {
      baseDim = Math.min(shape.width || 120, shape.height || 60);
    } else {
      baseDim = shape.radius || MIN_TABLE_RADIUS;
    }
    return Math.max(4, baseDim * (8 / 60)); // Removed max cap so it scales infinitely
  }, [shape.radius, shape.width, shape.height, shape.tableShape]);

  const currentPadding = currentChairRadius * (5 / 8);
  const scaleFactor = currentChairRadius / 8;

  // Chair position calculation
  const chairPositions = useMemo(() => {
    const positions = [];
    const tableShape = shape.tableShape || "round";

    if (tableShape === "chair_rows") {
      const chairSpacing = currentChairRadius * 2 + currentPadding;
      const totalWidth = (shape.capacity - 1) * chairSpacing;
      for (let i = 0; i < shape.capacity; i++) {
        positions.push({
          x: -totalWidth / 2 + i * chairSpacing,
          y: 0,
          angle: 0,
        });
      }
    } else if (tableShape === "rectangular") {
      const width = shape.width || 120;
      const height = shape.height || 60;
      const perSide = Math.floor(shape.capacity / 2);
      const remainder = shape.capacity % 2;
      const chairSpacing = width / perSide;
      for (let i = 0; i < perSide; i++) {
        positions.push({ x: -width/2 + chairSpacing/2 + i * chairSpacing, y: -height/2 - currentChairRadius - currentPadding, angle: -Math.PI/2 });
        positions.push({ x: -width/2 + chairSpacing/2 + i * chairSpacing, y: height/2 + currentChairRadius + currentPadding, angle: Math.PI/2 });
      }
      if (remainder === 1) {
         positions.push({ x: -width/2 - currentChairRadius - currentPadding, y: 0, angle: Math.PI });
      }
    } else {
      const angleStep = (2 * Math.PI) / shape.capacity;
      const radius = shape.radius || MIN_TABLE_RADIUS;
      const distance = radius + currentChairRadius + currentPadding;
      for (let i = 0; i < shape.capacity; i++) {
        const angle = i * angleStep - Math.PI / 2;
        positions.push({
          x: distance * Math.cos(angle),
          y: distance * Math.sin(angle),
          angle,
        });
      }
    }
    return positions;
  }, [shape.capacity, shape.radius, shape.width, shape.height, shape.tableShape, currentChairRadius, currentPadding]);

  // Guest lookup map
  const guestMap = useMemo(() => {
    const map = new Map<string, string>();
    guests.forEach((guest) => {
      map.set(`${guest.tableId}---${guest.chairIndex}`, guest.id);
    });
    return map;
  }, [guests]);

  // Count occupied seats at this table
  const occupiedSeatCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < shape.capacity; i++) {
      if (guestMap.has(`${shape.id}---${i}`)) {
        count++;
      }
    }
    return count;
  }, [shape.id, shape.capacity, guestMap]);

  // Find the highest occupied chair index (to prevent reducing capacity below this)
  const highestOccupiedChairIndex = useMemo(() => {
    let highest = -1;

    // Check which chairs are occupied
    for (let i = 0; i < shape.capacity; i++) {
      if (guestMap.has(`${shape.id}---${i}`)) {
        highest = Math.max(highest, i);
      }
    }

    return highest;
  }, [shape.id, shape.capacity, guestMap]);

  const handleSelect = (e?: any) => {
    // Allow selection only when in edit mode
    if (!editMode) {
      return;
    }
    const isShiftPressed = e?.evt?.shiftKey;
    
    let idsToSelect = [shape.id];
    if (shape.groupId) {
      idsToSelect = baseShapes.filter(s => s.groupId === shape.groupId).map(s => s.id);
    }
    
    if (isShiftPressed) {
      if (isSelected) {
        setSelectedShapeIds((prev) => prev.filter((id) => !idsToSelect.includes(id)));
      } else {
        setSelectedShapeIds((prev) => [...prev, ...idsToSelect.filter(id => !prev.includes(id))]);
      }
    } else {
      setSelectedShapeIds(idsToSelect);
    }
  };

  const hasHighlightedGuest = useMemo(() => {
    if (!highlightedGuestId) return false;
    const guest = guests.find(g => g.id === highlightedGuestId);
    return guest?.tableId === shape.id;
  }, [highlightedGuestId, guests, shape.id]);

  const isHighlighted = shape.id === currentlyHoveredTableId || hasHighlightedGuest;

  const pulseRef = useRef<any>(null);

  useEffect(() => {
    if (!hasHighlightedGuest || !pulseRef.current) return;
    
    const node = pulseRef.current;
    let anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const scale = 1 + Math.sin(frame.time / 200) * 0.15;
      const opacity = 0.5 + Math.sin(frame.time / 200) * 0.4;
      node.scale({ x: scale, y: scale });
      node.opacity(opacity);
    }, node.getLayer());

    anim.start();
    return () => {
      anim.stop();
      if (pulseRef.current) {
        pulseRef.current.scale({ x: 1, y: 1 });
        pulseRef.current.opacity(0);
      }
    };
  }, [hasHighlightedGuest]);

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(true);
    // Prevent stage drag if Alt is pressed when starting shape drag
    if (e.evt.altKey) {
      e.target.getStage()?.stopDrag();
    }
    // Also stop standard event bubbling
    e.evt.cancelBubble = true;
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    // Update shape position only if it was actually draggable
    if (shape.draggable !== false) {
      saveHistory();
    setShape((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    // Transformation implies editing
    if (!editMode || shape.isLocked) return; 
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    saveHistory();
    setShape((prev) => {
      if (prev.tableShape === "rectangular") {
        const newWidth = Math.max(5, (prev.width || 120) * scaleX);
        const newHeight = Math.max(5, (prev.height || 60) * scaleY);
        return {
          ...prev,
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
        };
      } else {
        const scale = (scaleX + scaleY) / 2;
        const newRadius = prev.radius * scale;
        const clampedRadius = Math.max(5, newRadius); // Allow scaling down to prevent overlap
        return {
          ...prev,
          x: node.x(),
          y: node.y(),
          radius: clampedRadius,
        };
      }
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleCapacityChange = (change: number) => {
    if (!editMode) {
      // Optionally show a toast here if desired
      return;
    }
    // For animation effect
    if (change < 0) {
      // Prevent reducing capacity below the number of occupied chairs
      const minimumRequiredCapacity = highestOccupiedChairIndex + 1;
      if (shape.capacity + change < minimumRequiredCapacity) {
        setIsMinusPressed(true);
        setTimeout(() => setIsMinusPressed(false), 200);

        // Show toast notification
        toast({
          title: "Cannot Reduce Capacity",
          description: `Please remove guests from seats ${minimumRequiredCapacity} to ${shape.capacity} first.`,
          variant: "destructive",
        });
        return;
      }

      setIsMinusPressed(true);
      setTimeout(() => setIsMinusPressed(false), 200);
    } else {
      setIsPlusPressed(true);
      setTimeout(() => setIsPlusPressed(false), 200);
    }

    saveHistory();
    setShape((prev) => {
      const newCapacity = prev.capacity + change;
      const clampedCapacity = Math.max(
        MIN_CAPACITY,
        Math.min(newCapacity, MAX_CAPACITY),
      );
      return { ...prev, capacity: clampedCapacity };
    });
  };

  // Handle button hover effects
  const handleMinusMouseEnter = () => setIsMinusHovered(true);
  const handleMinusMouseLeave = () => setIsMinusHovered(false);
  const handlePlusMouseEnter = () => setIsPlusHovered(true);
  const handlePlusMouseLeave = () => setIsPlusHovered(false);

  // Updated font sizes for better readability
  const FONT_SIZE_LARGE = 18 * scaleFactor;
  const FONT_SIZE_SMALL = 14 * scaleFactor;
  const currentButtonRadius = 12 * scaleFactor;
  const BUTTON_SPACING = 1.25;

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        draggable={isDraggable}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDblClick={handleRename}
        onDblTap={handleRename}
        onTransformEnd={handleTransformEnd}
        offsetX={0}
        offsetY={0}
        onMouseEnter={() => {
          setIsTableHovered(true);
          // Optional: Change cursor, though Konva shapes can have their own cursor style on hover via CSS on container if needed
          const stage = shapeRef.current?.getStage();
          if (stage) stage.container().style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          setIsTableHovered(false);
          const stage = shapeRef.current?.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
      >
          {/* Pulsating Highlight Overlay */}
          {hasHighlightedGuest && (!shape.tableShape || shape.tableShape === "round") && (
            <Circle
              ref={pulseRef}
              radius={shape.radius || MIN_TABLE_RADIUS}
              fill="transparent"
              stroke={COLORS.highlightedTableStroke}
              strokeWidth={8}
              opacity={0}
              listening={false}
            />
          )}
          {hasHighlightedGuest && shape.tableShape === "rectangular" && (
            <Rect
              ref={pulseRef}
              x={0}
              y={0}
              offsetX={(shape.width || 120) / 2}
              offsetY={(shape.height || 60) / 2}
              width={shape.width || 120}
              height={shape.height || 60}
              cornerRadius={8}
              fill="transparent"
              stroke={COLORS.highlightedTableStroke}
              strokeWidth={8}
              opacity={0}
              listening={false}
            />
          )}

                  {/* Main Table Shape */}
          {(!shape.tableShape || shape.tableShape === "round") && (
            <Circle
              radius={shape.radius || MIN_TABLE_RADIUS}
              fill={COLORS.tableFill}
              stroke={isHighlighted ? COLORS.highlightedTableStroke : COLORS.tableStroke}
              strokeWidth={isHighlighted ? COLORS.highlightedTableStrokeWidth : 3}
              shadowBlur={isSelected ? 12 : 6}
              shadowColor={COLORS.shadowColor}
              shadowOpacity={isSelected ? 0.4 : 0.2}
              shadowOffset={{ x: 2, y: 2 }}
              perfectDrawEnabled={false}
              listening={true}
            />
          )}
          {shape.tableShape === "rectangular" && (
            <Rect
              x={-(shape.width || 120) / 2}
              y={-(shape.height || 60) / 2}
              width={shape.width || 120}
              height={shape.height || 60}
              cornerRadius={8}
              fill={COLORS.tableFill}
              stroke={isHighlighted ? COLORS.highlightedTableStroke : COLORS.tableStroke}
              strokeWidth={isHighlighted ? COLORS.highlightedTableStrokeWidth : 3}
              shadowBlur={isSelected ? 12 : 6}
              shadowColor={COLORS.shadowColor}
              shadowOpacity={isSelected ? 0.4 : 0.2}
              shadowOffset={{ x: 2, y: 2 }}
              perfectDrawEnabled={false}
              listening={true}
            />
          )}

                  {/* Centered Table Name / Number */}
          <Text
            text={shape.name?.trim() ? shape.name.trim() : `Table ${shape.number}`}
            fontSize={
              (shape.name?.trim() ? shape.name.trim() : `Table ${shape.number}`).length > 18
                ? Math.max(9 * scaleFactor, 12 * scaleFactor)
                : (shape.name?.trim() ? shape.name.trim() : `Table ${shape.number}`).length > 12
                ? Math.max(10 * scaleFactor, 14 * scaleFactor)
                : Math.max(12 * scaleFactor, 17 * scaleFactor)
            }
            fontFamily="'Inter', sans-serif"
            fill={COLORS.tableTextPrimary}
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            wrap="wrap"
            padding={4}
            ellipsis={true}
            x={shape.tableShape === 'rectangular' ? -(shape.width || 120)/2 : -(shape.radius || MIN_TABLE_RADIUS)}
            y={-17 * scaleFactor}
            width={shape.tableShape === 'rectangular' ? (shape.width || 120) : (shape.radius || MIN_TABLE_RADIUS)*2}
            listening={true}
            onClick={(e) => {
              if (isSelected && editMode) {
                handleRename(e);
              }
            }}
            onTap={(e) => {
              if (isSelected && editMode) {
                handleRename(e);
              }
            }}
            onDblClick={handleRename}
            onDblTap={handleRename}
          />
          {/* Centered Capacity Text */}
          <Text
            text={`${shape.capacity} Seats`}
            fontSize={12 * scaleFactor}
            fontFamily="'Inter', sans-serif"
            fill={COLORS.tableTextSecondary}
            align="center"
            verticalAlign="middle"
            x={shape.tableShape === 'rectangular' ? -(shape.width || 120)/2 : -(shape.radius || MIN_TABLE_RADIUS)}
            y={5 * scaleFactor}
            width={shape.tableShape === 'rectangular' ? (shape.width || 120) : (shape.radius || MIN_TABLE_RADIUS)*2}
            listening={false}
          />

        

        {/* Chairs */}
        {!isStatic && chairPositions.map((pos, index) => {
          const guestId = guestMap.get(`${shape.id}---${index}`) || null;

          return (
            <ChairCircle
              key={`chair-${shape.id}-${index}`}
              tableId={shape.id}
              chairIndex={index}
              x={pos.x}
              y={pos.y}
              radius={currentChairRadius}
              guestId={guestId}
              registerRef={registerRef}
            />
          );
        })}

        {/* Seat Occupancy Badge - START COMMENTING OUT */}
        {/* 
        <Group x={0} y={-shape.radius - 12}>
          <Circle 
            radius={16}
            fill={COLORS.countBadgeFill}
            stroke={COLORS.countBadgeStroke}
            strokeWidth={1}
            shadowBlur={4}
            shadowOpacity={0.15}
            shadowOffset={{ x: 1, y: 1 }}
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text 
            text={`${occupiedSeatCount}/${shape.capacity}`}
            fontSize={10}
            fontFamily="'Source Sans Pro', sans-serif"
            fontStyle="bold"
            fill={COLORS.countBadgeText}
            align="center"
            verticalAlign="middle"
            width={32}
            height={10}
            offsetX={16}
            offsetY={5}
            listening={false}
            perfectDrawEnabled={false}
          />
        </Group>
        */}
        {/* Seat Occupancy Badge - END COMMENTING OUT */}

        <Group
          x={0}
          y={FONT_SIZE_SMALL + currentPadding * 3}
          visible={(isTableHovered || isSelected) && editMode}
        >
          {/* Minus Button */}
          <Group
            x={-currentButtonRadius * BUTTON_SPACING}
            y={0}
            onClick={(e) => { e.cancelBubble = true; handleCapacityChange(-1); }}
            onTap={(e) => { e.cancelBubble = true; handleCapacityChange(-1); }}
            opacity={shape.capacity > MIN_CAPACITY ? 1 : 0.5}
            onMouseEnter={handleMinusMouseEnter}
            onMouseLeave={handleMinusMouseLeave}
            scaleX={isMinusPressed ? 0.9 : 1}
            scaleY={isMinusPressed ? 0.9 : 1}
          >
            <Circle
              radius={currentButtonRadius}
              fill={
                isMinusHovered
                  ? COLORS.minusButtonHoverFill
                  : COLORS.minusButtonFill
              }
              stroke={
                isMinusHovered
                  ? COLORS.minusButtonHoverStroke
                  : COLORS.minusButtonStroke
              }
              strokeWidth={1.5} // Restored original strokeWidth
              shadowBlur={isMinusHovered ? 5 : 3}
              shadowOpacity={isMinusHovered ? 0.3 : 0.2}
              shadowOffset={{ x: 1, y: 1 }}
            />
            <Text
              text="-"
              fontSize={16 * scaleFactor} // Scaled
              fontStyle="bold"
              fill={COLORS.minusButtonText} // Restored original fill logic
              width={currentButtonRadius * 2}
              height={currentButtonRadius * 2} // Restored original height
              align="center"
              verticalAlign="middle"
              offsetX={currentButtonRadius}
              offsetY={currentButtonRadius}
              listening={false}
            />
          </Group>

          {/* Plus Button */}
          <Group
            x={currentButtonRadius * BUTTON_SPACING}
            y={0}
            // Only allow capacity change if in edit mode
            onClick={editMode ? (e) => { e.cancelBubble = true; handleCapacityChange(1); } : undefined}
            onTap={editMode ? (e) => { e.cancelBubble = true; handleCapacityChange(1); } : undefined}
            opacity={shape.capacity < MAX_CAPACITY ? 1 : 0.5}
            onMouseEnter={handlePlusMouseEnter}
            onMouseLeave={handlePlusMouseLeave}
            scaleX={isPlusPressed ? 0.9 : 1}
            scaleY={isPlusPressed ? 0.9 : 1}
          >
            <Circle
              radius={currentButtonRadius}
              fill={
                isPlusHovered
                  ? COLORS.plusButtonHoverFill
                  : COLORS.plusButtonFill
              }
              stroke={
                isPlusHovered
                  ? COLORS.plusButtonHoverStroke
                  : COLORS.plusButtonStroke
              }
              strokeWidth={1.5} // Restored original strokeWidth
              shadowBlur={isPlusHovered ? 5 : 3}
              shadowOpacity={isPlusHovered ? 0.3 : 0.2}
              shadowOffset={{ x: 1, y: 1 }}
            />
            <Text
              text="+"
              fontSize={16 * scaleFactor} // Scaled
              fontStyle="bold"
              fill={COLORS.plusButtonText} // Restored original fill logic
              width={currentButtonRadius * 2}
              height={currentButtonRadius * 2} // Restored original height
              align="center"
              verticalAlign="middle"
              offsetX={currentButtonRadius}
              offsetY={currentButtonRadius}
              listening={false}
            />
          </Group>
        </Group>
      </Group>
    </React.Fragment>
  );
};

// Wrapper component
export const TableCircle: React.FC<TableCircleProps> = ({
  shapeAtom,
  highlightedGuestId,
  registerRef,
  registerShapeRef,
  isStatic = false,
}) => {
  const shapeValue = useAtomValue(shapeAtom);

  if (shapeValue.type !== "table") {
    return null;
  }

  return (
    <TableCircleContent
      shapeAtom={shapeAtom as PrimitiveAtom<Table>}
      highlightedGuestId={highlightedGuestId}
      registerRef={registerRef}
      registerShapeRef={registerShapeRef}
      isStatic={isStatic}
    />
  );
};










