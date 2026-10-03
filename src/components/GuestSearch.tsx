"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { guestsAtom, searchedGuestIdAtom, baseShapesAtom } from "@/lib/atoms";
import { Table } from "@/types/seatingChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const GuestSearch = () => {
  const guests = useAtomValue(guestsAtom);
  const shapes = useAtomValue(baseShapesAtom);
  const { toast } = useToast();
  const [searchedGuestId, setSearchedGuestId] = useAtom(searchedGuestIdAtom);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGuests = guests.filter((g) => {
    const fullName = `${g.firstName} ${g.lastName || ""}`.trim().toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (id: string, name: string, isSeated: boolean) => {
    if (!isSeated) {
      toast({
        title: "Guest Unseated",
        description: `${name} has not been assigned a seat yet.`,
        variant: "default",
      });
      // Optionally still select them, or just clear
      setSearchTerm("");
      setIsOpen(false);
      return;
    }
    setSearchedGuestId(id);
    setSearchTerm(name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchedGuestId(null);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative z-50 flex items-center" ref={containerRef}>
      <div className="relative w-48 sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Find my seat..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              setSearchedGuestId(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 bg-card/60 border-border/30 focus:border-primary/50 text-sm"
        />
        {searchedGuestId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 h-full px-2 text-muted-foreground hover:text-foreground"
          >
            &times;
          </Button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border/50 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredGuests.length > 0 ? (
            <ul className="py-1">
              {filteredGuests.map((guest) => {
                const assignedTable = shapes.find((s) => s.id === guest.tableId) as Table | undefined;
                const tableName = assignedTable ? (assignedTable.name || `Table ${assignedTable.number}`) : null;
                return (
                  <li
                    key={guest.id}
                    className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between"
                    onClick={() => handleSelect(guest.id, `${guest.firstName} ${guest.lastName || ""}`.trim(), !!guest.tableId)}
                  >
                    <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                    {tableName ? (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {tableName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unseated</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No guests found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
