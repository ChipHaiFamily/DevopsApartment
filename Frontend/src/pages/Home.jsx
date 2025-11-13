// src/pages/public/Home.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import RoomTypes from "../components/RoomTypes";
import Facilities from "../components/Facilities";
import Footer from "../components/Footer";
import api from "../api/axiosConfig";

export default function Home() {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [dashboard, setDashboard] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api
      .get("rooms")
      .then((res) => setRooms(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    api
      .get("dashboard/home")
      .then((res) => {
        setDashboard(res.data);
      })
      .catch((err) => console.error("HOME ERROR:", err));
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Navbar
        mode={role === "USER" ? "tenant" : "public"}
        userName={userName}
        onLogout={logout}
      />

      <main style={{ flex: 1 }}>
        <Hero />
        <Stats dashboard={dashboard} />
        <RoomTypes dashboard={dashboard} rooms={rooms} />
        <Facilities />
      </main>
      <Footer />
    </div>
  );
}
