export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { mtnMoMoService } from '@/lib/payments/mtnService';
import { orangeMoneyService } from '@/lib/payments/orangeService';
import { validateCameroonPhone, detectCarrier } from '@/lib/payments/helpers';
import { InitiatePaymentRequest } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const body: InitiatePaymentRequest = await req.json();

    if (!body.amount || body.amount < 100) {
      return NextResponse.json(
        { success: false, message: 'Minimum transaction amount is 100 FCFA.' },
        { status: 400 }
      );
    }

    if (!body.phoneNumber || !validateCameroonPhone(body.phoneNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Cameroon phone number. Format: 6XX XXX XXX' },
        { status: 400 }
      );
    }

    const detectedProvider = detectCarrier(body.phoneNumber);
    const provider = body.provider || detectedProvider || 'mtn';

    if (provider === 'mtn') {
      const transaction = await mtnMoMoService.requestToPay({
        ...body,
        provider: 'mtn'
      });

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        referenceId: transaction.referenceId,
        provider: 'mtn',
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        phoneNumber: transaction.phoneNumber,
        description: transaction.description,
        ussdPromptSent: true,
        message: 'A payment prompt has been sent to your MTN phone. Please check your screen and enter your MoMo PIN to confirm.'
      });
    } else {
      const { transaction, paymentUrl } = await orangeMoneyService.initiatePayment({
        ...body,
        provider: 'orange'
      });

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        referenceId: transaction.referenceId,
        provider: 'orange',
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        phoneNumber: transaction.phoneNumber,
        description: transaction.description,
        paymentUrl,
        ussdPromptSent: true,
        message: paymentUrl 
          ? 'Orange Money payment session created. Redirecting to payment authorization...'
          : 'An Orange Money payment prompt has been sent to your phone. Enter your secret code #150# or approve the notification.'
      });
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal payment gateway error' },
      { status: 500 }
    );
  }
}
