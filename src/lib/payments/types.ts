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
  receiverPhone?: string; // Target: 671 159 461
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
  receiverPhone: string; // 671 159 461
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
  receiverPhone?: string;
  validatedBySender?: boolean;
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
  receiverPhone: string; // 671 159 461
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
  receiverPhone: string; // 671 159 461
  payerName: string;
  payerEmail?: string;
  description: string;
  serviceType?: string;
  validatedBySender?: boolean;
  validationCode?: string;
  validatedAt?: string;
  financialTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface ValidatePaymentRequest {
  transactionId: string;
  validationCode?: string;
}

export interface ValidatePaymentResponse {
  success: boolean;
  status: PaymentStatus;
  message: string;
  transactionId: string;
  receiverPhone: string;
  receipt?: PaymentReceipt;
}
