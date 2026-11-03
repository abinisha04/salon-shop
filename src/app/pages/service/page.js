// // Before Optimize code

// "use client";

// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import Image from "next/image";
// import { Edit, Trash2, Search } from "lucide-react";
// import { Modal, Form, Input, InputNumber, Button, message, Select, Drawer } from "antd";
// import Loading from "@/app/components/loading";

// // ✅ FIX #1: Constants at module level — not recreated on every render
// const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// // ✅ FIX #2: SERVICE_IMAGES at module level — was inside component, recreated on every render
// const SERVICE_IMAGES = [
//   { url: "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/haircolor.png?alt=media&token=59aabba8-1e7a-45d0-94ed-2dae6fb60aee" },
//   { url: "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/haircut.png?alt=media&token=2fdc8a89-8534-43e8-aac8-c77fbd519ee9" },
//   { url: "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/hairspa.png?alt=media&token=086114bd-0b2a-4121-a35c-52bc9cb2bd17" },
//   { url: "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/hairwash.png?alt=media&token=8547abbf-27fe-44f7-bf9d-587faa49d217" },
//   { url: "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/trim.png?alt=media&token=030a2ff1-2af0-464c-9d03-dddbdb4daebb" },
// ];

// const { Option } = Select;

// export default function Page() {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [selectedService, setSelectedService] = useState(null);
//   const [search, setSearch] = useState("");
//   const [form] = Form.useForm();
//   const [openAdd, setOpenAdd] = useState(false);
//   const [addForm] = Form.useForm();
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [adding, setAdding] = useState(false);

//   // ✅ FIX #3: useCallback — stable reference
//   const fetchServices = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/proxy?endpoint=getService&shopId=${SHOP_ID}`);
//       const result = await res.json();
//       if (result.success) setServices(result.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchServices();
//   }, [fetchServices]);

//   const sortedServices = useMemo(() => {
//     return [...services].sort((a, b) => {
//       if (a.status === "active" && b.status !== "active") return -1;
//       if (a.status !== "active" && b.status === "active") return 1;
//       return 0;
//     });
//   }, [services]);

//   const filteredServices = useMemo(() => {
//     if (!search) return sortedServices;
//     return sortedServices.filter((s) =>
//       s.serviceName.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [sortedServices, search]);

//   // ✅ FIX #4: useCallback for all event handlers
//   const openEditModal = useCallback(
//     (service) => {
//       setSelectedService(service);
//       form.setFieldsValue({
//         serviceName: service.serviceName,
//         duration: service.duration,
//         displayPrice: service.displayPrice,
//         servicePrice: service.servicePrice,
//         status: service.status,
//       });
//       setOpenEdit(true);
//     },
//     [form]
//   );

//   const updateService = useCallback(
//     async (values) => {
//       try {
//         const payload = {
//           serviceId: selectedService._id,
//           serviceName: values.serviceName,
//           servicePrice: values.servicePrice,
//           displayPrice: values.displayPrice,
//           offerPrice: values.offerPrice,
//           duration: values.duration,
//           status: values.status,
//         };

//         const res = await fetch(`/api/proxy`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ endpoint: "putService", ...payload }),
//         });
//         const result = await res.json();

//         if (result.success) {
//           message.success("Service updated successfully");
//           setOpenEdit(false);
//           fetchServices();
//         } else {
//           message.error(result.message || "Update failed");
//         }
//       } catch (error) {
//         console.error(error);
//         message.error("Update failed");
//       }
//     },
//     [selectedService, fetchServices]
//   );

//   const deleteService = useCallback(
//     (id) => {
//       Modal.confirm({
//         title: "Delete Service?",
//         content: "This action cannot be undone.",
//         okType: "danger",
//         centered: true,
//         onOk: async () => {
//           try {
//             const res = await fetch(`/api/proxy`, {
//               method: "DELETE",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ endpoint: "deleteService", serviceId: id }),
//             });
//             const result = await res.json();
//             if (result.success) {
//               message.success("Service deleted successfully");
//               fetchServices();
//             } else {
//               message.error(result.message || "Delete failed");
//             }
//           } catch (error) {
//             console.error(error);
//             message.error("Delete failed");
//           }
//         },
//       });
//     },
//     [fetchServices]
//   );

//   const openAddDrawer = useCallback(() => {
//     setOpenAdd(true);
//     setSelectedImage(null);
//     addForm.resetFields();
//     addForm.setFieldsValue({ status: "inactive" });
//   }, [addForm]);

//   const addService = useCallback(
//     async (values) => {
//       if (!selectedImage) {
//         message.warning("Please select a service image");
//         return;
//       }
//       try {
//         setAdding(true);
//         const payload = {
//           serviceName: values.serviceName,
//           serviceImage: selectedImage,
//           servicePrice: values.servicePrice,
//           displayPrice: values.displayPrice,
//           offerPrice: values.displayPrice,
//           duration: values.duration,
//           status: values.status,
//           shopId: SHOP_ID,
//         };

//         const res = await fetch(`/api/proxy`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ endpoint: "postService", ...payload }),
//         });
//         const result = await res.json();

//         if (result.success) {
//           message.success("Service added successfully");
//           setOpenAdd(false);
//           addForm.resetFields();
//           setSelectedImage(null);
//           fetchServices();
//         } else {
//           message.error(result.message || "Failed to add service");
//         }
//       } catch (error) {
//         console.error(error);
//         message.error("Failed to add service");
//       } finally {
//         setAdding(false);
//       }
//     },
//     [selectedImage, addForm, fetchServices]
//   );

//   if (loading) return <Loading />;

//   return (
//     <div className="p-4 bg-white min-h-screen pb-24">
//       <div className="flex items-center justify-between mb-4 gap-3">
//         <h1 className="text-xl font-bold text-gray-900">Services</h1>
//         <div className="relative w-64">
//           <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search service..."
//             className="w-full pl-9 pr-3 py-2 text-gray-700 border rounded-lg text-sm outline-none focus:ring-1"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {filteredServices.map((service) => (
//           <div
//             key={service._id}
//             className={`rounded-lg border p-4 flex items-center gap-4 transition ${
//               service.status === "active"
//                 ? "bg-white border-gray-200 hover:shadow-md"
//                 : "bg-gray-100 border-gray-200"
//             }`}
//           >
//             <div className="w-20 h-20 flex items-center justify-center">
//               <div className="w-16 h-16 overflow-hidden">
//                 <Image
//                   src={service.serviceImage}
//                   alt={service.serviceName}
//                   width={50}
//                   height={50}
//                   className="object-contain"
//                 />
//               </div>
//             </div>

//             <div className="flex-1 space-y-1">
//               <h2 className="font-semibold text-base text-gray-900">{service.serviceName}</h2>
//               <p className="text-sm text-gray-500">⏱ {service.duration} mins</p>
//               <div className="flex items-center gap-2">
//                 <span className="text-green-600 font-bold text-sm">₹{service.displayPrice}</span>
//                 <span className="text-xs line-through text-gray-400">₹{service.servicePrice}</span>
//               </div>
//             </div>

//             <div className="flex flex-col items-center gap-2">
//               <span className={`w-2.5 h-2.5 rounded-full ${service.status === "active" ? "bg-green-500" : "bg-gray-500"}`} />
//               <button onClick={() => openEditModal(service)} className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 transition" title="Edit">
//                 <Edit size={16} />
//               </button>
//               <button onClick={() => deleteService(service._id)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 transition" title="Delete">
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
//         <button onClick={openAddDrawer} className="w-full p-3 bg-black text-green-500 rounded-lg font-semibold transition-colors duration-300">
//           Add Service
//         </button>
//       </div>

//       {/* ADD DRAWER */}
//       <Drawer
//         title="Add New Service"
//         placement="bottom"
//         open={openAdd}
//         onClose={() => setOpenAdd(false)}
//         styles={{ wrapper: { height: "72vh" }, body: { overflowY: "auto" } }}
//       >
//         <div className="mb-4">
//           <p className="font-semibold mb-2">Select Service Image</p>
//           <div className="grid grid-cols-4 gap-3">
//             {SERVICE_IMAGES.map((img) => (
//               <div
//                 key={img.url}
//                 onClick={() => setSelectedImage(img.url)}
//                 className={`border rounded-full p-2 cursor-pointer flex flex-col items-center ${
//                   selectedImage === img.url ? "border-green-500 bg-green-50" : "border-gray-200"
//                 }`}
//               >
//                 <Image src={img.url} alt="img" width={64} height={64} className="object-contain p-3" />
//               </div>
//             ))}
//           </div>
//         </div>

//         <Form form={addForm} layout="vertical" onFinish={addService} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
//           <Form.Item name="serviceName" label="Service Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <div className="grid grid-cols-2 gap-3">
//             <Form.Item name="servicePrice" label="Service Price" rules={[{ required: true }]}>
//               <InputNumber className="w-full" controls={false} inputMode="numeric" />
//             </Form.Item>
//             <Form.Item name="displayPrice" label="Display Price" rules={[{ required: true }]}>
//               <InputNumber className="w-full" controls={false} inputMode="numeric" />
//             </Form.Item>
//             <Form.Item name="duration" label="Duration (mins)" rules={[{ required: true }]}>
//               <InputNumber className="w-full" controls={false} inputMode="numeric" />
//             </Form.Item>
//             <Form.Item name="status" label="Status">
//               <Select>
//                 <Option value="active">Active</Option>
//                 <Option value="inactive">Inactive</Option>
//               </Select>
//             </Form.Item>
//           </div>
//           <Button type="primary" htmlType="submit" loading={adding} className="w-full mt-3">
//             Add Service
//           </Button>
//         </Form>
//       </Drawer>

//       {/* EDIT MODAL */}
//       <Modal
//         title="Edit Service"
//         open={openEdit}
//         centered
//         onCancel={() => { setOpenEdit(false); form.resetFields(); }}
//         footer={null}
//         width={420}
//       >
//         <Form form={form} layout="vertical" onFinish={updateService} className="space-y-2">
//           <Form.Item name="serviceName" label="Service Name" rules={[{ required: true, message: "Please enter service name" }]}>
//             <Input placeholder="Enter service name" />
//           </Form.Item>
//           <div className="grid grid-cols-2 gap-3">
//             <Form.Item name="displayPrice" label="Display Price">
//               <InputNumber className="w-full" placeholder="₹ 0" min={0} />
//             </Form.Item>
//             <Form.Item name="servicePrice" label="Service Price">
//               <InputNumber className="w-full" placeholder="₹ 0" min={0} />
//             </Form.Item>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <Form.Item name="duration" label="Duration (mins)">
//               <InputNumber className="w-full" placeholder="Eg: 30" min={1} />
//             </Form.Item>
//             <Form.Item name="status" label="Status">
//               <Select placeholder="Select status">
//                 <Select.Option value="active">Active</Select.Option>
//                 <Select.Option value="inactive">Inactive</Select.Option>
//               </Select>
//             </Form.Item>
//           </div>
//           <Button type="primary" htmlType="submit" size="large" className="w-full mt-3">
//             Update Service
//           </Button>
//         </Form>
//       </Modal>
//     </div>
//   );
// }

// //  Optimize code

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Edit, Trash2, Search } from "lucide-react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Select,
  Drawer,
} from "antd";
import LottieLoader from "@/app/components/loading";

// ── Module-level constants ────────────────────────────────────────────────
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

const SERVICE_IMAGES = [
  { url: "/images/haircut.svg" },
  { url: "/images/trimming.svg" },
  { url: "/images/waxing.svg" },
  { url: "/images/facial.svg" },
  { url: "/images/hairwash.svg" },
];

const { Option } = Select;

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const [openAdd, setOpenAdd] = useState(false);
  const [addForm] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false); // ✅ FIX: missing loading state on update

  // ── Fetch services ─────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/proxy?endpoint=getService&shopId=${SHOP_ID}`,
      );
      // ✅ FIX: Guard non-OK HTTP responses
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
      // ✅ FIX: Defensive fallback — result.data could be undefined
      if (result.success) setServices(result.data ?? []);
      else message.error(result.message || "Failed to load services");
    } catch (err) {
      // console.error("fetchServices:", err);
      // ✅ FIX: User-visible error instead of silent failure
      message.error("Failed to load services. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ── Sorted + filtered services ─────────────────────────────────────────
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return 0;
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!search.trim()) return sortedServices;
    const q = search.toLowerCase();
    return sortedServices.filter((s) =>
      s.serviceName.toLowerCase().includes(q),
    );
  }, [sortedServices, search]);

  // ── Open edit modal ────────────────────────────────────────────────────
  const openEditModal = useCallback(
    (service) => {
      setSelectedService(service);
      form.setFieldsValue({
        serviceName: service.serviceName,
        duration: service.duration,
        displayPrice: service.displayPrice,
        servicePrice: service.servicePrice,
        status: service.status,
      });
      setOpenEdit(true);
    },
    [form],
  );

  // ── Update service ─────────────────────────────────────────────────────
  const updateService = useCallback(
    async (values) => {
      if (!selectedService) return;
      setUpdating(true); // ✅ FIX: show loading on update button
      try {
        const res = await fetch("/api/proxy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "putService",
            serviceId: selectedService._id,
            serviceName: values.serviceName,
            servicePrice: values.servicePrice,
            displayPrice: values.displayPrice,
            offerPrice: values.displayPrice, // keep in sync
            duration: values.duration,
            status: values.status,
          }),
        });
        // ✅ FIX: Guard non-OK HTTP responses
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const result = await res.json();

        if (result.success) {
          message.success("Service updated successfully");
          setOpenEdit(false);
          form.resetFields();
          fetchServices();
        } else {
          message.error(result.message || "Update failed");
        }
      } catch (err) {
        // console.error("updateService:", err);
        message.error("Update failed. Please try again.");
      } finally {
        setUpdating(false);
      }
    },
    [selectedService, form, fetchServices],
  );

  // ── Delete service ─────────────────────────────────────────────────────
  const deleteService = useCallback(
    (id) => {
      Modal.confirm({
        title: "Delete Service?",
        content: "This action cannot be undone.",
        okType: "danger",
        centered: true,
        onOk: async () => {
          try {
            const res = await fetch("/api/proxy", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                endpoint: "deleteService",
                serviceId: id,
              }),
            });
            // ✅ FIX: Guard non-OK HTTP responses
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const result = await res.json();

            if (result.success) {
              message.success("Service deleted successfully");
              fetchServices();
            } else {
              message.error(result.message || "Delete failed");
            }
          } catch (err) {
            // console.error("deleteService:", err);
            message.error("Delete failed. Please try again.");
          }
        },
      });
    },
    [fetchServices],
  );

  // ── Open add drawer ────────────────────────────────────────────────────
  const openAddDrawer = useCallback(() => {
    addForm.resetFields();
    addForm.setFieldsValue({ status: "inactive" });
    setSelectedImage(null);
    setOpenAdd(true);
  }, [addForm]);

  // ── Close add drawer ───────────────────────────────────────────────────
  const closeAddDrawer = useCallback(() => {
    setOpenAdd(false);
    addForm.resetFields();
    setSelectedImage(null);
  }, [addForm]);

  // ── Add service ────────────────────────────────────────────────────────
  const addService = useCallback(
    async (values) => {
      if (!selectedImage) {
        message.warning("Please select a service image");
        return;
      }
      setAdding(true);
      try {
        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "postService",
            serviceName: values.serviceName,
            serviceImage: selectedImage,
            servicePrice: values.servicePrice,
            displayPrice: values.displayPrice,
            offerPrice: values.displayPrice, // keep in sync with displayPrice
            duration: values.duration,
            status: values.status,
            shopId: SHOP_ID,
          }),
        });
        // ✅ FIX: Guard non-OK HTTP responses
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const result = await res.json();

        if (result.success) {
          message.success("Service added successfully");
          closeAddDrawer();
          fetchServices();
        } else {
          message.error(result.message || "Failed to add service");
        }
      } catch (err) {
        // console.error("addService:", err);
        message.error("Failed to add service. Please try again.");
      } finally {
        setAdding(false);
      }
    },
    [selectedImage, closeAddDrawer, fetchServices],
  );

  // ── Close edit modal ───────────────────────────────────────────────────
  const closeEditModal = useCallback(() => {
    setOpenEdit(false);
    form.resetFields();
    setSelectedService(null);
  }, [form]);

  if (loading) return <LottieLoader />;

  return (
    <div className="p-4 bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-xl font-bold text-gray-900">Services</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service..."
            className="w-full pl-9 pr-3 py-2 text-gray-700 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-black"
            aria-label="Search services"
          />
        </div>
      </div>

      {/* Services Grid */}

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">No services found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="rounded-xl border border-gray-400 bg-white p-4 flex items-center gap-4 transition-all duration-200"
            >
              {/* Service Image + Status Dot */}
              <div className="relative w-18 h-18 flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-white border-gray-100  flex items-center justify-center overflow-hidden">
                  <Image
                    src={service.serviceImage}
                    alt={service.serviceName}
                    width={52}
                    height={52}
                    className="object-contain"
                  />
                </div>

                {/* Active Status Indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-gray-100 ${
                    service.status === "active" ? "bg-green-500" : "bg-gray-400"
                  }`}
                  title={service.status}
                />
              </div>

              {/* Service Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <h2 className="font-semibold text-base text-gray-800 truncate">
                  {service.serviceName}
                </h2>

                <p className="text-sm text-gray-700">{service.duration} mins</p>

                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-bold text-sm">
                    ₹{service.displayPrice}
                  </span>

                  <span className="text-xs line-through text-red-400">
                    ₹{service.servicePrice}
                  </span>
                </div>
              </div>

              {/* Edit + Delete in Same Row */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEditModal(service)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 transition"
                  title="Edit service"
                  aria-label={`Edit ${service.serviceName}`}
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => deleteService(service._id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 bg-white hover:bg-red-50 border border-gray-200 transition"
                  title="Delete service"
                  aria-label={`Delete ${service.serviceName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200">
        <button
          onClick={openAddDrawer}
          className="w-full p-3 bg-black text-white rounded-lg font-semibold transition-colors duration-200 active:opacity-80"
        >
          Add Service
        </button>
      </div>

      {/* ── ADD DRAWER ─────────────────────────────────────────────────── */}
      <Drawer
        title="Add New Service"
        placement="bottom"
        open={openAdd}
        onClose={closeAddDrawer}
        styles={{ wrapper: { height: "72vh" }, body: { overflowY: "auto" } }}
      >
        {/* Image Picker */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Select Service Image</p>
          {/* ✅ FIX: Show error if no image selected and form submitted */}
          {!selectedImage && (
            <p className="text-xs text-gray-400 mb-2">
              Please choose an image below
            </p>
          )}
          <div className="grid grid-cols-5 gap-3">
            {SERVICE_IMAGES.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setSelectedImage(img.url)}
                aria-label="Select service image"
                aria-pressed={selectedImage === img.url}
                className={`border-2 rounded-full p-2 flex items-center justify-center transition ${
                  selectedImage === img.url
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={img.url}
                  alt="service icon"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        <Form
          form={addForm}
          layout="vertical"
          onFinish={addService}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[{ required: true, message: "Enter service name" }]}
          >
            <Input placeholder="e.g. Haircut" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="servicePrice"
              label="Service Price"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                className="w-full"
                controls={false}
                inputMode="numeric"
                min={0}
                placeholder="₹ 0"
              />
            </Form.Item>
            <Form.Item
              name="displayPrice"
              label="Display Price"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                className="w-full"
                controls={false}
                inputMode="numeric"
                min={0}
                placeholder="₹ 0"
              />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Duration (mins)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                className="w-full"
                controls={false}
                inputMode="numeric"
                min={1}
                placeholder="30"
              />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={adding}
            disabled={adding}
            className="w-full mt-3"
          >
            {adding ? "Adding..." : "Add Service"}
          </Button>
        </Form>
      </Drawer>

      {/* ── EDIT MODAL ─────────────────────────────────────────────────── */}
      <Modal
        title="Edit Service"
        open={openEdit}
        centered
        onCancel={closeEditModal}
        footer={null}
        width={420}
        // ✅ FIX: Prevent closing while update is in progress
        mask={{ closable: !updating }}
        closable={!updating}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={updateService}
          className="space-y-2"
        >
          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[{ required: true, message: "Please enter service name" }]}
          >
            <Input placeholder="Enter service name" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="displayPrice"
              label="Display Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full"
                placeholder="₹ 0"
                min={0}
                controls={false}
                inputMode="numeric"
              />
            </Form.Item>
            <Form.Item
              name="servicePrice"
              label="Service Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full"
                placeholder="₹ 0"
                min={0}
                controls={false}
                inputMode="numeric"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="duration"
              label="Duration (mins)"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full"
                placeholder="Eg: 30"
                min={1}
                controls={false}
                inputMode="numeric"
              />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select placeholder="Select status">
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={updating}
            disabled={updating}
            className="w-full mt-3 !bg-gray-800"
          >
            {updating ? "Updating..." : "Update Service"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
