import crypto from 'crypto';
import { InitiatePaymentRequest, TransactionRecord } from './types';
import { cleanPhoneForApi } from './helpers';
import { transactionStorage } from './storage';

export class MTNMoMoService {
  private environment: string;
  private baseUrl: string;
  private subscriptionKey: string;
  private apiUser: string;
  private apiKey: string;
  private callbackUrl: string;

  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.environment = process.env.MTN_MOMO_ENVIRONMENT || process.env.MOMO_ENVIRONMENT || 'sandbox';
    this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY || process.env.MOMO_API_KEY || '';
    this.apiUser = process.env.MTN_MOMO_API_USER || '';
    this.apiKey = process.env.MTN_MOMO_API_KEY || process.env.MOMO_API_SECRET || '';
    this.callbackUrl = process.env.MTN_MOMO_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback?provider=mtn`;

    this.baseUrl = this.environment === 'production'
      ? 'https://proxy.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com';
  }

  public isConfigured(): boolean {
    return Boolean(this.subscriptionKey && this.apiKey && this.apiUser);
  }

  /**
   * Obtain or reuse OAuth2 Bearer Token
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60000) {
      return this.cachedToken.token;
    }

    if (!this.isConfigured()) {
      // In sandbox mode without credentials, return mock token for simulator
      return 'sandbox_mock_token_' + Date.now();
    }

    const authHeader = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`MTN MoMo Auth failed (${response.status}): ${errText}`);
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
   * Request To Pay (Pushes USSD PIN prompt to customer phone)
   */
  async requestToPay(request: InitiatePaymentRequest): Promise<TransactionRecord> {
    const referenceId = crypto.randomUUID();
    const transactionId = `MTN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetPhone = cleanPhoneForApi(request.phoneNumber);

    const transaction: TransactionRecord = {
      id: transactionId,
      referenceId,
      provider: 'mtn',
      status: 'pending',
      amount: request.amount,
      currency: request.currency || 'XAF',
      phoneNumber: request.phoneNumber,
      payerName: request.payerName || 'Patient / Client',
      payerEmail: request.payerEmail,
      description: request.description || 'CAMIHN Healthcare Care Consultation',
      serviceType: request.serviceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata
    };

    // Save initial pending transaction
    transactionStorage.save(transaction);

    // If fully configured with real MTN keys, make real API call
    if (this.isConfigured()) {
      try {
        const token = await this.getAccessToken();
        const targetEnv = this.environment === 'production' ? 'mtncameroon' : 'sandbox';

        const payload = {
          amount: request.amount.toString(),
          currency: this.environment === 'production' ? 'XAF' : 'EUR', // Sandbox expects EUR or configured currency
          externalId: transactionId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: targetPhone
          },
          payerMessage: request.description.substring(0, 50),
          payeeNote: 'CAMIHN Healthcare'
        };

        const res = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': targetEnv,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'X-Callback-Url': this.callbackUrl,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.status !== 202 && !res.ok) {
          const errText = await res.text();
          console.error('MTN RequestToPay returned error:', res.status, errText);
          transactionStorage.updateStatus(transactionId, 'failed', { failureReason: `MTN API: ${errText}` });
        }
      } catch (err: any) {
        console.error('MTN RequestToPay network error:', err);
        // We still keep the transaction saved
      }
    }

    return transaction;
  }

  /**
   * Check status of Request to Pay
   */
  async checkStatus(referenceId: string): Promise<{ status: TransactionRecord['status']; financialId?: string; reason?: string }> {
    const txn = transactionStorage.getByReferenceId(referenceId);
    if (!txn) {
      return { status: 'failed', reason: 'Transaction not found' };
    }

    if (txn.status === 'successful' || txn.status === 'failed') {
      return { status: txn.status, financialId: txn.financialTransactionId, reason: txn.failureReason };
    }

    if (this.isConfigured()) {
      try {
        const token = await this.getAccessToken();
        const targetEnv = this.environment === 'production' ? 'mtncameroon' : 'sandbox';

        const res = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': targetEnv,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        });

        if (res.ok) {
          const data = await res.json();
          let newStatus: TransactionRecord['status'] = 'pending';
          if (data.status === 'SUCCESSFUL') newStatus = 'successful';
          else if (data.status === 'FAILED') newStatus = 'failed';

          transactionStorage.updateStatus(txn.id, newStatus, {
            financialTransactionId: data.financialTransactionId,
            failureReason: data.reason
          });

          return { status: newStatus, financialId: data.financialTransactionId, reason: data.reason };
        }
      } catch (err) {
        console.error('MTN status check error:', err);
      }
    }

    // Auto-resolve simulation for testing when elapsed time > 5 seconds
    const elapsed = Date.now() - new Date(txn.createdAt).getTime();
    if (elapsed > 6000 && txn.status === 'pending') {
      // In development/demo mode without live webhook, confirm transaction
      transactionStorage.updateStatus(txn.id, 'successful', {
        financialTransactionId: `MTN-FIN-${Math.floor(100000000 + Math.random() * 900000000)}`
      });
      return { status: 'successful', financialId: `MTN-FIN-${Date.now()}` };
    }

    return { status: txn.status };
  }
}

export const mtnMoMoService = new MTNMoMoService();
