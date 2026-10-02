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
    <div className="flex flex-col items-center justify-start w-full min-h-full p-2 md:p-4 bg-gradient-to-b from-background to-muted/20 overflow-y-auto">
      <div className="w-full max-w-xl mx-auto space-y-4 mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
        
        {/* Header Section */}
        <div className="text-center space-y-1">
          <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Welcome to
          </Badge>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-1">
            {eventTitle}
          </h1>
          <p className="text-muted-foreground text-sm">Find your seat to get started.</p>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedGuestId(null); // Reset selection on new search
              setSearchedGuestId(null);
            }}
            placeholder="Enter your first or last name..."
            className="pl-10 h-12 text-base rounded-xl border-2 border-primary/20 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all bg-card/90 backdrop-blur-sm hover:border-primary/40"
          />
        </div>

        {/* Search Results */}
        {!selectedGuest && searchQuery && filteredGuests.length > 0 && (
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => {
                    setSelectedGuestId(guest.id);
                    setSearchedGuestId(guest.id);
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
          <div className="text-center p-8 bg-card rounded-2xl shadow-sm border border-border/50">
            <p className="text-muted-foreground text-lg">No guest found with that name.</p>
            <p className="text-sm text-muted-foreground mt-2">Try searching by your first or last name only.</p>
          </div>
        )}

        {/* Selected Guest Details */}
        {selectedGuest && (
          <div className="bg-card rounded-3xl shadow-2xl border border-primary/20 overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Table Number Banner */}
            <div className="bg-primary/10 p-8 text-center border-b border-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              <MapPin size={48} className="mx-auto text-primary mb-4 animate-bounce" />
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                {`${selectedGuest.firstName} ${selectedGuest.lastName}`.trim() || "Unnamed Guest"}
              </h2>
              <div className="text-muted-foreground mb-4">You are seated at</div>
              
              <div className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full text-4xl font-bold shadow-lg">
                {assignedTable ? `Table ${assignedTable.number}` : "Unassigned"}
              </div>
            </div>

            {/* Table Mates Section */}
            {assignedTable && tableMates.length > 0 && (
              <div className="p-6 md:p-8 bg-card">
                <div className="flex items-center space-x-2 text-muted-foreground mb-6">
                  <Users size={20} />
                  <h3 className="font-medium text-lg">Joining you at Table {assignedTable.number}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tableMates.map((mate) => (
                    <div key={mate.id} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-xl">
                      <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                        <User size={16} />
                      </div>
                      <span className="font-medium">{`${mate.firstName} ${mate.lastName}`.trim() || "Unnamed Guest"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {assignedTable && tableMates.length === 0 && (
              <div className="p-6 md:p-8 text-center text-muted-foreground">
                You are currently the only one seated at this table.
              </div>
            )}

            {!assignedTable && (
              <div className="p-6 md:p-8 text-center text-muted-foreground">
                Please see the host for your seating arrangement.
              </div>
            )}

            <div className="p-4 bg-muted/20 border-t border-border/50 text-center">
              <button 
                onClick={() => {
                  setSelectedGuestId(null);
                  setSearchedGuestId(null);
                  setSearchQuery("");
                }}
                className="text-primary font-medium hover:underline px-4 py-2"
              >
                Search for another guest
              </button>
            </div>
          </div>
        )}

        {/* Static Floor Plan */}
        <div className="mt-4 bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          <div className="p-3 bg-muted/30 border-b border-border/50">
            <h3 className="text-base font-semibold text-center">Floor Plan Overview</h3>
          </div>
          <div className="w-full h-[350px] md:h-[500px] relative pointer-events-none">
            <SortedCanvasStageAdapter shapeAtoms={shapeAtoms} isStatic={true} />
          </div>
        </div>

      </div>
    </div>
  );
}
