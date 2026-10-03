import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const { pin } = await req.json();
    
    const venue = await prisma.venue.findUnique({
      where: { slug: params.slug }
    });
    
    if (!venue) {
      return NextResponse.json({ success: false, message: 'Venue not found' }, { status: 404 });
    }
    
    if (venue.pin === pin) {
      return NextResponse.json({ success: true, role: 'admin', hostPin: venue.hostPin });
    } else if (venue.hostPin && venue.hostPin === pin) {
      return NextResponse.json({ success: true, role: 'host' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
