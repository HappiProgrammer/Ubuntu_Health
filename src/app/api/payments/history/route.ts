export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { transactionStorage } from '@/lib/payments/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    let all = transactionStorage.getAll();
    if (phone) {
      const clean = phone.replace(/[^0-9]/g, '');
      all = all.filter(t => t.phoneNumber.replace(/[^0-9]/g, '').includes(clean));
    }

    return NextResponse.json({
      success: true,
      transactions: all
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
