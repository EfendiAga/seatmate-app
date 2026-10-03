"use client";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAtomValue, useAtom } from "jotai";
import { guestsAtom, baseShapesAtom, eventTitleAtom, shapeAtomsAtom, searchedGuestIdAtom, hostModeAtom } from "@/lib/atoms";
import { Table } from "@/types/seatingChart";
import { SortedCanvasStageAdapter } from "./SortedCanvasStageAdapter";
import { useSetAtom } from "jotai";

export function GuestSimpleSearch() {
  const [guests, setGuests] = useAtom(guestsAtom);
  const baseShapes = useAtomValue(baseShapesAtom);
  const eventTitle = useAtomValue(eventTitleAtom);
  const shapeAtoms = useAtomValue(shapeAtomsAtom);
  const setSearchedGuestId = useSetAtom(searchedGuestIdAtom);
  const hostMode = useAtomValue(hostModeAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const tables = useMemo(
    () => baseShapes.filter((s): s is Table => s.type === "table"),
    [baseShapes],
  );

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim() && !hostMode) return [];
    if (!searchQuery.trim() && hostMode) return guests;
    const query = searchQuery.toLowerCase();
    return guests.filter((g) => {
      const fullName = `${g.firstName} ${g.lastName}`.trim().toLowerCase();
      return fullName.includes(query);
    });
  }, [guests, searchQuery, hostMode]);

  const selectedGuest = useMemo(() => {
    return guests.find((g) => g.id === selectedGuestId);
  }, [guests, selectedGuestId]);

  const assignedTable = useMemo(() => {
    if (!selectedGuest?.tableId) return null;
    return tables.find((t) => t.id === selectedGuest.tableId);
  }, [selectedGuest, tables]);

  const toggleCheckIn = (e: React.MouseEvent, guestId: string) => {
    e.stopPropagation();
    setGuests(guests.map(g => g.id === guestId ? { ...g, isCheckedIn: !g.isCheckedIn } : g));
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-2 md:p-4 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <div className={`w-full max-w-xl mx-auto space-y-4 mt-2 md:mt-4 flex-shrink-0 z-10 ${hostMode ? 'flex flex-col h-[50vh] md:h-[60vh]' : ''}`}>
        
        {(!selectedGuest || hostMode) && (
          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {hostMode ? "Host Dashboard" : `Welcome to ${eventTitle}`}
            </h1>
            <p className="text-muted-foreground text-sm">{hostMode ? "Manage guest arrivals" : "Find your seat to get started"}</p>
          </div>
        )}

        {(!selectedGuest || hostMode) && (
          <div className="relative group flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!hostMode) {
                  setSelectedGuestId(null);
                  setSearchedGuestId(null);
                }
              }}
              placeholder="Search guests..."
              className="pl-10 h-12 text-base rounded-xl border-2 border-primary/20 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all bg-card/90 backdrop-blur-sm hover:border-primary/40"
            />
          </div>
        )}

        <div className={`${hostMode ? 'flex-1 overflow-y-auto rounded-2xl border border-border/80 bg-card shadow-lg' : 'relative z-50'}`}>
          {(!selectedGuest || hostMode) && filteredGuests.length > 0 && (
            <div className={`${!hostMode ? 'absolute top-0 left-0 right-0 bg-card rounded-2xl shadow-2xl border border-border/80 overflow-hidden animate-in slide-in-from-top-2 duration-300' : ''}`}>
              <div className={`${!hostMode ? 'max-h-[300px] overflow-y-auto' : ''}`}>
                {filteredGuests.map((guest) => {
                  const isArrived = guest.isCheckedIn;
                  return (
                    <button
                      key={guest.id}
                      onClick={() => {
                        setSelectedGuestId(guest.id);
                        setSearchedGuestId(guest.id);
                        if (!hostMode) setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 text-left group ${selectedGuestId === guest.id ? 'bg-primary/5' : ''} ${isArrived && hostMode ? 'bg-green-500/10' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform ${isArrived && hostMode ? 'bg-green-500/20 text-green-600' : 'bg-primary/10 text-primary'} group-hover:scale-110`}>
                          {isArrived && hostMode ? <CheckCircle2 size={20} /> : <User size={20} />}
                        </div>
                        <span className={`font-medium text-lg ${isArrived && hostMode ? 'text-green-700' : ''}`}>{`${guest.firstName} ${guest.lastName}`.trim() || "Unnamed Guest"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {hostMode && (
                          <div 
                            onClick={(e) => toggleCheckIn(e, guest.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase cursor-pointer border transition-colors ${isArrived ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                          >
                            {isArrived ? 'Arrived' : 'Check In'}
                          </div>
                        )}
                        {!hostMode && <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedGuest && searchQuery && filteredGuests.length === 0 && (
            <div className={`${!hostMode ? 'absolute top-0 left-0 right-0' : 'mt-4'} text-center p-8 bg-card rounded-2xl shadow-xl border border-border/80`}>
              <p className="text-muted-foreground text-lg">No guest found with that name.</p>
            </div>
          )}
        </div>

        {selectedGuest && !hostMode && (
          <div className="bg-card rounded-2xl shadow-xl border border-primary/20 overflow-hidden animate-in zoom-in-95 duration-300 flex-shrink-0">
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
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-background border-2 border-primary/20 hover:border-primary/50 text-foreground font-medium rounded-xl transition-all hover:bg-muted"
              >
                Back to Search
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 w-full relative z-0 transition-all duration-500 ease-in-out ${(!selectedGuest && !hostMode) ? 'opacity-80 scale-95 blur-[1px] pointer-events-none' : 'opacity-100 scale-100'} mt-4`}>
        <SortedCanvasStageAdapter shapeAtoms={shapeAtoms} />
        {(!selectedGuest && !hostMode) && (
          <div className="absolute inset-0 bg-background/5 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-background/80 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground shadow-sm">
              Search your name above
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
