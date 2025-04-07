// components/DialogSender.tsx
import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { SenderData } from "../../types/types";

type DialogSenderProps = {
  open: boolean;
  set: (open: boolean) => void;
  sender: SenderData;
  setSender: (sender: SenderData) => void;
};

const DialogSender = ({ open, set, sender, setSender }: DialogSenderProps) => {
  const [savedSenders, setSavedSenders] = useState<SenderData[]>([]);
  const [errors, setErrors] = useState<Partial<SenderData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedSenders();
  }, []);

  const fetchSavedSenders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://192.168.1.121:5000/api/senders");
      const data = await response.json();
      setSavedSenders(data);
    } catch (error) {
      console.error("Failed to fetch saved senders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSender((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SenderData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectSaved = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selected = savedSenders.find((s) => s.id === selectedId);
    if (selected) {
      setSender(selected);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SenderData> = {};
    const requiredFields = [
      "name",
      "address1",
      "city",
      "country",
      "postcode",
      "email",
    ];

    requiredFields.forEach((field) => {
      if (!sender[field as keyof SenderData]) {
        newErrors[field as keyof SenderData] = "This field is required";
      }
    });

    if (sender.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender.email)) {
      newErrors.email = "Invalid email format";
    }

    if (sender.phone && !/^\+?[\d\s-]{10,}$/.test(sender.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSender = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await fetch("http://192.168.1.121:5000/api/senders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sender),
      });

      if (!response.ok) throw new Error("Failed to save sender");

      const savedSender = await response.json();
      setSavedSenders((prev) => [savedSender, ...prev]);
      set(false);
    } catch (error) {
      console.error("Error saving sender:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => set(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-700/75" />
      <div className="fixed inset-0 w-screen flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[50%] min-h-[40%] overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="p-6 flex flex-col gap-12">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-50">
                <UserCircleIcon className="size-6 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Sender Information
              </DialogTitle>

              <div className="ml-auto">
                <select
                  disabled={!savedSenders.length || isLoading}
                  onChange={handleSelectSaved}
                  className="rounded-md border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="">Select saved sender</option>
                  {savedSenders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
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
                      className={`px-1 py-2 peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 ${
                        errors[field as keyof SenderData]
                          ? "border-red-300"
                          : ""
                      }`}
                      placeholder={`Enter ${field}`}
                      disabled={isLoading}
                    />
                    <span className="pointer-events-none absolute start-2.5 capitalize top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </label>
                  {errors[field as keyof SenderData] && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[field as keyof SenderData]}
                    </span>
                  )}
                </div>
              ))}

              <div className="flex flex-row gap-8 justify-around col-span-4">
                {["city", "state", "postcode"].map((field) => (
                  <div key={field} className="flex flex-col w-full">
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
                        className={`px-1 py-2 peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 ${
                          errors[field as keyof SenderData]
                            ? "border-red-300"
                            : ""
                        }`}
                        placeholder={`Enter ${field}`}
                        disabled={isLoading}
                      />
                      <span className="pointer-events-none absolute start-2.5 capitalize top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                        {field}
                      </span>
                    </label>
                    {errors[field as keyof SenderData] && (
                      <span className="text-red-500 text-xs mt-1">
                        {errors[field as keyof SenderData]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => set(false)}
                className="rounded-md bg-red-200 px-4 py-2 text-gray-800 hover:bg-red-300 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={saveSender}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DialogSender;
