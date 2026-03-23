"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Calendar, MapPin, Receipt, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would verify the payment status with your backend here
    // For the sample UI, we'll just simulate a quick loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Verifying payment status...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 md:px-10">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header - Success Banner */}
        <div className="bg-teal-500 text-white text-center py-12 px-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={50} className="text-white relative z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-teal-50 opacity-90 text-lg">
            Thank you for your payment. Your booking is now fully confirmed.
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="text-slate-400" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Transaction Details</h2>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-semibold text-slate-800">#{bookingId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <span className="text-slate-500">Date Paid</span>
              <span className="font-semibold text-slate-800">
                {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-800">Bank Transfer</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Total Amount</span>
              <span className="text-2xl font-bold text-teal-600">Paid</span>
            </div>
          </div>

          {/* Next Steps / Actions */}
          <div className="space-y-4">
            <Button 
              className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all"
              onClick={() => router.push("/bookings")}
            >
              <Calendar className="mr-2" size={20} /> View My Bookings
              <ArrowRight className="ml-auto" size={20} />
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-14 text-lg border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              onClick={() => router.push("/")}
            >
              <Home className="mr-2" size={20} /> Return to Homepage
            </Button>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
