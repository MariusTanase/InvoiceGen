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
