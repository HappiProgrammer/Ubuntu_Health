/**
 * Official Cameroon Mobile Money Merchant Configuration
 * Linked receiving account: 671 159 461
 */

export const MERCHANT_ACCOUNT = {
  // Official linked merchant phone number
  phone: '671 159 461',
  rawPhone: '671159461',
  internationalPhone: '+237 671 159 461',
  apiPhone: '237671159461',
  provider: 'mtn' as const,
  accountName: 'BridgeCare Santé / Ubuntu Health Official Merchant',
  businessName: 'BridgeCare Cameroon Santé',
  country: 'Cameroon',
  currency: 'XAF',
  ussdCodes: {
    mtn: '*126#',
    orange: '#150*50#'
  }
} as const;

export type MerchantAccount = typeof MERCHANT_ACCOUNT;
