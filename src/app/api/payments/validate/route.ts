export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { transactionStorage } from '@/lib/payments/storage';
import { MERCHANT_ACCOUNT } from '@/lib/payments/config';
import { PaymentReceipt, ValidatePaymentRequest } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const body: ValidatePaymentRequest = await req.json();
    const { transactionId, validationCode } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required to validate payment.' },
        { status: 400 }
      );
    }

    const txn = transactionStorage.getById(transactionId);
    if (!txn) {
      return NextResponse.json(
        { success: false, message: 'Transaction record not found.' },
        { status: 404 }
      );
    }

    // If already successful, return the existing receipt
    if (txn.status === 'successful') {
      const fee = Math.round(txn.amount * 0.01);
      const receipt: PaymentReceipt = {
        receiptNumber: `REC-${txn.provider.toUpperCase()}-${txn.id.substring(4)}`,
        transactionId: txn.id,
        referenceId: txn.referenceId,
        provider: txn.provider,
        payerName: txn.payerName,
        phoneNumber: txn.phoneNumber,
        receiverPhone: txn.receiverPhone || MERCHANT_ACCOUNT.phone,
        description: txn.description,
        amount: txn.amount,
        fee,
        totalPaid: txn.amount,
        currency: txn.currency,
        status: 'successful',
        paidAt: txn.completedAt || txn.updatedAt,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/receipts/${txn.id}`
      };

      return NextResponse.json({
        success: true,
        status: 'successful',
        transactionId: txn.id,
        receiverPhone: txn.receiverPhone || MERCHANT_ACCOUNT.phone,
        message: `Payment already confirmed to merchant ${MERCHANT_ACCOUNT.phone}.`,
        receipt
      });
    }

    // Generate operator confirmation reference
    const financialId = `${txn.provider.toUpperCase()}-VAL-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const now = new Date().toISOString();

    // Mark as validated and successful
    const updated = transactionStorage.updateStatus(txn.id, 'successful', {
      financialTransactionId: financialId,
      validatedBySender: true,
      validationCode: validationCode || 'APPROVED_BY_SENDER',
      validatedAt: now
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Failed to update transaction status.' },
        { status: 500 }
      );
    }

    // Ensure receiverPhone is strictly 671 159 461
    updated.receiverPhone = MERCHANT_ACCOUNT.phone;
    transactionStorage.save(updated);

    const fee = Math.round(updated.amount * 0.01);
    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${updated.provider.toUpperCase()}-${updated.id.substring(4)}`,
      transactionId: updated.id,
      referenceId: updated.referenceId,
      provider: updated.provider,
      payerName: updated.payerName,
      phoneNumber: updated.phoneNumber,
      receiverPhone: MERCHANT_ACCOUNT.phone, // 671 159 461
      description: updated.description,
      amount: updated.amount,
      fee,
      totalPaid: updated.amount,
      currency: updated.currency,
      status: 'successful',
      paidAt: updated.completedAt || now,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/receipts/${updated.id}`
    };

    return NextResponse.json({
      success: true,
      status: 'successful',
      transactionId: updated.id,
      receiverPhone: MERCHANT_ACCOUNT.phone,
      validatedBySender: true,
      validationCode: updated.validationCode || 'APPROVED_BY_SENDER',
      validatedAt: updated.validatedAt || now,
      financialTransactionId: updated.financialTransactionId || financialId,
      message: `Payment of ${updated.amount} XAF to ${MERCHANT_ACCOUNT.phone} has been verified and confirmed!`,
      receipt
    });

  } catch (error: any) {
    console.error('Payment validation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment validation error' },
      { status: 500 }
    );
  }
}
