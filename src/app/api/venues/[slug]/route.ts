import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const venue = await prisma.venue.findUnique({
      where: { slug: params.slug }
    });
    
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    
    return NextResponse.json({ venue_data: venue.venueData });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const data = await req.json();
    
    // Check if it exists
    const existing = await prisma.venue.findUnique({ where: { slug: params.slug } });
    
    if (existing) {
      await prisma.venue.update({
        where: { slug: params.slug },
        data: {
          venueData: data.venue_data,
          pin: data.pin || existing.pin
        }
      });
    } else {
      await prisma.venue.create({
        data: {
          slug: params.slug,
          pin: data.pin || '1234',
          venueData: data.venue_data
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
