# install package ที่มีปัญหาบ่อย ๆ
---
- vite (เวลาเปลี่ยน env ทำงานแล้วต้องลงใหม่ตลอด)
- axios (ยังไม่แน่ใจว่ามีปัญหาจริงไหม)
- recharts (ตอนให้ปอนลองให้เหมือนจะต้องลงใหม่)
- react-select (อันนี้ยังไม่ได้ลองลงที่เครื่องอื่น)
- jspdf jspdf-autotable (เพิ่งติดตั้ง)

# หลังลงใหม่ต้องสร้าง
- ใส่ VITE_API_BASE_URL=http://localhost:8080/api ใน .env.local ที่สร้างบน layer เดียวกับ vite.config.js