import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tables = await prisma.table.findMany();
    const venues = await prisma.venueElement.findMany();
    const guests = await prisma.guest.findMany();

    // Map properties back exactly as frontend expects
    const shapes = [
      ...tables.map(t => ({ ...t, type: 'table' })),
      ...venues.map(v => ({ ...v, type: 'venue' }))
    ];

    return NextResponse.json({ shapes, guests });
  } catch (error) {
    console.error("Load error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
