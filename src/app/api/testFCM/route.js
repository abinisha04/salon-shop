import { NextResponse } from "next/server";
import { messaging } from "@/lib/firebaseAdmin";

// Temporary Customer FCM token
const CUSTOMER_FCM_TOKEN =
  "c1CNkRZ2KU3yRwNYxGCE0E:APA91bHPWVG2o2zfsk2MYpPbLOIGAUTsQWco7Dj6hEKcqlEoHGeui-lCfbzK-dR-KsABhqXsAjc05-LPQW0xAEjzKiW-QH_1sP0nv7QawPeIdOAM895TOfw";

export async function POST() {
  try {
    const message = {
      token: CUSTOMER_FCM_TOKEN,

      notification: {
        title: "Shop Test Notification",
        body: "Hello! This message was sent directly from the Shop app.",
      },

      data: {
        type: "SHOP_TEST",
        title: "Shop Test Notification",
        body: "Hello! This message was sent directly from the Shop app.",
      },
    };

    // console.log("Sending notification from Shop to Customer...");

    const response = await messaging.send(message);

    // console.log("Customer FCM Message ID:", response);

    return NextResponse.json({
      success: true,
      message: "Firebase accepted the notification",
      messageId: response,
    });
  } catch (error) {
    // console.error("Shop to Customer FCM Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorCode: error.code,
      },
      { status: 500 }
    );
  }
}