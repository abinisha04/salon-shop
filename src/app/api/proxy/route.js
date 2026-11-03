// src/app/api/proxy/route.js
// ✅ Runs on SERVER — AUTH_KEY is never exposed to browser

import { NextResponse } from "next/server";

// ✅ Shop app-ku allowed endpoints — full access
const ALLOWED_ENDPOINTS = [
  // Appointments
  "getAppointment",
  "putAppointment",
  "deleteAppointment",

  // Shop
  "getShop",
  "postShop",
  "putShop",

  // User (shop read-only — delete இல்லை)
  "getUser",

  // Groomer / Stylist
  "getGroomer",
  "postGroomer",
  "putGroomer",
  "deleteGroomer",

  // Service
  "getService",
  "postService",
  "putService",
  "deleteService",

  // Leave
  "getLeave",
  "postLeave",

  // Feedback
  "getShopFeedback",

  // OTP Verification
  "sendOtp",
  "verifyOtp",
];

// ✅ Reusable validator
function validateEndpoint(endpoint) {
  if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
    return NextResponse.json(
      { success: false, error: "Invalid endpoint" },
      { status: 400 },
    );
  }
  return null;
}

// ✅ GET
export async function GET(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  searchParams.delete("endpoint");
  const queryString = searchParams.toString();
  const url = new URL(
    `/api/${endpoint}${queryString ? `?${queryString}` : ""}`,
    request.url,
  );

  try {
    const res = await fetch(url, {
      headers: { "x-auth-key": AUTH_KEY },
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // console.error("Proxy GET error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 },
    );
  }
}

// ✅ POST
export async function POST(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const body = await request.json();
  const { endpoint, ...payload } = body;

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  const url = new URL(`/api/${endpoint}`, request.url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-key": AUTH_KEY,
      },
      body: JSON.stringify(payload),
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // console.error("Proxy POST error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 },
    );
  }
}

// ✅ PUT
export async function PUT(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const body = await request.json();
  const { endpoint, ...payload } = body;

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  const url = new URL(`/api/${endpoint}`, request.url);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-key": AUTH_KEY,
      },
      body: JSON.stringify(payload),
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // console.error("Proxy PUT error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 },
    );
  }
}

// ✅
export async function DELETE(request) {
  const AUTH_KEY = process.env.AUTH_KEY;

  const body = await request.json();
  const { endpoint, ...payload } = body;

  // 🚫 Whitelist check
  const endpointError = validateEndpoint(endpoint);
  if (endpointError) return endpointError;

  const url = new URL(`/api/${endpoint}`, request.url);

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-auth-key": AUTH_KEY,
      },
      body: JSON.stringify(payload),
      // signal: AbortSignal.timeout(60000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // console.error("Proxy DELETE error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 },
    );
  }
}
