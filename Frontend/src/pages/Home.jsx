// src/pages/public/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import RoomTypes from "../components/RoomTypes";
import Facilities from "../components/Facilities";
import Footer from "../components/Footer";

export default function Home() {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

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
        <Stats />
        <RoomTypes />
        <Facilities />
      </main>
      <Footer />
    </div>
  );
}
