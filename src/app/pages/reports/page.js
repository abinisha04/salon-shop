// // Before Optimize code

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Table, Select, Card, Empty, Button, Modal, Tag, DatePicker } from "antd";
// import dayjs from "dayjs";
// import Loading from "@/app/components/loading";
// import { EyeOutlined } from "@ant-design/icons";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// /* ✅ PIE CHART */
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Legend,
//   Tooltip,
// } from "recharts";

// /* ✅ LINE GRAPH */
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
// } from "recharts";

// export default function Page() {
//   // const backendUrl = process.env.BACKEND_URL;
//   // const authKey = process.env.AUTH_KEY;
//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

// const [customRange, setCustomRange] = useState(null);

//   const [loading, setLoading] = useState(true);

//   const [reportType, setReportType] = useState("shop");
//   const [appointments, setAppointments] = useState([]);
//   const [leaves, setLeaves] = useState([]);

//   const [services, setServices] = useState([]);
//   const [stylists, setStylists] = useState([]);

//   const [serviceFilter, setServiceFilter] = useState("all");
//   const [stylistFilter, setStylistFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [quickDate, setQuickDate] = useState("thisweek");

// //
// useEffect(() => {
//   if (reportType === "stylist" && stylists.length > 0) {
//     setStylistFilter(stylists[0]._id); // ✅ first stylist default
//   }
// }, [reportType, stylists]);

//   // ✅ GRAPH ONLY PERIOD
//   const [graphPeriod, setGraphPeriod] = useState("thisweek");

//   const [viewAppt, setViewAppt] = useState(null);

//   // 🎨 AUTO COLOR GENERATOR (UNLIMITED UNIQUE COLORS)
// const getPieColor = (index, total) => {
//   const hue = (index * 360) / total; // spread colors evenly
//   return `hsl(${hue}, 70%, 50%)`;
// };

//   const getTotalOfferPrice = (appt) =>
//     appt.serviceIds.reduce((sum, s) => sum + Number(s.offerPrice || 0), 0);

//   // ================= FETCH =================
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // const [apptRes, leaveRes, serviceRes, groomerRes] = await Promise.all([
//       //   fetch(
//       //     `${backendUrl}/api/getAppointment?shopId=${shopId}&status=cancelled,completed`,
//       //     { headers: { "x-auth-key": authKey } }
//       //   ),
//       //   fetch(`${backendUrl}/api/getLeave?shopId=${shopId}`, {
//       //     headers: { "x-auth-key": authKey },
//       //   }),
//       //   fetch(`${backendUrl}/api/getService?shopId=${shopId}`, {
//       //     headers: { "x-auth-key": authKey },
//       //   }),
//       //   fetch(`${backendUrl}/api/getGroomer?shopId=${shopId}`, {
//       //     headers: { "x-auth-key": authKey },
//       //   }),
//       // ]);

//       const [apptRes, leaveRes, serviceRes, groomerRes] = await Promise.all([
//   fetch(`/api/proxy?endpoint=getAppointment&shopId=${shopId}&status=cancelled,completed`),
//   fetch(`/api/proxy?endpoint=getLeave&shopId=${shopId}`),
//   fetch(`/api/proxy?endpoint=getService&shopId=${shopId}`),
//   fetch(`/api/proxy?endpoint=getGroomer&shopId=${shopId}`),
// ]);
//       const apptData = await apptRes.json();
//       const leaveData = await leaveRes.json();
//       const serviceData = await serviceRes.json();
//       const groomerData = await groomerRes.json();

//       if (apptData.success) setAppointments(apptData.appointments);
//       if (leaveData.success) setLeaves(leaveData.leaves);
//       if (serviceData.success) setServices(serviceData.data);
//       if (groomerData.success) setStylists(groomerData.groomers);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

// const disableOldDates = (current) => {
//   const threeMonthsAgo = dayjs().subtract(3, "month").startOf("day");
//   const today = dayjs().endOf("day");

//   return (
//     current < threeMonthsAgo ||
//     current > today
//   );
// };

//   // ================= QUICK RANGE (MAIN FILTER) =================
//   const getFinalRange = () => {
//   if (customRange && customRange.length === 2) {
//     return [customRange[0].startOf("day"), customRange[1].endOf("day")];
//   }

//   const today = dayjs();

//   if (quickDate === "today") return [today.startOf("day"), today.endOf("day")];

//   if (quickDate === "yesterday") {
//     const y = today.subtract(1, "day");
//     return [y.startOf("day"), y.endOf("day")];
//   }

//   if (quickDate === "thisweek")
//     return [today.startOf("week"), today.endOf("day")];

//   if (quickDate === "lastweek") {
//     const s = today.subtract(1, "week").startOf("week");
//     const e = today.subtract(1, "week").endOf("week");
//     return [s, e];
//   }

//   if (quickDate === "1month")
//     return [today.subtract(1, "month").startOf("day"), today.endOf("day")];

//   if (quickDate === "3month")
//     return [today.subtract(3, "month").startOf("day"), today.endOf("day")];

//   return null;
// };

// const dateRange = getFinalRange();

//   // ================= GRAPH RANGE ONLY =================
//   const getGraphRange = () => {
//     const today = dayjs();

//     if (graphPeriod === "thisweek")
//       return [today.startOf("week"), today.endOf("day")];

//     if (graphPeriod === "lastweek") {
//       const s = today.subtract(1, "week").startOf("week");
//       const e = today.subtract(1, "week").endOf("week");
//       return [s, e];
//     }

//     if (graphPeriod === "1month")
//       return [today.subtract(1, "month").startOf("day"), today.endOf("day")];

//     if (graphPeriod === "3month")
//       return [today.subtract(3, "month").startOf("day"), today.endOf("day")];

//     return null;
//   };

//   const graphDateRange = getGraphRange();

//   // ================= FILTER APPOINTMENTS =================
//  const filteredAppointments = useMemo(() => {
//   let data = [...appointments];

//   if (serviceFilter !== "all") {
//     data = data.filter((a) =>
//       a.serviceIds?.some((s) => s._id === serviceFilter)
//     );
//   }

//   if (reportType === "stylist" && stylistFilter !== "all") {
//     data = data.filter((a) => a.groomerId?._id === stylistFilter);
//   }

//   if (statusFilter !== "all") {
//     data = data.filter((a) => a.status === statusFilter);
//   }

//   if (dateRange) {
//     const [start, end] = dateRange;
//     data = data.filter((a) => {
//       const d = dayjs(a.date).valueOf();
//       return d >= start.valueOf() && d <= end.valueOf();
//     });
//   }

//   // ✅ LATEST DATE FIRST
//   data.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

//   return data;
// }, [
//   appointments,
//   reportType,
//   serviceFilter,
//   stylistFilter,
//   statusFilter,
//   dateRange,
// ]);

//   // ================= SHOP LEAVE DAY-WISE =================
//   const shopLeaveDayWise = useMemo(() => {
//     let data = leaves.filter((l) => l.isShop === true);

//     let expanded = [];

//     data.forEach((l) => {
//       let current = dayjs(l.startDate).startOf("day");
//       const end = dayjs(l.endDate).startOf("day");

//       while (current.valueOf() <= end.valueOf()) {
//         expanded.push({
//           _id: `${l._id}-${current.format("YYYY-MM-DD")}`,
//           date: current.format("YYYY-MM-DD"),
//           reason: l.reason || "-",
//         });

//         current = current.add(1, "day");
//       }
//     });

//     if (dateRange) {
//       const [start, end] = dateRange;
//       expanded = expanded.filter((d) => {
//         const x = dayjs(d.date).valueOf();
//         return x >= start.valueOf() && x <= end.valueOf();
//       });
//     }

// expanded.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

//     return expanded;
//   }, [leaves, dateRange]);

//   // ================= SHOP LEAVE DAY SET =================
//   const shopLeaveDaySet = useMemo(() => {
//     const set = new Set();
//     shopLeaveDayWise.forEach((l) => {
//       set.add(l.date);
//     });
//     return set;
//   }, [shopLeaveDayWise]);

//   // ================= STYLIST LEAVE (DAY-WISE, EXCLUDE SHOP DAYS) =================
//   const stylistLeaveRecords = useMemo(() => {
//     let data = leaves.filter((l) => l.isShop === false);

//     if (stylistFilter !== "all") {
//       data = data.filter((l) => l.groomerId?._id === stylistFilter);
//     }

//     let expanded = [];

//     data.forEach((l) => {
//       let current = dayjs(l.startDate).startOf("day");
//       const end = dayjs(l.endDate).startOf("day");

//       while (current.valueOf() <= end.valueOf()) {
//         const dayStr = current.format("YYYY-MM-DD");

//         if (!shopLeaveDaySet.has(dayStr)) {
//           expanded.push({
//             _id: `${l._id}-${dayStr}`,
//             date: dayStr,
//             stylistName: l.groomerId?.name || "-",
//             reason: l.reason,
//           });
//         }

//         current = current.add(1, "day");
//       }
//     });

//     if (dateRange) {
//       const [start, end] = dateRange;
//       expanded = expanded.filter((d) => {
//         const x = dayjs(d.date).valueOf();
//         return x >= start.valueOf() && x <= end.valueOf();
//       });
//     }

// expanded.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

//     return expanded;
//   }, [leaves, stylistFilter, dateRange, shopLeaveDaySet]);

//   const stylistLeaveCount = stylistLeaveRecords.length;

//   // ================= SUMMARY =================
//   const summary = useMemo(() => {
//     const completed = filteredAppointments.filter(
//       (a) => a.status === "completed"
//     );
//     const cancelled = filteredAppointments.filter(
//       (a) => a.status === "cancelled"
//     );

//     const revenue = completed.reduce(
//       (sum, a) => sum + getTotalOfferPrice(a),
//       0
//     );

//     return {
//       total: filteredAppointments.length,
//       completed: completed.length,
//       cancelled: cancelled.length,
//       revenue,
//       shopLeaveCount: shopLeaveDayWise.length,
//     };
//   }, [filteredAppointments, shopLeaveDayWise]);

//   // ================= PIE DATA =================
//   const servicePieData = useMemo(() => {
//     const map = {};
//     filteredAppointments.forEach((a) => {
//       a.serviceIds?.forEach((s) => {
//         if (!map[s.serviceName]) map[s.serviceName] = 0;
//         map[s.serviceName] += 1;
//       });
//     });
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [filteredAppointments]);

//   // ================= GRAPH DATA =================
//   const appointmentGraphData = useMemo(() => {
//     if (!graphDateRange) return [];

//     const [start, end] = graphDateRange;

//     let map = {};
//     filteredAppointments.forEach((a) => {
//       const d = dayjs(a.date).format("YYYY-MM-DD");
//       if (!map[d]) map[d] = 0;
//       map[d] += 1;
//     });

//     let data = [];
//     let current = start.startOf("day");
//     const last = end.startOf("day");

//     let total = 0;

//     while (current.valueOf() <= last.valueOf()) {
//       const key = current.format("YYYY-MM-DD");
//       total += map[key] || 0;
//       data.push({ date: key, total });
//       current = current.add(1, "day");
//     }

//     return data;
//   }, [filteredAppointments, graphDateRange]);

//   const graphStartEndFormatter = (value, index) => {
//     if (!appointmentGraphData.length) return "";
//     if (index === 0) return dayjs(value).format("DD MMM");
//     if (index === appointmentGraphData.length - 1)
//       return dayjs(value).format("DD MMM");
//     return "";
//   };

//   if (loading) return <Loading />;

//   // ================= PDF EXPORT =================
//   const exportShopAppointmentsPDF = () => {
//   const doc = new jsPDF();

//   doc.setFontSize(14);
//   doc.text("Shop Appointments Report", 14, 10);

//   const rangeText = dateRange
//     ? `${dateRange[0].format("DD MMM YYYY")} - ${dateRange[1].format("DD MMM YYYY")}`
//     : "All Dates";

//   doc.setFontSize(11);
//   doc.text(`Period: ${rangeText}`, 14, 16);

//   autoTable(doc, {
//     startY: 22,
//     margin: { left: 15, right: 15 },

//     head: [["Date", "Stylist", "Status", "Total Price"]],
//     body: filteredAppointments.map((a) => [
//       dayjs(a.date).format("DD MMM YYYY"),
//       a.groomerId?.name || "-",
//       a.status,
//       `Rs. ${getTotalOfferPrice(a)}`,
//     ]),

//     styles: {
//       fontSize: 10,
//       cellPadding: 4,
//       overflow: "visible",
//     },

//     columnStyles: {
//       0: { cellWidth: 38 },
//       1: { cellWidth: 45 },
//       2: { cellWidth: 30 },
//       3: { cellWidth: 40 }, // ✅ price cut problem fixed
//     },
//   });

//   const finalY = doc.lastAutoTable.finalY || 30;

//   const totalRevenue = filteredAppointments
//   .filter((a) => a.status === "completed")   // ✅ only completed
//   .reduce((sum, a) => sum + getTotalOfferPrice(a), 0);

//   doc.setFontSize(12);
//   doc.text(`Total Revenue: Rs. ${totalRevenue}`, 14, finalY + 10);

//   doc.save("shop-appointments-report.pdf");
// };

//   const exportShopLeavePDF = () => {
//     const doc = new jsPDF();
//     doc.text("Shop Leave Report", 14, 20);

//     autoTable(doc, {
//       startY: 20,
//       head: [["Date", "Reason"]],
//       body: shopLeaveDayWise.map((l) => [
//         dayjs(l.date).format("DD MMM YYYY"),
//         l.reason || "-",
//       ]),
//     });

//     doc.save("shop-leave-report.pdf");
//   };

//   // ✅ STYLIST APPOINTMENTS PDF
// const exportStylistAppointmentsPDF = () => {
//   const doc = new jsPDF();

//   doc.setFontSize(14);
//   doc.text("Stylist Appointments Report", 14, 10);

//   const rangeText = dateRange
//     ? `${dateRange[0].format("DD MMM YYYY")} - ${dateRange[1].format("DD MMM YYYY")}`
//     : "All Dates";

//   doc.setFontSize(11);
//   doc.text(`Period: ${rangeText}`, 14, 16);

//   autoTable(doc, {
//     startY: 22,
//     margin: { left: 15, right: 15 },   // ✅ FIRST DIGIT CUT FIX

//     head: [["Date", "Stylist", "Status", "Total Price"]],
//     body: filteredAppointments.map((a) => [
//       dayjs(a.date).format("DD MMM YYYY"),
//       a.groomerId?.name || "-",
//       a.status,
//       `Rs. ${getTotalOfferPrice(a)}`,   // ✅ full number visible
//     ]),

//     styles: {
//       fontSize: 10,
//       cellPadding: 4,
//       overflow: "visible",
//     },

//     columnStyles: {
//       0: { cellWidth: 38 },
//       1: { cellWidth: 45 },
//       2: { cellWidth: 30 },
//       3: { cellWidth: 40 },  // ✅ PRICE COLUMN BIG WIDTH
//     },
//   });

//   const finalY = doc.lastAutoTable.finalY || 30;

//   const totalRevenue = filteredAppointments
//     .filter((a) => a.status === "completed")   // ✅ only completed revenue
//     .reduce((sum, a) => sum + getTotalOfferPrice(a), 0);

//   doc.setFontSize(12);
//   doc.text(`Total Revenue (Completed): Rs. ${totalRevenue}`, 14, finalY + 10);

//   doc.save("stylist-appointments-report.pdf");
// };

// // ✅ STYLIST LEAVE PDF
// const exportStylistLeavePDF = () => {
//   const doc = new jsPDF();
//   doc.text("Stylist Leave Report", 14, 10);

//   autoTable(doc, {
//     startY: 20,
//     head: [["Date", "Stylist", "Reason"]],
//     body: stylistLeaveRecords.map((l) => [
//       dayjs(l.date).format("DD MMM YYYY"),
//       l.stylistName,
//       l.reason || "-",
//     ]),
//   });

//   doc.save("stylist-leave-report.pdf");
// };

//   // ================= TABLE COLUMNS =================
//   const appointmentColumns = [
//     { title: "Date", render: (_, r) => dayjs(r.date).format("DD MMM YYYY") },
//     { title: "Stylist", render: (_, r) => r.groomerId?.name || "-" },
//    {
//   title: "View",
//   render: (_, r) => {
//     const statusColor =
//       r.status === "completed"
//         ? "bg-green-500"
//         : r.status === "cancelled"
//         ? "bg-red-500"
//         : "bg-yellow-400";

//     return (
//       <div className="flex items-center gap-2">
//         {/* 🔵🟢🔴 STATUS DOT */}
//         <span
//           className={`inline-block w-2.5 h-2.5 rounded-full ${statusColor}`}
//         />

//         {/* 👁️ VIEW BUTTON */}
//         <Button
//           size="small"
//           className="!bg-gray-100 !border-gray-300 hover:!bg-gray-200"
//           icon={<EyeOutlined className="text-lg text-black" />}
//           onClick={() => setViewAppt(r)}
//         />
//       </div>
//     );
//   },
// },

//     { title: "Price", render: (_, r) => `₹${getTotalOfferPrice(r)}` },
//   ];

//   const shopLeaveColumns = [
//     {
//       title: "Date",
//       dataIndex: "date",
//       render: (v) => dayjs(v).format("DD MMM YYYY"),
//     },
//     { title: "Reason", dataIndex: "reason" },
//   ];

//   const stylistLeaveColumns = [
//     {
//       title: "Date",
//       dataIndex: "date",
//       render: (v) => dayjs(v).format("DD MMM YYYY"),
//     },
//     { title: "Stylist", dataIndex: "stylistName" },
//     { title: "Reason", dataIndex: "reason" },
//   ];

//   return (
//     <div className="p-4 bg-white min-h-screen">
//       <h1 className="text-xl font-bold mb-4">Reports</h1>

//       {/* TOGGLE */}
//       <div className="flex gap-3 mb-4">
//         {["shop", "stylist"].map((t) => (
//           <button
//             key={t}
//             onClick={() => {
//               setReportType(t);
//               setStylistFilter("all");
//             }}
//             className={`flex-1 py-2 rounded-full border font-semibold ${
//               reportType === t ? "bg-black text-green-500" : "border-gray-300"
//             }`}
//           >
//             {t === "shop" ? "SHOP REPORT" : "STYLIST REPORT"}
//           </button>
//         ))}
//       </div>

//       {/* FILTERS */}
//       <div className="flex flex-wrap gap-3 mb-5">
//        {reportType === "stylist" && (
//   <Select
//     value={stylistFilter}
//     onChange={setStylistFilter}
//     style={{ width: 180 }}
//     placeholder="Select Stylist"
//   >
//     {stylists.map((s) => (
//       <Select.Option key={s._id} value={s._id}>
//         {s.name}
//       </Select.Option>
//     ))}
//   </Select>
// )}

//         <Select
//           value={serviceFilter}
//           onChange={setServiceFilter}
//           style={{ width: 180 }}
//         >
//           <Select.Option value="all">All Services</Select.Option>
//           {services.map((s) => (
//             <Select.Option key={s._id} value={s._id}>
//               {s.serviceName}
//             </Select.Option>
//           ))}
//         </Select>

//         <Select
//           value={statusFilter}
//           onChange={setStatusFilter}
//           style={{ width: 160 }}
//         >
//           <Select.Option value="all">All Status</Select.Option>
//           <Select.Option value="completed">Completed</Select.Option>
//           <Select.Option value="cancelled">Cancelled</Select.Option>
//         </Select>

//        {/* SELECT PERIOD */}
// <Select
//   value={quickDate}
//   onChange={(v) => {
//     setQuickDate(v);
//     setCustomRange(null); // clear custom date
//   }}
//   style={{ width: 170 }}
// >
//   <Select.Option value="today">Today</Select.Option>
//   <Select.Option value="yesterday">Yesterday</Select.Option>
//   <Select.Option value="thisweek">This Week</Select.Option>
//   <Select.Option value="lastweek">Last Week</Select.Option>
//   <Select.Option value="1month">1 Month</Select.Option>
//   <Select.Option value="3month">3 Months</Select.Option>
// </Select>

// {/* CUSTOM DATE RANGE (MAX 3 MONTHS) */}
// <DatePicker.RangePicker
//   value={customRange}
//   onChange={(val) => {
//     setCustomRange(val);
//     setQuickDate(null); // disable quick filter
//   }}
//   disabledDate={disableOldDates}
//   allowClear
// />

//       </div>

//       {/* SUMMARY */}
//       <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
//         {[
//           ["Total", summary.total],
//           ["Completed", summary.completed],
//           ["Cancelled", summary.cancelled],
//           ["Revenue", `₹${summary.revenue}`],
//           [
//             "Leaves",
//             reportType === "shop"
//               ? summary.shopLeaveCount
//               : stylistLeaveCount,
//           ],
//         ].map(([l, v]) => (
//           <Card key={l} className="text-center">
//             <p className="text-xs text-gray-500">{l}</p>
//             <p className="text-lg font-bold">{v}</p>
//           </Card>
//         ))}
//       </div>

//       {/* APPOINTMENTS TABLE */}
//       {filteredAppointments.length === 0 ? (
//         <Empty description="No appointment data" />
//       ) : (
//         <>
//           <div className="flex justify-end mb-2 gap-2">
//   {reportType === "shop" && (
//     <Button type="primary" onClick={exportShopAppointmentsPDF}>
//       Export Appointments PDF
//     </Button>
//   )}

//   {reportType === "stylist" && (
//     <Button type="primary" onClick={exportStylistAppointmentsPDF}>
//       Export Stylist Appointments PDF
//     </Button>
//   )}
// </div>

//           <Table
//             rowKey="_id"
//             columns={appointmentColumns}
//             dataSource={filteredAppointments}
//             pagination={{ pageSize: 5 }}
//           />
//         </>
//       )}

//       {/* SHOP TAB — LEAVE + PIE + GRAPH */}
//       {reportType === "shop" && (
//         <div className="mt-8">
//           <div className="flex justify-end mb-2">
//             <Button type="primary" onClick={exportShopLeavePDF}>
//               Export Shop Leave PDF
//             </Button>
//           </div>

//           <h2 className="font-semibold mb-3">Shop Leave Report</h2>

//           <Table
//             rowKey="_id"
//             columns={shopLeaveColumns}
//             dataSource={shopLeaveDayWise}
//             pagination={{ pageSize: 5 }}
//           />

//           {/* PIE CHART */}
//           <div className="mt-10">
//             <h3 className="font-semibold text-center mb-3">
//               Most Used Services (%)
//             </h3>

//             {servicePieData.length === 0 ? (
//               <Empty description="No service data" />
//             ) : (
//               <div className="w-full h-[320px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={servicePieData}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="45%"
//                       outerRadius={100}
//                       labelLine={false}
//                         isAnimationActive={false}   // ✅ IMPORTANT

//                       label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//                         const RADIAN = Math.PI / 180;
//                         const radius =
//                           innerRadius + (outerRadius - innerRadius) / 2;
//                         const x = cx + radius * Math.cos(-midAngle * RADIAN);
//                         const y = cy + radius * Math.sin(-midAngle * RADIAN);

//                         return (
//                           <text
//                             x={x}
//                             y={y}
//                             fill="#fff"
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                             fontSize={13}
//                             fontWeight="bold"
//                           >
//                             {(percent * 100).toFixed(0)}%
//                           </text>
//                         );
//                       }}
//                     >
//                       {servicePieData.map((_, index) => (
//                         <Cell
//   key={index}
//   fill={getPieColor(index, servicePieData.length)}
// />

//                       ))}
//                     </Pie>

//                     <Tooltip />
//                     <Legend verticalAlign="bottom" iconType="circle" />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           {/* GRAPH PERIOD SELECT */}
//           <div className="flex justify-end mt-6 mb-2">
//             <Select
//               value={graphPeriod}
//               onChange={setGraphPeriod}
//               style={{ width: 160 }}
//             >
//               <Select.Option value="thisweek">This Week</Select.Option>
//               <Select.Option value="lastweek">Last Week</Select.Option>
//               <Select.Option value="1month">1 Month</Select.Option>
//               <Select.Option value="3month">3 Months</Select.Option>
//             </Select>
//           </div>

//           {/* 📈 APPOINTMENT TREND GRAPH */}
//           <div>
//             <h3 className="font-semibold text-center mb-3">
//               Appointment Trend
//             </h3>

//             {appointmentGraphData.length === 0 ? (
//               <Empty description="No graph data" />
//             ) : (
//               <div className="w-full h-[280px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={appointmentGraphData}>
//                     <CartesianGrid strokeDasharray="3 3" />

//                     <XAxis
//                       dataKey="date"
//                       tickFormatter={graphStartEndFormatter}
//                     />

//                     <YAxis allowDecimals={false} />

//                     <Tooltip
//                       labelFormatter={(v) =>
//                         dayjs(v).format("DD MMM YYYY")
//                       }
//                     />

//                     <Line
//                       type="stepAfter"
//                       dataKey="total"
//                       stroke="#22c55e"
//                       strokeWidth={3}
//                       dot={false}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* STYLIST TAB — LEAVE ONLY */}
//    {reportType === "stylist" && (
//   <div className="mt-8">
//     <div className="flex justify-end mb-2">
//       <Button type="primary" onClick={exportStylistLeavePDF}>
//         Export Stylist Leave PDF
//       </Button>
//     </div>

//     <h2 className="font-semibold mb-3">Stylist Leave Report</h2>

//     <Table
//       rowKey="_id"
//       columns={stylistLeaveColumns}
//       dataSource={stylistLeaveRecords}
//       pagination={{ pageSize: 5 }}
//     />
//   </div>
// )}

//       {/* VIEW MODAL */}
//       <Modal
//         open={!!viewAppt}
//         onCancel={() => setViewAppt(null)}
//         footer={null}
//         centered
//         title="Appointment Details"
//       >
// {viewAppt && (
//   <div className="space-y-4 text-sm">

//     {/* DATE & TIME */}
//     <div className="flex justify-between">
//       <p>
//         <b>Date:</b> {dayjs(viewAppt.date).format("DD MMM YYYY")}
//       </p>
//       <p>
//         <b>Time:</b> {viewAppt.time}
//       </p>
//     </div>

//     {/* CUSTOMER DETAILS */}
//     <div className="border rounded-lg p-3 bg-gray-50">
//       <p className="font-semibold mb-1">Customer</p>
//       <p><b>Name:</b> {viewAppt.userId?.name || "-"}</p>
//       <p><b>Phone:</b> {viewAppt.userId?.phone || "-"}</p>
//       <p><b>Email:</b> {viewAppt.userId?.email || "-"}</p>
//     </div>

//     {/* STYLIST DETAILS */}
//     <div className="border rounded-lg p-3 bg-gray-50">
//       <p className="font-semibold mb-1">Stylist</p>
//       <p><b>Name:</b> {viewAppt.groomerId?.name || "-"}</p>
//       <p><b>Phone:</b> {viewAppt.groomerId?.phone || "-"}</p>
//       <p><b>Email:</b> {viewAppt.groomerId?.email || "-"}</p>
//     </div>

//     {/* STATUS */}
//     <div>
//       <b>Status:</b>{" "}
//       <Tag color={viewAppt.status === "completed" ? "green" : "red"}>
//         {viewAppt.status.toUpperCase()}
//       </Tag>
//     </div>

//     {/* SERVICES */}
//     <div>
//       <p className="font-semibold mb-1">Services</p>
//       <ul className="list-disc pl-5">
//         {viewAppt.serviceIds.map((s) => (
//           <li key={s._id}>
//             {s.serviceName} — ₹{s.offerPrice}
//           </li>
//         ))}
//       </ul>
//     </div>

//     {/* TOTAL */}
//     <p className="text-lg font-semibold text-green-600 text-right">
//       Total: ₹{getTotalOfferPrice(viewAppt)}
//     </p>
//   </div>
// )}

//       </Modal>
//     </div>
//   );
// }

// //  Optimize code

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  Select,
  Card,
  Empty,
  Button,
  Modal,
  Tag,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import Loading from "@/app/components/loading";
import { EyeOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

const getId = (value) => {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
};

const getTotalOfferPrice = (appt) => {
  if (!Array.isArray(appt?.serviceIds)) return 0;

  return appt.serviceIds.reduce(
    (sum, service) => sum + Number(service?.offerPrice || 0),
    0,
  );
};

const getPieColor = (index, total) =>
  `hsl(${(index * 360) / Math.max(total, 1)}, 70%, 50%)`;

const computeDateRange = (quickDate, customRange, today) => {
  if (customRange?.length === 2) {
    return [customRange[0].startOf("day"), customRange[1].endOf("day")];
  }

  if (!today || quickDate === "all" || !quickDate) return null;

  switch (quickDate) {
    case "today":
      return [today.startOf("day"), today.endOf("day")];

    case "yesterday": {
      const y = today.subtract(1, "day");
      return [y.startOf("day"), y.endOf("day")];
    }

    case "thisweek":
      return [today.startOf("week"), today.endOf("week")];

    case "lastweek": {
      const s = today.subtract(1, "week").startOf("week");
      return [s, s.endOf("week")];
    }

    case "1month":
      return [today.subtract(1, "month").startOf("day"), today.endOf("day")];

    case "3month":
      return [today.subtract(3, "month").startOf("day"), today.endOf("day")];

    default:
      return null;
  }
};

const computeGraphRange = (graphPeriod, today) => {
  if (!today) return null;

  switch (graphPeriod) {
    case "thisweek":
      return [today.startOf("week"), today.endOf("week")];

    case "lastweek": {
      const s = today.subtract(1, "week").startOf("week");
      return [s, s.endOf("week")];
    }

    case "1month":
      return [today.subtract(1, "month").startOf("day"), today.endOf("day")];

    case "3month":
      return [today.subtract(3, "month").startOf("day"), today.endOf("day")];

    default:
      return null;
  }
};

const disableOldDates = (current, today) => {
  if (!today || !current) return false;

  const threeMonthsAgo = today.subtract(3, "month").startOf("day");

  // Future dates are allowed.
  return current.isBefore(threeMonthsAgo, "day");
};

// Safely normalize API response arrays.
const getArray = (data, key) => {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState("shop");

  const [appointments, setAppointments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);

  const [serviceFilter, setServiceFilter] = useState("all");
  const [stylistFilter, setStylistFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // IMPORTANT: Show all appointments by default.
  const [quickDate, setQuickDate] = useState("all");

  const [graphPeriod, setGraphPeriod] = useState("thisweek");
  const [customRange, setCustomRange] = useState(null);
  const [viewAppt, setViewAppt] = useState(null);

  const [today, setToday] = useState(null);

  // --------------------------------------------------
  // TODAY
  // --------------------------------------------------

  useEffect(() => {
    setToday(dayjs());
  }, []);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (!SHOP_ID) {
        throw new Error("NEXT_PUBLIC_SHOP_ID is missing.");
      }

      const urls = [
        `/api/proxy?endpoint=getAppointment&shopId=${SHOP_ID}&status=cancelled,completed`,
        `/api/proxy?endpoint=getLeave&shopId=${SHOP_ID}`,
        `/api/proxy?endpoint=getService&shopId=${SHOP_ID}`,
        `/api/proxy?endpoint=getGroomer&shopId=${SHOP_ID}`,
      ];

      const responses = await Promise.all(
        urls.map((url) => fetch(url, { cache: "no-store" })),
      );

      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        throw new Error(
          `API request failed: ${failedResponse.status} ${failedResponse.statusText}`,
        );
      }

      const [apptData, leaveData, serviceData, groomerData] = await Promise.all(
        responses.map((response) => response.json()),
      );

      // Appointments
      if (apptData.success) {
        setAppointments(getArray(apptData, "appointments"));
      } else {
        setAppointments([]);
        // console.error("Appointment API error:", apptData);
      }

      // Leaves
      if (leaveData.success) {
        setLeaves(getArray(leaveData, "leaves"));
      } else {
        setLeaves([]);
      }

      // Services
      if (serviceData.success) {
        setServices(getArray(serviceData, "services"));
      } else {
        setServices([]);
      }

      // Stylists / Groomers
      if (groomerData.success) {
        setStylists(getArray(groomerData, "groomers"));
      } else {
        setStylists([]);
        // console.error("Groomer API error:", groomerData);
      }
    } catch (error) {

      setAppointments([]);
      setLeaves([]);
      setServices([]);
      setStylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------
  // STYLIST FILTER
  // --------------------------------------------------

  useEffect(() => {
    if (reportType === "stylist" && stylists.length > 0) {
      setStylistFilter(stylists[0]._id);
    }
  }, [reportType, stylists]);

  // --------------------------------------------------
  // DATE RANGE
  // --------------------------------------------------

  const dateRange = useMemo(
    () => computeDateRange(quickDate, customRange, today),
    [quickDate, customRange, today],
  );

  const graphDateRange = useMemo(
    () => computeGraphRange(graphPeriod, today),
    [graphPeriod, today],
  );

  // --------------------------------------------------
  // FILTER APPOINTMENTS
  // --------------------------------------------------

  const filteredAppointments = useMemo(() => {
    let data = [...appointments];

    // Service filter
    if (serviceFilter !== "all") {
      data = data.filter((appointment) =>
        appointment.serviceIds?.some(
          (service) => getId(service) === serviceFilter,
        ),
      );
    }

    // Stylist filter
    if (reportType === "stylist" && stylistFilter !== "all") {
      data = data.filter(
        (appointment) => getId(appointment.groomerId) === stylistFilter,
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      data = data.filter((appointment) => appointment.status === statusFilter);
    }

    // Date filter
    if (dateRange) {
      const [start, end] = dateRange;

      data = data.filter((appointment) => {
        if (!appointment.date || !dayjs(appointment.date).isValid()) {
          return false;
        }

        const appointmentDate = dayjs(appointment.date);

        return (
          !appointmentDate.isBefore(start) && !appointmentDate.isAfter(end)
        );
      });
    }

    data.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return data;
  }, [
    appointments,
    reportType,
    serviceFilter,
    stylistFilter,
    statusFilter,
    dateRange,
  ]);

  // --------------------------------------------------
  // SHOP LEAVE DAY WISE
  // --------------------------------------------------

  const shopLeaveDayWise = useMemo(() => {
    let expanded = [];

    leaves
      .filter((leave) => leave.isShop)
      .forEach((leave) => {
        if (!leave.startDate || !leave.endDate) return;

        let current = dayjs(leave.startDate).startOf("day");
        const end = dayjs(leave.endDate).startOf("day");

        if (!current.isValid() || !end.isValid()) return;

        while (current.valueOf() <= end.valueOf() && expanded.length < 10000) {
          expanded.push({
            _id: `${leave._id}-${current.format("YYYY-MM-DD")}`,
            date: current.format("YYYY-MM-DD"),
            reason: leave.reason || "-",
          });

          current = current.add(1, "day");
        }
      });

    if (dateRange) {
      const [start, end] = dateRange;

      expanded = expanded.filter((leave) => {
        const date = dayjs(leave.date);

        return !date.isBefore(start, "day") && !date.isAfter(end, "day");
      });
    }

    expanded.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return expanded;
  }, [leaves, dateRange]);

  const shopLeaveDaySet = useMemo(() => {
    return new Set(shopLeaveDayWise.map((leave) => leave.date));
  }, [shopLeaveDayWise]);

  // --------------------------------------------------
  // STYLIST LEAVE RECORDS
  // --------------------------------------------------

  const stylistLeaveRecords = useMemo(() => {
    let data = leaves.filter((leave) => !leave.isShop);

    if (stylistFilter !== "all") {
      data = data.filter((leave) => getId(leave.groomerId) === stylistFilter);
    }

    let expanded = [];

    data.forEach((leave) => {
      if (!leave.startDate || !leave.endDate) return;

      let current = dayjs(leave.startDate).startOf("day");
      const end = dayjs(leave.endDate).startOf("day");

      if (!current.isValid() || !end.isValid()) return;

      while (current.valueOf() <= end.valueOf() && expanded.length < 10000) {
        const dayStr = current.format("YYYY-MM-DD");

        if (!shopLeaveDaySet.has(dayStr)) {
          expanded.push({
            _id: `${leave._id}-${dayStr}`,
            date: dayStr,
            stylistName:
              leave.groomerId?.name ||
              stylists.find((stylist) => stylist._id === getId(leave.groomerId))
                ?.name ||
              "-",
            reason: leave.reason || "-",
          });
        }

        current = current.add(1, "day");
      }
    });

    if (dateRange) {
      const [start, end] = dateRange;

      expanded = expanded.filter((leave) => {
        const date = dayjs(leave.date);

        return !date.isBefore(start, "day") && !date.isAfter(end, "day");
      });
    }

    expanded.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return expanded;
  }, [leaves, stylistFilter, dateRange, shopLeaveDaySet, stylists]);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const summary = useMemo(() => {
    const completed = filteredAppointments.filter(
      (appointment) => appointment.status === "completed",
    );

    const cancelled = filteredAppointments.filter(
      (appointment) => appointment.status === "cancelled",
    );

    return {
      total: filteredAppointments.length,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue: completed.reduce(
        (sum, appointment) => sum + getTotalOfferPrice(appointment),
        0,
      ),
      shopLeaveCount: shopLeaveDayWise.length,
    };
  }, [filteredAppointments, shopLeaveDayWise]);

  // --------------------------------------------------
  // SERVICE PIE CHART
  // --------------------------------------------------

  const servicePieData = useMemo(() => {
    const map = {};

    filteredAppointments.forEach((appointment) => {
      appointment.serviceIds?.forEach((service) => {
        const serviceName =
          service?.serviceName ||
          services.find((item) => item._id === getId(service))?.serviceName ||
          "Unknown Service";

        map[serviceName] = (map[serviceName] || 0) + 1;
      });
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredAppointments, services]);

  // --------------------------------------------------
  // APPOINTMENT GRAPH
  // --------------------------------------------------

  // ================= STACKED AREA GRAPH DATA =================
  const appointmentGraphData = useMemo(() => {
    if (!graphDateRange) return [];

    const [start, end] = graphDateRange;

    const map = {};

    filteredAppointments.forEach((a) => {
      const date = dayjs(a.date).format("YYYY-MM-DD");

      if (!map[date]) {
        map[date] = {
          date,
          completed: 0,
          cancelled: 0,
        };
      }

      if (a.status === "completed") {
        map[date].completed += 1;
      }

      if (a.status === "cancelled") {
        map[date].cancelled += 1;
      }
    });

    const data = [];

    let current = start.startOf("day");
    const last = end.startOf("day");

    while (current.valueOf() <= last.valueOf()) {
      const date = current.format("YYYY-MM-DD");

      data.push(
        map[date] || {
          date,
          completed: 0,
          cancelled: 0,
        },
      );

      current = current.add(1, "day");
    }

    return data;
  }, [filteredAppointments, graphDateRange]);

  // --------------------------------------------------
  // DEBUGGING
  // --------------------------------------------------

  useEffect(() => {
  }, [appointments, dateRange, filteredAppointments]);

  // --------------------------------------------------
  // PDF EXPORT - APPOINTMENTS
  // --------------------------------------------------

  const exportAppointmentsPDF = useCallback(
    (title, filename) => {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.text(title, 14, 15);

      doc.setFontSize(10);
      doc.text(
        dateRange
          ? `Period: ${dateRange[0].format("DD MMM YYYY")} - ${dateRange[1].format("DD MMM YYYY")}`
          : "Period: All Dates",
        14,
        23,
      );

      const tableBody = filteredAppointments.map((appointment) => {
        const customer = appointment.userId || {};
        const stylist = appointment.groomerId || {};

        const services = Array.isArray(appointment.serviceIds)
          ? appointment.serviceIds
              .map((service) => {
                const serviceName = service?.serviceName || "Service";
                const price = Number(service?.offerPrice || 0);

                return `${serviceName} - Rs. ${price}`;
              })
              .join("\n")
          : "-";

        return [
          `${
            appointment.date
              ? dayjs(appointment.date).format("DD MMM YYYY")
              : "-"
          }\n${appointment.time || "-"}`,

          `Name: ${customer.name || "-"}\nPhone: ${customer.phone || "-"}\nEmail: ${customer.email || "-"}`,

          `Name: ${stylist.name || "-"}\nPhone: ${stylist.phone || "-"}\nEmail: ${stylist.email || "-"}`,

          (appointment.status || "-").toUpperCase(),

          services,

          `Rs. ${getTotalOfferPrice(appointment)}`,
        ];
      });

      autoTable(doc, {
        startY: 30,
        margin: { left: 10, right: 10 },
        head: [
          [
            "Date / Time",
            "Customer Details",
            "Stylist Details",
            "Status",
            "Services",
            "Total",
          ],
        ],
        body: tableBody,

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "top",
        },

        headStyles: {
          fontSize: 9,
          fontStyle: "bold",
        },

        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 65 },
          2: { cellWidth: 65 },
          3: { cellWidth: 28 },
          4: { cellWidth: 55 },
          5: { cellWidth: 25 },
        },
      });

      const revenue = filteredAppointments
        .filter((appointment) => appointment.status === "completed")
        .reduce((sum, appointment) => sum + getTotalOfferPrice(appointment), 0);

      let finalY = doc.lastAutoTable.finalY + 10;

      if (finalY > 190) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(12);
      doc.text(`Total Revenue (Completed): Rs. ${revenue}`, 14, finalY);

      doc.save(filename);
    },
    [filteredAppointments, dateRange],
  );

  // --------------------------------------------------
  // PDF EXPORT - SHOP LEAVE
  // --------------------------------------------------

  const exportShopLeavePDF = useCallback(() => {
    const doc = new jsPDF();

    doc.text("Shop Leave Report", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Reason"]],
      body: shopLeaveDayWise.map((leave) => [
        dayjs(leave.date).format("DD MMM YYYY"),
        leave.reason || "-",
      ]),
    });

    doc.save("shop-leave-report.pdf");
  }, [shopLeaveDayWise]);

  // --------------------------------------------------
  // PDF EXPORT - STYLIST LEAVE
  // --------------------------------------------------

  const exportStylistLeavePDF = useCallback(() => {
    const doc = new jsPDF();

    doc.text("Stylist Leave Report", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [["Date", "Stylist", "Reason"]],
      body: stylistLeaveRecords.map((leave) => [
        dayjs(leave.date).format("DD MMM YYYY"),
        leave.stylistName,
        leave.reason || "-",
      ]),
    });

    doc.save("stylist-leave-report.pdf");
  }, [stylistLeaveRecords]);

  // --------------------------------------------------
  // APPOINTMENT TABLE COLUMNS
  // --------------------------------------------------

  const appointmentColumns = useMemo(
    () => [
      {
        title: "Date",
        render: (_, record) =>
          record.date ? dayjs(record.date).format("DD MMM YYYY") : "-",
      },
      {
        title: "Stylist",
        render: (_, record) => record.groomerId?.name || "-",
      },
      {
        title: "View",
        render: (_, record) => {
          const dotClass =
            record.status === "completed"
              ? "bg-green-500"
              : record.status === "cancelled"
                ? "bg-red-500"
                : "bg-yellow-400";

          return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${dotClass}`}
              />

              <Button
                size="small"
                className="!bg-gray-100 !border-gray-300 hover:!bg-gray-200"
                icon={<EyeOutlined className="text-lg text-black" />}
                onClick={() => setViewAppt(record)}
              />
            </div>
          );
        },
      },
      {
        title: "Price",
        render: (_, record) => `₹${getTotalOfferPrice(record)}`,
      },
    ],
    [],
  );

  // --------------------------------------------------
  // SHOP LEAVE TABLE COLUMNS
  // --------------------------------------------------

  const shopLeaveColumns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        render: (value) => dayjs(value).format("DD MMM YYYY"),
      },
      {
        title: "Reason",
        dataIndex: "reason",
      },
    ],
    [],
  );

  // --------------------------------------------------
  // STYLIST LEAVE TABLE COLUMNS
  // --------------------------------------------------

  const stylistLeaveColumns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        render: (value) => dayjs(value).format("DD MMM YYYY"),
      },
      {
        title: "Stylist",
        dataIndex: "stylistName",
      },
      {
        title: "Reason",
        dataIndex: "reason",
      },
    ],
    [],
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) return <Loading />;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      {/* REPORT TYPE TOGGLE */}

      <div className="flex gap-3 mb-4">
        {["shop", "stylist"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setReportType(type);
              setStylistFilter("all");
            }}
            className={`flex-1 py-2 rounded-full border font-semibold ${
              reportType === type
                ? "bg-black text-green-500"
                : "border-gray-300"
            }`}
          >
            {type === "shop" ? "SHOP REPORT" : "STYLIST REPORT"}
          </button>
        ))}
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-3 mb-5">
        {reportType === "stylist" && (
          <Select
            value={stylistFilter}
            onChange={setStylistFilter}
            style={{ width: 180 }}
            placeholder="Select Stylist"
          >
            <Select.Option value="all">All Stylists</Select.Option>

            {stylists.map((stylist) => (
              <Select.Option key={stylist._id} value={stylist._id}>
                {stylist.name}
              </Select.Option>
            ))}
          </Select>
        )}

        <Select
          value={serviceFilter}
          onChange={setServiceFilter}
          style={{ width: 180 }}
        >
          <Select.Option value="all">All Services</Select.Option>

          {services.map((service) => (
            <Select.Option key={service._id} value={service._id}>
              {service.serviceName}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          <Select.Option value="all">All Status</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>

        <Select
          value={quickDate || "all"}
          onChange={(value) => {
            setQuickDate(value);
            setCustomRange(null);
          }}
          style={{ width: 170 }}
        >
          <Select.Option value="all">All Dates</Select.Option>
          <Select.Option value="today">Today</Select.Option>
          <Select.Option value="yesterday">Yesterday</Select.Option>
          <Select.Option value="thisweek">This Week</Select.Option>
          <Select.Option value="lastweek">Last Week</Select.Option>
          <Select.Option value="1month">1 Month</Select.Option>
          <Select.Option value="3month">3 Months</Select.Option>
        </Select>

        <DatePicker.RangePicker
          value={customRange}
          onChange={(val) => {
            setCustomRange(val);
            setQuickDate(null);
          }}
          disabledDate={(current) => disableOldDates(current, today)}
          allowClear
          classNames={{
            popup: {
              root: "single_month_popup",
            },
          }}
        />
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          ["Total", summary.total],
          ["Completed", summary.completed],
          ["Cancelled", summary.cancelled],
          ["Revenue", `₹${summary.revenue}`],
          [
            "Leaves",
            reportType === "shop"
              ? summary.shopLeaveCount
              : stylistLeaveRecords.length,
          ],
        ].map(([label, value]) => (
          <Card key={label} className="text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* APPOINTMENTS TABLE */}

      {filteredAppointments.length === 0 ? (
        <Empty description="No appointment data" />
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button
              type="primary"
              onClick={() =>
                exportAppointmentsPDF(
                  reportType === "shop"
                    ? "Shop Appointments Report"
                    : "Stylist Appointments Report",
                  reportType === "shop"
                    ? "shop-appointments-report.pdf"
                    : "stylist-appointments-report.pdf",
                )
              }
            >
              Export Appointments PDF
            </Button>
          </div>

          <Table
            rowKey="_id"
            columns={appointmentColumns}
            dataSource={filteredAppointments}
            pagination={{ pageSize: 5 }}
          />
        </>
      )}

      {/* SHOP REPORT: LEAVE + CHARTS */}

      {reportType === "shop" && (
        <div className="mt-8">
          <div className="flex justify-end mb-2">
            <Button type="primary" onClick={exportShopLeavePDF}>
              Export Shop Leave PDF
            </Button>
          </div>

          <h2 className="font-semibold mb-3">Shop Leave Report</h2>

          <Table
            rowKey="_id"
            columns={shopLeaveColumns}
            dataSource={shopLeaveDayWise}
            pagination={{ pageSize: 5 }}
          />

          {/* DOUGHNUT CHART */}
          <div className="mt-10 rounded-xl border p-4">
            <h3 className="font-semibold text-center mb-3">
              Most Used Services (%)
            </h3>

            {servicePieData.length === 0 ? (
              <Empty description="No service data" />
            ) : (
              <div
                className="w-full h-[280px] min-w-0"
                style={{ pointerEvents: "none" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="48%"
                      outerRadius="70%"
                      paddingAngle={3}
                      labelLine={false}
                      isAnimationActive={false}
                      activeShape={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {servicePieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={getPieColor(index, servicePieData.length)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Static service details */}
            <div className="mt-3 space-y-2">
              {servicePieData.map((item, index) => {
                const total = servicePieData.reduce(
                  (sum, service) => sum + service.value,
                  0,
                );

                const percentage = total
                  ? ((item.value / total) * 100).toFixed(1)
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getPieColor(
                            index,
                            servicePieData.length,
                          ),
                        }}
                      />
                      <span>{item.name}</span>
                    </div>

                    <span className="font-medium">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRAPH FILTER */}

          <div className="flex justify-end mt-6 mb-2">
            <Select
              value={graphPeriod}
              onChange={setGraphPeriod}
              style={{ width: 160 }}
            >
              <Select.Option value="thisweek">This Week</Select.Option>

              <Select.Option value="lastweek">Last Week</Select.Option>

              <Select.Option value="1month">1 Month</Select.Option>

              <Select.Option value="3month">3 Months</Select.Option>
            </Select>
          </div>

          {/* APPOINTMENT GRAPH */}

          {/* STACKED AREA CHART */}
          <div className="mt-4 rounded-xl border p-4">
            <h3 className="font-semibold text-center mb-3">
              Appointment Trend
            </h3>

            {appointmentGraphData.length === 0 ? (
              <Empty description="No graph data" />
            ) : (
              <div className="w-full h-[280px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={appointmentGraphData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => dayjs(value).format("DD MMM")}
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      minTickGap={20}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      width={35}
                    />

                    <Tooltip
                      labelFormatter={(value) =>
                        dayjs(value).format("DD MMM YYYY")
                      }
                      formatter={(value, name) => [
                        `${value} appointments`,
                        name,
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        paddingTop: "10px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stackId="1"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.65}
                      isAnimationActive={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="cancelled"
                      name="Cancelled"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.65}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STYLIST REPORT: LEAVE */}

      {reportType === "stylist" && (
        <div className="mt-8">
          <div className="flex justify-end mb-2">
            <Button type="primary" onClick={exportStylistLeavePDF}>
              Export Stylist Leave PDF
            </Button>
          </div>

          <h2 className="font-semibold mb-3">Stylist Leave Report</h2>

          <Table
            rowKey="_id"
            columns={stylistLeaveColumns}
            dataSource={stylistLeaveRecords}
            pagination={{ pageSize: 5 }}
          />
        </div>
      )}

      {/* APPOINTMENT DETAILS MODAL */}

      <Modal
        open={!!viewAppt}
        onCancel={() => setViewAppt(null)}
        footer={null}
        centered
        title="Appointment Details"
      >
        {viewAppt && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <p>
                <b>Date:</b>{" "}
                {viewAppt.date
                  ? dayjs(viewAppt.date).format("DD MMM YYYY")
                  : "-"}
              </p>

              <p>
                <b>Time:</b> {viewAppt.time || "-"}
              </p>
            </div>

            {/* CUSTOMER */}

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="font-semibold mb-1">Customer</p>

              <p>
                <b>Name:</b> {viewAppt.userId?.name || "-"}
              </p>

              <p>
                <b>Phone:</b> {viewAppt.userId?.phone || "-"}
              </p>

              <p>
                <b>Email:</b> {viewAppt.userId?.email || "-"}
              </p>
            </div>

            {/* STYLIST */}

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="font-semibold mb-1">Stylist</p>

              <p>
                <b>Name:</b> {viewAppt.groomerId?.name || "-"}
              </p>

              <p>
                <b>Phone:</b> {viewAppt.groomerId?.phone || "-"}
              </p>

              <p>
                <b>Email:</b> {viewAppt.groomerId?.email || "-"}
              </p>
            </div>

            {/* STATUS */}

            <div>
              <b>Status:</b>{" "}
              <Tag
                color={
                  viewAppt.status === "completed"
                    ? "green"
                    : viewAppt.status === "cancelled"
                      ? "red"
                      : "orange"
                }
              >
                {(viewAppt.status || "unknown").toUpperCase()}
              </Tag>
            </div>

            {/* SERVICES */}

            <div>
              <p className="font-semibold mb-1">Services</p>

              <ul className="list-disc pl-5">
                {(Array.isArray(viewAppt.serviceIds)
                  ? viewAppt.serviceIds
                  : []
                ).map((service, index) => {
                  const serviceDetails =
                    typeof service === "object"
                      ? service
                      : services.find((item) => item._id === service);

                  return (
                    <li key={service?._id || service || index}>
                      {serviceDetails?.serviceName || "Service"} — ₹
                      {Number(serviceDetails?.offerPrice || 0)}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* TOTAL */}

            <p className="text-lg font-semibold text-green-600 text-right">
              Total: ₹{getTotalOfferPrice(viewAppt)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
