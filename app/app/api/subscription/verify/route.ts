import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionDetails, updateUserSubscription, PAYPAL_PLAN_IDS } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPendingSubscription = user.subscription?.status === "pending";

    try {
      const paypalSubscriptionDetails = await getSubscriptionDetails(subscriptionId);
      if (!paypalSubscriptionDetails || !paypalSubscriptionDetails.id) {
        if (hasPendingSubscription) {
          await updateUserSubscription(session.user.id, {
            tier: "free",
            status: "active",
            paypalSubscriptionId: null,
            paypalPlanId: null,
          });
        }
        return NextResponse.json({
          success: false,
          message: "Subscription not found or was canceled",
          subscription: { tier: "free", status: "active" },
        });
      }

      const status = paypalSubscriptionDetails.status.toLowerCase();
      if (status === "active" || status === "approved") {
        const planId = paypalSubscriptionDetails.plan_id;
        let tier = "basic";
        Object.entries(PAYPAL_PLAN_IDS).forEach(([key, value]) => {
          if (value === planId) tier = key;
        });

        const currentPeriodStart = paypalSubscriptionDetails.billing_info.last_payment?.time
          ? new Date(paypalSubscriptionDetails.billing_info.last_payment.time)
          : new Date();
        const currentPeriodEnd = paypalSubscriptionDetails.billing_info.next_billing_time
          ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
          : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

          const lastPaymentDate = paypalSubscriptionDetails.billing_info.last_payment?.time
          ? new Date(paypalSubscriptionDetails.billing_info.last_payment.time)
          : new Date();
        const nextBillingDate = paypalSubscriptionDetails.billing_info.next_billing_time
          ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
          : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        const subscription = await updateUserSubscription(session.user.id, {
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: planId,
          tier,
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
          lastPaymentDate,
          nextBillingDate
        });

        return NextResponse.json({ success: true, subscription });
      } else {
        if (hasPendingSubscription) {
          await updateUserSubscription(session.user.id, {
            tier: "free",
            status: "active",
            paypalSubscriptionId: null,
            paypalPlanId: null,
          });
        }
        return NextResponse.json({
          success: false,
          message: "Subscription not active",
          subscription: { tier: "free", status: "active" },
        });
      }
    } catch (paypalError) {
      console.error("PayPal verification error:", paypalError);
      if (hasPendingSubscription) {
        await updateUserSubscription(session.user.id, {
          tier: "free",
          status: "active",
          paypalSubscriptionId: null,
          paypalPlanId: null,
        });
      }
      return NextResponse.json({
        success: false,
        error: "Failed to verify with PayPal",
        subscription: { tier: "free", status: "active" },
      });
    }
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}