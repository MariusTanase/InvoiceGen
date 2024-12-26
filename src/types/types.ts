export interface Invoice {
  id?: number;
  invoiceNo: string;
  date: string;
  dueDate: string;
  recipient: string;
  items: InvoiceItem[];
  total: number;
}

export interface InvoiceItem {
  date: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceDetails {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  recipient: string;
  date: string;
  tax: number;
  subTotal: number;
  total: number;
  items: InvoiceItem[];
}

export interface ContactDetails {
  name: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
}

export type DialogBankDetailsProps = {
  open: boolean;
  set: (open: boolean) => void;
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
};

export type BankDetails = {
  account: string;
  sort_code: string;
  account_name: string;
};

// types/types.ts
export type SenderData = {
  id?: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
};

export type BusinessData = {
  id?: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
};
