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

  // mock data (แทนการเรียก API จริง)
  useEffect(() => {
    const mock = [
      {
        paymentId: "PMT-2025-08-01",
        invoiceId: "INV-2025-08-01",
        room: "107",
        tenantName: "Somsak Jaidee",
        date: "2025-08-25",
        method: "Bank Transfer",
        amount: 5800,
      },
      {
        paymentId: "PMT-2025-08-02",
        invoiceId: "INV-2025-08-02",
        room: "104",
        tenantName: "Mana Chujai",
        date: "2025-08-25",
        method: "Credit Card",
        amount: 5800,
      },
      {
        paymentId: "PMT-2025-08-03",
        invoiceId: "INV-2025-08-03",
        room: "101",
        tenantName: "Warin Inthira",
        date: "2025-08-25",
        method: "Cash",
        amount: 5800,
      },
      {
        paymentId: "PMT-2025-08-04",
        invoiceId: "INV-2025-08-04",
        room: "109",
        tenantName: "Suda Maneerat",
        date: "2025-08-25",
        method: "PromptPay",
        amount: 5800,
      },
    ];
    setTimeout(() => {
      setPayments(mock);
      setLoading(false);
    }, 400);
  }, []);

  // ดึงข้อมูลห้องจาก API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");
        const roomsData = Array.isArray(res.data?.data) ? res.data.data : [];

        // แปลง roomNum เป็นตัวเลข (กรณีเป็น string) แล้ว sort
        const sortedRooms = roomsData.sort(
          (a, b) => Number(a.roomNum) - Number(b.roomNum)
        );

        // map เป็น options
        const list = sortedRooms.map((r) => ({
          value: r.roomNum?.toString() || "-",
          label: r.roomNum?.toString() || "-",
        }));

        setRooms(list);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
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
    fetchInterestRates();
  }, []);

  // Metrics
  const totalIncome = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  // Normalize
  const normalizedPayments = payments.map((p) => ({
    paymentId: p.paymentId,
    invoiceId: p.invoiceId,
    tenantName: p.tenantName,
    room: p.room,
    date: p.date,
    method: p.method,
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
