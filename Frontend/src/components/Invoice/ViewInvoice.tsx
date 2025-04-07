import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  DocumentIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { useRef, useEffect} from "react";
import { Invoice, InvoiceItem } from "../../types/types";

interface ViewInvoiceProps {
  data: Invoice;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ViewInvoice: React.FC<ViewInvoiceProps> = ({ data, open, setOpen }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Improved print handler with better error handling and explicit content checking
  const handlePrint = useReactToPrint({ contentRef })

  // Add this to ensure styles are properly applied for printing
  useEffect(() => {
    // Add print-specific styles
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: auto;
          margin: 10mm;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const calculateItemAmount = (item: InvoiceItem) => {
    return item.qty * item.rate;
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-700/75" />
      <div className="fixed inset-0 w-screen flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[50%] min-h-[40%] max-h-[90%] overflow-y-auto rounded-lg bg-white shadow-xl">
          <div className="p-6">
            {/* Header with actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">View Invoice</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <PrinterIcon className="h-5 w-5 mr-2" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Invoice Content - ensure it's always rendered and visible */}
            <div className="print-container" style={{ display: 'block' }}>
              {/* The key ref element - making sure it has layout and is visible */}
              <div 
                ref={contentRef} 
                className="print-content"
                style={{ 
                  display: 'block',
                  minHeight: '100px',
                  width: '100%'
                }}
              >
                <h1 className="text-3xl font-bold mb-6 text-gray-800">INVOICE</h1>

                {/* Billed To & Invoice Details */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Sender Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      From
                    </h3>
                    <p className="font-semibold">{data.sender.name}</p>
                    <p className="text-gray-600">
                      {data.sender.address1}
                      {data.sender.address2 && `, ${data.sender.address2}`}
                    </p>
                    <p className="text-gray-600">
                      {data.sender.country}, {data.sender.postcode}
                    </p>
                    <p className="text-gray-600">{data.sender.email}</p>
                    <p className="text-gray-600">{data.sender.phone}</p>
                  </div>

                  {/* Business Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      Billed To
                    </h3>
                    <p className="font-semibold">{data.business.name}</p>
                    <p className="text-gray-600">
                      {data.business.address1}
                      {data.business.address2 && `, ${data.business.address2}`}
                    </p>
                    <p className="text-gray-600">
                      {data.business.city}, {data.business.country}
                    </p>
                    <p className="text-gray-600">{data.business.email}</p>
                    <p className="text-gray-600">{data.business.phone}</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-blue-50 my-8 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="font-semibold">{data.invoiceNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-semibold">
                      {format(new Date(data.invoiceDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  {data.dueDate && (
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-semibold">
                        {format(new Date(data.dueDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-gray-600">Description</th>
                        <th className="px-4 py-2 text-right text-gray-600">Qty</th>
                        <th className="px-4 py-2 text-right text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-right text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-4 py-2">
                            {format(new Date(item.date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-right">{item.qty}</td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(calculateItemAmount(item))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals and Payment Info */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Account: {data.bankDetails?.account}</p>
                      <p>Sort Code: {data.bankDetails?.sort_code}</p>
                      <p>Account Name: {data.bankDetails?.account_name}</p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(data.subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>VAT ({data.tax}%)</span>
                        <span>{formatCurrency((data.subTotal * data.tax) / 100)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(data.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ViewInvoice;