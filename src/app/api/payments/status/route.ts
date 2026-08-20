export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { transactionStorage } from '@/lib/payments/storage';
import { mtnMoMoService } from '@/lib/payments/mtnService';
import { orangeMoneyService } from '@/lib/payments/orangeService';
import { PaymentReceipt } from '@/lib/payments/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ref = searchParams.get('ref');

    if (!id && !ref) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID or Reference ID is required' },
        { status: 400 }
      );
    }

    const txn = id 
      ? transactionStorage.getById(id) 
      : transactionStorage.getByReferenceId(ref!);

    if (!txn) {
      return NextResponse.json(
        { success: false, message: 'Transaction record not found' },
        { status: 404 }
      );
    }

    // If still pending, query the provider
    if (txn.status === 'pending') {
      if (txn.provider === 'mtn') {
        await mtnMoMoService.checkStatus(txn.referenceId);
      } else {
        await orangeMoneyService.checkStatus(txn.referenceId);
      }
    }

    // Refresh after potential update
    const updatedTxn = transactionStorage.getById(txn.id) || txn;

    // Generate receipt object if successful
    let receipt: PaymentReceipt | undefined = undefined;
    if (updatedTxn.status === 'successful') {
      const fee = Math.round(updatedTxn.amount * 0.01); // 1% platform/operator fee
      receipt = {
        receiptNumber: `REC-${updatedTxn.provider.toUpperCase()}-${updatedTxn.id.substring(4)}`,
        transactionId: updatedTxn.id,
        referenceId: updatedTxn.referenceId,
        provider: updatedTxn.provider,
        payerName: updatedTxn.payerName,
        phoneNumber: updatedTxn.phoneNumber,
        description: updatedTxn.description,
        amount: updatedTxn.amount,
        fee,
        totalPaid: updatedTxn.amount,
        currency: updatedTxn.currency,
        status: updatedTxn.status,
        paidAt: updatedTxn.completedAt || updatedTxn.updatedAt,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/receipts/${updatedTxn.id}`
      };
    }

    return NextResponse.json({
      success: true,
      transactionId: updatedTxn.id,
      referenceId: updatedTxn.referenceId,
      provider: updatedTxn.provider,
      status: updatedTxn.status,
      amount: updatedTxn.amount,
      currency: updatedTxn.currency,
      phoneNumber: updatedTxn.phoneNumber,
      financialTransactionId: updatedTxn.financialTransactionId,
      failureReason: updatedTxn.failureReason,
      timestamp: updatedTxn.updatedAt,
      receipt
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error checking payment status' },
      { status: 500 }
    );
  }
}
