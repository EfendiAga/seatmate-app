export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableId: string;
  chairIndex: number;
  email?: string;
  rsvpStatus?: 'attending' | 'declined' | 'pending';
  dietaryNotes?: string;
  isCheckedIn?: boolean;
}

export interface Table {
  type: "table";
  id: string;
  number: number;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  tableShape?: 'round' | 'rectangular' | 'serpentine' | 'chair_rows' | 'classroom';
  name?: string;
  capacity: number;
  draggable?: boolean;
  groupId?: string;
}

export interface VenueElement {
  type: "venue";
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  draggable?: boolean;
  groupId?: string;
}
