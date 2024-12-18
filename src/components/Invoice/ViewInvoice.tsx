import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const ViewInvoice = ({ data, open, setOpen }) => {
  console.log(data);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-700/75" />
      <div className="fixed inset-0 w-screen flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[50%] min-h-[40%] overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="p-6 flex flex-col gap-12">
            <div className="print-content">
              <h1 className="text-3xl font-bold mb-6 text-gray-800">INVOICE</h1>

              {/* Billed To & Invoice Details */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left: Upload & Contact Info */}

                <div className="hover:border-dashed hover:border-2 hover:border-blue-400 border-dashed border-white border-2 pt-4 pr-4 pb-4 hover:bg-blue-200 ease-in-out duration-300 rounded-lg cursor-pointer">
                  {/* {if any of the sender data is empty, then show something else such as 'small icon', 'Company Name' and a p with 'Add your company details'} */}

                  <p className="font-semibold">{data.sender.name}</p>
                  <p>
                    {data.sender.address1}, {data.sender.address2}
                  </p>
                  <p>
                    {data.sender.country}, {data.sender.postcode}
                  </p>
                  <p>{data.sender.email}</p>
                  <p>{data.sender.phone}</p>
                </div>

                {/* Right: Invoice Details */}
                <div className="relative hover:border-dashed hover:border-2 hover:border-blue-400 border-dashed border-white border-2 p-4 hover:bg-blue-200 ease-in-out duration-300 rounded-lg cursor-pointer">
                  <p className="pl-4 absolute top-0 left-0 text-[12px] text-gray-500 text-ellipsis tracking-widest">
                    BILLED TO:
                  </p>
                  <p className="font-semibold">{data.business.name}</p>
                  <p>
                    {data.business.address1}, {data.business.address2}
                  </p>
                  <p>
                    {data.business.city}, {data.business.country}
                  </p>
                  <p>{data.business.email}</p>
                  <p>{data.business.phone}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="flex flex-col bg-blue-100 my-8 rounded-lg w-fit p-4">
                <p>
                  Invoice No:{" "}
                  <span className="font-semibold">{data.invoiceNo}</span>
                </p>
                <h2>Invoice Date: {data.invoiceDate}</h2>
              </div>

              {/* Table Display */}
              <table className="w-full mt-4 border-collapse border border-transparent rounded-md align-middle">
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
                  {data.items.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <td className="border p-2">{item.date}</td>
                      <td className="border p-2">{item.description}</td>
                      <td className="border p-2">{item.qty}</td>
                      <td className="border p-2">£{item.rate.toFixed(2)}</td>
                      <td className="border p-2">
                        £{(parseInt(item.qty) * parseInt(item.rate)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotals */}
              <div className="mt-6 grid grid-cols-2">
                <div>
                  <h3 className="font-semibold">Payment Info:</h3>
                  <p>Account: 2222222</p>
                  <p>A/C Name: Laura Tanase</p>
                  <p>Bank Details: NationWide</p>
                </div>
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <p>Sub Total: </p>
                    <p>£{data.subTotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>
                      VAT:
                      <span className="ml-8">{data.tax}%</span>
                    </p>
                    <p>£0</p>
                  </div>
                  <div className="flex justify-between font-bold">
                    <p>Total: </p>
                    <p>£{data.total.toFixed(2)}</p>
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
