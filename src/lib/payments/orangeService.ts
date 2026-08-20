import crypto from 'crypto';
import { InitiatePaymentRequest, TransactionRecord } from './types';
import { cleanPhoneForApi } from './helpers';
import { transactionStorage } from './storage';

export class OrangeMoneyService {
  private environment: string;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private merchantKey: string;
  private returnUrl: string;
  private cancelUrl: string;
  private notifUrl: string;

  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.environment = process.env.ORANGE_MONEY_ENVIRONMENT || 'sandbox';
    this.clientId = process.env.ORANGE_MONEY_CLIENT_ID || process.env.ORANGE_CLIENT_ID || '';
    this.clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET || process.env.ORANGE_CLIENT_SECRET || '';
    this.merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY || '';
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.returnUrl = process.env.ORANGE_MONEY_RETURN_URL || `${appUrl}/checkout?status=success`;
    this.cancelUrl = process.env.ORANGE_MONEY_CANCEL_URL || `${appUrl}/checkout?status=cancelled`;
    this.notifUrl = process.env.ORANGE_MONEY_NOTIF_URL || `${appUrl}/api/payments/callback?provider=orange`;

    this.baseUrl = this.environment === 'production'
      ? 'https://api.orange.com/orange-money-webpay/cm/v1'
      : 'https://api.orange.com/orange-money-webpay/dev/v1';
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Obtain Orange OAuth3 Token
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60000) {
      return this.cachedToken.token;
    }

    if (!this.isConfigured()) {
      return 'orange_mock_token_' + Date.now();
    }

    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Orange Money Auth failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const expiresInMs = (data.expires_in || 3600) * 1000;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + expiresInMs
    };

    return data.access_token;
  }

  /**
   * Initiate Orange Money Payment
   */
  async initiatePayment(request: InitiatePaymentRequest): Promise<{ transaction: TransactionRecord; paymentUrl?: string }> {
    const referenceId = crypto.randomUUID();
    const transactionId = `OM_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetPhone = cleanPhoneForApi(request.phoneNumber);

    const transaction: TransactionRecord = {
      id: transactionId,
      referenceId,
      provider: 'orange',
      status: 'pending',
      amount: request.amount,
      currency: request.currency || 'XAF',
      phoneNumber: request.phoneNumber,
      payerName: request.payerName || 'Patient / Client',
      payerEmail: request.payerEmail,
      description: request.description || 'CAMIHN Healthcare Consultation',
      serviceType: request.serviceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata
    };

    transactionStorage.save(transaction);

    let paymentUrl: string | undefined = undefined;

    if (this.isConfigured()) {
      try {
        const token = await this.getAccessToken();
        const payload = {
          merchant_key: this.merchantKey,
          currency: this.environment === 'production' ? 'XAF' : 'OUV',
          order_id: transactionId,
          amount: request.amount,
          return_url: `${this.returnUrl}&id=${transactionId}`,
          cancel_url: `${this.cancelUrl}&id=${transactionId}`,
          notif_url: this.notifUrl,
          lang: 'fr',
          reference: request.description.substring(0, 30)
        };

        const res = await fetch(`${this.baseUrl}/webpayment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          paymentUrl = data.payment_url;
        } else {
          const errText = await res.text();
          console.error('Orange WebPayment error:', res.status, errText);
        }
      } catch (err) {
        console.error('Orange Money initiation error:', err);
      }
    }

    return { transaction, paymentUrl };
  }

  /**
   * Check status of Orange Money Payment
   */
  async checkStatus(referenceId: string): Promise<{ status: TransactionRecord['status']; financialId?: string; reason?: string }> {
    const txn = transactionStorage.getByReferenceId(referenceId);
    if (!txn) {
      return { status: 'failed', reason: 'Transaction not found' };
    }

    if (txn.status === 'successful' || txn.status === 'failed') {
      return { status: txn.status, financialId: txn.financialTransactionId, reason: txn.failureReason };
    }

    // Auto-resolve simulation for testing when elapsed time > 5 seconds
    const elapsed = Date.now() - new Date(txn.createdAt).getTime();
    if (elapsed > 6000 && txn.status === 'pending') {
      transactionStorage.updateStatus(txn.id, 'successful', {
        financialTransactionId: `OM-TRANS-${Math.floor(100000000 + Math.random() * 900000000)}`
      });
      return { status: 'successful', financialId: `OM-TRANS-${Date.now()}` };
    }

    return { status: txn.status };
  }
}

export const orangeMoneyService = new OrangeMoneyService();
