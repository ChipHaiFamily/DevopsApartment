import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axiosConfig";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // console.log("BaseURL:", import.meta.env.VITE_API_BASE_URL);
  // console.log("Form Data:", form);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!isEmail) e.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    if (form.password.length < 6)
      e.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      // 🔹 เรียก API backend
      const res = await api.post("/auth/login", form);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userId", res.data.userId); 
        localStorage.setItem("userName", res.data.userName || form.email);

        if (res.data.role === "ADMIN") {
          navigate("/admin");
        } else {
          // ⚠️ TODO: ต้องเปลี่ยน roomId เป็นค่าจริงของ user ที่ login
          navigate("/");
        }
      } else {
        setErrors({ email: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: "เข้าสู่ระบบล้มเหลว กรุณาลองใหม่" });
    }
  };

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <div className="section section--soft">
          <div className="container auth__wrap">
            <h1 className="auth__title">เข้าสู่ระบบ</h1>
            <p className="auth__sub">
              หรือ{" "}
              <a href="/register" className="link">
                สมัครสมาชิกใหม่
              </a>
            </p>
            <form className="card form" onSubmit={onSubmit} noValidate>
              <div className="field">
                <label className="label">
                  อีเมล<span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.email ? "input--error" : ""}`}
                  type="email"
                  name="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={form.email}
                  onChange={onChange}
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </div>

              <div className="field">
                <label className="label">
                  รหัสผ่าน<span className="req">*</span>
                </label>
                <input
                  className={`input ${errors.password ? "input--error" : ""}`}
                  type="password"
                  name="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={form.password}
                  onChange={onChange}
                />
                {errors.password && (
                  <div className="error">{errors.password}</div>
                )}
              </div>

              <button className="btn btn--brand btn--block" type="submit">
                เข้าสู่ระบบ
              </button>
              <div className="auth__tiny">
                <a href="#" className="link">
                  ลืมรหัสผ่าน
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
