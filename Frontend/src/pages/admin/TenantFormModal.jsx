import React, { useEffect, useState } from "react";

import axios from "axios";
import Select from "react-select";

export default function TenantFormModal({ open, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [form, setForm] = useState({
    tenantId: "",
    citizenId: "",
    emergencyContact: "",
    emergencyName: "",
    emergencyRelationship: "",
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (selectedOption) => {
    setForm((prev) => ({ ...prev, tenantId: selectedOption?.value || "" }));
  };

  const handleSubmit = async () => {
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

  // options สำหรับ react-select
  const userOptions = availableUsers.map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.email})`,
  }));

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

                <div className="col-md-6">
                  <label className="form-label">รหัสบัตรประชาชน</label>
                  <input
                    className="form-control"
                    name="citizenId"
                    value={form.citizenId}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เบอร์ฉุกเฉิน</label>
                  <input
                    className="form-control"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ชื่อผู้ติดต่อฉุกเฉิน</label>
                  <input
                    className="form-control"
                    name="emergencyName"
                    value={form.emergencyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ความสัมพันธ์</label>
                  <input
                    className="form-control"
                    name="emergencyRelationship"
                    value={form.emergencyRelationship}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
