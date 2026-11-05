"use client";

import { useState } from "react";

export default function TestFCMPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendNotification = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/testFCM", {
        method: "POST",
      });

      const data = await response.json();

      console.log("Shop FCM API Response:", data);

      setResult(data);
    } catch (error) {
      console.error("Request failed:", error);

      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5">
      <h1 className="text-2xl font-bold">
        Shop → Customer FCM Test
      </h1>

      <button
        onClick={sendNotification}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Sending..." : "Send Message to Customer"}
      </button>

      {result && (
        <pre className="bg-gray-100 text-black p-4 rounded-lg">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}