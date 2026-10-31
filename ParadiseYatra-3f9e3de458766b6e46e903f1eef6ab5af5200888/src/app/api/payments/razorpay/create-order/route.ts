import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CreateOrderBody {
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  checkoutType?: "package" | "fixed-departure";
  selectedDepartureDate?: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  packageId?: string;
  packageSlug: string;
  packageTitle: string;
  destination?: string;
  travelDate?: string;
  travellers: number;
  unitPrice: number;
  unitLabel: string;
  customerNote?: string;
}

interface PackagePricing {
  packageId: string;
  price: number;
  priceType: "per_person" | "per_couple";
  title: string;
  destination: string;
}

const normalizeDateOnly = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fetchPackagePricing = async (
  backendUrl: string,
  slug: string,
  checkoutType: "package" | "fixed-departure",
  selectedDepartureDate?: string
): Promise<PackagePricing | null> => {
  if (checkoutType === "fixed-departure") {
    try {
      const response = await fetch(`${backendUrl}/api/fixed-departures/slug/${slug}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const departure = await response.json();
      const basePrice = Number(departure?.price || 0);
      let finalPrice = basePrice;

      const targetDate = normalizeDateOnly(selectedDepartureDate);
      if (targetDate && Array.isArray(departure?.departures)) {
        const matched = departure.departures.find((d: { date?: string; status?: string; price?: number }) => {
          const normalized = normalizeDateOnly(d?.date || "");
          return normalized === targetDate;
        });
        if (matched && matched.status !== "soldout" && Number(matched.price) > 0) {
          finalPrice = Number(matched.price);
        }
      }

      return {
        packageId: String(departure?._id || departure?.id || ""),
        price: finalPrice,
        priceType: "per_person",
        title: departure?.title || "Fixed Departure",
        destination: departure?.destination || "",
      };
    } catch (_error) {
      return null;
    }
  }

  try {
    const allPackageResponse = await fetch(`${backendUrl}/api/all-packages/${slug}`, {
      cache: "no-store",
    });
    if (allPackageResponse.ok) {
      const allPackageRaw = await allPackageResponse.json();
      const allPackage =
        allPackageRaw?.package ||
        allPackageRaw?.destination ||
        allPackageRaw?.data ||
        allPackageRaw;
      return {
        packageId: String(allPackage?._id || allPackage?.id || ""),
        price: Number(allPackage?.price || 0),
        priceType: allPackage?.priceType === "per_couple" ? "per_couple" : "per_person",
        title: allPackage?.name || allPackage?.title || "Travel Package",
        destination: allPackage?.location || allPackage?.destination || "",
      };
    }
  } catch (_error) {
    // Intentionally no-op; fallback below.
  }

  try {
    const packageResponse = await fetch(`${backendUrl}/api/packages/slug/${slug}`, {
      cache: "no-store",
    });
    if (packageResponse.ok) {
      const packageRaw = await packageResponse.json();
      const pkg = packageRaw?.package || packageRaw?.destination || packageRaw?.data || packageRaw;
      return {
        packageId: String(pkg?._id || pkg?.id || ""),
        price: Number(pkg?.price || 0),
        priceType: pkg?.priceType === "per_couple" ? "per_couple" : "per_person",
        title: pkg?.title || pkg?.name || "Travel Package",
        destination: pkg?.destination || pkg?.location || "",
      };
    }
  } catch (_error) {
    // Intentionally no-op; return null.
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { message: "Razorpay credentials are missing on server." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreateOrderBody;
    const checkoutType: "package" | "fixed-departure" =
      body.checkoutType === "fixed-departure" ? "fixed-departure" : "package";
    const currency = body.currency || "INR";
    const travellers = Math.max(1, Number(body.travellers || 1));
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5001";
    const internalToken = process.env.INTERNAL_API_TOKEN || "";

    if (!body.packageSlug) {
      return NextResponse.json({ message: "Package slug is required" }, { status: 400 });
    }

    const pricing = await fetchPackagePricing(
      backendUrl,
      body.packageSlug,
      checkoutType,
      body.selectedDepartureDate
    );
    if (!pricing || !Number.isFinite(pricing.price) || pricing.price <= 0) {
      return NextResponse.json(
        { message: "Unable to validate package pricing on server" },
        { status: 400 }
      );
    }

    const unitPrice = Number(pricing.price);
    const unitLabel = pricing.priceType === "per_couple" ? "Per Couple" : "Per Person";
    const amountInRupees =
      pricing.priceType === "per_couple"
        ? Math.max(1, Math.ceil(travellers / 2)) * unitPrice
        : travellers * unitPrice;
    const amount = Math.round(amountInRupees * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const receipt = (body.receipt || `rcpt_${Date.now()}`).slice(0, 40);
    const resolvedPackageId = String(pricing.packageId || body.packageId || "");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes: {
          ...(body.notes || {}),
          packageId: resolvedPackageId,
          packageSlug: body.packageSlug,
        },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.error?.description || "Failed to create Razorpay order" },
        { status: response.status }
      );
    }

    // Persist purchase intent in backend database
    let purchaseData = null;
    try {
      const purchaseResponse = await fetch(`${backendUrl}/api/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(internalToken ? { "x-internal-token": internalToken } : {}),
        },
        body: JSON.stringify({
          userId: body.userId || "",
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          packageId: resolvedPackageId,
          packageSlug: body.packageSlug,
          packageTitle: body.packageTitle || pricing.title,
          destination: body.destination || pricing.destination || "",
          travelDate: body.travelDate || "",
          travellers,
          unitPrice,
          unitLabel,
          amount: Number((amount / 100).toFixed(2)),
          currency,
          razorpayOrderId: data.id,
          notes: body.customerNote || "",
        }),
      });

      const purchaseJson = await purchaseResponse.json();
      if (purchaseResponse.ok && purchaseJson?.data) {
        purchaseData = purchaseJson.data;
      }
    } catch (persistError) {
      console.error("Purchase persist error:", persistError);
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      key: keyId,
      purchaseId: purchaseData?._id || null,
      internalOrderId: purchaseData?.internalOrderId || null,
      receiptNumber: purchaseData?.receiptNumber || null,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
