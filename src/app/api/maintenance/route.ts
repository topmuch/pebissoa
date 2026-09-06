import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await db.siteConfig.findFirst({
      select: {
        maintenanceMode: true,
        maintenanceMessage: true,
        maintenanceEndTime: true,
      },
    });

    if (!config || !config.maintenanceMode) {
      return NextResponse.json({ active: false });
    }

    // If maintenance end time has passed, auto-disable
    if (config.maintenanceEndTime && new Date(config.maintenanceEndTime) < new Date()) {
      await db.siteConfig.updateMany({
        data: { maintenanceMode: false },
      });
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      message: config.maintenanceMessage,
      endTime: config.maintenanceEndTime,
    });
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    return NextResponse.json({ active: false });
  }
}
