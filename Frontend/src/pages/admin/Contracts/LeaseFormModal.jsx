import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ContractTemplate from "./ContractTemplate";
import ReactDOM from "react-dom/client";
import api from "../../../api/axiosConfig";

export default function LeaseFormModal({
  open,
  onClose,
  onSubmit,
  contract,
  mode = "create", // create | update | read
}) {
  if (!open) return null;

  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({}); // สำหรับเก็บ error ของแต่ละช่อง
  const [file, setFile] = useState(null);
  const [imageType, setImageType] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  const isReadOnly = mode === "read";
  const isUpdateLimited = mode === "update";

  useEffect(() => {
    api
      .get(`/tenants`)
      .then((res) =>
        setTenants(Array.isArray(res.data) ? res.data : res.data.data)
      )
      .catch((err) => console.error("Error fetching tenants:", err));

    api
      .get(`/rooms`)
      .then((res) => setRooms(res.data?.data ?? []))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  // วันเริ่มต้น = วันนี้โดยอัตโนมัติ (เมื่อสร้างสัญญา)
  const getToday = () => new Date().toISOString().split("T")[0];
  const getNextMonthStart = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1);
    return d.toISOString().split("T")[0];
  };

  const getDefaultDeposit = (price) => price * 2;

  // ฟอร์มเริ่มต้น
  const [form, setForm] = useState({
    startDate: mode === "create" ? getToday() : "",
    endDate: "",
    rentAmount: 0,
    deposit: 0,
    billingCycle: "monthly",
    contractLink: "",
    tenantId: "",
    roomNum: "",
    contractNum: "",
    status: "active",
  });

  // preload ข้อมูลตอน update/read
  useEffect(() => {
    if ((mode === "update" || mode === "read") && contract) {
      setForm({
        contractNum: contract.contractNum || "",
        startDate: contract.startDate || "",
        endDate: contract.endDate || "",
        rentAmount: contract.rentAmount || 0,
        deposit: contract.deposit || 0,
        billingCycle: contract.billingCycle || "monthly",
        status: contract.status || "active",
        contractLink: contract.contractLink || "",
        tenantId: contract.tenant?.tenantId || "",
        roomNum: contract.room?.roomNum || "",
      });
    }
  }, [mode, contract]);

  // ========================== Validation ==========================
  const validateForm = () => {
    const newErrors = {};

    // วันสิ้นสุด
    if (!form.endDate) {
      newErrors.endDate = "กรุณากรอกวันสิ้นสุด ก่อนกดบันทึกข้อมูล";
    } else if (new Date(form.endDate) <= new Date(form.startDate)) {
      newErrors.endDate = "วันสิ้นสุด ต้องอยู่หลังวันเริ่มต้น";
    }

    // ผู้เช่า
    if (!form.tenantId) {
      newErrors.tenantId = "กรุณาเลือกผู้เช่า ก่อนกดบันทึกข้อมูล";
    }

    // ห้อง
    if (!form.roomNum) {
      newErrors.roomNum = "กรุณาเลือกห้อง ก่อนกดบันทึกข้อมูล";
    }

    // // ลิงก์สัญญา (optional แต่ถ้ามี ต้องเป็น URL ที่ถูกต้อง)
    // if (form.contractLink.trim() !== "") {
    //   const urlRegex =
    //     /^(https?:\/\/)([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    //   if (!urlRegex.test(form.contractLink.trim())) {
    //     newErrors.contractLink = "กรุณากรอกลิ้งค์ที่ถูกต้อง";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================== Handlers ==========================

  const handleExportPDF = async () => {
    try {
      // สร้าง div ชั่วคราวเพื่อ render Template
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      // render Template เข้าไป
      const template = <ContractTemplate data={contract || form} />;
      const root = ReactDOM.createRoot(container);
      root.render(template);

      // รอให้ render เสร็จ
      await new Promise((r) => setTimeout(r, 300));

      // แปลงเป็นภาพ
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // สร้าง PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Lease_${form.contractNum || "new"}.pdf`);

      // ลบ container หลังใช้งาน
      root.unmount();
      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  const fetchUploadedImages = async () => {
    if (!form.contractNum) return;
    try {
      const res = await api.get(`/contracts/images/${form.contractNum}`);
      setUploadedImages(res.data || []);
    } catch (err) {
      console.error("Error fetching uploaded images:", err);
    }
  };

  // ฟังก์ชันอัปโหลดไฟล์
  const handleUploadFile = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
    if (!form.contractNum) return alert("ไม่พบเลขที่สัญญา");
    if (!imageType.trim()) return alert("กรุณากรอกประเภทเอกสารก่อนอัปโหลด");

    try {
      const formData = new FormData();
      formData.append("imageType", imageType);
      formData.append("file", file);

      await api.post(`/contracts/images/${form.contractNum}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("อัปโหลดสำเร็จ!");
      setFile(null);
      setImageType("");
      fetchUploadedImages(); // refresh รายการไฟล์หลังอัปโหลด
    } catch (err) {
      console.error("Upload error:", err);
      alert("ไม่สามารถอัปโหลดไฟล์ได้");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!form.contractNum) return alert("ไม่พบเลขที่สัญญา");
    if (!window.confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) return;

    try {
      await api.delete(
        `/contracts/images/${form.contractNum}/delete/${imageId}`
      );
      alert("ลบไฟล์สำเร็จ");
      fetchUploadedImages(); // รีโหลดรายการไฟล์หลังลบ
    } catch (err) {
      console.error("Delete error:", err);
      alert("ไม่สามารถลบไฟล์ได้");
    }
  };

  // โหลดรายการไฟล์เมื่อ modal เปิดหรืออัปเดตสัญญา
  useEffect(() => {
    if (open && form.contractNum) fetchUploadedImages();
  }, [open, form.contractNum]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "roomNum") {
      const selectedRoom = rooms.find((r) => r.roomNum === value);
      if (selectedRoom) {
        setForm((prev) => ({
          ...prev,
          roomNum: value,
          rentAmount: selectedRoom.price || prev.rentAmount,
          deposit: getDefaultDeposit(selectedRoom.price || prev.rentAmount),
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTenantChange = async (tenantId) => {
    setForm((prev) => ({ ...prev, tenantId }));

    try {
      const res = await api.get(`/reservations`);
      const reservations = res.data || [];

      const matched = reservations.find(
        (r) =>
          r.user.id === tenantId && r.assignedRoom && r.status === "processing"
      );

      if (matched) {
        setForm((prev) => ({ ...prev, roomNum: matched.assignedRoom }));
      }
    } catch (err) {
      console.error("Error fetching reservations for tenant:", err);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      startDate: form.startDate,
      endDate: form.endDate,
      rentAmount: form.rentAmount,
      deposit: form.deposit,
      billingCycle: form.billingCycle,
      contractLink: form.contractLink,
      tenant: { tenantId: form.tenantId },
      room: { roomNum: form.roomNum },
      ...(mode === "update" && {
        contractNum: form.contractNum,
        status: form.status,
      }),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "ไม่สามารถบันทึกได้");
    }
  };

  // ========================== JSX ==========================
  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content"
            style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
          >
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {mode === "create"
                  ? "สร้างสัญญาใหม่"
                  : mode === "update"
                  ? "แก้ไขสัญญา"
                  : "รายละเอียดสัญญา"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-3 mb-3">
                {(mode === "update" || mode === "read") && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">เลขที่สัญญา</label>
                      <input
                        className="form-control"
                        name="contractNum"
                        value={form.contractNum}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">สถานะ</label>
                      <select
                        className="form-select"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        disabled={isReadOnly}
                      >
                        <option value="active">ใช้งาน</option>
                        <option value="expired">หมดอายุ</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Start Date */}
                <div className="col-md-6">
                  <label className="form-label">วันเริ่มต้น</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* End Date */}
                <div className="col-md-6">
                  <label className="form-label">วันสิ้นสุด</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    onBlur={validateForm}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                  {errors.endDate && (
                    <small className="text-danger">{errors.endDate}</small>
                  )}
                </div>

                {/* Rent */}
                <div className="col-md-6">
                  <label className="form-label">ค่าเช่า</label>
                  <input
                    type="number"
                    className="form-control"
                    name="rentAmount"
                    value={form.rentAmount}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* Deposit */}
                <div className="col-md-6">
                  <label className="form-label">เงินมัดจำ</label>
                  <input
                    type="number"
                    className="form-control"
                    name="deposit"
                    value={form.deposit}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* Billing Cycle */}
                <div className="col-md-6">
                  <label className="form-label">รอบบิล</label>
                  <select
                    className="form-select"
                    name="billingCycle"
                    value={form.billingCycle}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="monthly">รายเดือน</option>
                    <option value="yearly">รายปี</option>
                  </select>
                </div>

                {/* Contract Link */}
                <div className="col-md-6">
                  <label className="form-label">เอกสารสัญญา (ลิงก์)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contractLink"
                    value={form.contractLink}
                    onChange={handleChange}
                    onBlur={validateForm}
                    disabled={isReadOnly}
                  />
                  {errors.contractLink && (
                    <small className="text-danger">{errors.contractLink}</small>
                  )}
                </div>

                {/* Tenant */}
                <div className="col-md-12">
                  <label className="form-label">ผู้เช่า</label>
                  <select
                    className="form-select"
                    name="tenantId"
                    value={form.tenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    onBlur={validateForm}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="">-- เลือกผู้เช่า --</option>
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.user.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.tenantId && (
                    <small className="text-danger">{errors.tenantId}</small>
                  )}
                </div>

                {/* Room */}
                <div className="col-md-12">
                  <label className="form-label">ห้อง</label>
                  <select
                    className="form-select"
                    name="roomNum"
                    value={form.roomNum}
                    onChange={handleChange}
                    onBlur={validateForm}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="">-- เลือกห้อง --</option>
                    {rooms.length > 0 ? (
                      rooms
                        .filter(
                          (r) =>
                            r.status === "available" ||
                            r.roomNum === form.roomNum
                        )
                        .map((r) => (
                          <option key={r.roomNum} value={r.roomNum}>
                            ห้อง {r.roomNum} {r.roomTypeName}
                          </option>
                        ))
                    ) : (
                      <option disabled>ไม่มีห้องว่าง</option>
                    )}
                  </select>
                  {errors.roomNum && (
                    <small className="text-danger">{errors.roomNum}</small>
                  )}
                </div>

                {/* Upload Document */}
                <div className="col-md-12">
                  <label className="form-label">อัปโหลดรูป / เอกสารสัญญา</label>

                  <div className="row g-2 align-items-center">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ประเภทเอกสาร เช่น รูปบัตรประชาชน"
                        value={imageType}
                        onChange={(e) => setImageType(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,.pdf"
                        disabled={isReadOnly}
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-primary w-100"
                        type="button"
                        disabled={isReadOnly || !file}
                        onClick={handleUploadFile}
                      >
                        <i className="bi bi-upload"></i> อัปโหลด
                      </button>
                    </div>
                  </div>

                  <small className="text-muted">
                    รองรับไฟล์ .jpg, .png, .pdf (สูงสุด ~10MB)
                  </small>

                  {/* Uploaded Files List */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-3">
                      <label className="form-label fw-bold">
                        ไฟล์ที่อัปโหลดแล้ว
                      </label>
                      <ul className="list-group">
                        {uploadedImages.map((img, index) => (
                          <li
                            key={img.imageId || index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                              {img.imageType || "ไม่ระบุประเภท"}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {/* ปุ่มดูไฟล์ */}
                              <a
                                href={`${
                                  import.meta.env.VITE_API_BASE_URL
                                }/contracts/images/${form.contractNum}/view/${
                                  img.imageId
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                title="ดูไฟล์"
                              >
                                <i className="bi bi-eye"></i>
                              </a>

                              {/* ปุ่มลบรูป */}
                              <button
                                className="btn text-danger btn-sm d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                onClick={() => handleDeleteImage(img.imageId)}
                                title="ลบไฟล์"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                {mode === "read" ? "ปิด" : "ยกเลิก"}
              </button>

              {mode !== "create" && (
                <button
                  className="btn btn-outline-success"
                  onClick={handleExportPDF}
                >
                  <i className="bi bi-file-earmark-pdf"></i> ส่งออกแบบร่างสัญญา
                </button>
              )}

              {mode !== "read" && (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
