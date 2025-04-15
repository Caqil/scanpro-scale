// components/subscription/paypal-subscription-button.tsx
"use client";

import React, { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Define plan IDs - in a real app, you'd store these in environment variables
// or fetch them from your backend
const PLAN_IDS = {
  basic: {
    monthly: "P-3RX065706M3469222L5IFM4I", // Replace with your actual plan IDs
    annual: "P-5ML4271244454362XLSM3LWI",
  },
  pro: {
    monthly: "P-28B62039TD439310VL5JD3YY",
    annual: "P-4X229079D4075725YLSM3LMQ",
  },
  enterprise: {
    monthly: "P-1NH30458V3845112XLSM3L5Y",
    annual: "P-86V24180P5410874PLSM3L6Q",
  },
};

// Your PayPal client ID - in production, use environment variables
const PAYPAL_CLIENT_ID = "test"; // Use your sandbox/live client ID

interface PayPalSubscriptionButtonProps {
  tier: string;
  isAnnual: boolean;
  buttonText?: string;
  className?: string;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  tier,
  isAnnual,
  buttonText = "Subscribe",
  className,
}) => {
  const router = useRouter();
  const [showPayPal, setShowPayPal] = useState(false);

  // Get the plan ID based on tier and billing cycle
  const planId = PLAN_IDS[tier as keyof typeof PLAN_IDS]?.[isAnnual ? "annual" : "monthly"];

  if (!planId) {
    return <div className="text-red-500">Invalid subscription plan selected</div>;
  }

  // Show PayPal buttons when the user clicks Subscribe
  const handleSubscribe = () => {
    setShowPayPal(true);
  };

  // Hide PayPal buttons when the user cancels
  const handleCancel = () => {
    setShowPayPal(false);
  };

  return (
    <div className={className}>
      {!showPayPal ? (
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
        >
          {buttonText}
        </Button>
      ) : (
        <div>
          <PayPalScriptProvider
            options={{
              clientId: PAYPAL_CLIENT_ID,
              components: "buttons",
              intent: "subscription",
              vault: true,
            }}
          >
            <PayPalButtons
              style={{
                layout: "vertical",
                shape: "rect",
                label: "subscribe",
              }}
              createSubscription={(data, actions) => {
                return actions.subscription
                  .create({
                    plan_id: planId,
                    application_context: {
                      shipping_preference: "NO_SHIPPING",
                      user_action: "SUBSCRIBE_NOW",
                      brand_name: "ScanPro",
                      return_url: `${window.location.origin}/${tier}`,
                      cancel_url: `${window.location.origin}/pricing`,
                    }
                  });
              }}
              onApprove={(data) => {
                toast.success("Subscription created successfully!");
                // Redirect to dashboard or success page
                router.push("/dashboard");
                return Promise.resolve();
              }}
              onError={(err) => {
                console.error("PayPal error:", err);
                toast.error("There was an error with your subscription. Please try again.");
              }}
              onCancel={() => {
                toast.info("Subscription process was canceled");
                setShowPayPal(false);
              }}
            />
          </PayPalScriptProvider>
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayPalSubscriptionButton;