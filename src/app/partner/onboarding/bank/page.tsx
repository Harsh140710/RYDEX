"use client";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [upi, setUpi] = useState("");

  // Validation all the fields
  const sanitizedIfsc = ifsc.trim().toUpperCase();

  const isNameValid = accountHolder.trim().length >= 3;

  const isAccountValid = accountNumber.trim().length >= 9;

  const isIfscValid = IFSC_REGEX.test(sanitizedIfsc);

  const isMobileValid = mobileNumber.trim().length == 10;

  const canSubmit =
    isNameValid && isAccountValid && isIfscValid && isMobileValid;

  const handleBank = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder,
        accountNumber,
        ifsc: sanitizedIfsc,
        mobileNumber,
        upi,
      });
      setLoading(false);
      console.log(data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGetBank = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/bank");
        console.log(data);
        setAccountHolder(data.partnerBank.accountHolder || "");
        setAccountNumber(data.partnerBank.accountNumber || "");
        setIfsc(data.partnerBank.ifsc || "");
        setMobileNumber(data.mobileNumber || "");
        setUpi(data.partnerBank.upi || "");
      } catch (error: any) {
        console.log(error);
      }
    };
    handleGetBank();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        {/* Header */}
        <div className="relative text-center">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-sm text-gray-500 font-medium">Step 3 of 3</p>

          <h1 className="text-2xl font-bold mt-1">Bank & Payout Setup</h1>
          <p className="text-sm text-gray-500 mt-2">Used for partner payouts</p>
        </div>

        {/* Show Error */}
        {error && (
          <p className="mt-3 text-red-500 border border-red-600 bg-red-500/10 h-11 flex items-center pl-5 rounded-xl">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-6">
          {/* Account Holder name */}
          <div>
            <label
              htmlFor="ahn"
              className="text-sm font-semibold text-gray-500"
            >
              Account Holder Name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>
              <input
                type="text"
                id="ahn"
                placeholder="As per bank records"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${!isNameValid && accountHolder.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>
            {!isNameValid && accountHolder.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                Minimum 3 characters required
              </p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="an" className="text-sm font-semibold text-gray-500">
              Bank Account Number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <CreditCard />
              </div>
              <input
                type="text"
                id="an"
                placeholder="Enter account number"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${!isAccountValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            {!isAccountValid && accountNumber.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                Account number must be at least 9 digits
              </p>
            )}
          </div>

          {/* IFSC code */}
          <div>
            <label
              htmlFor="ifsc"
              className="text-sm font-semibold text-gray-500"
            >
              IFSC Code
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Landmark />
              </div>
              <input
                type="text"
                id="ifsc"
                placeholder="HDFC0001234"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${!isIfscValid && ifsc.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={ifsc.toUpperCase()}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              />
            </div>
            {!isIfscValid && ifsc.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                IFSC code is not valid
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mn" className="text-sm font-semibold text-gray-500">
              Mobile Number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Phone />
              </div>
              <input
                type="text"
                id="mn"
                placeholder="10 digit mobile number"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${!isMobileValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            {!isMobileValid && mobileNumber.length > 0 && (
              <p className="mt-1 text-sm text-red-500">
                Enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          {/* UPI Id */}
          <div>
            <label
              htmlFor="upi"
              className="text-sm font-semibold text-gray-500"
            >
              UPI ID (optional)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                id="upi"
                placeholder="name@upi"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
          <CheckCircle size={16} className="mt-0.5" />
          <p>
            Bank details are verified before first payout. This usually takes
            24-48 hours.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 cursor-pointer flex items-center justify-center"
          onClick={handleBank}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default page;
