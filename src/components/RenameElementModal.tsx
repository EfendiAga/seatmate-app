"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { renameModalStateAtom, baseShapesAtom, updateBaseShapesAtom } from "../lib/atoms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VenueElement, Table } from "../types/seatingChart";

export const RenameElementModal = () => {
  const [modalState, setModalState] = useAtom(renameModalStateAtom);
  const shapes = useAtomValue(baseShapesAtom);
  const setBaseShapes = useSetAtom(updateBaseShapesAtom);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentShape = modalState.elementId 
    ? shapes.find((s) => s.id === modalState.elementId) 
    : null;
  const isTable = currentShape?.type === "table";

  useEffect(() => {
    if (modalState.isOpen) {
      setNewTitle(modalState.currentTitle || "");
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setNewTitle("");
    }
  }, [modalState.isOpen, modalState.currentTitle]);

  const handleClose = () => {
    setModalState({ isOpen: false, elementId: null, currentTitle: null });
  };

  const handleSave = () => {
    if (!modalState.elementId) return;

    setBaseShapes((currentShapes) => {
      const index = currentShapes.findIndex(
        (s) => s.id === modalState.elementId,
      );
      if (index === -1) return currentShapes;

      const shapeToUpdate = currentShapes[index];
      const trimmed = newTitle.trim();

      if (shapeToUpdate.type === "table") {
        const updatedShape: Table = {
          ...shapeToUpdate,
          name: trimmed || `Table ${shapeToUpdate.number}`,
        };
        const newShapes = [...currentShapes];
        newShapes[index] = updatedShape;
        return newShapes;
      }

      if (shapeToUpdate.type === "venue") {
        const updatedShape: VenueElement = {
          ...shapeToUpdate,
          title: trimmed || "Untitled Element",
        };
        const newShapes = [...currentShapes];
        newShapes[index] = updatedShape;
        return newShapes;
      }

      return currentShapes;
    });

    handleClose();
  };

  return (
    <Dialog open={modalState.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isTable ? "Rename Table" : "Rename Element"}</DialogTitle>
          <DialogDescription>
            {isTable 
              ? "Enter a custom name for this table (e.g., 'Head Table', 'Family & Friends')." 
              : "Enter a new title for the selected venue element."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="element-title" className="text-right">
              {isTable ? "Name" : "Title"}
            </Label>
            <Input
              ref={inputRef}
              id="element-title"
              value={newTitle}
              placeholder={isTable ? (modalState.currentTitle || "e.g. Head Table") : "e.g. Stage"}
              onChange={(e) => setNewTitle(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
