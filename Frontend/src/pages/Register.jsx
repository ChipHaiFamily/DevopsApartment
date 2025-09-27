import React, { useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Step = ({ num, title, active }) => (
  <div className={`step ${active ? "is-active" : ""}`}>
    <div className="step__dot">{num}</div>
    <div className="step__title">{title}</div>
    {num !== 3 && <div className="step__bar" />}
  </div>
);

// function useTenants() {
//   return useMemo(() => {
//     const extra = JSON.parse(localStorage.getItem("tenants_extra") || "[]");
//     return [...data.tenants, ...extra];
//   }, []);
// }

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    fullname: "",
    gender: "male",
    phone: "",
    job: "",
    workplace: "",
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const vStep1 = async () => {
    const e = {};
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!isEmail) e.email = "กรุณากรอกอีเมลเท่านั้น เช่น email@example.com";

    //  เรียก API เพื่อตรวจสอบ email ซ้ำ
    if (isEmail) {
      try {
        const res = await axios.get(`${API_BASE}/users`);
        const dup = res.data.some(
          (u) => u.email.toLowerCase() === form.email.toLowerCase()
        );
        if (dup) e.email = "อีเมลนี้มีอยู่แล้วในระบบ";
      } catch (err) {
        console.error("Check email failed:", err);
      }
    }

    if (
      form.password.length < 6 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password)
    )
      e.password = "รหัสผ่านยาว ≥ 6 ตัว มีตัวอักษรและตัวเลข";
    if (form.confirm !== form.password) e.confirm = "รหัสผ่านไม่ตรงกัน";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const vStep2 = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "กรุณากรอกชื่อ–สกุล";
    if (!/^\d{10}$/.test(form.phone))
      e.phone = "กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก";
    if (form.job === "") e.job = "กรุณากรอกอาชีพ";
    if (form.workplace === "") e.workplace = "กรุณากรอกสถานที่ทำงาน";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if ((step === 1 && (await vStep1())) || (step === 2 && vStep2())) {
      setStep(step + 1);
    }
  };

  const back = () => setStep(step - 1);

  // const submit = (e) => {
  //   e.preventDefault();
  //   // สรุปข้อมูล & บันทึก
  //   if (!vStep2()) return;
  //   const extra = JSON.parse(localStorage.getItem("tenants_extra") || "[]");
  //   const newTenant = {
  //     id: `USR-${String(extra.length + data.tenants.length + 1).padStart(
  //       3,
  //       "0"
  //     )}`,
  //     full_name: form.fullname,
  //     email: form.email,
  //     tel: form.phone,
  //     citizen_id: "",
  //     emergency_contact: form.altphone || "",
  //     emergency_relationship: "",
  //   };
  //   localStorage.setItem(
  //     "tenants_extra",
  //     JSON.stringify([...extra, newTenant])
  //   );
  //   alert("สมัครสมาชิกสำเร็จ (mock) — ลองไปหน้าเข้าสู่ระบบได้เลย");
  // };
  const submit = async (e) => {
    e.preventDefault();
    if (!vStep2()) return;

    try {
      await axios.post(`${API_BASE}/users`, {
        email: form.email,
        passwd: form.password,
        fullName: form.fullname,
        sex: form.gender === "male" ? "Male" : "Female",
        tel: form.phone,
        job: form.job,
        workplace: form.workplace,
      });
      alert("สมัครสมาชิกสำเร็จ!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Register failed:", err);
      alert("เกิดข้อผิดพลาด ไม่สามารถสมัครสมาชิกได้");
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
            <h1 className="auth__title">สมัครสมาชิก</h1>
            <p className="auth__sub">
              มีบัญชีแล้ว?{" "}
              <a href="/login" className="link">
                เข้าสู่ระบบ
              </a>
            </p>

            <div className="stepper">
              <Step num={1} title="บัญชีผู้ใช้" active={step >= 1} />
              <Step num={2} title="ข้อมูลส่วนตัว" active={step >= 2} />
              <Step num={3} title="เสร็จสิ้น" active={step >= 3} />
            </div>

            <form className="card form" onSubmit={submit} noValidate>
              {step === 1 && (
                <>
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
                    {errors.email && (
                      <div className="error">{errors.email}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="label">
                      รหัสผ่าน<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${
                        errors.password ? "input--error" : ""
                      }`}
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

                  <div className="field">
                    <label className="label">
                      ยืนยันรหัสผ่าน<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${
                        errors.confirm ? "input--error" : ""
                      }`}
                      type="password"
                      name="confirm"
                      placeholder="ยืนยันรหัสผ่าน"
                      value={form.confirm}
                      onChange={onChange}
                    />
                    {errors.confirm && (
                      <div className="error">{errors.confirm}</div>
                    )}
                  </div>

                  <div className="actions">
                    <button
                      className="btn btn--brand"
                      type="button"
                      onClick={next}
                    >
                      ถัดไป
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="field">
                    <label className="label">
                      ชื่อ–นามสกุล<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${
                        errors.fullname ? "input--error" : ""
                      }`}
                      name="fullname"
                      placeholder="ชื่อ–นามสกุล"
                      value={form.fullname}
                      onChange={onChange}
                    />
                    {errors.fullname && (
                      <div className="error">{errors.fullname}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="label">
                      เพศ<span className="req">*</span>
                    </label>
                    <div className="radio-row">
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={form.gender === "male"}
                          onChange={onChange}
                        />{" "}
                        ชาย
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={form.gender === "female"}
                          onChange={onChange}
                        />{" "}
                        หญิง
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">
                      เบอร์โทรศัพท์<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${errors.phone ? "input--error" : ""}`}
                      name="phone"
                      placeholder="เบอร์โทรศัพท์"
                      value={form.phone}
                      onChange={onChange}
                    />
                    {errors.phone && (
                      <div className="error">{errors.phone}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="label">
                      อาชีพ<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${errors.job ? "input--error" : ""}`}
                      name="job"
                      placeholder="อาชีพ"
                      value={form.job}
                      onChange={onChange}
                    />
                    {errors.job && <div className="error">{errors.job}</div>}
                  </div>

                  <div className="field">
                    <label className="label">
                      สถานที่ทำงาน<span className="req">*</span>
                    </label>
                    <input
                      className={`input ${
                        errors.workplace ? "input--error" : ""
                      }`}
                      name="workplace"
                      placeholder="สถานที่ทำงาน"
                      value={form.workplace}
                      onChange={onChange}
                    />
                    {errors.workplace && (
                      <div className="error">{errors.workplace}</div>
                    )}
                  </div>

                  <div className="actions actions--split">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={back}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      className="btn btn--brand"
                      onClick={next}
                    >
                      ถัดไป
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="summary">
                    <p>
                      <strong>อีเมล:</strong> {form.email}
                    </p>
                    <p>
                      <strong>ชื่อ–นามสกุล:</strong> {form.fullname}
                    </p>
                    <p>
                      <strong>เพศ:</strong>{" "}
                      {form.gender === "male" ? "ชาย" : "หญิง"}
                    </p>
                    <p>
                      <strong>โทรศัพท์:</strong> {form.phone}
                    </p>
                    <p>
                      <strong>อาชีพ:</strong> {form.job}
                    </p>
                    <p>
                      <strong>สถานที่ทำงาน:</strong> {form.workplace}
                    </p>
                  </div>
                  <div className="actions actions--split">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={back}
                    >
                      ย้อนกลับ
                    </button>
                    <button type="submit" className="btn btn--brand">
                      เสร็จสิ้น
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
