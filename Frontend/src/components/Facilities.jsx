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
  const images = [
    "https://images.unsplash.com/photo-1630703178161-1e2f9beddbf8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://plus.unsplash.com/premium_photo-1727456098477-b1f107799ee8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1125",
    "https://images.unsplash.com/photo-1743440164721-a3002bdca43b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    "https://images.unsplash.com/photo-1696128893829-55e17192e894?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1631",
    "https://images.unsplash.com/photo-1657978837873-5a6938c382ec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632",
    "https://images.unsplash.com/photo-1687783615494-b4a1f1af8b58?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1haW50ZW5hbmNlfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500",
    "https://plus.unsplash.com/premium_photo-1686090448451-fe1327f9b042?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  ];

  return (
    <>
      <section className="section fac">
        <div className="container">
          <h3 className="section__title fac__title">สิ่งอำนวยความสะดวก</h3>
          <p className="section__sub fac__sub">
            บริการครบครันเพื่อความสะดวกสบายของคุณ
          </p>

          <div className="fac__grid">
            {images.map((img, i) => (
              <div
                key={i}
                className="fac__img"
                style={{
                  backgroundImage: `url(${
                    img || "https://via.placeholder.com/400x300?text=No+Image"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </div>

          <div className="fac__list m-5">
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
          <strong>สอบถามรายละเอียดเพิ่มเติมได้ที่</strong> — โทร 012-345-6789
          หรืออีเมล{" "}
          <a href="mailto:info@devopsapartment.com">info@devopsapartment.com</a>
        </div>
      </div>
    </>
  );
}
