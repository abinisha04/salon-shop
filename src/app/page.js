"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const shop = localStorage.getItem("shop");

    if (shop) {
      try {
        const shopData = JSON.parse(shop);

        if (shopData.isLoggedIn) {
          router.replace("/pages/home");
          return;
        }
      } catch {
        localStorage.removeItem("shop");
      }
    }

    router.replace("/pages/login");
  }, [router]);

  return null;
}