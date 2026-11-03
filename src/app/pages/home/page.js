// // Optimize code

"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import dayjs from "dayjs";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Modal, Tag, Button, Empty, message, Divider, Select } from "antd";
import Image from "next/image";
import { db, app } from "@/lib/firebase";
import LottieLoader from "@/app/components/loading";
import {
  UserOutlined,
  ScissorOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

// ── Module-level constants ────────────────────────────────────────────────
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

const FALLBACK_AVATAR =
  "/shop.jpg";

const STATUS_COLOR = {
  active: "blue",
  confirmed: "green",
  completed: "purple",
  cancelled: "red",
};

const STATUS_DOT = {
  confirmed: "bg-green-500",
  active: "bg-yellow-500",
  completed: "bg-gray-400",
  cancelled: "bg-red-500",
};

const STATUS_TABS = [
  { key: "active", label: "Active", color: "text-blue-500" },
  { key: "confirmed", label: "Confirm", color: "text-green-500" },
  { key: "completed", label: "Done", color: "text-gray-500" },
  { key: "cancelled", label: "Cancel", color: "text-red-500" },
];

// ── Safe localStorage helper ─────────────────────────────────────────────
const safeStorage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [groomerFilter, setGroomerFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("today");
  const [searchText, setSearchText] = useState("");

  // ✅ FIX: useRef to hold latest appointments for Firestore callback
  //    without causing the effect to re-run on every state change
  const appointmentsRef = useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // ── Fetch appointments ─────────────────────────────────────────────────
  const fetchAppointments = useCallback(async (showLoader = false) => {
    if (showLoader) setInitialLoading(true);
    try {
      const res = await fetch(
        `/api/proxy?endpoint=getAppointment&shopId=${SHOP_ID}&dateScope=upcoming`,
      );
      // ✅ FIX: Guard non-OK HTTP responses
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success) setAppointments(result.appointments ?? []);
    } catch (err) {
      message.error("Failed to load appointments");
    } finally {
      if (showLoader) setInitialLoading(false);
    }
  }, []);

  // ── Register FCM + save token ──────────────────────────────────────────
  // ✅ FIX: Fully dynamic import — firebase/messaging out of initial bundle

  const registerShopFCM = useCallback(async () => {
    try {
      if (!("Notification" in window)) {
        return;
      }

      if (!("serviceWorker" in navigator)) {
        return;
      }

      // 1. Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

      // 2. Register your custom service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" },
      );

      // console.log("Service Worker registration:", registration);

      // 3. Wait until service worker becomes active
      const activeRegistration = await navigator.serviceWorker.ready;

      // console.log("Active Service Worker:", activeRegistration);

      // 4. Initialize Firebase Messaging
      const { getMessaging, getToken, isSupported } =
        await import("firebase/messaging");

      const supported = await isSupported();

      if (!supported) {
        return;
      }

      const messaging = getMessaging(app);

      // 5. Generate FCM token using registered service worker
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: activeRegistration,
      });

      if (!token) {
        return;
      }

      // console.log("Shop FCM token generated successfully");

      // 6. Save token locally
      safeStorage.set("shopFCMToken", token);

      // 7. Save token in backend
      const response = await fetch("/api/proxy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "putShop",
          shopId: SHOP_ID,
          fcmToken: token,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save FCM token: ${response.status}`);
      }

    } catch (err) {
      // console.error("Shop FCM registration error:", err);
    }
  }, []);

  // ── Fetch shop details + cache in localStorage ─────────────────────────
  const fetchShopDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy?endpoint=getShop&shopId=${SHOP_ID}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && result.shops?.length > 0) {
        const shop = result.shops[0];
        safeStorage.set("shop", {
          shopId: shop._id,
          shopName: shop.shopName,
          shopEmail: shop.shopEmail,
          shopOwnerName: shop.shopOwnerName,
          shopMobile: shop.shopMobile,
          shopLocation: shop.shopLocation,
          openingHours: shop.openingHours,
          closingDays: shop.closingDays,
          shopImage: shop.shopImage,
          status: shop.status,
        });
      }
    } catch (err) {
      // console.error("Shop fetch failed:", err);
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchAppointments(true);
    fetchShopDetails();
    registerShopFCM();
  }, [fetchAppointments, fetchShopDetails, registerShopFCM]);

  // ── Firestore realtime listener ────────────────────────────────────────
  // ✅ FIX: fetchAppointments in dep array is now stable (useCallback)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "appointments"),
      async (snapshot) => {
        if (snapshot.empty) return;
        await fetchAppointments(false);
        // ✅ FIX: Batch deletes with Promise.all instead of sequential awaits
        await Promise.all(
          snapshot
            .docChanges()
            .map((change) => deleteDoc(doc(db, "appointments", change.doc.id))),
        );
      },
    );
    return () => unsubscribe();
  }, [fetchAppointments]);

  // ── FCM foreground listener ────────────────────────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    let unsubscribeFCM = null;

    const initFCM = async () => {
      try {
        const { getMessaging, onMessage } = await import("firebase/messaging");
        const messaging = getMessaging(app);
        // ✅ FIX: Store unsubscribe fn and call it on cleanup
        unsubscribeFCM = onMessage(messaging, (payload) => {
          if (Notification.permission === "granted") {
            message.success(payload.data?.title || "New Appointment");
          }
        });
      } catch (err) {
        // console.error("FCM init failed:", err);
      }
    };

    initFCM();
    return () => {
      if (typeof unsubscribeFCM === "function") unsubscribeFCM();
    };
  }, []);

  // ── Day options (stable — only computed once) ──────────────────────────
  const [dayOptions, setDayOptions] = useState([]);

  useEffect(() => {
    const base = dayjs().startOf("day");

    setDayOptions([
      { key: "all", label: "All Days", date: null },
      { key: "today", label: "Today", date: base },
      { key: "tomorrow", label: "Tomorrow", date: base.add(1, "day") },
    ]);
  }, []);

  // ✅ FIX: Moved getTargetDate inside useMemo — was called during render
  const filteredAppointments = useMemo(() => {
    let data = appointments.filter((a) => a.status === statusFilter);

    if (groomerFilter !== "all") {
      data = data.filter((a) => a.groomerId?._id === groomerFilter);
    }

    const option = dayOptions.find((d) => d.key === dayFilter);
    if (option?.date) {
      data = data.filter((a) => dayjs(a.date).isSame(option.date, "day"));
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (a) =>
          a.userId?.name?.toLowerCase().includes(q) ||
          a.userId?.phone?.includes(q),
      );
    }

    return data;
  }, [
    appointments,
    statusFilter,
    groomerFilter,
    dayFilter,
    searchText,
    dayOptions,
  ]);

  // ✅ FIX: Deduplicate groomers using Map — was already good, kept as-is
  const groomers = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      if (a.groomerId) map.set(a.groomerId._id, a.groomerId);
    });
    return Array.from(map.values());
  }, [appointments]);

  // ── Status update (optimistic) ─────────────────────────────────────────
  const updateStatus = useCallback(
    async (appointmentId, newStatus) => {
      // ✅ Optimistic update
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: newStatus } : a,
        ),
      );

      try {
        const res = await fetch("/api/proxy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "putAppointment",
            appointmentId,
            status: newStatus,
          }),
        });
        // ✅ FIX: Check res.ok before parsing
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!result.success) {
          message.error("Status update failed");
          fetchAppointments(false); // rollback
        }
      } catch (err) {
        // console.error("Update failed:", err);
        message.error("Update failed. Please try again.");
        fetchAppointments(false); // rollback optimistic update
      }
    },
    [fetchAppointments],
  );

  const showCancelAlert = useCallback(
    (appointmentId) => {
      Modal.confirm({
        title: "Cancel Appointment",
        content: "Are you sure you want to cancel this appointment?",
        okText: "Yes, Cancel",
        centered: true,
        cancelText: "No",
        okButtonProps: { danger: true },
        onOk: () => updateStatus(appointmentId, "cancelled"),
      });
    },
    [updateStatus],
  );

  if (initialLoading) return <LottieLoader />;

  return (
    <div className="p-4 bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-bold">Appointments</h1>
        <input
          type="text"
          placeholder="Search name or phone"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Select
          value={groomerFilter}
          onChange={setGroomerFilter}
          style={{ minWidth: 160 }}
        >
          <Select.Option value="all">All Stylists</Select.Option>
          {groomers.map((g) => (
            <Select.Option key={g._id} value={g._id}>
              {g.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={dayFilter}
          onChange={setDayFilter}
          style={{ minWidth: 160 }}
        >
          {dayOptions.map((d) => (
            <Select.Option key={d.key} value={d.key}>
              {d.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Status Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`py-2 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === tab.key
                ? "bg-black text-white border-black shadow-sm"
                : "bg-white border-gray-300 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredAppointments.length === 0 ? (
        <Empty description="No appointments found" />
        ) : (
        <div className="space-y-4">
          {filteredAppointments.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={a.userId?.profileImage || FALLBACK_AVATAR}
                      alt="user"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {a.userId?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dayjs(a.date).format("DD MMM YYYY")} · {a.time}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {/* ✅ Using lookup object instead of nested ternary */}
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[a.status] || "bg-gray-400"}`}
                  />
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setSelectedAppointment(a)}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="mt-3 flex flex-wrap gap-2">
                {a.serviceIds.map((s) => (
                  <div
                    key={s._id}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium"
                  >
                    {s.serviceName} · ₹{s.offerPrice}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Stylist: <b>{a.groomerId?.name}</b>
                </p>
                <div className="flex gap-2 items-center">
                  {a.status === "active" && (
                    <Button
                      size="small"
                      type="primary"
                      className="!bg-green-600"
                      icon={<CheckOutlined />}
                      onClick={() => updateStatus(a._id, "confirmed")}
                    >
                      Confirm
                    </Button>
                  )}
                  {a.status === "confirmed" && (
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => updateStatus(a._id, "completed")}
                    >
                      Done
                    </Button>
                  )}
                  {a.status !== "cancelled" && a.status !== "completed" && (
                    <Button
                      size="small"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => showCancelAlert(a._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        open={!!selectedAppointment}
        onCancel={() => setSelectedAppointment(null)}
        footer={null}
        centered
        width={420}
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-blue-600" />
            <span className="font-semibold">Appointment Details</span>
          </div>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4 text-sm">
            <Divider className="my-2" />

            <div className="flex justify-between">
              <div className="flex items-start gap-3">
                <UserOutlined className="text-gray-500 mt-1" />
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium pt-2 text-[16px]">
                    {selectedAppointment.userId?.name}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    {selectedAppointment.userId?.phone}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    {selectedAppointment.userId?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ScissorOutlined className="text-gray-500 mt-1" />
                <div>
                  <p className="text-gray-500">Stylist</p>
                  <p className="font-medium text-[16px] pt-2">
                    {selectedAppointment.groomerId?.name}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    {selectedAppointment.groomerId?.phone}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    {selectedAppointment.groomerId?.email}
                  </p>
                </div>
              </div>
            </div>

            <Divider className="my-2" />

            <div>
              <p className="text-gray-500 mb-1">Services</p>
              <div className="flex flex-wrap gap-2">
                {selectedAppointment.serviceIds.map((s) => (
                  <Tag
                    key={s._id}
                    color="geekblue"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <span>{s.serviceName}</span>
                    <span className="pl-2 pr-2">-</span>
                    <span className="font-semibold">₹{s.displayPrice}</span>
                  </Tag>
                ))}
              </div>
            </div>

            <Divider className="my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">
                    {dayjs(selectedAppointment.date).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-gray-500" />
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
              </div>
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 mb-1">Status</p>
                <Tag color={STATUS_COLOR[selectedAppointment.status]}>
                  {selectedAppointment.status.toUpperCase()}
                </Tag>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-1">Total</p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{selectedAppointment.price}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
