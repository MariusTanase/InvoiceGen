import { useState, useEffect } from "react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { BankDetails } from "../../types/types";

type DialogBankDetailsProps = {
  open: boolean;
  set: (open: boolean) => void;
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
};

const DialogBankDetails = ({
  open,
  set,
  bankDetails,
  setBankDetails,
}: DialogBankDetailsProps) => {
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetails[]>([]);
  const [errors, setErrors] = useState<Partial<BankDetails>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedBankDetails();
  }, []);

  const fetchSavedBankDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://192.168.1.121:5000/api/bank-details"
      );
      const data = await response.json();
      setSavedBankDetails(data);
    } catch (error) {
      console.error("Failed to fetch saved bank details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSortCode = (code: string | undefined) => {
    if (!code) return "";
    return code.replace(/(\d{2})(?=\d)/g, "$1-");
  };

  const formatAccountNumber = (number: string | undefined) => {
    if (!number) return "";
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove any non-numeric characters for account and sort_code
    const sanitizedValue = ["account", "sort_code"].includes(name)
      ? value.replace(/[^0-9]/g, "").slice(0, name === "account" ? 8 : 6)
      : value;

    setBankDetails((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name as keyof BankDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectSaved = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selected = savedBankDetails.find((b) => b.id === selectedId);
    if (selected) {
      setBankDetails(selected);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetails> = {};

    if (!bankDetails.account || !/^\d{8}$/.test(bankDetails.account)) {
      newErrors.account = "Account number must be 8 digits";
    }

    if (!bankDetails.sort_code || !/^\d{6}$/.test(bankDetails.sort_code)) {
      newErrors.sort_code = "Sort code must be 6 digits";
    }

    if (!bankDetails.account_name || bankDetails.account_name.length < 2) {
      newErrors.account_name =
        "Account name is required (minimum 2 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveBankDetails = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://192.168.1.121:5000/api/bank-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bankDetails),
        }
      );

      if (!response.ok) throw new Error("Failed to save bank details");

      const savedDetails = await response.json();
      setSavedBankDetails((prev) => [savedDetails, ...prev]);
      set(false);
    } catch (error) {
      console.error("Error saving bank details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => set(false)} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-700/75" />
      <div className="fixed inset-0 w-screen flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[500px] overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="p-6 flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-50">
                <BanknotesIcon className="size-6 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Bank Details
              </DialogTitle>

              <div className="ml-auto">
                <select
                  disabled={!savedBankDetails.length || isLoading}
                  onChange={handleSelectSaved}
                  className="rounded-md border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="">Select saved details</option>
                  {savedBankDetails.map((detail) => (
                    <option key={detail.id} value={detail.id}>
                      {detail.account_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {[
                {
                  name: "account_name",
                  label: "Account Name",
                  value: bankDetails?.account_name || "",
                },
                {
                  name: "account",
                  label: "Account Number",
                  format: formatAccountNumber,
                  value: bankDetails?.account || "",
                },
                {
                  name: "sort_code",
                  label: "Sort Code",
                  format: formatSortCode,
                  value: bankDetails?.sort_code || "",
                },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="relative flex flex-col border-b-2 border-b-blue-300"
                  >
                    <input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={
                        field.format ? field.format(field.value) : field.value
                      }
                      onChange={handleInputChange}
                      className={`px-1 py-2 peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 ${
                        errors[field.name as keyof BankDetails]
                          ? "border-red-300"
                          : ""
                      }`}
                      placeholder={`Enter ${field.label}`}
                      disabled={isLoading}
                    />
                    <span className="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                      {field.label}
                    </span>
                  </label>
                  {errors[field.name as keyof BankDetails] && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[field.name as keyof BankDetails]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>• Account number should be 8 digits</p>
              <p>• Sort code should be 6 digits</p>
              <p>• Account name should match your bank account</p>
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
                onClick={saveBankDetails}
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

export default DialogBankDetails;
