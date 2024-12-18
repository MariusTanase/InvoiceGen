import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type DialogSenderProps = {
  open: boolean;
  set: (open: boolean) => void;
};

type SenderData = {
  name: string;
  address1: string;
  address2: string;
  city: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
};

const DialogSender = ({ open, set, sender, setSender }: DialogSenderProps) => {
  let [savedSender, setSavedSender] = useState([]);

  // Load saved sender data (mocked for now)
  useEffect(() => {
    const savedSender = localStorage.getItem("senderData");
    if (savedSender) {
      setSender(JSON.parse(savedSender));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSender((prev) => ({ ...prev, [name]: value }));
  };

  const saveSender = () => {
    localStorage.setItem("senderData", JSON.stringify(sender));
    set(false);
  };

  return (
    <Dialog open={open} onClose={() => set(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-700/75" />
      <div className="fixed inset-0 w-screen flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[50%] min-h-[40%] overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="p-6 flex flex-col gap-12">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full ">
                <ExclamationTriangleIcon className="size-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Sender Information
              </DialogTitle>

              <div>
                {/* select from saved senders */}

                <select
                  // if savedSender is empty, disable
                  disabled={!savedSender.length}
                  className="rounded-md border ml-8 border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 cursor-pointer disabled:cursor-not-allowed"
                  name="savedSender"
                  id="savedSender"
                >
                  <option value="">Saved sender</option>
                  <option value="1">Sender 1</option>
                  <option value="2">Sender 2</option>
                  <option value="3">Sender 3</option>
                </select>
              </div>
            </div>
            {/* Form */}
            <div className="grid grid-cols-4 gap-4">
              {/* First 6 fields: Each spans 2 columns */}
              {[
                "name",
                "country",
                "email",
                "phone",
                "address1",
                "address2",
              ].map((field) => (
                <div key={field} className="col-span-2">
                  <label
                    htmlFor={field}
                    className="relative flex flex-col border-b-2 border-b-blue-300"
                  >
                    <input
                      type="text"
                      id={field}
                      name={field}
                      value={sender[field as keyof SenderData]}
                      onChange={handleInputChange}
                      className="px-1 py-2 peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
                      placeholder={`Enter ${field}`}
                    />
                    <span className="pointer-events-none absolute start-2.5 capitalize top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                      {field}
                    </span>
                  </label>
                </div>
              ))}
              <div className="flex flex-row gap-8 justify-around col-span-4">
                {/* Last 3 fields: Each spans 3 columns */}
                {["city", "state", "postcode"].map((field) => (
                  // make them take equal space
                  <div key={field} className="flex flex-col w-full">
                    <label
                      htmlFor={field}
                      className="relative flex  flex-col border-b-2 border-b-blue-300"
                    >
                      <input
                        type="text"
                        id={field}
                        name={field}
                        value={sender[field as keyof SenderData]}
                        onChange={handleInputChange}
                        className="px-1 py-2 peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
                        placeholder={`Enter ${field}`}
                      />
                      <span className="pointer-events-none absolute start-2.5 capitalize top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                        {field}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => set(false)}
                className="rounded-md bg-red-200 px-4 py-2 text-gray-800 hover:bg-red-300"
              >
                Cancel
              </button>
              <button
                onClick={saveSender}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DialogSender;
