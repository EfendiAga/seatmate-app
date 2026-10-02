"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header, type SaveStatus } from "./Header";
import { Toolbar } from "./Toolbar";
import { useToast } from "@/components/ui/use-toast";
import { CanvasStage } from "./CanvasStage";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import {
  baseShapesAtom, updateBaseShapesAtom,
  guestsAtom,
  tableCounterAtom,
  totalGuestsAtom,
  shapeAtomsAtom,
  venueSpaceLockedAtom,
  selectedShapeIdsAtom,
  isPanningAtom,
  eventTitleAtom,
  editModeAtom,
} from "@/lib/atoms";
import { Shape } from "@/lib/atoms";
import type { Table, VenueElement } from "../types/seatingChart";
import { GuestAssignmentModal } from "./GuestAssignmentModal";
import { RenameElementModal } from "./RenameElementModal";
import { SortedCanvasStageAdapter } from "./SortedCanvasStageAdapter";
import { GuestSimpleSearch } from "./GuestSimpleSearch";
import { useVenuePersistence } from "@/hooks/useVenuePersistence";
import { nanoid } from "nanoid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Placeholder for useMediaQuery hook
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

export const SeatingChartApp = () => {
  const { toast } = useToast();
  const {
    isLoading,
    isSaving,
    handleResetVenue,
    serverError,
    updateError,
    editMode,
    attemptUnlock,
  } = useVenuePersistence();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop && isSheetOpen) {
      setIsSheetOpen(false);
    }
  }, [isDesktop, isSheetOpen]);

  const saveStatus: SaveStatus = useMemo(() => {
    if (isSaving) return "saving";
    if (updateError) return "unsaved";
    return "saved";
  }, [isSaving, updateError]);

  const setBaseShapes = useSetAtom(updateBaseShapesAtom);
  const setGuests = useSetAtom(guestsAtom);
  const [tableCounterValue, setTableCounter] = useAtom(tableCounterAtom);
  const [totalGuests] = useAtom(totalGuestsAtom);
  const [guestsValue] = useAtom(guestsAtom);
  const [shapeAtoms] = useAtom(shapeAtomsAtom);
  const [baseShapesValue] = useAtom(baseShapesAtom);
  const [isVenueLocked, setIsVenueLocked] = useAtom(venueSpaceLockedAtom);
  const [selectedShapeIds, setSelectedShapeIds] = useAtom(selectedShapeIdsAtom);
  const [eventTitle] = useAtom(eventTitleAtom);

  const venueSpaceExists = useMemo(
    () =>
      baseShapesValue.some(
        (shape) => shape.type === "venue" && shape.title === "Venue Space",
      ),
    [baseShapesValue],
  );

  useEffect(() => {
    if (serverError && serverError.message !== "Venue not found.") {
      toast({
        title: "Error Loading Venue",
        description:
          serverError.message || "Could not load venue data from server.",
        variant: "destructive",
      });
    }
  }, [serverError, toast]);

  useEffect(() => {
    if (updateError) {
      toast({
        title: "Error Saving Venue",
        description:
          (updateError as Error).message ||
          "Could not save venue data to server.",
        variant: "destructive",
      });
    }
  }, [updateError, toast]);

    // --- Copy/Paste Logic ---
  const copiedShapeRef = React.useRef<Shape | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editMode) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedShapeIds.length > 0) {
          const shapeToCopy = baseShapesValue.find((s) => s.id === selectedShapeIds[0]); // Only support copying first shape for now
          if (shapeToCopy && shapeToCopy.type === 'table') {
            copiedShapeRef.current = shapeToCopy;
            toast({
              title: "Copied!",
              description: "Table copied to clipboard.",
              duration: 2000,
            });
          }
        }
      }

      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedShapeRef.current) {
          const copied = copiedShapeRef.current;
          
          let newNumber = tableCounterValue;
          setTableCounter(c => c + 1);

          const newTable: Table = {
            ...copied,
            id: "table-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
            number: newNumber,
            x: copied.x + 40, // offset
            y: copied.y + 40, // offset
          };
          
          setBaseShapes(prev => [...prev, newTable]);
          setSelectedShapeIds([newTable.id]);
          
          toast({
            title: "Pasted!",
            description: "Table pasted to canvas.",
            duration: 2000,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, selectedShapeIds, baseShapesValue, tableCounterValue, setTableCounter, setBaseShapes, setSelectedShapeIds, toast]);

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to clear the canvas and start a new venue?",
      )
    ) {
      handleResetVenue();
      toast({
        title: "New Venue Created",
        description: "Started a fresh seating chart.",
      });
    }
  }, [handleResetVenue, toast]);

    const handleAddTable = (shapeType?: Table['tableShape']) => {
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
      description: `Table ${newTable.number} added.`,
    });
  };

  const handleAlignHorizontal = useCallback(() => {
    if (selectedShapeIds.length < 2) return;
    setBaseShapes((prev) => {
      const selectedShapes = prev.filter(s => selectedShapeIds.includes(s.id));
      const avgY = selectedShapes.reduce((sum, s) => sum + s.y, 0) / selectedShapes.length;
      return prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, y: avgY } : s);
    });
  }, [selectedShapeIds, setBaseShapes]);

  const handleAlignVertical = useCallback(() => {
    if (selectedShapeIds.length < 2) return;
    setBaseShapes((prev) => {
      const selectedShapes = prev.filter(s => selectedShapeIds.includes(s.id));
      const avgX = selectedShapes.reduce((sum, s) => sum + s.x, 0) / selectedShapes.length;
      return prev.map(s => selectedShapeIds.includes(s.id) ? { ...s, x: avgX } : s);
    });
  }, [selectedShapeIds, setBaseShapes]);

  const handleDistributeHorizontal = useCallback(() => {
    if (selectedShapeIds.length < 3) return;
    setBaseShapes((prev) => {
      const newShapes = [...prev];
      const selectedShapes = newShapes.filter(s => selectedShapeIds.includes(s.id));
      selectedShapes.sort((a, b) => a.x - b.x);
      
      const minX = selectedShapes[0].x;
      const maxX = selectedShapes[selectedShapes.length - 1].x;
      const step = (maxX - minX) / (selectedShapes.length - 1);
      
      for (let i = 1; i < selectedShapes.length - 1; i++) {
        const id = selectedShapes[i].id;
        const index = newShapes.findIndex(s => s.id === id);
        if (index !== -1) {
          newShapes[index] = { ...newShapes[index], x: minX + i * step };
        }
      }
      return newShapes;
    });
  }, [selectedShapeIds, setBaseShapes]);

  const handleDistributeVertical = useCallback(() => {
    if (selectedShapeIds.length < 3) return;
    setBaseShapes((prev) => {
      const newShapes = [...prev];
      const selectedShapes = newShapes.filter(s => selectedShapeIds.includes(s.id));
      selectedShapes.sort((a, b) => a.y - b.y);
      
      const minY = selectedShapes[0].y;
      const maxY = selectedShapes[selectedShapes.length - 1].y;
      const step = (maxY - minY) / (selectedShapes.length - 1);
      
      for (let i = 1; i < selectedShapes.length - 1; i++) {
        const id = selectedShapes[i].id;
        const index = newShapes.findIndex(s => s.id === id);
        if (index !== -1) {
          newShapes[index] = { ...newShapes[index], y: minY + i * step };
        }
      }
      return newShapes;
    });
  }, [selectedShapeIds, setBaseShapes]);

  const handleAddVenueElement = () => {
    if (editMode === false) {
      toast({
        title: "View-Only Mode",
        description: "Cannot add venue elements while in view-only mode.",
        variant: "destructive",
      });
      return;
    }
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = 30 + Math.floor(Math.random() * 30);
    const randomLightness = 75 + Math.floor(Math.random() * 15);
    const alpha = 0.3;
    const randomColor = `hsla(${randomHue}, ${randomSaturation}%, ${randomLightness}%, ${alpha})`;

    const newElement: VenueElement = {
      id: `venue-${Date.now()}`,
      type: "venue",
      title: "New Element",
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 200,
      height: 150,
      color: randomColor,
    };
    setBaseShapes((prevShapes) => [...prevShapes, newElement]);

    toast({
      title: "Venue Element Added",
      description: "A new venue element has been added.",
    });
  };

  const handleAddVenueSpace = () => {
    if (editMode === false) {
      toast({
        title: "View-Only Mode",
        description: "Cannot add venue space while in view-only mode.",
        variant: "destructive",
      });
      return;
    }
    if (venueSpaceExists) {
      toast({
        title: "Action Denied",
        description: "A Venue Space element already exists.",
        variant: "destructive",
      });
      return;
    }

    const newId = `venuespace-${Date.now()}`;
    const newVenueSpace: VenueElement = {
      id: newId,
      type: "venue",
      title: "Venue Space",
      x: 50,
      y: 50,
      width: 800,
      height: 600,
      color: "rgba(0, 0, 0, 0)",
      stroke: "#333333",
      strokeWidth: 2,
    };

    setBaseShapes((prevShapes) => [...prevShapes, newVenueSpace]);

    setIsVenueLocked(false);
    setSelectedShapeIds([newId]);

    toast({
      title: "Venue Space Added",
      description:
        "The main venue area has been defined and selected. It is currently unlocked.",
    });
  };

  const handleToggleVenueLock = () => {
    if (editMode === false) {
      toast({
        title: "View-Only Mode",
        description: "Cannot toggle venue lock while in view-only mode.",
        variant: "destructive",
      });
      return;
    }
    const nextLockedState = !isVenueLocked;
    setIsVenueLocked(nextLockedState);

    const venueSpaceElement = baseShapesValue.find(
      (shape) => shape.type === "venue" && shape.title === "Venue Space",
    );
    const venueSpaceId = venueSpaceElement?.id;

    if (!nextLockedState && venueSpaceId) {
      setSelectedShapeIds([venueSpaceId]);
    } else if (
      nextLockedState &&
      venueSpaceId &&
      selectedShapeIds.includes(venueSpaceId)
    ) {
      setSelectedShapeIds((prev) => prev.filter(id => id !== venueSpaceId));
    }

    toast({
      title: `Venue Space ${nextLockedState ? "Locked" : "Unlocked"}`,
      description: `The Venue Space element is now ${nextLockedState ? "locked and cannot be moved/resized" : "unlocked for editing"}.`,
    });
  };

  const showAddVenueSpaceRequiredToast = () => {
    toast({
      title: "Action Unavailable",
      description:
        "Please add and define the Venue Space first before adding tables or other elements.",
      variant: "destructive",
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading Venue...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        totalGuests={totalGuests}
        onReset={handleReset}
        onAddTable={handleAddTable}
        onAddVenueElement={handleAddVenueElement}
        onAddVenueSpace={handleAddVenueSpace}
        isVenueSpacePresent={venueSpaceExists}
        isVenueSpaceLocked={isVenueLocked}
        onToggleVenueLock={handleToggleVenueLock}
        onShowDisabledInfo={showAddVenueSpaceRequiredToast}
        saveStatus={saveStatus}
        onToggleMobileSidebar={() => setIsSheetOpen((prev) => !prev)}
        isMobileSidebarOpen={isSheetOpen}
        attemptUnlock={attemptUnlock}
      />
      {editMode && (
        <Toolbar 
          onAddTable={handleAddTable} 
          editMode={editMode} 
          selectedShapeCount={selectedShapeIds.length}
          onAlignHorizontal={handleAlignHorizontal}
          onAlignVertical={handleAlignVertical}
          onDistributeHorizontal={handleDistributeHorizontal}
          onDistributeVertical={handleDistributeVertical}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {editMode && isDesktop ? (
          <Sidebar
            guests={guestsValue}
            tables={baseShapesValue.filter(
              (s): s is Table => s.type === "table",
            )}
          />
        ) : editMode && !isDesktop ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent
              side="left"
              className="w-72 sm:w-80 p-0 overflow-y-auto"
            >
              <SheetHeader className="p-5 pb-2 sr-only">
                <SheetTitle>Guest List and Tables</SheetTitle>
              </SheetHeader>
              <Sidebar
                guests={guestsValue}
                tables={baseShapesValue.filter(
                  (s): s is Table => s.type === "table",
                )}
                isInSheet={true}
              />
            </SheetContent>
          </Sheet>
        ) : null}
        <div className="flex-1 flex flex-col p-4 md:p-5 border-l border-border/40 bg-background/50">
          <div
            className={`flex-1 relative rounded-lg ${editMode ? 'glass shadow-premium rounded-2xl' : ''} overflow-hidden`}
            tabIndex={1}
          >
            {editMode ? (
              <SortedCanvasStageAdapter shapeAtoms={shapeAtoms} />
            ) : (
              <GuestSimpleSearch />
            )}
          </div>
        </div>
      </div>
      <GuestAssignmentModal />
      <RenameElementModal />
    </div>
  );
};








