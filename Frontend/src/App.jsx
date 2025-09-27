import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import RoomTypes from "./components/RoomTypes";
import Facilities from "./components/Facilities";
import Footer from "./components/Footer";
import "./styles.css";

export default function App() {
  return (
    <div style={{minHeight:"100dvh", display:"flex", flexDirection:"column"}}>
      <Navbar />
      <main style={{flex:1}}>
        <Hero />
        <Stats />
        <RoomTypes />
        <Facilities />
      </main>
      <Footer />
    </div>
  );
}