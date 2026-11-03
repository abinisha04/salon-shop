// src/app/api/ratings/update/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ replace * with specific domains in production
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// PUT → Update Feedback
// ==========================
export async function PUT(req) {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Check API Auth Key
    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 3️⃣ Parse body
    const body = await req.json();
    const { feedbackId, rating, comment } = body;

    // 4️⃣ Validate input
    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "feedbackId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5️⃣ Find and update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { rating, comment },
      { new: true } // return updated document
    );

    if (!updatedFeedback) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 6️⃣ Return response
    return NextResponse.json(
      {
        success: true,
        message: "Feedback updated successfully",
        data: updatedFeedback,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ PUT Ratings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not update feedback." },
      { status: 500, headers: corsHeaders }
    );
  }
}
