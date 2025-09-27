import api from "../api/axiosConfig";
import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ---------- mock data ห้อง 3 แบบ ---------- */
const ROOM_TYPES = {
  small: {
    key: "small",
    price: 5000,
    title: "ห้องพักขนาดเล็ก",
    bullets: [
      { icon: "bi-people", text: "1–2 คน" },
      { icon: "bi-moon-stars", text: "1 ที่นอนควีนไซส์" },
      { icon: "bi-droplet", text: "1 ห้องน้ำ" },
    ],
    about1:
      "ห้องบิ้วต์อินให้ครบ กะทัดรัด ตอบโจทย์ด้วยห้องสตูดิโอที่ขนาดสบาย 23.50 ตร.ม. เหมาะสำหรับนักศึกษาที่ต้องการพื้นที่ส่วนตัว เข้าพักสูงสุด 2 คน",
    about2:
      "ห้องมอบพร้อมเตียงควีนไซส์ ห้องน้ำส่วนตัวสุดสะดวก มุมครัวไว้เตรียมของโปรด, ห้องนั่งเล่นชิล ๆ, มุมอ่านหนังสือให้ไอเดียแล่นกระฉูด และระเบียงพร้อมราวตากผ้า (แก้ด้วย)",
    featuresLeft: ["เตียงควีนไซส์", "ห้องน้ำส่วนตัว", "ตู้เสื้อผ้า", "โซฟา"],
    featuresRight: ["อ่างล้างจาน", "โต๊ะอ่านหนังสือ", "ระเบียง"],
  },
  medium: {
    key: "medium",
    price: 10000,
    title: "ห้องพักขนาดกลาง",
    bullets: [
      { icon: "bi-people", text: "2–4 คน" },
      { icon: "bi-moon-stars", text: "2 ห้องนอน + พื้นที่นั่งเล่น" },
      { icon: "bi-droplet", text: "1 ห้องน้ำ" },
    ],
    about1:
      "ขนาด ~40 ตร.ม. เหมาะกับเพื่อนร่วมห้องหรือคู่รักที่อยากได้พื้นที่เพิ่มขึ้น",
    about2:
      "จัดฟังก์ชันแยกสัดส่วน โซนนั่งเล่นกว้าง โต๊ะทำงาน 2 ที่นั่ง ครัวขนาดย่อม ตู้เก็บของเยอะ และระเบียงกว้าง",
    featuresLeft: ["เตียงควีนไซส์ 2 ห้อง", "ห้องน้ำส่วนตัว", "โซฟา + โต๊ะกลาง"],
    featuresRight: ["โต๊ะทำงาน 2 ชุด", "ครัวขนาดย่อม", "ระเบียงกว้าง"],
  },
  large: {
    key: "large",
    price: 15000,
    title: "ห้องพักขนาดใหญ่",
    bullets: [
      { icon: "bi-people", text: "4–6 คน" },
      { icon: "bi-moon-stars", text: "2 ห้องนอน + โถงกว้าง" },
      { icon: "bi-droplet", text: "2 ห้องน้ำ" },
    ],
    about1: "ยูนิตใหญ่ ~60 ตร.ม. อยู่สบายสำหรับครอบครัวเล็กหรือแชร์หลายคน",
    about2:
      "พื้นที่รับแขกกว้าง ครัวแยกเป็นสัดส่วน ห้องน้ำ 2 จุด ตู้เก็บของรอบห้อง ระเบียง 2 ฝั่ง รับลมดีสุด ๆ",
    featuresLeft: [
      "เตียงควีนไซส์ 2 ห้อง",
      "โซฟา L + ชั้นวางทีวี",
      "ห้องน้ำ 2 ห้อง",
    ],
    featuresRight: ["ครัวแยก", "โต๊ะกินข้าว 4 ที่นั่ง", "ระเบียง 2 ฝั่ง"],
  },
};

/* ---------- โมดัล (เงื่อนไข, ข้อผิดพลาด, สำเร็จ) ---------- */
function Modal({ id, title, children, footer }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* Bootstrap helper: เปิดโมดัลด้วย JS */
function openModal(id) {
  // ต้องมี bootstrap.js ในหน้า (ผ่าน bundle)
  const el = document.getElementById(id);
  if (!el) return;
  const modal = new window.bootstrap.Modal(el);
  modal.show();
}

export default function Room() {
  const { type = "small" } = useParams();
  const navigate = useNavigate();

  const info = useMemo(() => ROOM_TYPES[type] || ROOM_TYPES.small, [type]);

  // ฟอร์มสอดคล้องภาพตัวอย่าง
  const [roomType, setRoomType] = useState(""); // select
  const [acceptTos, setAcceptTos] = useState(true); // checkbox 1 (mock ให้ติ๊กไว้)
  const [acceptPrivacy, setAcceptPrivacy] = useState(true); // checkbox 2 (mock ให้ติ๊กไว้)
  const [errors, setErrors] = useState([]);

  // ปรับค่าเริ่มต้นเมื่อเปลี่ยนแท็บห้อง
  React.useEffect(() => {
    setRoomType(info.key);
  }, [info.key]);

  // ตรวจสอบความถูกต้อง (แบบตรงไปตรงมา)
  const validate = () => {
    const newErrors = [];
    if (!roomType) {
      newErrors.push("กรุณาเลือกประเภทห้อง");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const ROOM_TYPE_MAP = {
    small: "RT01",
    medium: "RT02",
    large: "RT03",
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const isValid = validate();
    if (!isValid) {
      openModal("errorModal");
      return;
    }

    try {
      const dateTime = new Date().toISOString().slice(0, 16);

      const payload = {
        dateTime: dateTime,
        user: { id: userId },
        roomType: { roomTypeId: ROOM_TYPE_MAP[roomType] },
      };

      console.log("Payload:", payload);

      await api.post("/reservations", payload);

      openModal("successModal");
    } catch (err) {
      console.error("Reservation error:", err);
      setErrors(["เกิดข้อผิดพลาดในการส่งข้อมูล"]);
      openModal("errorModal");
    }
  };

  const goHome = () => {
    const modalEl = document.getElementById("successModal");
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
    navigate("/");
  };

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <div
          className="container py-4"
          style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
        >
          {/* ปุ่มสลับชนิดห้อง */}
          <div className="mb-3">
            <div className="btn-group">
              <Link
                to="/rooms/small"
                className={`btn btn-outline-primary ${
                  info.key === "small" ? "active" : ""
                }`}
              >
                ห้องเล็ก
              </Link>
              <Link
                to="/rooms/medium"
                className={`btn btn-outline-primary ${
                  info.key === "medium" ? "active" : ""
                }`}
              >
                ห้องกลาง
              </Link>
              <Link
                to="/rooms/large"
                className={`btn btn-outline-primary ${
                  info.key === "large" ? "active" : ""
                }`}
              >
                ห้องใหญ่
              </Link>
            </div>
          </div>

          {/* HERO ราคา + ชื่อ + bullets */}
          <div
            className="rounded-3 mb-4 p-4"
            style={{
              background:
                "linear-gradient(0deg, rgba(15,23,42,.12), rgba(15,23,42,.12)), repeating-conic-gradient(#f3f4f6 0% 25%, #e5e7eb 0% 50%) 50%/40px 40px",
            }}
          >
            <div className="text-dark-50 small fw-semibold mb-2">
              {info.price.toLocaleString("th-TH")}.–/เดือน
            </div>
            <h1 className="display-5 fw-bolder mb-3">{info.title}</h1>
            <div className="d-flex flex-wrap gap-4 fs-5">
              {info.bullets.map((b) => (
                <div key={b.text} className="d-flex align-items-center">
                  <i className={`me-2 bi ${b.icon}`} />
                  {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* เนื้อหา 2 คอลัมน์ => ซ้ายคำอธิบาย + สิ่งอำนวยความสะดวก, ขวาเป็นภาพเม็ทริกซ์เทา (mock) */}
          <div className="row g-4 align-items-start mb-4">
            <div className="col-lg-8">
              <section className="mb-4">
                <h4 className="fw-bolder mb-3">เกี่ยวกับห้องพัก</h4>
                <p className="fs-5 mb-2">{info.about1}</p>
                <p className="fs-6 text-dark mb-0">{info.about2}</p>
              </section>

              <section className="mb-4">
                <h4 className="fw-bolder mb-3">สิ่งอำนวยความสะดวกในห้องพัก</h4>
                <div className="row">
                  <div className="col-md-6">
                    {info.featuresLeft.map((t) => (
                      <div
                        key={t}
                        className="d-flex align-items-center mb-3 fs-5"
                      >
                        <i className="bi bi-person-check me-3" />
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    {info.featuresRight.map((t) => (
                      <div
                        key={t}
                        className="d-flex align-items-center mb-3 fs-5"
                      >
                        <i className="bi bi-person-check me-3" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ฝั่งขวา: ช่องรูป (mock) 3 ช่องเรียงลงเหมือนตัวอย่าง */}
            <div className="col-lg-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-3 mb-3"
                  style={{
                    height: i === 0 ? 240 : 180,
                    background:
                      "repeating-conic-gradient(#f3f4f6 0% 25%, #e5e7eb 0% 50%) 50%/26px 26px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* กล่องจอง */}
          <section className="mb-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="fw-bolder mb-1">จองห้องที่คุณต้องการ</h4>
                <div className="text-secondary mb-3">
                  โปรดรอรับผลการตอบกลับทางอีเมล
                </div>

                <form onSubmit={onSubmit}>
                  <div className="row g-3">
                    <div className="col-lg-6">
                      <label className="form-label">
                        ประเภทห้องที่ต้องการ{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      >
                        <option value="">เลือกประเภทห้อง</option>
                        <option value="small">ห้องเล็ก</option>
                        <option value="medium">ห้องกลาง</option>
                        <option value="large">ห้องใหญ่</option>
                      </select>
                    </div>

                    <div className="col-12 mt-1">
                      <div className="form-check mb-2">
                        <input
                          id="tos"
                          type="checkbox"
                          className="form-check-input"
                          checked={acceptTos}
                          onChange={(e) => setAcceptTos(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="tos">
                          ฉันได้อ่านและยอมรับ{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 align-baseline"
                            onClick={() => openModal("termsModal")}
                          >
                            ข้อตกลงและเงื่อนไข
                          </button>
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          id="privacy"
                          type="checkbox"
                          className="form-check-input"
                          checked={acceptPrivacy}
                          onChange={(e) => setAcceptPrivacy(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="privacy">
                          ฉันได้อ่านและยอมรับ{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 align-baseline"
                            onClick={() => openModal("termsModal")}
                          >
                            นโยบายความเป็นส่วนตัว
                          </button>
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <button className="btn btn-primary w-100 py-2">
                        ส่งคำขอ
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* ---------- TERMS MODAL (mock) ---------- */}
      <Modal
        id="termsModal"
        title="ข้อตกลงและเงื่อนไขการจอง (ตัวอย่าง)"
        footer={
          <>
            <button className="btn btn-secondary" data-bs-dismiss="modal">
              ปิด
            </button>
          </>
        }
      >
        <div className="small">
          <p className="mb-2">
            - ผู้ขอจองตกลงชำระเงินค่ามัดจำและค่าเช่าตามที่กำหนดภายใน 3
            วันทำการนับจากวันที่ได้รับการอนุมัติ
          </p>
          <p className="mb-2">
            - หากไม่ชำระภายในกำหนด
            ระบบจะยกเลิกการจองโดยอัตโนมัติและคืนสิทธิให้ผู้สมัครรายต่อไป
          </p>
          <p className="mb-2">
            - ผู้เช่าต้องปฏิบัติตามระเบียบหอพัก เงื่อนไขการใช้พื้นที่ส่วนกลาง
            และนโยบายความเป็นส่วนตัว
          </p>
          <p className="mb-0">
            - ข้อความนี้เป็นตัวอย่างสำหรับทดสอบ UI เท่านั้น
          </p>
        </div>
      </Modal>

      {/* ---------- ERROR MODAL ---------- */}
      <Modal
        id="errorModal"
        title="กรอกข้อมูลไม่ครบถ้วน"
        footer={
          <button className="btn btn-primary" data-bs-dismiss="modal">
            เข้าใจแล้ว
          </button>
        }
      >
        <div className="text-danger">
          <ul className="mb-0">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* ---------- SUCCESS MODAL ---------- */}
      <Modal
        id="successModal"
        title="ส่งคำขอเรียบร้อย"
        footer={
          <button className="btn btn-primary" onClick={goHome}>
            รับทราบ
          </button>
        }
      >
        <div>
          ระบบได้รับคำขอของคุณแล้ว คุณสามารถตรวจสอบสถานะได้ที่หน้าโปรไฟล์ของคุณ
        </div>
      </Modal>
    </div>
  );
}
