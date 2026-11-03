
// // Before Optimize code

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { MoreVertical, Mail, Phone, Edit, Trash2 } from "lucide-react";
// import Loading from "@/app/components/loading";
// import {
//   Drawer,
//   Form,
//   Input,
//   Select,
//   Button,
//   message,
//   Modal,
//   DatePicker,
// } from "antd";
// import dayjs from "dayjs";

// export default function Page() {
//   // const backendUrl = process.env.BACKEND_URL;
//   // const authKey = process.env.AUTH_KEY;
//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

//   const [stylists, setStylists] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [openAdd, setOpenAdd] = useState(false);
//   const [adding, setAdding] = useState(false);
//   const [selectedAvatar, setSelectedAvatar] = useState(null);
//   const [addForm] = Form.useForm();

//   const [allServices, setAllServices] = useState([]);

//   const [openEdit, setOpenEdit] = useState(false);
//   const [editingStylist, setEditingStylist] = useState(null);
//   const [editForm] = Form.useForm();

//   const AVATARS = [
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/profile1.jpg?alt=media&token=682bb411-4c47-4add-bfa7-81113959fbea",
//     "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/profile2.jpg?alt=media&token=dd1d2727-8b32-448b-b97c-5274f9b070a3",
//   ];

//   const DEPARTMENTS = ["Haircare", "Skincare", "Makeup", "Spa", "Nail Care"];

//   const fetchStylists = async () => {
//     setLoading(true);

//     try {
//       // 🔹 Call both APIs in parallel
//       // const [groomerRes, serviceRes] = await Promise.all([
//       //   fetch(`${backendUrl}/api/getGroomer?shopId=${shopId}`, {
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       "x-auth-key": authKey,
//       //     },
//       //   }),
//       //   fetch(`${backendUrl}/api/getService?shopId=${shopId}`, {
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       "x-auth-key": authKey,
//       //     },
//       //   }),
//       // ]);

//       const [groomerRes, serviceRes] = await Promise.all([
//   fetch(`/api/proxy?endpoint=getGroomer&shopId=${shopId}`),
//   fetch(`/api/proxy?endpoint=getService&shopId=${shopId}`),
// ]);
//       const groomerResult = await groomerRes.json();
//       const serviceResult = await serviceRes.json();

//       if (groomerResult.success) {
//         setStylists(groomerResult.groomers);
//       }

//       if (serviceResult.success) {
//         setAllServices(serviceResult.data); // ✅ ALL shop services
//       }
//     } catch (error) {
//       console.error("Failed to fetch stylists/services", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStylists();
//   }, []);

//   const openAddStylist = () => {
//     const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
//     setSelectedAvatar(randomAvatar);
//     setOpenAdd(true);

//     addForm.resetFields();
//     addForm.setFieldsValue({
//       status: "active",
//       joiningDate: new Date(),
//     });
//   };

//   const addStylist = async (values) => {
//     if (!selectedAvatar) {
//       message.warning("Please select a profile image");
//       return;
//     }

//     try {
//       setAdding(true);

//       const payload = {
//         name: values.name,
//         email: values.email,
//         phone: values.phone,
//         gender: values.gender,
//         age: values.age,
//         department: values.department,
//         joiningDate: values.joiningDate,
//         serviceList: values.serviceList, // service IDs
//         profileImage: selectedAvatar,
//         status: values.status,
//         shopId,
//       };

//       // const res = await fetch(
//       //   `${backendUrl}/api/postGroomer?shopId=${shopId}`,
//       //   {
//       //     method: "POST",
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       "x-auth-key": authKey,
//       //     },
//       //     body: JSON.stringify(payload),
//       //   }
//       // );

// const res = await fetch(`/api/proxy`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ endpoint: "postGroomer", ...payload }),
// });
//       const result = await res.json();

//       if (result.success) {
//         message.success("Stylist added successfully");
//         setOpenAdd(false);
//         fetchStylists();
//       } else {
//         message.error(result.message || "Failed to add stylist");
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to add stylist");
//     } finally {
//       setAdding(false);
//     }
//   };

//   const handleEdit = (stylist) => {
//     setEditingStylist(stylist);
//     setOpenEdit(true);

//     setSelectedAvatar(stylist.profileImage);

//     editForm.setFieldsValue({
//       name: stylist.name,
//       email: stylist.email,
//       phone: stylist.phone,
//       gender: stylist.gender,
//       age: stylist.age,
//       department: stylist.department,
//       status: stylist.status,
//       joiningDate: dayjs(stylist.joiningDate),
//       serviceList: stylist.serviceList.map((s) => s._id), // ✅ IMPORTANT
//     });
//   };

//   const updateStylist = async (values) => {
//     try {
//       const payload = {
//         groomerId: editingStylist._id,
//         name: values.name,
//         email: values.email,
//         phone: values.phone,
//         gender: values.gender,
//         age: values.age,
//         department: values.department,
//         serviceList: values.serviceList, // IDs only
//         profileImage: selectedAvatar,
//         status: values.status,
//         joiningDate: values.joiningDate,
//         shopId,
//       };

//       // const res = await fetch(`${backendUrl}/api/putGroomer`, {
//       //   method: "PUT",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //     "x-auth-key": authKey,
//       //   },
//       //   body: JSON.stringify(payload),
//       // });

// const res = await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ endpoint: "putGroomer", ...payload }),
// });
//       const result = await res.json();

//       if (result.success) {
//         message.success("Stylist updated successfully");
//         setOpenEdit(false);
//         fetchStylists();
//       } else {
//         message.error(result.message || "Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Update failed");
//     }
//   };

//   const handleDelete = (stylist) => {
//     Modal.confirm({
//       title: "Delete Stylist?",
//       content: "This action cannot be undone.",
//       okType: "danger",
//       centered: true,
//       onOk: async () => {
//         try {
//           // const res = await fetch(`${backendUrl}/api/deleteGroomer`, {
//           //   method: "DELETE",
//           //   headers: {
//           //     "Content-Type": "application/json",
//           //     "x-auth-key": authKey,
//           //   },
//           //   body: JSON.stringify({
//           //     groomerId: stylist._id,
//           //   }),
//           // });

//           const res = await fetch(`/api/proxy`, {
//   method: "DELETE",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ endpoint: "deleteGroomer", groomerId: stylist._id }),
// });
//           const result = await res.json();

//           if (result.success) {
//             message.success("Stylist deleted");
//             fetchStylists();
//           } else {
//             message.error(result.message || "Delete failed");
//           }
//         } catch (err) {
//           console.error(err);
//           message.error("Delete failed");
//         }
//       },
//     });
//   };

//   if (loading) return <Loading />;

//   if (stylists.length === 0) {
//     return (
//       <div className="p-4 text-center text-gray-500">No stylists found</div>
//     );
//   }

//   return (
//     <div className="p-4 bg-white min-h-screen pb-24">
//       <h1 className="text-xl font-bold text-gray-900 mb-4">Stylists</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {stylists.map((stylist) => (
//           <div
//             key={stylist._id}
//             className="rounded-2xl bg-white border border-gray-300 p-4 "
//           >
//             {/* Top Row */}
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 {/* Profile Image */}
//                 <div className="relative">
//                   <Image
//                     src={stylist.profileImage}
//                     alt={stylist.name}
//                     width={64}
//                     height={64}
//                     loading="eager"
//                     className="rounded-full object-cover"
//                   />

//                   {/* Active Dot */}
//                   <span
//                     className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full
//         ${stylist.status === "active" ? "bg-green-500" : "bg-red-500"}`}
//                   />
//                 </div>

//                 {/* Name & Role */}
//                 <div>
//                   <h2 className="font-semibold text-gray-900">
//                     {stylist.name}
//                   </h2>
//                   <p className="text-sm text-gray-500">{stylist.department}</p>
//                 </div>
//               </div>

//               {/* Edit & Delete Icons */}
//               <div className="flex flex-col pr-2 items-center gap-4">
//                 {/* Edit */}
//                 <button
//                   className="text-blue-500 hover:text-blue-700"
//                   onClick={() => handleEdit(stylist)}
//                   title="Edit Stylist"
//                 >
//                   <Edit size={18} />
//                 </button>

//                 {/* Delete */}
//                 <button
//                   className="text-red-500 hover:text-red-700"
//                   onClick={() => handleDelete(stylist)}
//                   title="Delete Stylist"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             </div>

//             {/* Info Card */}
//             <div className="mt-4 bg-gray-100 rounded-xl p-4 space-y-4">
//               {/* Top row: Joining Date + Contact */}
//               <div className="flex justify-between items-start gap-4">
//                 {/* Contact Info */}
//                 <div className="flex-1 min-w-0 flex flex-col gap-2 text-sm text-gray-700">
//                   <div className="flex items-center gap-2">
//                     <Mail size={14} className="text-gray-400 " />
//                     <span className="truncate">{stylist.email}</span>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <Phone size={14} className="text-gray-400 " />
//                     <span className="truncate">{stylist.phone}</span>
//                   </div>
//                 </div>

//                 {/* Joining Date */}
//                 <div className="text-right">
//                   <p className="text-xs text-gray-500">Joining Date</p>
//                   <p className="font-semibold text-gray-600">
//                     {new Date(stylist.joiningDate).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="h-px bg-gray-200" />

//               {/* Services */}
//               {stylist.serviceList?.length > 0 && (
//                 <div>
//                   <p className="text-sm font-semibold text-gray-800 mb-2">
//                     Services
//                   </p>

//                   <div className="flex flex-wrap gap-2">
//                     {stylist.serviceList.map((service) => {
//                       const isActive = service.status === "active";

//                       return (
//                         <div
//                           key={service._id}
//                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border
//               ${
//                 isActive
//                   ? "bg-white border-gray-200"
//                   : "bg-white border-gray-200"
//               }`}
//                         >
//                           {/* Status Dot */}
//                           <span
//                             className={`w-2 h-2 rounded-full
//                 ${isActive ? "bg-green-500" : "bg-red-500"}`}
//                           />

//                           <span
//                             className={`text-xs font-medium truncate
//                 ${isActive ? "text-gray-800" : "text-red-800"}`}
//                           >
//                             {service.serviceName}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="fixed bottom-0 left-0 w-full p-4  bg-white border-t border-gray-200">
//         <button
//           onClick={openAddStylist}
//           className="w-full p-3 bg-black text-green-500  rounded-lg font-semibold transition-colors duration-300 "
//         >
//           Add Stylist
//         </button>
//       </div>

//       <Drawer
//         title="Add Stylist"
//         placement="bottom"
//         open={openAdd}
//         onClose={() => setOpenAdd(false)}
//            styles={{
//           wrapper: {
//             height: "72vh",
//           },
//           body: {
//             overflowY: "auto",
//           },
//         }}
//       >
//         {/* Avatar Picker */}
//         <div className="mb-4">
//           <p className="font-semibold mb-2">Select Profile Image</p>

//           <div className="flex gap-3">
//             {AVATARS.map((url) => (
//               <div
//                 key={url}
//                 onClick={() => setSelectedAvatar(url)}
//                 className={`cursor-pointer rounded-full p-1 border-2
//           ${
//             selectedAvatar === url ? "border-green-500" : "border-transparent"
//           }`}
//               >
//                 <Image
//                   src={url}
//                   alt="avatar"
//                   width={56}
//                   loading="eager"
//                   height={56}
//                   className="rounded-full object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Form */}
//         <Form
//           form={addForm}
//           layout="vertical"
//           onFinish={addStylist}
//           onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
//         >
//           <Form.Item name="name" label="Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>

//           <Form.Item
//             name="email"
//             label="Email"
//             rules={[{ required: true, type: "email" }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>

//           <div className="grid grid-cols-2 gap-3">
//             <Form.Item name="gender" label="Gender">
//               <Select>
//                 <Select.Option value="Male">Male</Select.Option>
//                 <Select.Option value="Female">Female</Select.Option>
//                 <Select.Option value="Other">Other</Select.Option>
//               </Select>
//             </Form.Item>

//             <Form.Item name="age" label="Age">
//               <Input type="number" />
//             </Form.Item>
//           </div>

//           <Form.Item
//             name="department"
//             label="Department"
//             rules={[{ required: true, message: "Select department" }]}
//           >
//             <Select placeholder="Select department">
//               {DEPARTMENTS.map((dept) => (
//                 <Select.Option key={dept} value={dept}>
//                   {dept}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="serviceList"
//             label="Services"
//             rules={[{ required: true, message: "Select at least one service" }]}
//           >
//             <Select
//               mode="multiple"
//               placeholder="Select services"
//               optionRender={(option) => {
//                 const service = allServices.find((s) => s._id === option.value);

//                 return (
//                   <div className="flex items-center gap-2">
//                     <span>{service?.serviceName}</span>
//                   </div>
//                 );
//               }}
//             >
//               {allServices.map((service) => (
//                 <Select.Option key={service._id} value={service._id}>
//                   {service.serviceName}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item name="status" label="Status">
//             <Select>
//               <Select.Option value="active">Active</Select.Option>
//               <Select.Option value="inactive">Inactive</Select.Option>
//             </Select>
//           </Form.Item>

//           <Button
//             type="primary"
//             htmlType="submit"
//             loading={adding}
//             className="w-full"
//           >
//             Add Stylist
//           </Button>
//         </Form>
//       </Drawer>

//       <Modal
//         title="Edit Stylist"
//         open={openEdit}
//         centered
//         onCancel={() => {
//           setOpenEdit(false);
//           editForm.resetFields();
//         }}
//         footer={null}
//         width={600}
//         styles={{
//           body: {
//             maxHeight: "60vh",
//             overflowY: "auto",
//           },
//         }}
//       >
//         {/* Avatar Picker */}
//         <div className="mb-4">
//           <p className="text-sm font-semibold mb-2">Profile Image</p>

//           <div className="flex gap-3">
//             {AVATARS.map((url) => (
//               <div
//                 key={url}
//                 onClick={() => setSelectedAvatar(url)}
//                 className={`cursor-pointer rounded-full p-1 border-2
//           ${
//             selectedAvatar === url ? "border-green-500" : "border-transparent"
//           }`}
//               >
//                 <Image
//                   src={url}
//                   alt="avatar"
//                   width={48}
//                   height={48}
//                   loading="eager"
//                   className="rounded-full"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         <Form form={editForm} layout="vertical" onFinish={updateStylist}>
//           <Form.Item name="name" label="Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>

//           <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
//             <Input />
//           </Form.Item>

//           <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>

//           <div className="grid grid-cols-2 gap-3">
//             <Form.Item name="gender" label="Gender">
//               <Select>
//                 <Select.Option value="Male">Male</Select.Option>
//                 <Select.Option value="Female">Female</Select.Option>
//                 <Select.Option value="Other">Other</Select.Option>
//               </Select>
//             </Form.Item>

//             <Form.Item name="age" label="Age">
//               <Input type="number" />
//             </Form.Item>
//           </div>

//           <Form.Item name="department" label="Department">
//             <Select>
//               {DEPARTMENTS.map((dept) => (
//                 <Select.Option key={dept} value={dept}>
//                   {dept}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item name="serviceList" label="Services">
//             <Select mode="multiple">
//               {allServices.map((s) => (
//                 <Select.Option key={s._id} value={s._id}>
//                   {s.serviceName}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item name="joiningDate" label="Joining Date">
//             <DatePicker className="w-full" />
//           </Form.Item>

//           <Form.Item name="status" label="Status">
//             <Select>
//               <Select.Option value="active">Active</Select.Option>
//               <Select.Option value="inactive">Inactive</Select.Option>
//             </Select>
//           </Form.Item>

//           <Button type="primary" htmlType="submit" className="w-full mt-2">
//             Update Stylist
//           </Button>
//         </Form>
//       </Modal>
//     </div>
//   );
// }



// //  Optimize code

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Mail, Phone, Edit, Trash2 } from "lucide-react";
import Loading from "@/app/components/loading";
import { Drawer, Form, Input, Select, Button, message, Modal, DatePicker } from "antd";
import dayjs from "dayjs";

// ── Module-level constants — not recreated on every render ─────────────────
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

const AVATARS = [
  "/male.jpg",
  "/female.png"
];

const DEPARTMENTS = ["Haircare", "Skincare", "Makeup", "Spa", "Nail Care"];

export default function StylistsPage() {
  const [stylists, setStylists]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [allServices, setAllServices]     = useState([]);

  const [openAdd, setOpenAdd]             = useState(false);
  const [adding, setAdding]               = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [addForm] = Form.useForm();

  const [openEdit, setOpenEdit]           = useState(false);
  const [editingStylist, setEditingStylist] = useState(null);
  const [editForm] = Form.useForm();

  // ── Fetch stylists + services in parallel ──────────────────────────────
  const fetchStylists = useCallback(async () => {
    setLoading(true);
    try {
      const [groomerRes, serviceRes] = await Promise.all([
        fetch(`/api/proxy?endpoint=getGroomer&shopId=${SHOP_ID}`),
        fetch(`/api/proxy?endpoint=getService&shopId=${SHOP_ID}`),
      ]);

      // ✅ FIX: Parse in parallel
      const [groomerResult, serviceResult] = await Promise.all([
        groomerRes.json(),
        serviceRes.json(),
      ]);

      if (groomerResult.success) setStylists(groomerResult.groomers ?? []);
      if (serviceResult.success) setAllServices(serviceResult.data ?? []);
    } catch (err) {
      // console.error("Failed to fetch stylists/services:", err);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStylists(); }, [fetchStylists]);

  // ── Open add drawer ────────────────────────────────────────────────────
  const openAddStylist = useCallback(() => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setSelectedAvatar(randomAvatar);
    addForm.resetFields();
    addForm.setFieldsValue({ status: "active", joiningDate: dayjs() });
    setOpenAdd(true);
  }, [addForm]);

  // ── Add stylist ────────────────────────────────────────────────────────
  const addStylist = useCallback(async (values) => {
    if (!selectedAvatar) {
      message.warning("Please select a profile image");
      return;
    }
    try {
      setAdding(true);
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint:     "postGroomer",
          name:         values.name,
          email:        values.email,
          phone:        values.phone,
          gender:       values.gender,
          age:          values.age,
          department:   values.department,
          joiningDate:  values.joiningDate,
          serviceList:  values.serviceList,
          profileImage: selectedAvatar,
          status:       values.status,
          shopId:       SHOP_ID,
        }),
      });

      // ✅ FIX: Guard non-OK responses
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success) {
        message.success("Stylist added successfully");
        setOpenAdd(false);
        fetchStylists();
      } else {
        message.error(result.message || "Failed to add stylist");
      }
    } catch (err) {
      // console.error(err);
      message.error("Failed to add stylist");
    } finally {
      setAdding(false);
    }
  }, [selectedAvatar, fetchStylists]);

  // ── Open edit ──────────────────────────────────────────────────────────
  const handleEdit = useCallback((stylist) => {
    setEditingStylist(stylist);
    setSelectedAvatar(stylist.profileImage);
    editForm.setFieldsValue({
      name:        stylist.name,
      email:       stylist.email,
      phone:       stylist.phone,
      gender:      stylist.gender,
      age:         stylist.age,
      department:  stylist.department,
      status:      stylist.status,
      joiningDate: dayjs(stylist.joiningDate),
      serviceList: stylist.serviceList.map((s) => s._id),
    });
    setOpenEdit(true);
  }, [editForm]);

  // ── Update stylist ─────────────────────────────────────────────────────
  const updateStylist = useCallback(async (values) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint:     "putGroomer",
          groomerId:    editingStylist._id,
          name:         values.name,
          email:        values.email,
          phone:        values.phone,
          gender:       values.gender,
          age:          values.age,
          department:   values.department,
          serviceList:  values.serviceList,
          profileImage: selectedAvatar,
          status:       values.status,
          joiningDate:  values.joiningDate,
          shopId:       SHOP_ID,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success) {
        message.success("Stylist updated successfully");
        setOpenEdit(false);
        fetchStylists();
      } else {
        message.error(result.message || "Update failed");
      }
    } catch (err) {
      // console.error(err);
      message.error("Update failed");
    }
  }, [editingStylist, selectedAvatar, fetchStylists]);

  // ── Delete stylist ─────────────────────────────────────────────────────
  const handleDelete = useCallback((stylist) => {
    Modal.confirm({
      title:   "Delete Stylist?",
      content: "This action cannot be undone.",
      okType:  "danger",
      centered: true,
      onOk: async () => {
        try {
          const res = await fetch("/api/proxy", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: "deleteGroomer", groomerId: stylist._id }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const result = await res.json();

          if (result.success) {
            message.success("Stylist deleted");
            fetchStylists();
          } else {
            message.error(result.message || "Delete failed");
          }
        } catch (err) {
          // console.error(err);
          message.error("Delete failed");
        }
      },
    });
  }, [fetchStylists]);

  // ── Shared service select options (memoised) ───────────────────────────
  // ✅ FIX: Computed once — not recreated on each render of Add + Edit drawers
  const serviceOptions = useMemo(() =>
    allServices.map((s) => (
      <Select.Option key={s._id} value={s._id}>{s.serviceName}</Select.Option>
    )),
  [allServices]);

  // ── Avatar picker (shared between add + edit) ──────────────────────────
  const AvatarPicker = useCallback(() => (
    <div className="mb-4">
      <p className="text-sm font-semibold mb-2">Profile Image</p>
      <div className="flex gap-3">
        {AVATARS.map((url) => (
          <div
            key={url}
            onClick={() => setSelectedAvatar(url)}
            className={`cursor-pointer rounded-full p-1 border-2 ${
              selectedAvatar === url ? "border-green-500" : "border-transparent"
            }`}
          >
            <Image src={url} alt="avatar" width={56} height={56} loading="eager" className="rounded-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  ), [selectedAvatar]);

  if (loading) return <Loading />;

  return (
    <div className="p-4 bg-white min-h-screen pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Stylists</h1>

      {stylists.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">No stylists found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stylists.map((stylist) => (
            <div key={stylist._id} className="rounded-2xl bg-white border border-gray-300 p-4">
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={stylist.profileImage}
                      alt={stylist.name}
                      width={64}
                      height={64}
                      loading="eager"
                      className="rounded-full object-cover"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      stylist.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{stylist.name}</h2>
                    <p className="text-sm text-gray-500">{stylist.department}</p>
                  </div>
                </div>

                <div className="flex flex-col pr-2 items-center gap-4">
                  <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(stylist)} title="Edit Stylist">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(stylist)} title="Delete Stylist">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-4 bg-gray-100 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 flex flex-col gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{stylist.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{stylist.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="font-semibold text-gray-600">
                      {new Date(stylist.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                {stylist.serviceList?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {stylist.serviceList.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-gray-200"
                        >
                          <span className={`w-2 h-2 rounded-full ${service.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                          <span className={`text-xs font-medium truncate ${service.status === "active" ? "text-gray-800" : "text-red-800"}`}>
                            {service.serviceName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
        <button onClick={openAddStylist} className="w-full p-3 bg-black text-green-500 rounded-lg font-semibold transition-colors duration-300">
          Add Stylist
        </button>
      </div>

      {/* Add Drawer */}
      <Drawer
        title="Add Stylist"
        placement="bottom"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        styles={{ wrapper: { height: "72vh" }, body: { overflowY: "auto" } }}
      >
        <AvatarPicker />
        <Form form={addForm} layout="vertical" onFinish={addStylist} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          <Form.Item name="name"  label="Name"  rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="gender" label="Gender">
              <Select>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
            {/* ✅ FIX: type="text" + inputMode="numeric" — prevents scroll spinner */}
            <Form.Item name="age" label="Age">
              <Input type="text" inputMode="numeric" />
            </Form.Item>
          </div>

          <Form.Item name="department" label="Department" rules={[{ required: true, message: "Select department" }]}>
            <Select placeholder="Select department">
              {DEPARTMENTS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="serviceList" label="Services" rules={[{ required: true, message: "Select at least one service" }]}>
            <Select mode="multiple" placeholder="Select services">{serviceOptions}</Select>
          </Form.Item>

          <Form.Item name="joiningDate" label="Joining Date">
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={adding} className="w-full">Add Stylist</Button>
        </Form>
      </Drawer>

      {/* Edit Modal */}
      <Modal
        title="Edit Stylist"
        open={openEdit}
        centered
        onCancel={() => { setOpenEdit(false); editForm.resetFields(); }}
        footer={null}
        width={600}
        styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      >
        <AvatarPicker />
        <Form form={editForm} layout="vertical" onFinish={updateStylist}>
          <Form.Item name="name"  label="Name"  rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="gender" label="Gender">
              <Select>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="age" label="Age">
              <Input type="text" inputMode="numeric" />
            </Form.Item>
          </div>

          <Form.Item name="department" label="Department">
            <Select>{DEPARTMENTS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}</Select>
          </Form.Item>

          <Form.Item name="serviceList" label="Services">
            <Select mode="multiple">{serviceOptions}</Select>
          </Form.Item>

          <Form.Item name="joiningDate" label="Joining Date">
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" className="w-full mt-2">Update Stylist</Button>
        </Form>
      </Modal>
    </div>
  );
}