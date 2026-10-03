import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, XCircle, Search, Mail } from "lucide-react";
import { useAtom } from "jotai";
import { guestsAtom, baseShapesAtom } from "@/lib/atoms";
import { Table as TableShape } from "@/types/seatingChart";
import { useState } from "react";

export function GuestListSheet() {
  const [guests, setGuests] = useAtom(guestsAtom);
  const [shapes] = useAtom(baseShapesAtom);
  const [search, setSearch] = useState("");

  const tables = shapes.filter(s => s.type === "table") as TableShape[];

  const filteredGuests = guests.filter(g => {
    const table = tables.find(t => t.id === g.tableId);
    const tableName = table ? (table.name || `Table ${table.number}`) : 'Unassigned';
    const combined = `${g.firstName} ${g.lastName} ${tableName} ${g.dietaryNotes || ''}`.toLowerCase();
    return combined.includes(search.toLowerCase());
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="glass shadow-premium border-none gap-2 px-4 ml-4 font-semibold text-primary">
          <Users size={16} /> Guest CRM
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[800px] sm:w-[900px] max-w-full glass border-l border-white/20">
        <SheetHeader>
          <SheetTitle className="text-3xl font-bold tracking-tight">Master Guest List</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 mt-8 h-full">
           <div className="grid grid-cols-3 gap-4">
             <div className="flex items-center gap-4 bg-background/40 p-5 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
               <div className="bg-green-500/20 text-green-500 p-3 rounded-xl">
                 <CheckCircle size={24} />
               </div>
               <div>
                 <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attending</div>
                 <div className="text-3xl font-bold text-foreground">{guests.filter(g => g.rsvpStatus === 'attending').length}</div>
               </div>
             </div>
             <div className="flex items-center gap-4 bg-background/40 p-5 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
               <div className="bg-yellow-500/20 text-yellow-500 p-3 rounded-xl">
                 <Clock size={24} />
               </div>
               <div>
                 <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</div>
                 <div className="text-3xl font-bold text-foreground">{guests.filter(g => !g.rsvpStatus || g.rsvpStatus === 'pending').length}</div>
               </div>
             </div>
             <div className="flex items-center gap-4 bg-background/40 p-5 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
               <div className="bg-destructive/20 text-destructive p-3 rounded-xl">
                 <XCircle size={24} />
               </div>
               <div>
                 <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Declined</div>
                 <div className="text-3xl font-bold text-foreground">{guests.filter(g => g.rsvpStatus === 'declined').length}</div>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3 bg-background/40 border border-white/20 shadow-sm p-3 rounded-xl backdrop-blur-md">
             <Search size={18} className="text-muted-foreground ml-2" />
             <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by guest name..." 
               className="bg-transparent border-none outline-none flex-1 py-1 text-base placeholder:text-muted-foreground/70"
             />
           </div>

           <div className="flex-1 overflow-auto rounded-xl border border-white/20 bg-background/40 shadow-sm backdrop-blur-md hide-scrollbar mb-12">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/50 sticky top-0 backdrop-blur-xl border-b border-white/20">
                 <tr>
                   <th className="p-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Guest Name</th>
                   <th className="p-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Assigned Table</th>
                   <th className="p-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">RSVP Status</th>
                   <th className="p-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Dietary Needs</th>
                   <th className="p-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">Action</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredGuests.length === 0 ? (
                   <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No guests found. Start adding guests from the sidebar!</td></tr>
                 ) : null}
                 {filteredGuests.map(guest => {
                   const table = tables.find(t => t.id === guest.tableId);
                   return (
                     <tr key={guest.id} className="border-b border-white/10 hover:bg-muted/30 transition-colors">
                       <td className="p-4 font-medium text-base">{guest.firstName} {guest.lastName}</td>
                       <td className="p-4 text-muted-foreground font-medium">
                         <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">{table ? table.name || `Table ${table.number}` : 'Unassigned'}</span>
                       </td>
                       <td className="p-4">
                         <select 
                           value={guest.rsvpStatus || 'pending'}
                           onChange={(e) => {
                             const newGuests = guests.map(g => g.id === guest.id ? {...g, rsvpStatus: e.target.value as any} : g);
                             setGuests(newGuests);
                           }}
                           className="bg-transparent border border-white/20 rounded-lg p-2 text-sm font-medium outline-none focus:border-primary transition-all cursor-pointer"
                         >
                           <option value="pending">?? Pending</option>
                           <option value="attending">?? Attending</option>
                           <option value="declined">?? Declined</option>
                         </select>
                       </td>
                       <td className="p-4 text-sm text-muted-foreground">
                         <input 
                           type="text"
                           placeholder="Add note..."
                           value={guest.dietaryNotes || ''}
                           onChange={(e) => {
                             const newGuests = guests.map(g => g.id === guest.id ? {...g, dietaryNotes: e.target.value} : g);
                             setGuests(newGuests);
                           }}
                           className="bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/50"
                         />
                       </td>
                       <td className="p-4">
                         <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg">
                           <Mail size={16} className="mr-2"/> Send Invite
                         </Button>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
