import React from "react";
import RoomCard from "./RoomCard";

export default function RoomTypes({ dashboard, rooms }) {
  if (!dashboard) return null;

  const slugMap = {
    RT01: "small",
    RT02: "medium",
    RT03: "large",
  };

  const roomTypes = dashboard.roomTypes || [];

  // ฟังก์ชันนับจำนวนห้องว่างตาม roomTypeId
  const countAvailable = (typeId) => {
    if (!rooms) return "-";
    return rooms.filter(
      (r) => r.roomTypeId === typeId && r.status === "available"
    ).length;
  };

  return (
    <section className="section section--soft">
      <div className="container">
        <h3 className="section__title">ประเภทห้องพัก</h3>
        <p className="section__sub">เลือกห้องที่เข้ากับไลฟ์สไตล์ของคุณ</p>

        <div className="rooms">
          {roomTypes.map((t) => (
            <RoomCard
              key={t.roomTypeId}
              title={t.name}
              desc={t.description}
              price={t.price}
              available={countAvailable(t.roomTypeId)}
              image={t.room_image}
              type={slugMap[t.roomTypeId]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
