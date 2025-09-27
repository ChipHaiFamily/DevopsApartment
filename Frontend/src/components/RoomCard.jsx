import React from "react";
import { Link } from "react-router-dom";

export default function RoomCard({ title, desc, price, available, type }) {
  return (
    <Link to={`/rooms/${type}`} className="text-decoration-none text-dark">
      <article className="room">
        <div className="room__img">รูปภาพ</div>
        <h4 className="room__title">{title}</h4>
        <p className="room__meta">{desc}</p>
        <div className="room__row">
          <span className="room__price">฿ {price.toLocaleString()}/เดือน</span>
          <span className="room__avail">ว่าง {available} ห้อง</span>
        </div>
      </article>
    </Link>
  );
}