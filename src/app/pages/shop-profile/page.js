
// // Before Optimize code

// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import dayjs from "dayjs";
// import {
//   EnvironmentOutlined,
//   MailOutlined,
//   PhoneOutlined,
//   ClockCircleOutlined,
//   CheckCircleOutlined,
// } from "@ant-design/icons";
// import {
//   Modal,
//   Input,
//   Button,
//   message,
//   Select,
//   Checkbox,
//   Divider,
//   TimePicker,
// } from "antd";

// const daysList = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
//   "Sunday",
// ];

// export default function ShopProfilePage() {
//   const [shop, setShop] = useState(null);
//   const [editOpen, setEditOpen] = useState(false);
//   const [form, setForm] = useState(null);

//   // const backendUrl = process.env.BACKEND_URL;
//   // const authKey = process.env.AUTH_KEY;

//   useEffect(() => {
//     const stored = localStorage.getItem("shop");
//     if (stored) {
//       const data = JSON.parse(stored);
//       setShop(data);
//       setForm(JSON.parse(JSON.stringify(data))); // deep copy
//     }
//   }, []);

//   if (!shop) return <p className="p-4">Loading shop details...</p>;

//   // ================= FORMAT TIME (VIEW MODE) =================
//  const formatTime = (time24) => {
//   if (!time24) return "";

//   const [h, m] = time24.split(":");
//   let hour = Number(h);
//   const ampm = hour >= 12 ? "PM" : "AM";

//   hour = hour % 12 || 12;

//   const hourStr = hour.toString().padStart(2, "0"); // 09

//   return `${hourStr}:${m} ${ampm}`;
// };


//   // ================= UPDATE SHOP =================
//   const handleUpdate = async () => {
//     try {
//       // const res = await fetch(`${backendUrl}/api/putShop`, {
//       //   method: "PUT",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //     "x-auth-key": authKey,
//       //   },
//       //   body: JSON.stringify({
//       //     shopId: shop.shopId || shop._id,
//       //     shopName: form.shopName,
//       //     shopOwnerName: form.shopOwnerName,
//       //     shopEmail: form.shopEmail,
//       //     shopMobile: form.shopMobile,
//       //     shopLocation: form.shopLocation,
//       //     openingHours: form.openingHours,
//       //     closingDays: form.closingDays,
//       //     status: form.status,
//       //   }),
//       // });

//       const res = await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     endpoint: "putShop",
//     shopId: shop.shopId || shop._id,
//     shopName: form.shopName,
//     shopOwnerName: form.shopOwnerName,
//     shopEmail: form.shopEmail,
//     shopMobile: form.shopMobile,
//     shopLocation: form.shopLocation,
//     openingHours: form.openingHours,
//     closingDays: form.closingDays,
//     status: form.status,
//   }),
// });
//       const result = await res.json();

//       if (result.success) {
//         message.success("Profile updated");

//         setShop(form);
//         localStorage.setItem("shop", JSON.stringify(form));
//         setEditOpen(false);
//       } else {
//         message.error(result.message || "Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Server error");
//     }
//   };

//   // ================= UPDATE OPENING HOURS =================
//   const updateHour = (index, key, value) => {
//     const updated = [...form.openingHours];
//     updated[index][key] = value; // stored as HH:mm
//     setForm({ ...form, openingHours: updated });
//   };

//   return (
//     <div className="bg-gray-50 py-10 px-4 min-h-screen">
//       <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

//         {/* ===== HEADER ===== */}
//         <div className="bg-gradient-to-r from-black/60 to-gray-600 p-6 text-center text-white">
//           <div className="mx-auto w-28 h-28 relative rounded-full border-4 border-white overflow-hidden mb-3">
//             <Image src={shop.shopImage} alt="shop" fill className="object-cover" />
//           </div>

//           <h2 className="text-2xl font-bold">{shop.shopName}</h2>
//           <p className="text-sm opacity-90">{shop.shopOwnerName}</p>
//         </div>

//         {/* ===== BODY ===== */}
//         <div className="p-6 space-y-6 text-sm">

//           {/* CONTACT */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
//               <MailOutlined className="text-lg text-gray-600" />
//               <div>
//                 <p className="text-gray-500 text-xs">Email</p>
//                 <p className="font-medium break-all">{shop.shopEmail}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
//               <PhoneOutlined className="text-lg text-gray-600" />
//               <div>
//                 <p className="text-gray-500 text-xs">Phone</p>
//                 <p className="font-medium">{shop.shopMobile}</p>
//               </div>
//             </div>
//           </div>

//           {/* LOCATION */}
//           <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
//             <EnvironmentOutlined className="text-lg text-gray-600 mt-1" />
//             <div>
//               <p className="text-gray-500 text-xs">Location</p>
//               <p className="font-medium">{shop.shopLocation}</p>
//             </div>
//           </div>

//           {/* OPENING HOURS (VIEW) */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <div className="flex items-center gap-2 mb-3">
//               <ClockCircleOutlined className="text-gray-600" />
//               <p className="font-semibold">Opening Hours</p>
//             </div>

//             <div className="space-y-1">
//               {shop.openingHours?.map((d) => (
//                 <div key={d._id} className="flex justify-between text-sm">
//                   <span className="text-gray-600">{d.day}</span>
//                   <span className="font-medium">
//                     {formatTime(d.open)} - {formatTime(d.close)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* CLOSING DAYS */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <p className="text-gray-500 text-xs mb-1">Closing Days</p>
//             <p className="font-medium">
//               {Array.isArray(shop.closingDays)
//                 ? shop.closingDays.join(", ")
//                 : shop.closingDays}
//             </p>
//           </div>

//           {/* STATUS */}
//           <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
//             <CheckCircleOutlined
//               className={`text-lg ${
//                 shop.status === "active"
//                   ? "text-green-500"
//                   : "text-red-500"
//               }`}
//             />
//             <div>
//               <p className="text-gray-500 text-xs">Status</p>
//               <p
//                 className={`font-semibold capitalize ${
//                   shop.status === "active"
//                     ? "text-green-600"
//                     : "text-red-500"
//                 }`}
//               >
//                 {shop.status}
//               </p>
//             </div>
//           </div>

//           {/* EDIT BUTTON */}
//           <div className="pt-4 flex justify-center">
//             <button
//               onClick={() => setEditOpen(true)}
//               className="w-fit px-5  bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
//             >
//               Edit Profile
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ================= EDIT MODAL ================= */}
//       <Modal
//         open={editOpen}
//         onCancel={() => setEditOpen(false)}
//         footer={null}
//         centered
//         title="Edit Shop Profile"
//         width={420}
//       >
//         {form && (
//           <div className="space-y-3">

//             <label className="text-xs text-gray-500">Shop Name</label>
//             <Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />

//             <label className="text-xs text-gray-500">Owner Name</label>
//             <Input value={form.shopOwnerName} onChange={(e) => setForm({ ...form, shopOwnerName: e.target.value })} />

//             <label className="text-xs text-gray-500">Email</label>
//             <Input value={form.shopEmail} onChange={(e) => setForm({ ...form, shopEmail: e.target.value })} />

//             <label className="text-xs text-gray-500">Phone</label>
//             <Input value={form.shopMobile} onChange={(e) => setForm({ ...form, shopMobile: e.target.value })} />

//             <label className="text-xs text-gray-500">Location</label>
//             <Input value={form.shopLocation} onChange={(e) => setForm({ ...form, shopLocation: e.target.value })} />

//             <Divider />

//             <p className="font-semibold text-sm">Opening Hours</p>

//             {form.openingHours?.map((d, i) => (
//               <div key={d._id || i} className="flex items-center gap-2">
//                 <span className="w-20 text-xs">{d.day}</span>

//                 <TimePicker
//                   use12Hours
//                   format="hh:mm A"
//                   value={d.open ? dayjs(d.open, "HH:mm") : null}
//                   onChange={(t) =>
//                     updateHour(i, "open", t ? t.format("HH:mm") : "")
//                   }
//                 />

//                 <TimePicker
//                   use12Hours
//                   format="hh:mm A"
//                   value={d.close ? dayjs(d.close, "HH:mm") : null}
//                   onChange={(t) =>
//                     updateHour(i, "close", t ? t.format("HH:mm") : "")
//                   }
//                 />
//               </div>
//             ))}

//             <Divider />

//             <p className="font-semibold text-sm">Closing Days</p>

//             <Checkbox.Group
//               options={daysList}
//               value={form.closingDays}
//               onChange={(list) => setForm({ ...form, closingDays: list })}
//             />

//             <Divider />
// <div className="flex gap-10 justify-start items-center">
//             <p className="font-semibold text-sm">Status :</p>
//             <Select
//               value={form.status}
//               onChange={(v) => setForm({ ...form, status: v })}
//               options={[
//                 { label: "Active", value: "active" },
//                 { label: "Inactive", value: "inactive" },
//               ]}
//             />
// </div>

// <div className="w-full flex justify-center">
//          <button
//               className="bg-none mt-3 w-fit px-6 py-3 text-white rounded-xl bg-black"
//               onClick={handleUpdate}
//             >
//                    Save Changes
//                     </button>
//             </div>

//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }




// //  Optimize code



"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import {
  EnvironmentOutlined, MailOutlined, PhoneOutlined,
  ClockCircleOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { Modal, Input, Button, message, Select, Checkbox, Divider, TimePicker } from "antd";

// ── Module-level constants ────────────────────────────────────────────────
const DAYS_LIST = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ✅ FIX: Pure helper at module level — not recreated on every render
const formatTime = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, "0")}:${m} ${ampm}`;
};

// ✅ Safe localStorage helper
const safeStorage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
};

export default function ShopProfilePage() {
  const [shop, setShop]         = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm]         = useState(null);
  const [saving, setSaving]     = useState(false); // ✅ FIX: Loading state was missing

  // ✅ FIX: Safe localStorage read with try/catch
  useEffect(() => {
    const data = safeStorage.get("shop");
    if (data) {
      setShop(data);
      setForm(JSON.parse(JSON.stringify(data))); // deep copy for edit form
    }
  }, []);

  // ── Update shop ────────────────────────────────────────────────────────
  const handleUpdate = useCallback(async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint:      "putShop",
          shopId:        shop.shopId || shop._id,
          shopName:      form.shopName,
          shopOwnerName: form.shopOwnerName,
          shopEmail:     form.shopEmail,
          shopMobile:    form.shopMobile,
          shopLocation:  form.shopLocation,
          openingHours:  form.openingHours,
          closingDays:   form.closingDays,
          status:        form.status,
        }),
      });

      // ✅ FIX: Guard non-OK HTTP responses
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success) {
        setShop(form);
        safeStorage.set("shop", form);
        message.success("Profile updated");
        setEditOpen(false);
      } else {
        message.error(result.message || "Update failed");
      }
    } catch (err) {
      // console.error(err);
      message.error("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [form, shop]);

  // ✅ FIX: useCallback — stable handler, not recreated every render
  const updateHour = useCallback((index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.openingHours];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, openingHours: updated };
    });
  }, []);

  // ✅ FIX: Inline setForm handlers extracted — prevent anonymous fn creation in JSX
  const handleFieldChange = useCallback((key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback((key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (!shop) return <p className="p-4">Loading shop details...</p>;

  return (
    <div className="bg-gray-50 py-10 px-4 min-h-screen">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-black/60 to-gray-600 p-6 text-center text-white">
          <div className="mx-auto w-28 h-28 relative rounded-full border-4 border-white overflow-hidden mb-3">
            <Image src="/shop.jpg" alt="shop" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{shop.shopName}</h2>
          <p className="text-sm opacity-90">{shop.shopOwnerName}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-sm">

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <MailOutlined className="text-lg text-gray-600" />
              <div>
                <p className="text-gray-500 text-xs">Email</p>
                <p className="font-medium break-all">{shop.shopEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <PhoneOutlined className="text-lg text-gray-600" />
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="font-medium">{shop.shopMobile}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
            <EnvironmentOutlined className="text-lg text-gray-600 mt-1" />
            <div>
              <p className="text-gray-500 text-xs">Location</p>
              <p className="font-medium">{shop.shopLocation}</p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <ClockCircleOutlined className="text-gray-600" />
              <p className="font-semibold">Opening Hours</p>
            </div>
            <div className="space-y-1">
              {shop.openingHours?.map((d) => (
                <div key={d._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{d.day}</span>
                  <span className="font-medium">{formatTime(d.open)} - {formatTime(d.close)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Closing Days */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Closing Days</p>
            <p className="font-medium">
              {Array.isArray(shop.closingDays) ? shop.closingDays.join(", ") : shop.closingDays}
            </p>
          </div>

          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
            <CheckCircleOutlined className={`text-lg ${shop.status === "active" ? "text-green-500" : "text-red-500"}`} />
            <div>
              <p className="text-gray-500 text-xs">Status</p>
              <p className={`font-semibold capitalize ${shop.status === "active" ? "text-green-600" : "text-red-500"}`}>
                {shop.status}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setEditOpen(true)}
              className="px-5 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        centered
        title="Edit Shop Profile"
        width={420}
      >
        {form && (
          <div className="space-y-3">

            <label className="text-xs text-gray-500">Shop Name</label>
            <Input value={form.shopName} onChange={handleFieldChange("shopName")} />

            <label className="text-xs text-gray-500">Owner Name</label>
            <Input value={form.shopOwnerName} onChange={handleFieldChange("shopOwnerName")} />

            <label className="text-xs text-gray-500">Email</label>
            <Input value={form.shopEmail} onChange={handleFieldChange("shopEmail")} />

            <label className="text-xs text-gray-500">Phone</label>
            <Input value={form.shopMobile} onChange={handleFieldChange("shopMobile")} />

            <label className="text-xs text-gray-500">Location</label>
            <Input value={form.shopLocation} onChange={handleFieldChange("shopLocation")} />

            <Divider />

            <p className="font-semibold text-sm">Opening Hours</p>
            {form.openingHours?.map((d, i) => (
              <div key={d._id || i} className="flex items-center gap-2">
                <span className="w-20 text-xs">{d.day}</span>
                <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={d.open ? dayjs(d.open, "HH:mm") : null}
                  onChange={(t) => updateHour(i, "open", t ? t.format("HH:mm") : "")}
                />
                <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={d.close ? dayjs(d.close, "HH:mm") : null}
                  onChange={(t) => updateHour(i, "close", t ? t.format("HH:mm") : "")}
                />
              </div>
            ))}

            <Divider />

            <p className="font-semibold text-sm">Closing Days</p>
            <Checkbox.Group
              options={DAYS_LIST}
              value={form.closingDays}
              onChange={handleSelectChange("closingDays")}
            />

            <Divider />

            <div className="flex gap-10 justify-start items-center">
              <p className="font-semibold text-sm">Status:</p>
              <Select
                value={form.status}
                onChange={handleSelectChange("status")}
                options={[
                  { label: "Active",   value: "active"   },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </div>

            <div className="w-full flex justify-center pt-3">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-6 py-3 text-white rounded-xl bg-black disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}