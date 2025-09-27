### Structure Frontend
```plaintext
src/
├── App.jsx
├── index.js (หรือ main.jsx ถ้าใช้ Vite)
├── index.css        # import ฟอนต์/รีเซ็ตเล็กน้อย แล้วดึง styles.css
├── styles.css       # สไตล์หลักทั้งหมด (มีตัวแปรสี, layout, card ฯลฯ)
└── components/
    ├── Navbar.jsx
    ├── Hero.jsx
    ├── Stats.jsx
    ├── RoomCard.jsx
    ├── RoomTypes.jsx
    ├── Facilities.jsx
    └── Footer.jsx
```