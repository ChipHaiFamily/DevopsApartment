import React, { useEffect, useState, useRef } from "react";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import api from "../../../api/axiosConfig";
import PaymentFormModal from "./PaymentFormModal";
import InterestSettingModal from "./InterestSettingModal";

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [ratePartial, setRatePartial] = useState(0);
  const [rateUnpaid, setRateUnpaid] = useState(0);

  const toastRef = useRef(null);

  // เรียกตอนเริ่มโหลด
  useEffect(() => {
    fetchInterestRates();
  }, []);

  const showToast = (message, type = "success") => {
    const toastEl = toastRef.current;
    if (!toastEl) return;
    const toastBody = toastEl.querySelector(".toast-body");
    toastBody.textContent = message;
    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(type === "success" ? "bg-success" : "bg-danger");

    const bsToast = new window.bootstrap.Toast(toastEl);
    bsToast.show();
  };

  // เมื่อบันทึกใน modal เสร็จ
  const handlePaymentSubmit = async (payload) => {
    console.log("📦 ข้อมูลที่ได้จาก PaymentFormModal:", payload);

    try {
      // สามารถต่อ API จริงได้ในภายหลัง เช่น:
      // await api.post("/payments", payload);

      alert("บันทึกการชำระเงินสำเร็จ!");
      setPaymentModalOpen(false);
    } catch (err) {
      console.error("Error creating payment:", err);
    }
  };

  /**  ดึงข้อมูลการชำระเงินจาก API */
  const fetchPayments = async () => {
    try {
      const res = await api.get("/dashboard/admin/payment");
      const data = Array.isArray(res.data) ? res.data : res.data.data;

      const formatted = data.map((p) => ({
        paymentId: p.paymentId,
        invoiceId: p.invoiceId,
        tenantName: p.tenantName,
        room: p.roomNum || "-",
        date: p.paymentDate,
        method: p.method,
        amount: Number(p.amount || 0),
      }));

      setPayments(formatted);
    } catch (err) {
      console.error("Error fetching payments:", err);
      showToast("โหลดข้อมูลการชำระเงินไม่สำเร็จ", "danger");
    } finally {
      setLoading(false);
    }
  };

  /**  ดึงข้อมูลห้อง (ใช้ใน filter) */
  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      const roomsData = Array.isArray(res.data?.data) ? res.data.data : [];
      const sortedRooms = roomsData.sort(
        (a, b) => Number(a.roomNum) - Number(b.roomNum)
      );
      setRooms(
        sortedRooms.map((r) => ({
          value: r.roomNum?.toString() || "-",
          label: r.roomNum?.toString() || "-",
        }))
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  /**  ดึงอัตราดอกเบี้ย */
  const fetchInterestRates = async () => {
    try {
      const res = await api.get("/interest-rate/latest");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      const partial = data.find((r) => r.type === "partial");
      const unpaid = data.find((r) => r.type === "unpaid");

      setRatePartial(partial?.percentage ?? 0);
      setRateUnpaid(unpaid?.percentage ?? 0);
    } catch (err) {
      console.error("Error fetching interest rates:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchPayments(), fetchRooms(), fetchInterestRates()]);
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalIncome = payments
    .filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // Normalize
  const normalizedPayments = payments.map((p) => ({
    ...p,
    amount: `฿${p.amount.toLocaleString()}`,
  }));

  const columns = [
    { key: "paymentId", label: "เลขที่การชำระ" },
    { key: "invoiceId", label: "เลขที่ใบแจ้งหนี้" },
    { key: "room", label: "ห้อง" },
    { key: "tenantName", label: "ผู้เช่า" },
    { key: "date", label: "วันที่ชำระ" },
    { key: "method", label: "วิธีชำระ" },
    { key: "amount", label: "ยอดที่ชำระ" },
  ];

  const filters = [
    {
      key: "method",
      label: "ทุกช่องทาง",
      options: [
        { value: "Bank Transfer", label: "Bank Transfer" },
        { value: "Credit Card", label: "Credit Card" },
        { value: "Cash", label: "Cash" },
        { value: "PromptPay", label: "PromptPay" },
      ],
    },
    {
      key: "room", //
      label: "ทุกห้อง",
      options: rooms, // เอามาจาก API /api/rooms
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">การชำระใบแจ้งหนี้</h3>
          <p className="text-muted mb-0">
            ประวัติและการจัดการการชำระเงินของผู้เช่า
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-light text-primary me-2"
            onClick={() => setInterestModalOpen(true)}
          >
            ตั้งค่าดอกเบี้ย
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setPaymentModalOpen(true)}
          >
            + สร้างการชำระเงิน
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="รายได้เดือนนี้"
            value={`฿${totalIncome.toLocaleString()}`}
            icon={<i className="bi bi-cash-stack text-success"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="ยอดที่ค้างชำระ"
            value={`${ratePartial.toFixed(2)}%`}
            icon={<i className="bi bi-clock text-warning"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="ยอดที่ล่าช้า"
            value={`${rateUnpaid.toFixed(2)}%`}
            icon={<i className="bi bi-exclamation-triangle text-danger"></i>}
          />
        </div>
      </div>

      {/* ตาราง */}
      <div className="card shadow-sm">
        <div className="card-header no-bg d-flex justify-content-between align-items-center p-3">
          <span className="fw-bold">รายการชำระเงิน</span>
        </div>

        <div className="card-body">
          <TableBS
            columns={columns}
            data={normalizedPayments}
            filters={filters}
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => alert(`ดูรายละเอียด ${row.paymentId}`)}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />
        </div>
      </div>

      <PaymentFormModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
      />

      <InterestSettingModal
        open={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onSaved={() => {
          fetchInterestRates();
          showToast("อัปเดตดอกเบี้ยเรียบร้อย!", "success");
        }}
      />

      {/*  Bootstrap Toast Container */}
      <div
        className="toast position-fixed top-0 end-0 m-3 text-white"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={toastRef}
        style={{ zIndex: 2000 }}
      >
        <div className="toast-body">บันทึกข้อมูลสำเร็จ</div>
      </div>
    </div>
  );
}
