export type FeeFrequency = "ONCE" | "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface FeeHead {
    id: string;
    name: string;
    amount: number;
    frequency: FeeFrequency;
}

export interface FeeStructure {
    id: string;
    className: string;
    effectiveFrom: string;
    effectiveTo: string;
    heads: FeeHead[];
}

export interface LedgerEntry {
    id: string;
    studentId: string;
    date: string;
    type: "DEBIT" | "CREDIT";
    description: string;
    amount: number; // For DEBIT, it's the charge. For CREDIT, it's the payment.
    balance: number; // Running balance
    invoiceId?: string;
    paymentMethod?: string;
}

export interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    date: string;
    dueDate: string;
    items: { description: string; amount: number }[];
    totalAmount: number;
    paidAmount: number;
    status: "PAID" | "PENDING" | "PARTIAL" | "OVERDUE";
}

export interface FeeProfile {
    studentId: string;
    discounts: { description: string; amount: number }[];
    oneOffCharges: { description: string; amount: number; date: string }[];
}
