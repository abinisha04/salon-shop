// src/app/api/feedback/post/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

// ==========================
// 🌍 CORS Headers
// ==========================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ Change * → your frontend domain in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// 🟢 OPTIONS → Preflight
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// 📝 POST → Submit Feedback
// ==========================
export async function POST(req) {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Check API Auth Key
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // 3️⃣ Parse request body
    const body = await req.json();
    const { shopId, userId, groomerId, serviceId, rating, feedback } = body;

    // 4️⃣ Validate required fields
    if (!shopId || !userId || !groomerId || !serviceId || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (shopId, userId, groomerId, serviceId, rating)",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5️⃣ Validate rating (1–5)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be an integer between 1 and 5" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // // 4️⃣ Check appointment status before allowing rating
    // const appointment = await Appointment.findOne({
    //   shopId,
    //   userId,
    //   groomerId,
    //   serviceId,
    //   status: "completed",
    // });

    // if (!appointment) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message:
    //         "Rating not allowed — appointment not found or not completed yet.",
    //     },
    //     { status: 403, headers: corsHeaders }
    //   );
    // }


    // 6️⃣ Create new feedback
    const newFeedback = new Feedback({
      shopId,
      userId,
      groomerId,
      serviceId,
      rating,
      feedback: feedback || "No feedback provided",
      
    });

    await newFeedback.save();

    // 7️⃣ Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully!",
        feedback: newFeedback,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ POST Feedback Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
