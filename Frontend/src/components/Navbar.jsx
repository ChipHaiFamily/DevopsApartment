import React from "react";
import { Link } from "react-router-dom";

/**
 * props:
 * - mode: 'tenant' | 'admin' | 'public'
 * - activeTab: 'myroom' | string (ใช้กับ mode='tenant')
 * - userName: string (ใช้กับ mode='admin' หรือ 'tenant')
 * - onLogout: fn
 */
export default function Navbar({
  mode,
  activeTab = "myroom",
  userName,
  onLogout = () => {},
}) {
  // AUTO DETECT role และ userName หากไม่ได้ส่งมาจาก props
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("userName");

  const finalMode =
    mode ??
    (role === "USER" ? "tenant" : role === "ADMIN" ? "admin" : "public");

  const finalUser = userName ?? name;

  return (
    <header className="nv">
      <div className="nv__inner container">
        {/* BRAND */}
        <Link to="/" className="nv__brand">
          DevOps Apartment
        </Link>

        {/* RIGHT SIDE */}
        <div className="nv__right">
          {finalMode === "tenant" && (
            <>
              {/* <nav className="nv__tabs">
                <Link
                  to="/my-room"
                  className={`nv__tab ${
                    activeTab === "myroom" ? "is-active" : ""
                  }`}
                >
                  ห้องพักของฉัน
                </Link>
              </nav> */}

              <div className="nv__greet">
                สวัสดี, <b>ผู้ใข้: {finalUser || "ผู้ใช้"}</b>
              </div>

              <button className="nv__link" onClick={onLogout}>
                <svg viewBox="0 0 24 24" className="nv__ico">
                  <path
                    d="M16 17l5-5-5-5M21 12H9m4 9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                ออกจากระบบ
              </button>
            </>
          )}

          {finalMode === "admin" && (
            <>
              <div className="nv__greet">
                สวัสดี, <b>แอดมิน: {finalUser || "ผู้ดูแล"}</b>
              </div>
              <button className="nv__link" onClick={onLogout}>
                <svg viewBox="0 0 24 24" className="nv__ico">
                  <path
                    d="M16 17l5-5-5-5M21 12H9m4 9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                ออกจากระบบ
              </button>
            </>
          )}

          {finalMode === "public" && (
            <div className="nv__actions">
              <Link to="/login" className="btn btn--ghost">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="btn btn--brand ">
                <i className="bi bi-person nv__ico nv__ico--btn mr-2"></i>
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
