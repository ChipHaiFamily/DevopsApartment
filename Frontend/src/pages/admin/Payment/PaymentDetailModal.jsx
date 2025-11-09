import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function PaymentDetailModal({
  open,
  onClose,
  paymentId,
  onUpdated,
  onToast,
}) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !paymentId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/admin/payment/${paymentId}`);
        setPayment(res.data || res.data?.data);
        setError("");
      } catch (err) {
        console.error("Error fetching payment detail:", err);
        setError("ไม่สามารถโหลดข้อมูลการชำระเงินได้");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, paymentId]);

  if (!open) return null;

  const handleDeleteSlip = async () => {
    if (!window.confirm("ต้องการลบหลักฐานนี้หรือไม่?")) return;
    try {
      await api.delete(`/payments/slips/${paymentId}/delete`);
      onToast?.("ลบหลักฐานเรียบร้อย", "success");
      setPayment((prev) => ({ ...prev, slipBase64: null }));
      onUpdated?.();
    } catch (err) {
      console.error(err);
      onToast?.("ไม่สามารถลบหลักฐานได้", "danger");
    }
  };

  const handleUploadSlip = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/payments/slips/${paymentId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // โหลดข้อมูล slip ใหม่หลังอัปโหลดเสร็จ
      const res = await api.get(`/dashboard/admin/payment/${paymentId}`);
      setPayment(res.data || res.data?.data);

      onToast?.("อัปโหลดหลักฐานเรียบร้อย", "success");
      onUpdated?.();
    } catch (err) {
      console.error(err);
      onToast?.("ไม่สามารถอัปโหลดได้", "danger");
    }
  };

  const handleDownloadSlip = async () => {
    try {
      const res = await api.get(`/payments/slips/${paymentId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${paymentId}-slip.png`;
      link.click();
    } catch (err) {
      console.error(err);
      onToast?.("ไม่สามารถดาวน์โหลดหลักฐานได้", "danger");
    }
  };

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
          <div className="modal-content" style={{ fontFamily: "Kanit" }}>
            <div className="modal-header">
              <h5 className="modal-title fw-bold">รายละเอียดการชำระเงิน</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {loading && <p>กำลังโหลดข้อมูล...</p>}
              {error && <div className="alert alert-danger">{error}</div>}

              {payment && (
                <>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th>เลขที่การชำระ</th>
                        <td>{payment.paymentId}</td>
                      </tr>
                      <tr>
                        <th>เลขที่ใบแจ้งหนี้</th>
                        <td>{payment.invoiceId}</td>
                      </tr>
                      <tr>
                        <th>วันที่ชำระ</th>
                        <td>{payment.paymentDate}</td>
                      </tr>
                      <tr>
                        <th>ยอดชำระ</th>
                        <td>฿{Number(payment.amount).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <th>วิธีชำระ</th>
                        <td>{payment.method}</td>
                      </tr>
                      <tr>
                        <th>ผู้เช่า</th>
                        <td>{payment.tenantName || "-"}</td>
                      </tr>
                      <tr>
                        <th>ห้อง</th>
                        <td>{payment.roomNum || "-"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <hr />
                  <h6 className="fw-bold mb-2">หลักฐานการชำระเงิน</h6>

                  {payment.slipBase64 ? (
                    <div className="mb-3 text-center">
                      <img
                        src={
                          payment.slipBase64.startsWith("data:")
                            ? payment.slipBase64 // ใช้ตรง ๆ ถ้ามี prefix อยู่แล้ว
                            : `data:image/jpeg;base64,${payment.slipBase64}` // เผื่อกรณี backend ส่งมาเป็น base64 เปล่า
                        }
                        alt="Payment Slip"
                        className="img-fluid rounded border"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                      />

                      <div className="mt-3 d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleDownloadSlip}
                        >
                          <i className="bi bi-download me-1"></i> ดาวน์โหลด
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            document.getElementById("uploadNewSlip").click()
                          }
                        >
                          <i className="bi bi-upload me-1"></i> อัปโหลดใหม่
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleDeleteSlip}
                        >
                          <i className="bi bi-trash me-1"></i> ลบ
                        </button>

                        <input
                          id="uploadNewSlip"
                          type="file"
                          className="d-none"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleUploadSlip}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border rounded-3 py-4 px-3 text-center bg-body-tertiary"
                      style={{
                        borderStyle: "dashed",
                        borderColor: "#ced4da",
                      }}
                    >
                      <i
                        className="bi bi-file-earmark-text text-secondary"
                        style={{ fontSize: "2.2rem" }}
                      ></i>
                      <p className="mt-2 mb-3 text-muted fw-semibold">
                        ยังไม่มีหลักฐานการชำระเงิน
                      </p>

                      <button
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={() =>
                          document.getElementById("uploadNewSlip").click()
                        }
                      >
                        <i className="bi bi-upload"></i>
                        เพิ่มหลักฐาน
                      </button>

                      <input
                        id="uploadNewSlip"
                        type="file"
                        className="d-none"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleUploadSlip}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
