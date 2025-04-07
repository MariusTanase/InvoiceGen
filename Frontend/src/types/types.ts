export interface ContactDetails {
  id?: number;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postcode: string;
  email: string;
  phone?: string;
}

export type SenderData = ContactDetails;
export type BusinessData = ContactDetails;

export interface BankDetails {
  id?: number;
  account: string;
  sort_code: string;
  account_name: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  date: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceDetails {
  items: InvoiceItem[];
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  recipient: string;
  date: string;
  tax: number;
  subTotal: number;
  total: number;
}

export interface Invoice {
  id?: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  date?: string;
  recipient?: string;
  tax: number;
  subTotal: number;
  total: number;
  sender: SenderData;
  business: BusinessData;
  bankDetails: BankDetails;
  items: InvoiceItem[];
  created_at?: string;
}

export interface InvoiceData {
  invoiceDetails: InvoiceDetails;
  sender: SenderData;
  business: BusinessData;
  bankDetails: BankDetails;
}