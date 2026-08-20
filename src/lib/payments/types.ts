export type PaymentProvider = 'mtn' | 'orange';

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled';

export type ServiceType = 
  | 'senior_care'
  | 'post_op'
  | 'chronic_disease'
  | 'maternal_care'
  | 'doctor_consultation'
  | 'emergency_dispatch'
  | 'general_care';

export interface InitiatePaymentRequest {
  provider: PaymentProvider;
  amount: number;
  currency?: string; // Defaults to 'XAF'
  phoneNumber: string;
  payerName?: string;
  payerEmail?: string;
  description: string;
  serviceType?: ServiceType | string;
  metadata?: Record<string, any>;
}

export interface InitiatePaymentResponse {
  success: boolean;
  transactionId: string;
  referenceId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
  paymentUrl?: string;
  message: string;
  ussdPromptSent?: boolean;
  expiresAt?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  transactionId: string;
  referenceId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  phoneNumber: string;
  financialTransactionId?: string;
  failureReason?: string;
  timestamp: string;
  receipt?: PaymentReceipt;
}

export interface PaymentReceipt {
  receiptNumber: string;
  transactionId: string;
  referenceId: string;
  provider: PaymentProvider;
  payerName: string;
  phoneNumber: string;
  description: string;
  amount: number;
  fee: number;
  totalPaid: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string;
  verificationUrl?: string;
}

export interface TransactionRecord {
  id: string;
  referenceId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  phoneNumber: string;
  payerName: string;
  payerEmail?: string;
  description: string;
  serviceType?: string;
  financialTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}
