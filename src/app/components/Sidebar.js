
"use client";

import {
  Home,
  Scissors,
  Users,
  CalendarOff,
  BarChart3,
  User,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

const menu = [
  { name: "Home", path: "/pages/home", icon: Home },
  { name: "Services", path: "/pages/service", icon: Scissors },
  { name: "Stylists", path: "/pages/stylists", icon: Users },
  { name: "Leave", path: "/pages/leave", icon: CalendarOff },
  { name: "Reports", path: "/pages/reports", icon: BarChart3 },
  { name: "Profile", path: "/pages/profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const goTo = (path) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 h-[calc(100%-4rem)] w-64 bg-white shadow-lg z-50
        transform transition-all duration-300 ease-in-out
        ${
          open
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }
        md:translate-x-0 md:opacity-100 md:pointer-events-auto`}
      >

        {/* Menu */}
        <ul className="flex flex-col gap-1 p-2 text-black font-semibold">
          {menu.map((item) => {
            const active = pathname === item.path;

            return (
              <li
                key={item.name}
                onClick={() => goTo(item.path)}
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
