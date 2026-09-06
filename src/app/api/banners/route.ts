import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/banners - Public endpoint to fetch active banners by position and format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || 'home';
    const format = searchParams.get('format') || '';

    const now = new Date();

    const dateFilter = {
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: { lte: now } }, { endDate: null }] },
        { AND: [{ startDate: null }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] },
      ],
    };

    // When position is "all", return all active banners regardless of position
    const whereClause: Record<string, unknown> = position === 'all'
      ? { isActive: true, ...dateFilter }
      : { position, isActive: true, ...dateFilter };

    // Add format filter if specified
    if (format) {
      whereClause.format = format;
    }

    const takeLimit = position === 'all' ? 50 : 10;

    const banners = await db.ad.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: takeLimit,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        link: true,
        type: true,
        position: true,
        format: true,
        createdAt: true,
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bannières' },
      { status: 500 }
    );
  }
}
