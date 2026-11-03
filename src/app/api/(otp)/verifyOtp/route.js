import { createHash, timingSafeEqual } from "crypto";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    // 1. Validate input
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return Response.json(
        { success: false, message: "Enter a valid email and 6-digit OTP." },
        { status: 400 }
      );
    }

    // 2. Check authorized Shop email
    const normalizedEmail = email.trim().toLowerCase();
    const allowedEmail = process.env.SHOP_LOGIN_EMAIL
      ?.trim()
      .toLowerCase();

    if (!allowedEmail || normalizedEmail !== allowedEmail) {
      return Response.json(
        { success: false, message: "Unauthorized email address." },
        { status: 403 }
      );
    }

    // 3. Get saved OTP
    const savedOtp = globalThis.emailOtps?.get(normalizedEmail);

    if (!savedOtp) {
      return Response.json(
        { success: false, message: "OTP not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // 4. Check expiry
    if (Date.now() > savedOtp.expiresAt) {
      globalThis.emailOtps.delete(normalizedEmail);

      return Response.json(
        { success: false, message: "OTP expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // 5. Compare OTP hash
    const enteredHash = createHash("sha256")
      .update(otp)
      .digest("hex");

    const isValid = timingSafeEqual(
      Buffer.from(enteredHash, "hex"),
      Buffer.from(savedOtp.otpHash, "hex")
    );

    if (!isValid) {
      return Response.json(
        { success: false, message: "Incorrect OTP. Please try again." },
        { status: 400 }
      );
    }

    // 6. Delete OTP after successful verification
    globalThis.emailOtps.delete(normalizedEmail);

    // 7. Successful Shop login
    return Response.json({
      success: true,
      message: "Shop login successful.",
    });

  } catch (error) {
    // console.error("Shop OTP verification error:", error);

    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}