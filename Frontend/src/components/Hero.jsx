import React from "react";
import { Link } from "react-router-dom";
import banner from "../assets/apartment.jpg";

export default function Hero() {
  const bg = {
    backgroundImage: `linear-gradient(0deg, rgba(30,58,138,.30), rgba(30,58,138,.30)), url(${banner})`,
    backgroundSize: "cover", backgroundPosition: "center",
  };

  return (
    <section className="hero">
      <div className="hero__bg" style={bg} aria-hidden="true" />
      <div className="container hero__content">
        <div className="hero__wrap">
          <h2 className="headline">อพาร์ทเมนท์สมัยใหม่ ครบครันทุกความต้องการ</h2>
          <p className="sub">อพาร์ทเมนท์ที่ทันสมัย พร้อมการบริการครบวงจร เพื่อให้คุณมีประสบการณ์การอยู่อาศัยที่ดีที่สุด</p>
          <Link to="/register" className="cta">สมัครและจอง</Link>
        </div>
      </div>
    </section>
  );
}