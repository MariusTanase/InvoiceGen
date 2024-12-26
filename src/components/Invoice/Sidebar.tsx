// components/Invoice/InvoiceSidebar.tsx
import { useState } from "react";
import {
  DocumentTextIcon,
  PrinterIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface InvoiceSidebarProps {
  onPrint: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoadInvoice: (invoice: any) => void;
}

const InvoiceSidebar = ({
  onPrint,
  onClear,
  onSave,
  onLoadInvoice,
}: InvoiceSidebarProps) => {
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [showInvoiceList, setShowInvoiceList] = useState(false);

  const fetchSavedInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const response = await fetch("http://192.168.1.121:5000/api/invoices");
      const data = await response.json();
      setSavedInvoices(data);
      setShowInvoiceList(true);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="fixed right-[10%] top-20 w-64 bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Invoice Tools
        </h2>
      </div>

      <div className="space-y-2">
        <button
          onClick={onPrint}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Print Invoice
        </button>

        <button
          onClick={onSave}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Save Invoice
        </button>

        <button
          onClick={onClear}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Clear Invoice
        </button>

        <button
          onClick={fetchSavedInvoices}
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Load Invoice
        </button>
      </div>

      {/* Saved Invoices List */}
      {showInvoiceList && (
        <div className="mt-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-medium">Saved Invoices</h3>
            <button
              onClick={() => setShowInvoiceList(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto mt-2">
            {isLoadingInvoices ? (
              <div className="flex justify-center py-4">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            ) : savedInvoices.length > 0 ? (
              <ul className="space-y-2">
                {savedInvoices.map((invoice: any) => (
                  <li
                    key={invoice.id}
                    className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      onLoadInvoice(invoice);
                      setShowInvoiceList(false);
                    }}
                  >
                    <div className="text-sm font-medium">
                      {invoice.invoiceNo}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.business.name} -{" "}
                      {formatDate(invoice.invoiceDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      £{invoice.total.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No saved invoices
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceSidebar;
