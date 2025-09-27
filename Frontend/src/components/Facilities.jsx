import React from "react";

export default function Facilities() {
  const list = [
    "ระบบจองห้องออนไลน์",
    "ชำระเงินผ่านระบบ",
    "ตรวจสอบค่าใช้จ่าย",
    "แจ้งซ่อมบำรุงออนไลน์",
    "รับรู้บิลแบบอัตโนมัติ",
    "สัญญาเช่าดิจิทัล",
  ];

  return (
    <>
      <section className="section fac">
        <div className="container">
          <h3 className="section__title fac__title">สิ่งอำนวยความสะดวก</h3>
          <p className="section__sub fac__sub">บริการครบครันเพื่อความสะดวกสบายของคุณ</p>

          <div className="fac__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="fac__img" />
            ))}
          </div>

          <div className="fac__list">
            {list.map((t, i) => (
              <div key={i} className="fac__item">
                <span className="check">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <div className="container">
          <strong>สอบถามรายละเอียดเพิ่มเติมได้ที่</strong> — 
          {" "}โทร 012-345-6789 หรืออีเมล <a href="mailto:info@devopsapartment.com">info@devopsapartment.com</a>
        </div>
      </div>
    </>
  );
}