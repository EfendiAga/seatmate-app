import type { Table, VenueElement, Guest } from "../../types/seatingChart";

export interface VenueData {
  shapes: Array<VenueElement | Table>;
  guests: Guest[];
  eventTitle: string;
  tableCounter: number;
}

export interface Venue {
  slug: string;
  venueData: VenueData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueResponse {
  slug: string;
}
