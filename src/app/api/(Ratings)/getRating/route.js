// src/app/api/ratings/get/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ replace * with specific domains in production
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// 🔵 GET → Fetch Ratings (Dynamic)
// ==========================
export async function GET(req) {
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

    // 3️⃣ Extract query params
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const groomerIdParam = searchParams.get("groomerId"); // can be comma-separated

    // 4️⃣ Validate shopId
    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "shopId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5️⃣ Initialize result array
    let feedbacks = [];

    // 6️⃣ Build query dynamically
    const query = { shopId };

    if (groomerIdParam) {
      // ✅ Support multiple groomer IDs
      const idArray = groomerIdParam.split(",").map((id) => id.trim()).filter(Boolean);

      query.groomerId = { $in: idArray };
    }

    // 7️⃣ Fetch all matching feedbacks
    feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

    // 8️⃣ Handle not found
    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json(
        { success: false, message: "No ratings found for the given filters." },
        { status: 404, headers: corsHeaders }
      );
    }

    // 9️⃣ Return consistent array response
    return NextResponse.json(
      {
        success: true,
        count: feedbacks.length,
        data: feedbacks,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ GET Ratings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not fetch ratings.", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
