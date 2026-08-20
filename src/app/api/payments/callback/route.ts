export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { transactionStorage } from '@/lib/payments/storage';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || 'mtn';
    const body = await req.json().catch(() => ({}));

    console.log(`Received ${provider.toUpperCase()} Webhook Callback:`, JSON.stringify(body, null, 2));

    let referenceId = body.referenceId || body.externalId || body.order_id || body.notif_token;
    let status = body.status;

    if (referenceId) {
      const txn = transactionStorage.getByReferenceId(referenceId) || transactionStorage.getById(referenceId);
      if (txn) {
        let mappedStatus = txn.status;
        if (status === 'SUCCESSFUL' || status === 'SUCCESS' || status === 'completed') {
          mappedStatus = 'successful';
        } else if (status === 'FAILED' || status === 'FAIL') {
          mappedStatus = 'failed';
        }

        transactionStorage.updateStatus(txn.id, mappedStatus, {
          financialTransactionId: body.financialTransactionId || body.txnid,
          failureReason: body.reason || body.message
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ received: false, error: error.message }, { status: 200 });
  }
}
