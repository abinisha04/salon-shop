// // Before Optimize code

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Select, Card, Tag, Empty, Space, Drawer, Form, Input, Radio, DatePicker, message, Button, Modal  } from "antd";
// import dayjs from "dayjs";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import Loading from "@/app/components/loading";

// import utc from "dayjs/plugin/utc";
// dayjs.extend(utc);

// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);

// export default function Page() {
//   // const backendUrl = process.env.BACKEND_URL;
//   // const authKey = process.env.AUTH_KEY;
//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState("live");
//   const [liveFilter, setLiveFilter] = useState("all");

//   const [shopTimeFilter, setShopTimeFilter] = useState("all");
//   const [groomerTimeFilter, setGroomerTimeFilter] = useState("all");
//   const [groomerFilter, setGroomerFilter] = useState("all");

//   const [openAdd, setOpenAdd] = useState(false);
// const [leaveType, setLeaveType] = useState("shop"); // shop | groomer
// const [dateType, setDateType] = useState("single"); // single | range
// const [adding, setAdding] = useState(false);
// const [addForm] = Form.useForm();

//   const today = dayjs();

//   // ================= FETCH =================
//   const fetchLeaves = async () => {
//     setLoading(true);
//     try {
//      const res = await fetch(
//   `/api/proxy?endpoint=getLeave&shopId=${shopId}`
// );
//       const result = await res.json();
//       if (result.success) setLeaves(result.leaves);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // ================= HELPERS =================
//   const isLive = (leave) => {
//     return today.isSameOrBefore(dayjs(leave.endDate), "day");
//   };

//   const isPast = (leave) => dayjs(leave.endDate).isBefore(today, "day");

//   const withinDays = (leave, days) =>
//     today.diff(dayjs(leave.endDate), "day") <= days;

//   const TIME_MAP = {
//     yesterday: 1,
//     week: 7,
//     three: 90,
//     six: 180,
//   };

//   // ================= FILTERED DATA =================
//   const filteredLeaves = useMemo(() => {
//     let data = [...leaves];

//     // ---------- LIVE ----------
//     if (activeTab === "live") {
//       data = data.filter(isLive);

//       if (liveFilter === "shop") data = data.filter((l) => l.isShop);
//       if (liveFilter === "groomer") data = data.filter((l) => !l.isShop);

//       data.sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

//       return data;
//     }

//     // ---------- SHOP (PAST ONLY) ----------
//     if (activeTab === "shop") {
//       data = data.filter((l) => l.isShop && isPast(l));

//       if (shopTimeFilter !== "all") {
//         data = data.filter((l) => withinDays(l, TIME_MAP[shopTimeFilter]));
//       }

//       return data;
//     }

//     // ---------- GROOMER (PAST ONLY) ----------
//     if (activeTab === "groomer") {
//       data = data.filter((l) => !l.isShop && isPast(l));

//       if (groomerFilter !== "all") {
//         data = data.filter((l) => l.groomerId?._id === groomerFilter);
//       }

//       if (groomerTimeFilter !== "all") {
//         data = data.filter((l) => withinDays(l, TIME_MAP[groomerTimeFilter]));
//       }

//       return data;
//     }

//     return [];
//   }, [
//     leaves,
//     activeTab,
//     liveFilter,
//     shopTimeFilter,
//     groomerTimeFilter,
//     groomerFilter,
//   ]);

//   // ================= GROOMERS =================
//   const groomers = useMemo(() => {
//     const map = new Map();
//     leaves.forEach((l) => {
//       if (l.groomerId) map.set(l.groomerId._id, l.groomerId);
//     });
//     return Array.from(map.values());
//   }, [leaves]);

//   const hasConflict = (payload) => {
//   const newStart = dayjs(payload.startDate);
//   const newEnd = dayjs(payload.endDate);

//   return leaves.some((l) => {
//     // same leave type
//     if (payload.isShop !== l.isShop) return false;

//     // groomer match if stylist leave
//     if (!payload.isShop && l.groomerId?._id !== payload.groomerId) return false;

//     const existStart = dayjs(l.startDate);
//     const existEnd = dayjs(l.endDate);

//     return (
//       newStart.isSameOrBefore(existEnd, "day") &&
//       newEnd.isSameOrAfter(existStart, "day")
//     );
//   });
// };

// const normalizeToUTCDate = (date) => {
//   if (!date) return null;

//   const d = dayjs(date);

//   return new Date(Date.UTC(
//     d.year(),
//     d.month(),
//     d.date()
//   ));
// };

// const normalizeUTC = (date) => {
//   return dayjs(date).utc().startOf("day");
// };

// const addLeave = async (values) => {
//   try {
//     let startDate, endDate;

//     if (dateType === "single") {
//       startDate = normalizeToUTCDate(values.startDate);
//       endDate = normalizeToUTCDate(values.startDate);
//     } else {
//       startDate = normalizeToUTCDate(values.startDate);
//       endDate = normalizeToUTCDate(values.endDate);
//     }

//     const payload = {
//       isShop: leaveType === "shop",
//       shopId,
//       groomerId: leaveType === "groomer" ? values.groomerId : null,
//       startDate,
//       endDate,
//       reason: values.reason,
//     };

//     // ❌ LEAVE OVERLAP CHECK
//     if (hasConflict(payload)) {
//       message.error("Leave already exists for the selected date(s)");
//       return;
//     }

//     // 🔥 APPOINTMENT CONFLICT CHECK
//     const appointments = await fetchAppointmentsForLeave({
//       startDate,
//       endDate,
//       groomerId: payload.groomerId,
//       isShop: payload.isShop,
//     });

//     if (appointments.length > 0) {
//       Modal.confirm({
//         title: "Appointments Found",
//         centered: true,
//         content: (
//           <div>
//             <p>
//               <strong>{appointments.length}</strong> appointment(s) fall within
//               this leave period.
//             </p>
//             <p className="text-red-500 mt-2">
//               These appointments will be cancelled if you continue.
//             </p>
//           </div>
//         ),
//         okText: "Cancel Appointments & Continue",
//         okType: "danger",
//         cancelText: "Go Back",
//         onOk: async () => {
//           await cancelAppointments(appointments);
//            await submitLeave(payload);
//         },
//       });
//       return;
//     }

//     // ✅ NO CONFLICT

//     await submitLeave(payload);
//   } catch (err) {
//     console.error(err);
//     message.error("Failed to add leave");
//   }
// };

// const fetchAppointmentsForLeave = async ({
//   startDate,
//   endDate,
//   groomerId,
//   isShop,
// }) => {
//   const params = new URLSearchParams({
//     shopId,
//     status: "active,confirmed",
//   });

//   // 👇 ONLY pass groomerId if groomer leave
//   if (!isShop && groomerId) {
//     params.append("groomerId", groomerId);
//   }

//   const res = await fetch(
//   `/api/proxy?endpoint=getAppointment&${params.toString()}`
// );

//   const result = await res.json();

//   if (!result.success) return [];

//   const start = normalizeUTC(startDate);
//   const end = normalizeUTC(endDate);

//   // ✅ DATE FILTER (UTC SAFE)

//   return result.appointments.filter((appt) => {
//   if (!appt.date) return false;

//   const apptDate = normalizeUTC(appt.date);

//   if (!apptDate.isValid()) return false;

//   return (
//     apptDate.isSameOrAfter(start, "day") &&
//     apptDate.isSameOrBefore(end, "day")
//   );
// });

// };

// const submitLeave = async (payload) => {
//   try {
//     setAdding(true);
// const res = await fetch(`/api/proxy`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ endpoint: "postLeave", ...payload }),
// });

//     const result = await res.json();

//     if (result.success) {
//       message.success("Leave added successfully");
//       setOpenAdd(false);
//       addForm.resetFields();
//       fetchLeaves();
//     } else {
//       message.error(result.message || "Failed to add leave");
//     }
//   } finally {
//     setAdding(false);
//   }
// };

// const cancelAppointments = async (appointments) => {
//   for (const appt of appointments) {
//     try {
//    await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     endpoint: "putAppointment",
//     appointmentId: appt._id,
//     status: "cancelled",
//   }),
// });

//       console.log("Appointment cancelled:", appt._id);

//     } catch (err) {
//       console.error("Failed to cancel appointment", appt._id);
//     }
//   }
// };

// const disablePastDates = (current) => {
//   return current && current < dayjs().startOf("day");
// };

//   if (loading) return <Loading />;

//   return (
//     <div className="p-4 bg-white min-h-screen pb-24">
//       <h1 className="text-xl font-bold mb-5">Leaves</h1>

//       {/* -------- TABS -------- */}
//       <div className="flex gap-3 mb-5">
//         {[
//           { key: "live", label: "LIVE" },
//           { key: "shop", label: "SHOP " },
//           { key: "groomer", label: "STYLIST " },
//         ].map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => {
//               setActiveTab(tab.key);
//               setLiveFilter("all");
//               setShopTimeFilter("all");
//               setGroomerTimeFilter("all");
//               setGroomerFilter("all");
//             }}
//             className={`flex-1 py-2 rounded-full text-sm font-semibold border transition
//               ${
//                 activeTab === tab.key
//                   ? "bg-black text-green-500 border-black"
//                   : "border-gray-300 text-gray-600 bg-white"
//               }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* -------- FILTERS -------- */}
//       <div className="flex flex-wrap gap-3 mb-4 justify-end">
//         {activeTab === "live" && (
//           <Select
//             value={liveFilter}
//             onChange={setLiveFilter}
//             style={{ width: 150 }}
//           >
//             <Select.Option value="all">All</Select.Option>
//             <Select.Option value="shop">Shop</Select.Option>
//             <Select.Option value="groomer">Stylist</Select.Option>
//           </Select>
//         )}

//         {activeTab === "shop" && (
//           <Select
//             value={shopTimeFilter}
//             onChange={setShopTimeFilter}
//             style={{ width: 150 }}
//           >
//             <Select.Option value="all">All</Select.Option>
//             <Select.Option value="yesterday">Yesterday</Select.Option>
//             <Select.Option value="week">Last Week</Select.Option>
//             <Select.Option value="three">Last 3 Months</Select.Option>
//             <Select.Option value="six">Last 6 Months</Select.Option>
//           </Select>
//         )}

//         {activeTab === "groomer" && (
//           <Space wrap>
//             <Select
//               value={groomerFilter}
//               onChange={setGroomerFilter}
//               style={{ width: 150 }}
//             >
//               <Select.Option value="all">All Stylists</Select.Option>
//               {groomers.map((g) => (
//                 <Select.Option key={g._id} value={g._id}>
//                   {g.name}
//                 </Select.Option>
//               ))}
//             </Select>

//             <Select
//               value={groomerTimeFilter}
//               onChange={setGroomerTimeFilter}
//               style={{ width: 150 }}
//             >
//               <Select.Option value="all">All</Select.Option>
//               <Select.Option value="yesterday">Yesterday</Select.Option>
//               <Select.Option value="week">Last Week</Select.Option>
//               <Select.Option value="three">Last 3 Months</Select.Option>
//               <Select.Option value="six">Last 6 Months</Select.Option>
//             </Select>
//           </Space>
//         )}
//       </div>

//       {/* -------- LIST -------- */}
//       {filteredLeaves.length === 0 ? (
//         <Empty description="No leaves found" />
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {filteredLeaves.map((leave) => (
//             <Card
//               key={leave._id}
//               className="rounded-xl"
//               style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
//             >
//               <div className="flex gap-3 items-start">
//                 <Image
//                   src={
//                     leave.isShop
//                       ? leave.shopId?.shopImage
//                       : leave.groomerId?.profileImage
//                   }
//                   width={48}
//                   height={48}
//                   className="rounded-full"
//                   alt="img"
//                 />

//                 <div className="flex-1">
//                   <div className="flex justify-between">
//                     <h3 className="font-semibold">
//                       {leave.isShop
//                         ? leave.shopId?.shopName
//                         : leave.groomerId?.name}
//                     </h3>

//                     <Tag color={leave.isShop ? "black" : "blue"}>
//                       {leave.isShop ? "SHOP LEAVE" : "STYLIST LEAVE"}
//                     </Tag>
//                   </div>

//                   <p className="text-sm text-gray-500 mt-1">
//                     {dayjs(leave.startDate).format("DD MMM YYYY")} →{" "}
//                     {dayjs(leave.endDate).format("DD MMM YYYY")}
//                   </p>

//                   <p className="text-sm mt-1">{leave.reason}</p>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* Continue Button */}
//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
//      <button
//   onClick={() => {
//     setOpenAdd(true);
//     addForm.resetFields();
//     setLeaveType("shop");
//     setDateType("single");
//   }}
//   className="w-full p-3 bg-black text-green-500 rounded-lg font-semibold"
// >
//   Add Leave
// </button>

//       </div>

// <Drawer
//   title="Add Leave"
//   placement="bottom"
//   open={openAdd}
//   onClose={() => setOpenAdd(false)}
//   styles={{
//     wrapper: { height: "60vh" },
//     body: {  overflowY: "auto" }, // space for button
//   }}
// >
//   <Form
//     form={addForm}
//     layout="vertical"
//     onFinish={addLeave}
//   >
//     {/* Leave Type */}
//     <Form.Item label="Leave Type">
//       <Radio.Group
//         value={leaveType}
//         onChange={(e) => setLeaveType(e.target.value)}
//       >
//         <Radio value="shop">Shop Leave</Radio>
//         <Radio value="groomer">Stylist Leave</Radio>
//       </Radio.Group>
//     </Form.Item>

//     {/* Groomer */}
//     {leaveType === "groomer" && (
//       <Form.Item
//         name="groomerId"
//         label="Select Stylist"
//         rules={[{ required: true }]}
//       >
//         <Select placeholder="Select stylist">
//           {groomers.map((g) => (
//             <Select.Option key={g._id} value={g._id}>
//               {g.name}
//             </Select.Option>
//           ))}
//         </Select>
//       </Form.Item>
//     )}

//     {/* Date Type */}
// <Form.Item label="Date Type">
//   <Radio.Group
//     value={dateType}
//     onChange={(e) => setDateType(e.target.value)}
//   >
//     <Radio value="single">Single Day</Radio>
//     <Radio value="range">Date Range</Radio>
//   </Radio.Group>
// </Form.Item>

// {dateType === "single" && (
//   <Form.Item
//     name="startDate"
//     label="Date"
//     rules={[{ required: true, message: "Select date" }]}
//   >
//     <DatePicker
//       className="w-full"
//       // disabledDate={disablePastDates}
//       getPopupContainer={(node) => node.parentElement}
//     />
//   </Form.Item>
// )}

// {dateType === "range" && (
//   <>
//     <Form.Item
//       name="startDate"
//       label="Start Date"
//       rules={[{ required: true, message: "Select start date" }]}
//     >
//       <DatePicker
//         className="w-full"
//         getPopupContainer={(node) => node.parentElement}
//         onChange={() => {
//           addForm.setFieldsValue({ endDate: null });
//         }}
//       />
//     </Form.Item>

//     <Form.Item
//       name="endDate"
//       label="End Date"
//       dependencies={["startDate"]}
//       rules={[
//         { required: true, message: "Select end date" },
//         ({ getFieldValue }) => ({
//           validator(_, value) {
//             const start = getFieldValue("startDate");
//             if (!value || !start) return Promise.resolve();
//             if (value.isSameOrAfter(start, "day")) {
//               return Promise.resolve();
//             }
//             return Promise.reject(
//               new Error("End date must be same or after start date")
//             );
//           },
//         }),
//       ]}
//     >
//       <DatePicker
//         className="w-full"
//         getPopupContainer={(node) => node.parentElement}
//       />
//     </Form.Item>
//   </>
// )}

//     {/* Reason */}
//     <Form.Item
//       name="reason"
//       label="Reason"
//       rules={[{ required: true }]}
//     >
//       <Input.TextArea rows={3} placeholder="Enter reason" />
//     </Form.Item>
//   </Form>

//   {/* ✅ FIXED BOTTOM BUTTON */}
//   {/* <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
//     <button
//       onClick={() => addForm.submit()}
//       disabled={adding}
//       className="w-full p-3 bg-black text-green-500 rounded-lg font-semibold transition"
//     >
//       {adding ? "Adding..." : "Add Leave"}
//     </button>
//   </div> */}

//       <Button
//             type="primary"
//             htmlType="submit"
//             onClick={() => addForm.submit()}
//             loading={adding}
//             className="w-full mt-3"
//           >
//             Add Service
//           </Button>

// </Drawer>

//     </div>
//   );
// }

// // Optimize code

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import {
  Select,
  Card,
  Tag,
  Empty,
  Space,
  Drawer,
  Form,
  Input,
  Radio,
  DatePicker,
  message,
  Button,
  Modal,
} from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import Loading from "@/app/components/loading";

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ── Module-level constants ────────────────────────────────────────────────
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// ✅ Stable map — not recreated on render
const TIME_MAP = { yesterday: 1, week: 7, three: 90, six: 180 };

// ── Pure helpers at module level ──────────────────────────────────────────
const normalizeToUTCDate = (date) => {
  if (!date) return null;
  const d = dayjs(date);
  return new Date(Date.UTC(d.year(), d.month(), d.date()));
};

const normalizeUTC = (date) => dayjs(date).utc().startOf("day");

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [liveFilter, setLiveFilter] = useState("all");

  const [shopTimeFilter, setShopTimeFilter] = useState("all");
  const [groomerTimeFilter, setGroomerTimeFilter] = useState("all");
  const [groomerFilter, setGroomerFilter] = useState("all");

  const [openAdd, setOpenAdd] = useState(false);
  const [leaveType, setLeaveType] = useState("shop");
  const [dateType, setDateType] = useState("single");
  const [adding, setAdding] = useState(false);
  const [addForm] = Form.useForm();

  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(dayjs());
  }, []); // ✅ stable reference

  // ── Fetch leaves ───────────────────────────────────────────────────────
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy?endpoint=getLeave&shopId=${SHOP_ID}`);
      // ✅ FIX: Guard non-OK response
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success) setLeaves(result.leaves ?? []);
    } catch (err) {
      // console.error(err);
      message.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch groomers ─────────────────────────────────────
  const fetchGroomers = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/proxy?endpoint=getGroomer&shopId=${SHOP_ID}`,
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();

      // console.log("Groomers API Response:", result);

      if (result.success) {
        setGroomers(result.groomers ?? []);
      } else {
        setGroomers([]);
      }
    } catch (err) {
      // console.error("Failed to fetch groomers:", err);
      message.error("Failed to load stylists");
    }
  }, []);

  useEffect(() => {
  fetchLeaves();
  fetchGroomers();
}, [fetchLeaves, fetchGroomers]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const isLive = useCallback(
    (leave) => today.isSameOrBefore(dayjs(leave.endDate), "day"),
    [today],
  );
  const isPast = useCallback(
    (leave) => dayjs(leave.endDate).isBefore(today, "day"),
    [today],
  );
  const withinDays = useCallback(
    (leave, days) => today.diff(dayjs(leave.endDate), "day") <= days,
    [today],
  );

  // ── Groomers derived from leaves ───────────────────────────────────────
  // const groomers = useMemo(() => {
  //   const map = new Map();
  //   leaves.forEach((l) => {
  //     if (l.groomerId) map.set(l.groomerId._id, l.groomerId);
  //   });
  //   return Array.from(map.values());
  // }, [leaves]);

  // ── Filtered leaves ────────────────────────────────────────────────────
  const filteredLeaves = useMemo(() => {
    let data = [...leaves];

    if (activeTab === "live") {
      data = data.filter(isLive);
      if (liveFilter === "shop") data = data.filter((l) => l.isShop);
      if (liveFilter === "groomer") data = data.filter((l) => !l.isShop);
      data.sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
      return data;
    }

    if (activeTab === "shop") {
      data = data.filter((l) => l.isShop && isPast(l));
      if (shopTimeFilter !== "all")
        data = data.filter((l) => withinDays(l, TIME_MAP[shopTimeFilter]));
      return data;
    }

    if (activeTab === "groomer") {
      data = data.filter((l) => !l.isShop && isPast(l));
      if (groomerFilter !== "all")
        data = data.filter((l) => l.groomerId?._id === groomerFilter);
      if (groomerTimeFilter !== "all")
        data = data.filter((l) => withinDays(l, TIME_MAP[groomerTimeFilter]));
      return data;
    }

    return [];
  }, [
    leaves,
    activeTab,
    liveFilter,
    shopTimeFilter,
    groomerTimeFilter,
    groomerFilter,
    isLive,
    isPast,
    withinDays,
  ]);

  // ── Conflict check ─────────────────────────────────────────────────────
  const hasConflict = useCallback(
    (payload) => {
      const newStart = dayjs(payload.startDate);
      const newEnd = dayjs(payload.endDate);

      return leaves.some((l) => {
        if (payload.isShop !== l.isShop) return false;
        if (!payload.isShop && l.groomerId?._id !== payload.groomerId)
          return false;
        const existStart = dayjs(l.startDate);
        const existEnd = dayjs(l.endDate);
        return (
          newStart.isSameOrBefore(existEnd, "day") &&
          newEnd.isSameOrAfter(existStart, "day")
        );
      });
    },
    [leaves],
  );

  // ── Fetch appointments for leave conflict ──────────────────────────────
  const fetchAppointmentsForLeave = useCallback(
    async ({ startDate, endDate, groomerId, isShop }) => {
      const params = new URLSearchParams({
        shopId: SHOP_ID,
        status: "active,confirmed",
      });
      if (!isShop && groomerId) params.append("groomerId", groomerId);

      try {
        const res = await fetch(
          `/api/proxy?endpoint=getAppointment&${params.toString()}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!result.success) return [];

        const start = normalizeUTC(startDate);
        const end = normalizeUTC(endDate);

        return result.appointments.filter((appt) => {
          if (!appt.date) return false;
          const apptDate = normalizeUTC(appt.date);
          if (!apptDate.isValid()) return false;
          return (
            apptDate.isSameOrAfter(start, "day") &&
            apptDate.isSameOrBefore(end, "day")
          );
        });
      } catch (err) {
        // console.error("Failed to fetch appointments for leave:", err);
        return [];
      }
    },
    [],
  );

  // ── Cancel appointments ────────────────────────────────────────────────
  // ✅ FIX: Promise.all instead of sequential for-loop awaits
  const cancelAppointments = useCallback(async (appointments) => {
    await Promise.allSettled(
      appointments.map((appt) =>
        fetch("/api/proxy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "putAppointment",
            appointmentId: appt._id,
            status: "cancelled",
          }),
        }),
      ),
    );
  }, []);

  // ── Submit leave ───────────────────────────────────────────────────────
  const submitLeave = useCallback(
    async (payload) => {
      try {
        setAdding(true);
        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "postLeave", ...payload }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        if (result.success) {
          message.success("Leave added successfully");
          setOpenAdd(false);
          addForm.resetFields();
          fetchLeaves();
        } else {
          message.error(result.message || "Failed to add leave");
        }
      } catch (err) {
        // console.error(err);
        message.error("Failed to add leave");
      } finally {
        setAdding(false);
      }
    },
    [addForm, fetchLeaves],
  );

  // ── Add leave ──────────────────────────────────────────────────────────
  const addLeave = useCallback(
    async (values) => {
      try {
        const startDate = normalizeToUTCDate(values.startDate);
        const endDate =
          dateType === "single"
            ? normalizeToUTCDate(values.startDate)
            : normalizeToUTCDate(values.endDate);

        const payload = {
          isShop: leaveType === "shop",
          shopId: SHOP_ID,
          groomerId: leaveType === "groomer" ? values.groomerId : null,
          startDate,
          endDate,
          reason: values.reason,
        };

        if (hasConflict(payload)) {
          message.error("Leave already exists for the selected date(s)");
          return;
        }

        const appointments = await fetchAppointmentsForLeave({
          startDate,
          endDate,
          groomerId: payload.groomerId,
          isShop: payload.isShop,
        });

        if (appointments.length > 0) {
          Modal.confirm({
            title: "Appointments Found",
            centered: true,
            content: (
              <div>
                <p>
                  <strong>{appointments.length}</strong> appointment(s) fall
                  within this leave period.
                </p>
                <p className="text-red-500 mt-2">
                  These appointments will be cancelled if you continue.
                </p>
              </div>
            ),
            okText: "Cancel Appointments & Continue",
            okType: "danger",
            cancelText: "Go Back",
            onOk: async () => {
              await cancelAppointments(appointments);
              await submitLeave(payload);
            },
          });
          return;
        }

        await submitLeave(payload);
      } catch (err) {
        // console.error(err);
        message.error("Failed to add leave");
      }
    },
    [
      dateType,
      leaveType,
      hasConflict,
      fetchAppointmentsForLeave,
      cancelAppointments,
      submitLeave,
    ],
  );

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    setLiveFilter("all");
    setShopTimeFilter("all");
    setGroomerTimeFilter("all");
    setGroomerFilter("all");
  }, []);

  if (loading || !today) return <Loading />;

  return (
    <div className="p-4 bg-white min-h-screen pb-24">
      <h1 className="text-xl font-bold mb-5">Leaves</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {[
          { key: "live", label: "LIVE" },
          { key: "shop", label: "SHOP" },
          { key: "groomer", label: "STYLIST" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === tab.key
                ? "bg-black text-green-500 border-black"
                : "border-gray-300 text-gray-600 bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 justify-end">
        {activeTab === "live" && (
          <Select
            value={liveFilter}
            onChange={setLiveFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="shop">Shop</Select.Option>
            <Select.Option value="groomer">Stylist</Select.Option>
          </Select>
        )}

        {activeTab === "shop" && (
          <Select
            value={shopTimeFilter}
            onChange={setShopTimeFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="yesterday">Yesterday</Select.Option>
            <Select.Option value="week">Last Week</Select.Option>
            <Select.Option value="three">Last 3 Months</Select.Option>
            <Select.Option value="six">Last 6 Months</Select.Option>
          </Select>
        )}

        {activeTab === "groomer" && (
          <Space wrap>
            <Select
              value={groomerFilter}
              onChange={setGroomerFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Stylists</Select.Option>
              {groomers.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={groomerTimeFilter}
              onChange={setGroomerTimeFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="yesterday">Yesterday</Select.Option>
              <Select.Option value="week">Last Week</Select.Option>
              <Select.Option value="three">Last 3 Months</Select.Option>
              <Select.Option value="six">Last 6 Months</Select.Option>
            </Select>
          </Space>
        )}
      </div>

      {/* List */}
      {filteredLeaves.length === 0 ? (
        <Empty description="No past leaves to display" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredLeaves.map((leave) => (
            <Card
              key={leave._id}
              className="rounded-xl"
              style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
            >
              <div className="flex gap-3 items-start">
                <Image
                  src={
                    leave.isShop
                      ? leave.shopId?.shopImage || "/shop.jpg"
                      : leave.groomerId?.profileImage
                  }
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                  alt="img"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-semibold truncate">
                      {leave.isShop
                        ? leave.shopId?.shopName
                        : leave.groomerId?.name}
                    </h3>
                    <Tag color={leave.isShop ? "black" : "blue"}>
                      {leave.isShop ? "SHOP LEAVE" : "STYLIST LEAVE"}
                    </Tag>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {dayjs(leave.startDate).format("DD MMM YYYY")} →{" "}
                    {dayjs(leave.endDate).format("DD MMM YYYY")}
                  </p>
                  <p className="text-sm mt-1">{leave.reason}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => {
            setOpenAdd(true);
            addForm.resetFields();
            setLeaveType("shop");
            setDateType("single");
          }}
          className="w-full p-3 bg-black text-green-500 rounded-lg font-semibold"
        >
          Add Leave
        </button>
      </div>

      {/* Add Leave Drawer */}
      <Drawer
        title="Add Leave"
        placement="bottom"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        styles={{ wrapper: { height: "60vh" }, body: { overflowY: "auto" } }}
      >
        <Form form={addForm} layout="vertical" onFinish={addLeave}>
          <Form.Item label="Leave Type">
            <Radio.Group
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <Radio value="shop">Shop Leave</Radio>
              <Radio value="groomer">Stylist Leave</Radio>
            </Radio.Group>
          </Form.Item>

          {leaveType === "groomer" && (
            <Form.Item
              name="groomerId"
              label="Select Stylist"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select stylist">
                {groomers.map((g) => (
                  <Select.Option key={g._id} value={g._id}>
                    {g.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Date Type">
            <Radio.Group
              value={dateType}
              onChange={(e) => setDateType(e.target.value)}
            >
              <Radio value="single">Single Day</Radio>
              <Radio value="range">Date Range</Radio>
            </Radio.Group>
          </Form.Item>

          {dateType === "single" && (
            <Form.Item
              name="startDate"
              label="Date"
              rules={[{ required: true, message: "Select date" }]}
            >
              <DatePicker
                className="w-full"
                getPopupContainer={(n) => n.parentElement}
              />
            </Form.Item>
          )}

          {dateType === "range" && (
            <>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: "Select start date" }]}
              >
                <DatePicker
                  className="w-full"
                  getPopupContainer={(n) => n.parentElement}
                  onChange={() => addForm.setFieldsValue({ endDate: null })}
                />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="End Date"
                dependencies={["startDate"]}
                rules={[
                  { required: true, message: "Select end date" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue("startDate");
                      if (!value || !start) return Promise.resolve();
                      if (value.isSameOrAfter(start, "day"))
                        return Promise.resolve();
                      return Promise.reject(
                        new Error("End date must be same or after start date"),
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-full"
                  getPopupContainer={(n) => n.parentElement}
                />
              </Form.Item>
            </>
          )}

          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Enter reason" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={adding}
            className="w-full mt-3"
          >
            {adding ? "Adding..." : "Add Leave"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
