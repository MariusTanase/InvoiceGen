import React, { useEffect, useState } from "react";
import axios from "axios";
import { ContactDetails, InvoiceItem } from "../types/types";
import ViewInvoice from "../components/Invoice/ViewInvoice";

interface Invoice {
  id?: number;
  invoiceNo: string;
  date: string;
  invoiceDate: string;
  dueDate: string;
  recipient: string;
  items: InvoiceItem[];
  sender: ContactDetails;
  business: ContactDetails;
  total: number;
}

const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [data, setData] = useState<Invoice | null>(null); // Use `null` instead of empty object
  const [open, setOpen] = useState(false);

  // Fetch Invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoices");
        if (Array.isArray(response.data)) {
          setInvoices(response.data);
          console.log(response.data);
        } else {
          console.error("Invalid response format. Expected an array.");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  // Safe handling for invoices and view dialog
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice History</h1>

      {/* Pass data to the ViewInvoice component only when it is non-null */}
      {data && <ViewInvoice data={data} open={open} setOpen={setOpen} />}

      <ul>
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <li key={invoice.id} className="border p-2 mb-2">
              <strong>{invoice.invoiceNo || "N/A"}</strong> -{" "}
              {invoice.business?.name || "Unknown Business"} -{" "}
              {invoice.invoiceDate || "No Date"} - ${invoice.total || "0.00"}
              <button
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => {
                  setData(invoice); // Ensure valid invoice is set
                  setOpen(true);
                }}
              >
                View
              </button>
            </li>
          ))
        ) : (
          <p>No invoices available.</p>
        )}
      </ul>
    </div>
  );
};

export default InvoiceHistory;
