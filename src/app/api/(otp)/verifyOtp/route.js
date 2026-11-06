import { createHash, timingSafeEqual } from "crypto";
import connectDB from "@/lib/db";
import Shop from "@/models/shop/schema";

export async function POST(request) {
  try {
    // 1. Read request data
    const { email, otp, fcmToken } = await request.json();

    // 2. Validate input
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp) ||
      typeof fcmToken !== "string" ||
      !fcmToken.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Valid email, OTP and FCM token are required.",
        },
        { status: 400 }
      );
    }

    // 3. Validate configured email and Shop ID
    const normalizedEmail = email.trim().toLowerCase();
    const allowedEmail = process.env.SHOP_LOGIN_EMAIL
      ?.trim()
      .toLowerCase();

    const shopId = process.env.SHOP_ID?.trim();

    if (!allowedEmail || normalizedEmail !== allowedEmail) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized email address.",
        },
        { status: 403 }
      );
    }

    if (!shopId) {
      return Response.json(
        {
          success: false,
          message: "SHOP_ID is not configured.",
        },
        { status: 500 }
      );
    }

    // 4. Get latest generated OTP
    const otpStore = globalThis.emailOtps;
    const savedOtp = otpStore?.get(normalizedEmail);

    if (!savedOtp) {
      return Response.json(
        {
          success: false,
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // 5. Check OTP expiry
    if (Date.now() > savedOtp.expiresAt) {
      otpStore.delete(normalizedEmail);

      return Response.json(
        {
          success: false,
          message: "OTP expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // 6. Validate saved OTP hash
    if (
      typeof savedOtp.otpHash !== "string" ||
      !/^[a-f0-9]{64}$/i.test(savedOtp.otpHash)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // 7. Compare entered OTP with saved OTP hash
    const enteredHash = createHash("sha256")
      .update(otp)
      .digest("hex");

    const enteredBuffer = Buffer.from(enteredHash, "hex");
    const savedBuffer = Buffer.from(savedOtp.otpHash, "hex");

    if (
      enteredBuffer.length !== savedBuffer.length ||
      !timingSafeEqual(enteredBuffer, savedBuffer)
    ) {
      return Response.json(
        {
          success: false,
          message: "Incorrect OTP. Please try again.",
        },
        { status: 400 }
      );
    }

    // 8. Connect to MongoDB
    await connectDB();

    // 9. Find the existing Shop using SHOP_ID
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return Response.json(
        {
          success: false,
          message: "Shop not found.",
        },
        { status: 404 }
      );
    }

    // 10. Confirm that the Shop email matches
    if (shop.shopEmail?.trim().toLowerCase() !== normalizedEmail) {
      return Response.json(
        {
          success: false,
          message: "Shop email does not match.",
        },
        { status: 403 }
      );
    }

    // 11. Update ONLY the FCM token
    shop.fcmToken = fcmToken.trim();

    await shop.save();

    // 12. Delete OTP only after successful database update
    otpStore.delete(normalizedEmail);

    // 13. Login successful
    return Response.json({
      success: true,
      message: "Shop login successful.",
    });

  } catch (error) {
    // console.error("Shop OTP verification error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}