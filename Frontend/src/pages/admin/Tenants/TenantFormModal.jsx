import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

export default function TenantFormModal({ open, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [errors, setErrors] = useState({}); // เก็บ error ของแต่ละช่อง

  const [form, setForm] = useState({
    tenantId: "",
    citizenId: "",
    emergencyContact: "",
    emergencyName: "",
    emergencyRelationship: "",
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // ===================== Fetch Users/Tenants =====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tenantsRes] = await Promise.all([
          axios.get(`${baseURL}/users`),
          axios.get(`${baseURL}/tenants`),
        ]);

        const allUsers = usersRes.data;
        const existingTenants = tenantsRes.data;

        const tenantIds = existingTenants.map((t) => t.tenantId);
        const filtered = allUsers.filter((u) => !tenantIds.includes(u.id));

        setUsers(allUsers);
        setTenants(existingTenants);
        setAvailableUsers(filtered);
      } catch (err) {
        console.error("Error fetching users/tenants:", err);
      }
    };
    fetchData();
  }, [baseURL]);

  if (!open) return null;

  // ===================== Validation Function =====================
  const validateCitizenId = (id) => {
    if (!id) return "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
    if (!/^\d{13}$/.test(id))
      return "เลขบัตรไม่ถูกต้อง หรืออาจไม่มีอยู่จริง กรุณากรอกเลขบัตรที่ถูกต้อง";

    //  ตรวจสอบโครงสร้างตามหลักคณิตศาสตร์ (Check Digit) // บัตรประชาชนไทย 13 หลัก
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(id.charAt(i)) * (13 - i);
    const checkDigit = (11 - (sum % 11)) % 10;
    if (checkDigit !== parseInt(id.charAt(12)))
      return "เลขบัตรไม่ถูกต้อง หรืออาจไม่มีอยู่จริง กรุณากรอกเลขบัตรที่ถูกต้อง";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก";
    if (!/^\d{10}$/.test(phone))
      return "เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเลข จำนวน 10 หลัก";
    return "";
  };

  const validateNotEmpty = (value) => {
    if (!value.trim()) return "กรุณากรอกข้อมูลให้ครบถ้วน";
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      citizenId: validateCitizenId(form.citizenId),
      emergencyContact: validatePhone(form.emergencyContact),
      emergencyName: validateNotEmpty(form.emergencyName),
      emergencyRelationship: validateNotEmpty(form.emergencyRelationship),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  };

  // ===================== Handlers =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (selectedOption) => {
    setForm((prev) => ({ ...prev, tenantId: selectedOption?.value || "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      tenantId: form.tenantId,
      citizenId: form.citizenId,
      emergencyContact: form.emergencyContact,
      emergencyName: form.emergencyName,
      emergencyRelationship: form.emergencyRelationship,
      user: { id: form.tenantId },
    };

    try {
      await axios.post(`${baseURL}/tenants`, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating tenant:", err);
      console.log("Sended payload:", payload);
    }
  };

  const userOptions = availableUsers.map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.email})`,
  }));

  const isFormValid = validateCitizenId(form.citizenId) === "" &&
    validatePhone(form.emergencyContact) === "" &&
    validateNotEmpty(form.emergencyName) === "" &&
    validateNotEmpty(form.emergencyRelationship) === "";

  // ===================== JSX =====================
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
              <h5 className="modal-title fw-bold">สร้างผู้เช่าใหม่</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3 mb-3">
                {/* เลือก user */}
                <div className="col-md-12">
                  <label className="form-label">เลือกผู้ใช้</label>
                  <Select
                    options={userOptions}
                    onChange={handleUserSelect}
                    placeholder="พิมพ์เพื่อค้นหาผู้ใช้..."
                    isClearable
                  />
                </div>

                {/* Citizen ID */}
                <div className="col-md-6">
                  <label className="form-label">รหัสบัตรประชาชน</label>
                  <input
                    className="form-control"
                    name="citizenId"
                    value={form.citizenId}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.citizenId && (
                    <small className="text-danger">{errors.citizenId}</small>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="col-md-6">
                  <label className="form-label">เบอร์ฉุกเฉิน</label>
                  <input
                    className="form-control"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.emergencyContact && (
                    <small className="text-danger">{errors.emergencyContact}</small>
                  )}
                </div>

                {/* Emergency Name */}
                <div className="col-md-6">
                  <label className="form-label">ชื่อผู้ติดต่อฉุกเฉิน</label>
                  <input
                    className="form-control"
                    name="emergencyName"
                    value={form.emergencyName}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.emergencyName && (
                    <small className="text-danger">{errors.emergencyName}</small>
                  )}
                </div>

                {/* Relationship */}
                <div className="col-md-6">
                  <label className="form-label">ความสัมพันธ์</label>
                  <input
                    className="form-control"
                    name="emergencyRelationship"
                    value={form.emergencyRelationship}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.emergencyRelationship && (
                    <small className="text-danger">{errors.emergencyRelationship}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!isFormValid} // disable ปุ่มเมื่อกรอกไม่ครบ/ผิด
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}