export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
  ONLINE = 'ONLINE'
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface AccountCategoryInput {
  name: string;
  type: TransactionType;
  description?: string;
}

export interface AccountVendorInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  bankDetails?: string;
  status?: VendorStatus;
}

export interface AccountTransactionInput {
  title: string;
  description?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  status?: TransactionStatus;
  receiptUrl?: string;
  isReconciled?: boolean;
  financialYearId: string;
  categoryId: string;
  vendorId?: string;
  feePaymentId?: string;
  payrollId?: string;
  transportExpenseId?: string;
}
