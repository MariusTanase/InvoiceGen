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

    const formattedDate = currentItem.date
      ? currentItem.date.split("-").reverse().join("-") // Ensure date format is consistent
      : "";

    const amount = currentItem.qty * currentItem.rate;
    const newItems = [
      ...items,
      { ...currentItem, date: formattedDate, amount },
    ];

    const { subTotal, total } = calculateTotals(newItems, invoiceDetails.tax);

    setItems(newItems);
    setInvoiceDetails((prev) => ({
      ...prev,
      items: newItems,
      subTotal,
      total,
    }));
    setCurrentItem({ date: "", description: "", qty: 0, rate: 0, amount: 0 });
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
      sortCode: "",
      accountName: "",
    });
    localStorage.removeItem("senderData");
    localStorage.removeItem("businessData");
    localStorage.removeItem("bankDetails");
  };

  const saveInvoice = async () => {
    if (!window.confirm("Are you sure you want to save the invoice?")) {
      return;
    }

    if (!sender.name || !business.name || !bankDetails.accountName) {
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
      console.log(savedInvoice.bankDetails);
      setBankDetails({
        account: savedInvoice.bankDetails.account || "",
        sort_code: savedInvoice.bankDetails.sort_code || "",
        account_name: savedInvoice.bankDetails.account_name || "",
      });
    }
  };

  useEffect(() => {
    // Only generate invoice number if it doesn't exist
    if (!invoiceDetails.invoiceNo) {
      randomHex(5);
    }

    // Calculate totals whenever items or tax changes
    const { subTotal, total } = calculateTotals(items, invoiceDetails.tax);
    setInvoiceDetails((prev) => ({ ...prev, subTotal, total }));
  }, [items, invoiceDetails.tax]); // Dependencies include both items and tax

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`; // Convert yyyy-MM-dd to dd-MM-yyyy
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
            {/* {if any of the sender data is empty, then show something else such as 'small icon', 'Company Name' and a p with 'Add your company details'} */}
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
        <div className="flex flex-col bg-blue-100 my-8 rounded-lg w-fit p-4">
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
              // hide icon
              className="p-2 rounded bg-blue-100"
            />
          </h2>
        </div>

        {/* Items Table */}
        <div className="print:hidden">
          <h2 className="text-xl font-semibold mt-6">Item Description</h2>
          <div className="flex space-x-2 mt-2">
            {/* do it with datepicker */}
            {/* add DatePicker for setCurrentItem */}
            <input
              type="date"
              // grey out the date out of the range
              value={currentItem.date}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, date: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              className="border p-2 flex-1 rounded"
              placeholder="Description"
              value={currentItem.description}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, description: e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2 w-24 rounded"
              placeholder="Qty"
              value={currentItem.qty}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, qty: Number(e.target.value) })
              }
            />
            <input
              type="number"
              className="border p-2 w-24 rounded"
              placeholder="Rate"
              value={currentItem.rate}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, rate: Number(e.target.value) })
              }
            />
            <button
              onClick={addItem}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Row
            </button>
          </div>
        </div>

        {/* Table Display */}
        <table className="w-full mt-4 border-collapse border border-transparent rounded-md ">
          <thead className="border rounded-sm">
            <tr className="bg-blue-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Item Description</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          {/* 1 color gray-100, 1 blue-100 */}
          <tbody className="border-transparent">
            {/* add the ability to edit the text if there needs any change */}
            {items.map((item, index) => (
              <tr className="even:bg-gray-100" key={index}>
                <td className="border border-transparent p-1 text-center">
                  <input
                    className="bg-transparent w-24 text-center"
                    type="text"
                    value={formatDate(item.date)} // Format date for display
                    onChange={(e) => {
                      const newItems = items.map((i, idx) => {
                        if (idx === index) {
                          return { ...i, date: e.target.value }; // Ensure date remains consistent
                        }
                        return i;
                      });
                      setItems(newItems);
                    }}
                  />{" "}
                </td>

                <td className="border border-transparent p-1 text-left">
                  <input
                    className="bg-transparent"
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
                    className="bg-transparent w-8 text-center"
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
                      // Remove the item at the current index
                      const newItems = items.filter((_, idx) => idx !== index);

                      // Update state with the new items array
                      setItems(newItems);

                      // Recalculate totals
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

        {/* Subtotals */}
        <div className=" grid mt-8 grid-cols-2">
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
                    <p>Sort Code: {bankDetails.sort_code}</p>
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
                    updateSubTotal(); // Recalculate totals when tax changes
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
        {/* <h3 className="font-semibold mt-6">Terms & Conditions</h3>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <footer className="text-center mt-8 text-white bg-blue-500 p-2 rounded">
          Thank you for your business!
        </footer> */}
      </div>
    </div>
  );
};

export default CreateInvoice;
