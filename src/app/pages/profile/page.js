"use client";

import dynamic from "next/dynamic";

const ProfileContent = dynamic(
  () => import("./ProfileContent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-9 w-9 rounded-full border-4 border-gray-200 border-t-[#0A192F] animate-spin" />
      </div>
    ),
  }
);

export default function ProfilePage() {
  return <ProfileContent />;
}