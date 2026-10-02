import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { shapes, guests } = data;

    // Separate shapes into tables and venues
    const tables = shapes.filter((s: any) => s.type === 'table');
    const venues = shapes.filter((s: any) => s.type === 'venue');

    // Run in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear existing
      await tx.guest.deleteMany({});
      await tx.table.deleteMany({});
      await tx.venueElement.deleteMany({});

      // Insert tables
      if (tables.length > 0) {
        await tx.table.createMany({
          data: tables.map((t: any) => ({
            id: t.id,
            number: t.number || 0,
            x: t.x,
            y: t.y,
            radius: t.radius,
            width: t.width,
            height: t.height,
            tableShape: t.tableShape,
            name: t.name,
            capacity: t.capacity,
            draggable: t.draggable,
            groupId: t.groupId,
          }))
        });
      }

      // Insert venues
      if (venues.length > 0) {
        await tx.venueElement.createMany({
          data: venues.map((v: any) => ({
            id: v.id,
            title: v.title || "Venue Element",
            x: v.x,
            y: v.y,
            width: v.width,
            height: v.height,
            color: v.color,
            stroke: v.stroke,
            strokeWidth: v.strokeWidth,
            draggable: v.draggable,
            groupId: v.groupId,
          }))
        });
      }

      // Insert guests
      if (guests.length > 0) {
        await tx.guest.createMany({
          data: guests.map((g: any) => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
            tableId: g.tableId || null,
            chairIndex: typeof g.chairIndex === 'number' ? g.chairIndex : null,
            email: g.email,
            rsvpStatus: g.rsvpStatus,
            dietaryNotes: g.dietaryNotes,
            isCheckedIn: g.isCheckedIn,
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
