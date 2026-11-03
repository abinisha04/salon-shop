"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import {
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  EditOutlined,
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
  IdcardOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

import {
  Modal,
  Input,
  Button,
  message,
  Select,
  Checkbox,
  TimePicker,
  Tag,
  Spin,
  Divider,
} from "antd";

const DAYS_LIST = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --------------------------------------------------
// STORAGE
// --------------------------------------------------

const safeStorage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getShopId = (shop) => shop?.shopId || shop?._id;

const normalizeClosingDays = (days) => {
  if (Array.isArray(days)) return days;

  if (typeof days === "string" && days.trim()) {
    return days.split(",").map((day) => day.trim());
  }

  return [];
};

const normalizeOpeningHours = (hours) => {
  return DAYS_LIST.map((day, index) => {
    const existing = Array.isArray(hours)
      ? hours.find((item) => item.day?.toLowerCase() === day.toLowerCase()) ||
        hours[index]
      : null;

    return {
      ...existing,
      day,
      open: existing?.open || "",
      close: existing?.close || "",
    };
  });
};

const parseTime = (value) => {
  if (!value) return null;

  const time = String(value).trim();

  const twelveHour = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  let hour;
  let minute;

  if (twelveHour) {
    hour = Number(twelveHour[1]);
    minute = Number(twelveHour[2]);

    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  } else {
    const twentyFourHour = time.match(/^(\d{1,2}):(\d{2})$/);

    if (!twentyFourHour) return null;

    hour = Number(twentyFourHour[1]);
    minute = Number(twentyFourHour[2]);
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  // Fixed date prevents reading the current time during rendering.
  return dayjs("2000-01-01T00:00:00")
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);
};

const displayTime = (value) => {
  const parsed = parseTime(value);
  return parsed ? parsed.format("hh:mm A") : "Not set";
};

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5F3EA] text-[#9C8124] flex items-center justify-center text-lg">
          {icon}
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-[#17263C]">{title}</h3>

          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-[#17263C] mt-1 break-words">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

export default function ProfilePage() {
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // --------------------------------------------------
  // LOAD SHOP
  // --------------------------------------------------

  useEffect(() => {
    const storedShop = safeStorage.get("shop");

    if (storedShop) {
      setShop(storedShop);
    }

    setPageLoading(false);
  }, []);

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const handleEdit = useCallback(() => {
    if (!shop) return;

    setForm({
      ...shop,
      openingHours: normalizeOpeningHours(shop.openingHours),
      closingDays: normalizeClosingDays(shop.closingDays),
    });

    setEditOpen(true);
  }, [shop]);

  const handleCancel = () => {
    if (saving) return;

    setEditOpen(false);
    setForm(null);
  };

  // --------------------------------------------------
  // FORM HANDLERS
  // --------------------------------------------------

  const handleFieldChange = (key) => (event) => {
    setForm((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const handleSelectChange = (key) => (value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateHour = (index, key, value) => {
    setForm((previous) => {
      const updated = [...previous.openingHours];

      updated[index] = {
        ...updated[index],
        [key]: value,
      };

      return {
        ...previous,
        openingHours: updated,
      };
    });
  };

  // --------------------------------------------------
  // UPDATE API
  // --------------------------------------------------

  const handleUpdate = async () => {
    if (!form || !shop) return;

    if (
      !form.shopName?.trim() ||
      !form.shopOwnerName?.trim() ||
      !form.shopEmail?.trim() ||
      !form.shopMobile?.trim() ||
      !form.shopLocation?.trim()
    ) {
      message.warning("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shopEmail.trim())) {
      message.warning("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(form.shopMobile.trim())) {
      message.warning("Enter a valid 10-digit mobile number.");
      return;
    }

    const shopId = getShopId(shop);

    if (!shopId) {
      message.error("Shop ID not found.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        endpoint: "putShop",
        shopId,
        shopName: form.shopName.trim(),
        shopOwnerName: form.shopOwnerName.trim(),
        shopEmail: form.shopEmail.trim(),
        shopMobile: form.shopMobile.trim(),
        shopLocation: form.shopLocation.trim(),

        openingHours: form.openingHours.map((item) => ({
          ...item,
          open: item.open || "",
          close: item.close || "",
        })),

        closingDays: form.closingDays,
        status: form.status,
      };

      const response = await fetch("/api/proxy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();

      // console.log("Shop update response:", result);

      if (!result.success) {
        message.error(result.message || "Shop update failed.");
        return;
      }

      const updatedShop = {
        ...shop,
        ...form,
        shopId,
      };

      setShop(updatedShop);

      const saved = safeStorage.set("shop", updatedShop);

      setEditOpen(false);
      setForm(null);

      if (saved) {
        message.success("Shop profile updated successfully!");
      } else {
        message.warning(
          "Profile updated, but local storage could not be updated.",
        );
      }
    } catch (error) {
      // console.error("Shop update error:", error);
      message.error(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <ShopOutlined className="text-5xl text-gray-300 mb-4" />

        <h2 className="font-bold text-lg text-gray-800">
          Shop profile not found
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Please login again to load your shop information.
        </p>
      </div>
    );
  }

  const closingDays = normalizeClosingDays(shop.closingDays);
  const openingHours = normalizeOpeningHours(shop.openingHours);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 md:p-7">
      <div className="max-w-7xl mx-auto">
        {/* PROFILE HERO */}

        <div className="relative overflow-hidden rounded-2xl bg-[#0A192F] shadow-lg mb-6">
          {/* DECORATIVE BACKGROUND */}

          <div className="absolute -right-20 -top-32 w-80 h-80 rounded-full border-[45px] border-white/[0.035]" />
          <div className="absolute right-32 -bottom-44 w-80 h-80 rounded-full border-[45px] border-[#FFD700]/[0.06]" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              {/* SHOP IMAGE */}

              <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl border-2 border-[#FFD700]/60 bg-white/10 overflow-hidden relative shadow-xl">
                <Image
                  src="/shop.jpg"
                  alt="Shop"
                  fill
                  className="object-cover"
                  sizes="112px"
                  loading="eager"
                />
              </div>

              {/* SHOP NAME */}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {shop.shopName || "Shop Name"}
                  </h2>

                  {/* <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      shop.status === "active"
                        ? "bg-emerald-400/15 text-emerald-300 border border-emerald-300/20"
                        : "bg-red-400/15 text-red-300 border border-red-300/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {shop.status || "Unknown"}
                  </span> */}
                </div>

                <p className="text-[#C4CEDC] text-sm mb-3">
                  Owned by {shop.shopOwnerName || "-"}
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#B6C2D2]">
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-[#FFD700]" />
                    {shop.shopLocation || "Location not added"}
                  </span>
                </div>
              </div>
            </div>

            <Divider className="!border-white/10 !my-6" />

            {/* CONTACT STRIP */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-[#FFD700]">
                  <MailOutlined className="text-lg" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-[#8797AB] uppercase tracking-wider">
                    Email Address
                  </p>

                  <p className="text-sm text-white font-medium mt-1 break-all">
                    {shop.shopEmail || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-[#FFD700]">
                  <PhoneOutlined className="text-lg" />
                </div>

                <div>
                  <p className="text-[11px] text-[#8797AB] uppercase tracking-wider">
                    Phone Number
                  </p>

                  <p className="text-sm text-white font-medium mt-1">
                    {shop.shopMobile || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMATION GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          {/* GENERAL INFORMATION */}

          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <SectionHeader
              icon={<ShopOutlined />}
              title="Business Information"
              subtitle="Your shop's basic details"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <DetailItem
                icon={<ShopOutlined />}
                label="Shop Name"
                value={shop.shopName}
              />

              <DetailItem
                icon={<UserOutlined />}
                label="Owner Name"
                value={shop.shopOwnerName}
              />

              <DetailItem
                icon={<MailOutlined />}
                label="Email Address"
                value={shop.shopEmail}
              />

              <DetailItem
                icon={<PhoneOutlined />}
                label="Mobile Number"
                value={shop.shopMobile}
              />

              <DetailItem
                icon={<EnvironmentOutlined />}
                label="Location"
                value={shop.shopLocation}
              />
            </div>
          </div>

          {/* SHOP STATUS */}

          {/* <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">

            <SectionHeader
              icon={<CheckCircleFilled />}
              title="Shop Status"
              subtitle="Current business account status"
            />

            <div className="rounded-xl bg-[#F7F8FA] border border-gray-100 p-5">

              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    shop.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  <CheckCircleFilled className="text-2xl" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Account status
                  </p>

                  <p
                    className={`text-lg font-bold capitalize mt-0.5 ${
                      shop.status === "active"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {shop.status || "Unknown"}
                  </p>
                </div>
              </div>

              <Divider className="!my-4" />

              <p className="text-xs text-gray-500 leading-6">
                {shop.status === "active"
                  ? "Your shop account is currently active. Your business profile is available for management."
                  : "Your shop account is currently inactive. Check your account settings or contact support if necessary."}
              </p>

            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>Shop ID</span>
              <span className="font-medium text-gray-600 break-all text-right ml-3">
                {getShopId(shop) || "-"}
              </span>
            </div>
          </div> */}
        </div>

        {/* BUSINESS HOURS */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <SectionHeader
              icon={<ClockCircleOutlined />}
              title="Business Hours"
              subtitle="Your weekly operating schedule"
            />

            <div className="flex items-center gap-2 text-xs text-gray-400 pb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Open
              <span className="w-2 h-2 rounded-full bg-red-400 ml-2" />
              Closed
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* TABLE HEADER */}

            <div className="hidden sm:grid grid-cols-3 bg-[#F7F8FA] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <span>Day</span>
              <span>Opening Hours</span>
              <span className="text-right">Status</span>
            </div>

            {openingHours.map((item, index) => {
              const isClosed = closingDays.some(
                (day) => day.toLowerCase() === item.day.toLowerCase(),
              );

              const noHours = !item.open || !item.close;
              const closed = isClosed || noHours;

              return (
                <div
                  key={item.day}
                  className={`grid grid-cols-2 sm:grid-cols-3 items-center gap-2 px-5 py-4 border-t border-gray-100 ${
                    index === 0 ? "sm:border-t-0" : ""
                  } hover:bg-gray-50/80 transition`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#17263C]">
                      {item.day}
                    </p>
                  </div>

                  <div className="sm:block">
                    <p
                      className={`text-sm font-medium ${
                        closed ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {isClosed
                        ? "Weekly Holiday"
                        : noHours
                          ? "Hours not configured"
                          : `${displayTime(item.open)} – ${displayTime(item.close)}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                        closed
                          ? "bg-red-50 text-red-500"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          closed ? "bg-red-400" : "bg-emerald-500"
                        }`}
                      />
                      {isClosed ? "Closed" : noHours ? "Not set" : "Open"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLOSING DAYS */}

          <div className="mt-5 p-4 rounded-xl bg-[#FBF9F1] border border-[#F0EAD5]">
            <div className="flex items-center gap-2 mb-3">
              <CalendarOutlined className="text-[#9C8124]" />

              <p className="text-sm font-semibold text-[#17263C]">
                Weekly Holidays
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {closingDays.length > 0 ? (
                closingDays.map((day) => (
                  <span
                    key={day}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE1C4] text-xs font-semibold text-[#8D7424]"
                  >
                    {day}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">
                  No weekly holidays configured.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* SINGLE EDIT BUTTON */}

          <button
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#172B48] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <EditOutlined />
            Edit Profile
            <ArrowRightOutlined className="text-xs ml-1" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
          EDIT PROFILE MODAL
      -------------------------------------------------- */}

      <Modal
        open={editOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={760}
        closable={!saving}
        mask={{ closable: !saving }}
        destroyOnHidden
        title={null}
        styles={{
          body: {
            padding: 0,
          },
          content: {
            padding: 0,
            overflow: "hidden",
            borderRadius: 18,
          },
        }}
      >
        {form && (
          <div className="flex flex-col max-h-[85vh]">
            {/* MODAL HEADER */}

            <div className="bg-[#0A192F] px-6 py-5 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FFD700] text-[#0A192F] flex items-center justify-center text-lg">
                    <EditOutlined />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Edit Shop Profile
                    </h2>

                    <p className="text-xs text-[#B7C3D3] mt-1">
                      Update your business information
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center disabled:opacity-50"
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>

            {/* MODAL FORM */}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* BASIC DETAILS */}

              <section>
                <div className="mb-4">
                  <h3 className="font-bold text-[#17263C] text-sm">
                    Basic Information
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Update your shop and owner details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Shop Name *
                    </label>

                    <Input
                      size="large"
                      prefix={<ShopOutlined className="text-gray-400" />}
                      value={form.shopName || ""}
                      onChange={handleFieldChange("shopName")}
                      placeholder="Enter shop name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Owner Name *
                    </label>

                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      value={form.shopOwnerName || ""}
                      onChange={handleFieldChange("shopOwnerName")}
                      placeholder="Enter owner name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Email Address *
                    </label>

                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={form.shopEmail || ""}
                      onChange={handleFieldChange("shopEmail")}
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Mobile Number *
                    </label>

                    <Input
                      size="large"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      value={form.shopMobile || ""}
                      onChange={handleFieldChange("shopMobile")}
                      maxLength={10}
                      placeholder="10 digit mobile number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Shop Location *
                    </label>

                    <Input
                      size="large"
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                      value={form.shopLocation || ""}
                      onChange={handleFieldChange("shopLocation")}
                      placeholder="Enter shop location"
                    />
                  </div>
                </div>
              </section>

              <Divider className="!my-0" />

              {/* BUSINESS HOURS */}

              <section>
                <div className="mb-4">
                  <h3 className="font-bold text-[#17263C] text-sm">
                    Business Hours
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Set the opening and closing time for each day.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[75px_1fr_1fr] sm:grid-cols-[110px_1fr_1fr] gap-2 px-3 sm:px-4 py-3 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    <span>Day</span>
                    <span>Opens at</span>
                    <span>Closes at</span>
                  </div>

                  {form.openingHours.map((item, index) => {
                    const isClosed = form.closingDays.includes(item.day);

                    return (
                      <div
                        key={item.day}
                        className="grid grid-cols-[75px_1fr_1fr] sm:grid-cols-[110px_1fr_1fr] items-center gap-2 px-3 sm:px-4 py-3 border-t border-gray-100"
                      >
                        <span className="text-xs font-semibold text-gray-700">
                          {item.day.slice(0, 3)}
                        </span>

                        <TimePicker
                          use12Hours
                          format="hh:mm A"
                          placeholder="Opening"
                          className="w-full"
                          size="middle"
                          disabled={isClosed}
                          value={parseTime(item.open)}
                          onChange={(time) =>
                            updateHour(
                              index,
                              "open",
                              time ? time.format("HH:mm") : "",
                            )
                          }
                        />

                        <TimePicker
                          use12Hours
                          format="hh:mm A"
                          placeholder="Closing"
                          className="w-full"
                          size="middle"
                          disabled={isClosed}
                          value={parseTime(item.close)}
                          onChange={(time) =>
                            updateHour(
                              index,
                              "close",
                              time ? time.format("HH:mm") : "",
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <Divider className="!my-0" />

              {/* WEEKLY HOLIDAYS */}

              <section>
                <h3 className="font-bold text-[#17263C] text-sm">
                  Weekly Closing Days
                </h3>

                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Select the days when your shop remains closed.
                </p>

                <Checkbox.Group
                  value={form.closingDays}
                  onChange={(days) => {
                    setForm((previous) => ({
                      ...previous,
                      closingDays: days,
                    }));
                  }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {DAYS_LIST.map((day) => {
                    const checked = form.closingDays.includes(day);

                    return (
                      <label
                        key={day}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border cursor-pointer transition ${
                          checked
                            ? "bg-[#FBF8E9] border-[#D9BF65]"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Checkbox value={day} />
                        <span className="text-xs font-medium text-gray-700">
                          {day}
                        </span>
                      </label>
                    );
                  })}
                </Checkbox.Group>
              </section>

              <Divider className="!my-0" />

              {/* STATUS */}

              <section className="flex gap-3">
                <h3 className="font-bold text-[#17263C] text-sm mt-3">
                  Account Status
                </h3>

                <span className=" mt-3 text-sm font-medium text-green-600 bg-green-50 p-1 rounded-sm">
                  Active
                </span>
              </section>
            </div>

            {/* FIXED MODAL FOOTER */}

            <div className="shrink-0 bg-white border-t border-gray-100 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleUpdate}
                className="!bg-[#0A192F] hover:!bg-[#172B48] !rounded-xl !px-6"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
