import React from "react";
import RoomCard from "./RoomCard";

export default function RoomTypes() {
  const rooms = [
    {
      title: "ห้องเล็ก",
      desc: "ห้องขนาด 20 ตร.ม. เหมาะสำหรับ 1–2 คน",
      price: 5000,
      available: 3,
      image:
        "https://images.unsplash.com/photo-1737737196308-e5b848160b78?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
    },
    {
      title: "ห้องกลาง",
      desc: "ห้องขนาด 40 ตร.ม. เหมาะสำหรับ 2–4 คน",
      price: 10000,
      available: 1,
      image:
        "https://plus.unsplash.com/premium_photo-1674676471417-07f613528a94?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1145",
    },
    {
      title: "ห้องใหญ่",
      desc: "ห้องขนาด 60 ตร.ม. เหมาะสำหรับ 4–6 คน",
      price: 15000,
      available: 2,
      image:
        "https://plus.unsplash.com/premium_photo-1663126298656-33616be83c32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    },
  ];

  return (
    <section className="section section--soft">
      <div className="container">
        <h3 className="section__title">ประเภทห้องพัก</h3>
        <p className="section__sub">เลือกห้องที่เข้ากับไลฟ์สไตล์ของคุณ</p>
        <div className="rooms">
          {rooms.map((r, i) => (
            <RoomCard key={i} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}
