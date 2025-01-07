// pages/CreateInvoice.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ContactDetails,
  Invoice,
  InvoiceDetails,
  InvoiceItem,
  BankDetails,
} from "../types/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { BsCreditCard2Back, BsFillPersonLinesFill } from "react-icons/bs";
import DialogSender from "../components/Invoice/DialogSender";
import DialogBusiness from "../components/Invoice/DialogBusiness";
import { useReactToPrint } from "react-to-print";
import DialogBankDetails from "../components/Invoice/DialogBank";
import InvoiceSidebar from "../components/Invoice/Sidebar";

const CreateInvoice: React.FC = () => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    date: "",
    description: "",
    qty: 0,
    rate: 0,
    amount: 0,
  });

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    items: [],
    invoiceNo: "",
    invoiceDate: "",
    dueDate: "",
    recipient: "",
    date: "",
    tax: 0,
    subTotal: 0,
    total: 0,
  });

  const [isOpenBank, setIsOpenBank] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    account: "",
    sort_code: "",
    account_name: "",
  });

  const [sender, setSender] = useState<ContactDetails>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postcode: "",
    email: "",
    phone: "",
  });

  const [business, setBusiness] = useState<ContactDetails>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postcode: "",
    email: "",
    phone: "",
  });

  const [dialogSender, setDialogSender] = useState(false);
  const [dialogBusiness, setDialogBusiness] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Local Storage Functions
  const saveToLocalStorage = () => {
    const invoiceState = {
      items,
      currentItem,
      invoiceDetails,
      bankDetails,
      sender,
      business,
    };
    localStorage.setItem("invoiceState", JSON.stringify(invoiceState));
  };

  const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem("invoiceState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setItems(parsedState.items || []);
      setCurrentItem(
        parsedState.currentItem || {
          date: "",
          description: "",
          qty: 0,
          rate: 0,
          amount: 0,
        }
      );
      setInvoiceDetails(
        parsedState.invoiceDetails || {
          items: [],
          invoiceNo: "",
          invoiceDate: "",
          dueDate: "",
          recipient: "",
          date: "",
          tax: 0,
          subTotal: 0,
          total: 0,
        }
      );
      setBankDetails(
        parsedState.bankDetails || {
          account: "",
          sort_code: "",
          account_name: "",
        }
      );
      setSender(
        parsedState.sender || {
          name: "",
          address1: "",
          address2: "",
          city: "",
          country: "",
          postcode: "",
          email: "",
          phone: "",
        }
      );
      setBusiness(
        parsedState.business || {
          name: "",
          address1: "",
          address2: "",
          city: "",
          country: "",
          postcode: "",
          email: "",
          phone: "",
        }
      );
    }
  };

  // Helper function to calculate subtotal and total
  const calculateTotals = (updatedItems: InvoiceItem[], tax: number) => {
    const subTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subTotal + (subTotal * tax) / 100;
    return { subTotal, total };
  };

  // Update the invoice subtotal after any item change
  const updateSubTotal = () => {
    const newItems = items.map((item) => ({
      ...item,
      amount: item.qty * item.rate,
    }));

    const { subTotal, total } = calculateTotals(newItems, invoiceDetails.tax);

    setItems(newItems);
    setInvoiceDetails((prev) => ({ ...prev, subTotal, total }));
  };

  // Add a new item to the invoice
  const addItem = () => {
    if (
      currentItem.qty <= 0 ||
      currentItem.rate <= 0 ||
      currentItem.description.trim() === ""
    ) {
      alert(
        "Invalid item details. Please check quantity, rate, and description."
      );
      return;
    }

    // Keep the date in yyyy-mm-dd format for storage
    const amount = currentItem.qty * currentItem.rate;
    const newItems = [...items, { ...currentItem, amount }];

    const { subTotal, total } = calculateTotals(newItems, invoiceDetails.tax);

    setItems(newItems);
    setInvoiceDetails((prev) => ({
      ...prev,
      items: newItems,
      subTotal,
      total,
    }));
    setCurrentItem({ date: "", description: "", qty: 0, rate: 0, amount: 0 });
    saveToLocalStorage();
  };

  // Generate a random hex string for invoice number
  const randomHex = (length: number) => {
    const hex =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let output = "LT-";
    for (let i = 0; i < length; i++) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    setInvoiceDetails((prev) => ({ ...prev, invoiceNo: output }));
  };

  // Clear the invoice form
  const clearInvoice = () => {
    if (!window.confirm("Are you sure you want to clear the invoice?")) {
      return;
    }

    setItems([]);
    setCurrentItem({ date: "", description: "", qty: 0, rate: 0, amount: 0 });
    setInvoiceDetails({
      items: [],
      invoiceNo: "",
      invoiceDate: "",
      dueDate: "",
      recipient: "",
      date: "",
      tax: 0,
      subTotal: 0,
      total: 0,
    });
    setSender({
      name: "",
      address1: "",
      address2: "",
      city: "",
      country: "",
      postcode: "",
      email: "",
      phone: "",
    });
    setBusiness({
      name: "",
      address1: "",
      address2: "",
      city: "",
      country: "",
      postcode: "",
      email: "",
      phone: "",
    });
    setBankDetails({
      account: "",
      sort_code: "",
      account_name: "",
    });
    localStorage.removeItem("invoiceState"); // Clear localStorage
  };

  const saveInvoice = async () => {
    if (!window.confirm("Are you sure you want to save the invoice?")) {
      return;
    }

    if (!sender.name || !business.name || !bankDetails.account_name) {
      alert(
        "Please fill in all required details (Sender, Business, and Bank Details)"
      );
      return;
    }

    let bigObject = {
      invoiceDetails: {
        ...invoiceDetails,
        items: items,
      },
      sender,
      business,
      bankDetails,
    };

    try {
      const response = await fetch("http://192.168.1.121:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bigObject),
      });

      if (response.ok) {
        alert("Invoice saved successfully!");
        clearInvoice();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to save invoice: ${errorData.message || "Please try again."}`
        );
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("An error occurred while saving the invoice. Please try again.");
    }
  };

  const handleLoadInvoice = (savedInvoice: any) => {
    setInvoiceDetails({
      items: savedInvoice.items || [],
      invoiceNo: savedInvoice.invoiceNo,
      invoiceDate: savedInvoice.invoiceDate,
      dueDate: savedInvoice.dueDate || "",
      recipient: savedInvoice.recipient || "",
      date: savedInvoice.date || "",
      tax: savedInvoice.tax || 0,
      subTotal: savedInvoice.subTotal || 0,
      total: savedInvoice.total || 0,
    });

    setItems(savedInvoice.items || []);

    if (savedInvoice.sender) {
      setSender(savedInvoice.sender);
    }

    if (savedInvoice.business) {
      setBusiness(savedInvoice.business);
    }

    if (savedInvoice.bankDetails) {
      setBankDetails({
        account: savedInvoice.bankDetails.account || "",
        sort_code: savedInvoice.bankDetails.sort_code || "",
        account_name: savedInvoice.bankDetails.account_name || "",
      });
    }

    saveToLocalStorage(); // Save loaded invoice to localStorage
  };

  useEffect(() => {
    // Load saved state on mount
    loadFromLocalStorage();

    // Only generate invoice number if it doesn't exist
    if (!invoiceDetails.invoiceNo) {
      randomHex(5);
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Calculate totals whenever items or tax changes
    const { subTotal, total } = calculateTotals(items, invoiceDetails.tax);
    setInvoiceDetails((prev) => ({ ...prev, subTotal, total }));

    // Save to localStorage whenever state changes
    saveToLocalStorage();
  }, [items, invoiceDetails.tax]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // Split the date string and check if it's already in dd-mm-yyyy format
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        // If the first part is a year (length 4), then convert
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert from yyyy-mm-dd to dd-mm-yyyy
        }
        // If it's already in dd-mm-yyyy format, return as is
        return dateString;
      }
      return dateString;
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto min-h-full p-4 bg-white shadow-lg rounded-lg text-slate-800">
      <InvoiceSidebar
        onPrint={reactToPrintFn}
        onClear={clearInvoice}
        onSave={saveInvoice}
        onLoadInvoice={handleLoadInvoice}
      />
      <DialogSender
        open={dialogSender}
        set={setDialogSender}
        sender={sender}
        setSender={setSender}
      />
      <DialogBusiness
        open={dialogBusiness}
        set={setDialogBusiness}
        business={business}
        setBusiness={setBusiness}
      />
      <DialogBankDetails
        open={isOpenBank}
        set={setIsOpenBank}
        bankDetails={bankDetails}
        setBankDetails={setBankDetails}
      />

      <div ref={contentRef} className="print-content">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">INVOICE</h1>

        {/* Billed To & Invoice Details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Upload & Contact Info */}
          <div
            className="hover:border-dashed hover:border-2 hover:border-blue-400 border-dashed border-white border-2 pt-4 pr-4 pb-4 hover:bg-blue-200 ease-in-out duration-300 rounded-lg cursor-pointer"
            onClick={() => setDialogSender(true)}
          >
            {sender.name ? (
              <>
                <p className="font-semibold">{sender.name}</p>
                <p>
                  {sender.address1}, {sender.city}
                </p>
                <p>
                  {sender.country}, {sender.postcode}
                </p>
                <p>{sender.email}</p>
                <p>{sender.phone}</p>
              </>
            ) : (
              <div className="flex items-center h-36">
                <BsFillPersonLinesFill />
                <div className="ml-4">
                  <h2 className="text-gray-500">Company name</h2>
                  <span className="text-gray-500">
                    Add your company details
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Right: Invoice Details */}
          <div
            className="relative hover:border-dashed hover:border-2 hover:border-blue-400 border-dashed border-white border-2 p-4 hover:bg-blue-200 ease-in-out duration-300 rounded-lg cursor-pointer"
            onClick={() => setDialogBusiness(true)}
          >
            {business.name ? (
              <>
                <p className="pl-4 absolute top-0 left-0 text-[12px] text-gray-500 text-ellipsis tracking-widest">
                  BILLED TO:
                </p>
                <p className="font-semibold">{business.name}</p>
                <p>
                  {business.address1}, {business.city}
                </p>
                <p>
                  {business.country}, {business.postcode}
                </p>
                <p>{business.email}</p>
                <p>{business.phone}</p>
              </>
            ) : (
              <div className="flex items-center h-36">
                <BsFillPersonLinesFill />
                <div className="ml-4">
                  <h2 className="text-gray-500">Company name</h2>
                  <span className="text-gray-500">
                    Add your company details
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="flex flex-col my-4 bg-blue-100 rounded-lg w-fit p-4">
          <p>
            Invoice No:{" "}
            <span className="font-semibold">{invoiceDetails.invoiceNo}</span>
          </p>
          <h2>
            Invoice Date:{" "}
            <input
              type="date"
              value={invoiceDetails.invoiceDate}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  invoiceDate: e.target.value,
                })
              }
              className="p-2 rounded bg-blue-100"
            />
          </h2>
        </div>

        {/* Items Table */}
        <div className="print:hidden">
          <h2 className="text-xl font-semibold mt-6">Add item</h2>
          <div className="grid grid-cols-5 gap-4 mt-2">
            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={currentItem.date}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, date: e.target.value })
                }
                className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col col-span-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <input
                id="description"
                className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
                value={currentItem.description}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="qty"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="qty"
                className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                value={currentItem.qty}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    qty: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="rate"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Rate
              </label>
              <input
                type="number"
                id="rate"
                className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                value={currentItem.rate}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    rate: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={addItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Add Row
            </button>
          </div>
        </div>

        {/* Table Display */}
        <table className="w-full mt-4 border-collapse border border-transparent rounded-md">
          <thead className="border rounded-sm">
            <tr className="bg-blue-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Hours</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody className="border-transparent">
            {items.map((item, index) => (
              <tr className="even:bg-gray-100" key={index}>
                <td className="border border-transparent p-1 text-center">
                  <input
                    className="bg-transparent w-24 text-center"
                    type="text"
                    value={formatDate(item.date)} // This will now properly format the date
                    onChange={(e) => {
                      const newItems = items.map((i, idx) => {
                        if (idx === index) {
                          return { ...i, date: e.target.value };
                        }
                        return i;
                      });
                      setItems(newItems);
                    }}
                  />
                </td>
                <td className="border border-transparent p-1 text-left">
                  <input
                    className="bg-transparent w-full"
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = items.map((i, idx) => {
                        if (idx === index) {
                          return { ...i, description: e.target.value };
                        }
                        return i;
                      });
                      setItems(newItems);
                    }}
                  />
                </td>
                <td className="border border-transparent p-1 w-fit text-center">
                  <input
                    className="bg-transparent w-12 text-center"
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = items.map((i, idx) => {
                        if (idx === index) {
                          return { ...i, qty: Number(e.target.value) };
                        }
                        return i;
                      });
                      setItems(newItems);
                    }}
                  />
                </td>
                <td className="border border-transparent p-1 text-center">
                  <input
                    className="bg-transparent w-16 text-center"
                    type="number"
                    value={item.rate}
                    onChange={(e) => {
                      const newItems = items.map((i, idx) => {
                        if (idx === index) {
                          return { ...i, rate: Number(e.target.value) };
                        }
                        return i;
                      });
                      setItems(newItems);
                    }}
                  />
                </td>
                <td className="border border-transparent p-1 text-center">
                  £{(item.rate * item.qty).toFixed(2)}
                  <button
                    className="bg-red-500 p-1 text-white rounded hover:bg-red-600 print:hidden ml-2"
                    onClick={() => {
                      const newItems = items.filter((_, idx) => idx !== index);
                      setItems(newItems);
                      const { subTotal, total } = calculateTotals(
                        newItems,
                        invoiceDetails.tax
                      );
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        subTotal,
                        total,
                      }));
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotals and Bank Details */}
        <div className="grid mt-8 grid-cols-2">
          <div>
            <div
              className="relative hover:border-dashed hover:border-2 hover:border-blue-400 border-dashed border-white border-2 p-4 hover:bg-blue-200 ease-in-out duration-300 rounded-lg cursor-pointer"
              onClick={() => setIsOpenBank(true)}
            >
              {bankDetails.account_name ? (
                <>
                  <p className="pl-4 absolute top-0 left-0 text-[12px] text-gray-500 text-ellipsis tracking-widest">
                    PAYMENT DETAILS:
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">{bankDetails.account_name}</p>
                    <p>Account: {bankDetails.account}</p>
                    <p>
                      Sort Code:{" "}
                      {
                        // make the sortcode to be displayed in the format xx-xx-xx
                        bankDetails.sort_code.replace(
                          /(\d{2})(\d{2})(\d{2})/,
                          "$1-$2-$3"
                        )
                      }
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center h-20">
                  <BsCreditCard2Back className="text-xl text-gray-500" />
                  <div className="ml-4">
                    <h2 className="text-gray-500">Bank Details</h2>
                    <span className="text-gray-500">
                      Add your payment information
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <p>Sub Total:</p>
              <p>£{invoiceDetails.subTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>
                VAT:
                <input
                  type="number"
                  value={invoiceDetails.tax}
                  onChange={(e) => {
                    setInvoiceDetails({
                      ...invoiceDetails,
                      tax: Number(e.target.value),
                    });
                    updateSubTotal();
                  }}
                  className="ml-4 mr-[-4] w-8"
                />
                <span>%</span>
              </p>
              <p>
                £
                {((invoiceDetails.subTotal * invoiceDetails.tax) / 100).toFixed(
                  2
                )}
              </p>
            </div>
            <div className="flex justify-between font-bold">
              <p>Total:</p>
              <p>£{invoiceDetails.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <h3 className="font-semibold mt-6">Notes</h3>
        <p className="text-gray-600">
          I understand that I am responsible for the payment of income tax and
          national insurance contributions to HMRC in relation to this invoice.
        </p>
      </div>
    </div>
  );
};

export default CreateInvoice;
