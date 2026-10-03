"use client";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, User, ArrowRight } from "lucide-react";
import { useAtomValue } from "jotai";
import { guestsAtom, baseShapesAtom, eventTitleAtom, shapeAtomsAtom, searchedGuestIdAtom } from "@/lib/atoms";
import { Table } from "@/types/seatingChart";
import { Badge } from "@/components/ui/badge";
import { SortedCanvasStageAdapter } from "./SortedCanvasStageAdapter";
import { useSetAtom } from "jotai";

export function GuestSimpleSearch() {
  const guests = useAtomValue(guestsAtom);
  const baseShapes = useAtomValue(baseShapesAtom);
  const eventTitle = useAtomValue(eventTitleAtom);
  const shapeAtoms = useAtomValue(shapeAtomsAtom);
  const setSearchedGuestId = useSetAtom(searchedGuestIdAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const tables = useMemo(
    () => baseShapes.filter((s): s is Table => s.type === "table"),
    [baseShapes],
  );

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return guests.filter((g) => {
      const fullName = `${g.firstName} ${g.lastName}`.trim().toLowerCase();
      return fullName.includes(query);
    });
  }, [guests, searchQuery]);

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const selectedGuest = useMemo(() => {
    return guests.find((g) => g.id === selectedGuestId);
  }, [guests, selectedGuestId]);

  const assignedTable = useMemo(() => {
    if (!selectedGuest?.tableId) return null;
    return tables.find((t) => t.id === selectedGuest.tableId);
  }, [selectedGuest, tables]);

  const tableMates = useMemo(() => {
    if (!assignedTable) return [];
    return guests.filter(
      (g) =>
        g.tableId === assignedTable.id && g.id !== selectedGuest?.id,
    );
  }, [assignedTable, guests, selectedGuest]);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-2 md:p-4 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <div className="w-full max-w-xl mx-auto space-y-4 mt-2 md:mt-4 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10">
        
        {/* Header Section (Hidden when guest is selected) */}
        {!selectedGuest && (
          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Welcome to {eventTitle}
            </h1>
            <p className="text-muted-foreground text-sm">Find your seat to get started</p>
          </div>
        )}

        {/* Search Input (Hidden when guest is selected) */}
        {!selectedGuest && (
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedGuestId(null);
                setSearchedGuestId(null);
              }}
              placeholder="Enter your first or last name..."
              className="pl-10 h-12 text-base rounded-xl border-2 border-primary/20 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all bg-card/90 backdrop-blur-sm hover:border-primary/40"
            />
          </div>
        )}

        {/* Search Results (Absolutely positioned to not push content down) */}
        <div className="relative z-50">
          {!selectedGuest && searchQuery && filteredGuests.length > 0 && (
            <div className="absolute top-0 left-0 right-0 bg-card rounded-2xl shadow-2xl border border-border/80 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="max-h-[300px] overflow-y-auto">
                {filteredGuests.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => {
                      setSelectedGuestId(guest.id);
                      setSearchedGuestId(guest.id);
                      setSearchQuery(""); // Clear search to hide dropdown
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <User size={20} />
                      </div>
                      <span className="font-medium text-lg">{`${guest.firstName} ${guest.lastName}`.trim() || "Unnamed Guest"}</span>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedGuest && searchQuery && filteredGuests.length === 0 && (
            <div className="absolute top-0 left-0 right-0 text-center p-8 bg-card rounded-2xl shadow-xl border border-border/80">
              <p className="text-muted-foreground text-lg">No guest found with that name.</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching by your first or last name only.</p>
            </div>
          )}
        </div>

        {/* Selected Guest Details */}
        {selectedGuest && (
          <div className="bg-card rounded-2xl shadow-xl border border-primary/20 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex flex-shrink-0 items-center justify-center shadow-inner">
                  <MapPin size={24} className="text-primary animate-bounce" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-foreground">
                    {`${selectedGuest.firstName} ${selectedGuest.lastName}`.trim() || "Unnamed Guest"}
                  </h2>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {assignedTable ? (
                      <span>You are seated at <strong className="text-primary font-bold text-base bg-primary/10 px-2 py-0.5 rounded ml-1">Table {assignedTable.number}</strong></span>
                    ) : (
                      "Please see the host for your seating arrangement."
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedGuestId(null);
                  setSearchedGuestId(null);
                  setSearchQuery("");
                }}
                className="text-primary text-sm font-semibold hover:bg-primary/10 px-4 py-2 bg-primary/5 rounded-lg transition-colors whitespace-nowrap border border-primary/20"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Static Floor Plan */}
      <div className="w-full max-w-xl mx-auto mt-4 bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden flex-grow flex flex-col min-h-[250px]">
        <div className="p-3 bg-muted/30 border-b border-border/50 flex-shrink-0">
          <h3 className="text-base font-semibold text-center">Floor Plan Overview</h3>
        </div>
        <div className="w-full flex-grow relative pointer-events-none">
          <SortedCanvasStageAdapter shapeAtoms={shapeAtoms} isStatic={true} />
        </div>
      </div>
    </div>
  );
}
