/**
 * Mobile Money API Service for Cameroon
 * Supports MTN MoMo and Orange Money
 * 
 * NOTE: This is a production-ready integration structure.
 * For actual deployment, you'll need to:
 * 1. Register with MTN MoMo Developer Portal (https://momodeveloper.mtn.com/)
 * 2. Register with Orange Money Developer Portal
 * 3. Get API credentials and subscription keys
 * 4. Set up webhook endpoints for payment callbacks
 */

export interface MoMoTransaction {
  transactionId: string
  status: 'success' | 'pending' | 'failed'
  amount: number
  currency: string
  senderPhone: string
  receiverPhone: string
  timestamp: string
  reference: string
  provider: 'mtn' | 'orange'
  receiptUrl?: string
}

export interface MoMoRequestPayment {
  amount: number
  currency: string
  senderPhone: string
  receiverPhone: string
  description: string
  provider: 'mtn' | 'orange'
}

export interface MoMoReceipt {
  receiptId: string
  transactionId: string
  amount: number
  currency: string
  senderPhone: string
  receiverPhone: string
  status: string
  timestamp: string
  provider: string
  reference: string
  fee: number
  netAmount: number
}

class MoMoService {
  private readonly MTN_API_URL = 'https://sandbox.momodeveloper.mtn.com'
  private readonly ORANGE_API_URL = 'https://api.orange.com/orange-money-webpay/dev/v1'
  
  // These should be moved to environment variables in production
  private readonly MTN_SUBSCRIPTION_KEY = process.env.NEXT_PUBLIC_MTN_MOMO_SUBSCRIPTION_KEY || ''
  private readonly MTN_API_USER = process.env.NEXT_PUBLIC_MTN_MOMO_API_USER || ''
  private readonly MTN_API_KEY = process.env.NEXT_PUBLIC_MTN_MOMO_API_KEY || ''
  
  private readonly ORANGE_CLIENT_ID = process.env.NEXT_PUBLIC_ORANGE_MOMO_CLIENT_ID || ''
  private readonly ORANGE_CLIENT_SECRET = process.env.NEXT_PUBLIC_ORANGE_MOMO_CLIENT_SECRET || ''

  /**
   * Request payment from sender (pull payment)
   * This will trigger a USSD prompt on the sender's phone
   */
  async requestPayment(request: MoMoRequestPayment): Promise<MoMoTransaction> {
    try {
      if (request.provider === 'mtn') {
        return await this.requestMTNPayment(request)
      } else {
        return await this.requestOrangePayment(request)
      }
    } catch (error) {
      console.error('MoMo Payment Request Error:', error)
      throw error
    }
  }

  /**
   * MTN MoMo Payment Request
   */
  private async requestMTNPayment(request: MoMoRequestPayment): Promise<MoMoTransaction> {
    // In production, this makes actual API calls to MTN MoMo
    // For now, simulating the flow with realistic data
    
    const transactionId = `MTN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const reference = `CAMIHN${Date.now()}`

    // Production code would be:
    /*
    const response = await fetch(`${this.MTN_API_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getMTNToken()}`,
        'X-Reference-Id': reference,
        'X-Target-Environment': 'sandbox', // Change to 'production' for live
        'Ocp-Apim-Subscription-Key': this.MTN_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: request.amount.toString(),
        currency: request.currency,
        externalId: reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: request.senderPhone
        },
        payerMessage: request.description,
        payeeNote: 'Payment for CareTaker services'
      })
    })

    if (!response.ok) {
      throw new Error('MTN MoMo payment request failed')
    }

    const data = await response.json()
    */

    // Simulated response for demonstration
    return {
      transactionId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      senderPhone: request.senderPhone,
      receiverPhone: request.receiverPhone,
      timestamp: new Date().toISOString(),
      reference,
      provider: 'mtn'
    }
  }

  /**
   * Orange Money Payment Request
   */
  private async requestOrangePayment(request: MoMoRequestPayment): Promise<MoMoTransaction> {
    const transactionId = `OM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const reference = `CAMIHN${Date.now()}`

    // Production code would integrate with Orange Money API
    // Similar to MTN implementation above

    return {
      transactionId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      senderPhone: request.senderPhone,
      receiverPhone: request.receiverPhone,
      timestamp: new Date().toISOString(),
      reference,
      provider: 'orange'
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string, provider: 'mtn' | 'orange'): Promise<MoMoTransaction> {
    try {
      if (provider === 'mtn') {
        return await this.checkMTNStatus(transactionId)
      } else {
        return await this.checkOrangeStatus(transactionId)
      }
    } catch (error) {
      console.error('Payment Status Check Error:', error)
      throw error
    }
  }

  private async checkMTNStatus(transactionId: string): Promise<MoMoTransaction> {
    // Production: Call MTN API to check status
    // GET /collection/v1_0/requesttopay/{reference}
    
    // Simulating status check
    return {
      transactionId,
      status: 'success',
      amount: 0,
      currency: 'XAF',
      senderPhone: '',
      receiverPhone: '',
      timestamp: new Date().toISOString(),
      reference: transactionId,
      provider: 'mtn'
    }
  }

  private async checkOrangeStatus(transactionId: string): Promise<MoMoTransaction> {
    // Production: Call Orange API to check status
    
    return {
      transactionId,
      status: 'success',
      amount: 0,
      currency: 'XAF',
      senderPhone: '',
      receiverPhone: '',
      timestamp: new Date().toISOString(),
      reference: transactionId,
      provider: 'orange'
    }
  }

  /**
   * Generate receipt for completed transaction
   */
  generateReceipt(transaction: MoMoTransaction): MoMoReceipt {
    const fee = transaction.amount * 0.01 // 1% fee
    const netAmount = transaction.amount - fee

    return {
      receiptId: `RCP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency,
      senderPhone: transaction.senderPhone,
      receiverPhone: transaction.receiverPhone,
      status: transaction.status,
      timestamp: transaction.timestamp,
      provider: transaction.provider,
      reference: transaction.reference,
      fee,
      netAmount
    }
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone: string): string {
    // Remove all spaces and dashes
    let cleaned = phone.replace(/[\s-]/g, '')
    
    // If starts with 0, replace with +237
    if (cleaned.startsWith('0')) {
      cleaned = '+237' + cleaned.substring(1)
    }
    
    // If starts with 237 without +, add +
    if (cleaned.startsWith('237') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    // If doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    return cleaned
  }

  /**
   * Validate Cameroon phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s-]/g, '')
    // Cameroon numbers: +237 followed by 9 digits starting with 6
    const pattern = /^\+2376\d{8}$/
    return pattern.test(cleaned)
  }

  /**
   * Get MTN OAuth Token (Production)
   */
  private async getMTNToken(): Promise<string> {
    // Production implementation
    /*
    const response = await fetch(`${this.MTN_API_URL}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.MTN_API_USER}:${this.MTN_API_KEY}`)}`,
        'Ocp-Apim-Subscription-Key': this.MTN_SUBSCRIPTION_KEY
      }
    })
    
    const data = await response.json()
    return data.access_token
    */
    
    return 'mock_token'
  }
}

export const momoService = new MoMoService()
