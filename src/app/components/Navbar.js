
"use client";

import { useState, useEffect } from "react";
import { Menu, X, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar({ onMenuClick, shop }) {
  const [mounted, setMounted] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [shopRating, setShopRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const currentShopId = "6ae7c9ff38c6f355726abd90";

    let eventSource;
    let isMounted = true;

    // Fetch latest rating
    const fetchShopRating = async () => {
      try {
        const response = await fetch(
          `/api/proxy?endpoint=getShopFeedback&shopId=${currentShopId}&page=1&limit=10`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Failed to fetch shop feedback");
        }

        if (!isMounted) return;

        setShopId(currentShopId);
        setShopRating(result.averageRating || 0);
        setTotalReviews(result.totalReviews || 0);

        // console.log("Navbar rating updated:", result.averageRating);
      } catch (error) {
        // console.error("Navbar rating error:", error);
      }
    };

    // Initial fetch
    fetchShopRating();

    // SSE connection - same endpoint as Feedback Page
    eventSource = new EventSource(
      `/api/getShopFeedback?shopId=${encodeURIComponent(currentShopId)}&stream=true`
    );

    eventSource.addEventListener("connected", () => {
      // console.log("Navbar SSE connected");
    });

    // Listen for new feedback
    eventSource.addEventListener("feedback_created", (event) => {
      try {
        const data = JSON.parse(event.data);

        // console.log("Navbar received feedback:", data);

        if (String(data.shopId) === currentShopId) {
          fetchShopRating();
        }
      } catch (error) {
        // console.error("Feedback event error:", error);
      }
    });

    eventSource.onerror = (error) => {
      // console.error("Navbar SSE error:", error);
    };

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow-md z-50">
      <div className="px-4 flex justify-between items-center h-full">

        {/* Shop Logo and Rating */}
        <div className="flex items-center space-x-2">
          <Image
            src="/shop-logo.png"
            alt="Zenth Salon"
            width={32}
            height={32}
            className="rounded-full"
            priority
          />

          <div className="flex flex-col">
            <span className="text-xl font-bold text-black">
              Zenth Salon
            </span>

            {shopId && (
              <button
                onClick={() =>
                  router.push(`/pages/feedback?shopId=${shopId}`)
                }
                className="flex items-center gap-1 text-xs"
              >
                <Star
                  size={13}
                  className="fill-yellow-400 text-yellow-400"
                />

                <span className="text-yellow-500 font-semibold">
                  {shopRating.toFixed(1)}
                </span>

                <span className="text-gray-600">
                  ({totalReviews} reviews)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Hamburger Toggle */}
        <button
          className="p-2 rounded-md relative w-8 h-8"
          onClick={onMenuClick}
          aria-label={shop ? "Close menu" : "Open menu"}
        >
          <Menu
            className={`absolute top-0 left-0 w-6 h-6 text-black transition-transform duration-300 ${
              shop
                ? "rotate-90 opacity-0"
                : "rotate-0 opacity-100"
            }`}
          />

          <X
            className={`absolute top-0 left-0 w-6 h-6 text-black transition-transform duration-300 ${
              shop
                ? "rotate-0 opacity-100"
                : "-rotate-90 opacity-0"
            }`}
          />
        </button>

      </div>
    </nav>
  );
}
