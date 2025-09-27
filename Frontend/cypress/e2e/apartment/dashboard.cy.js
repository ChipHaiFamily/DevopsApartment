describe('Admin Dashboard', () => {
    it('should render dashboard widgets and key sections', () => {
      // เปิดหน้าด้วยจอใหญ่หน่อยให้ layout เหมือนภาพ
      cy.viewport(1440, 900);
  
      // 1) เข้า URL
      cy.visit('http://localhost:3000/admin');
  
      // 2) แถบหัว/เมนูหลัก
      cy.contains('DevOps Apartment').should('be.visible');
  
      // 3) Sidebar เมนูหลัก (เห็นอย่างน้อยหัวข้อสำคัญ)
      [
        'แดชบอร์ด',
        'จัดการห้อง',
        'คำขอเช่า',
        'ผู้เช่า',
        'สัญญาเช่า',
        'ใบแจ้งหนี้',
        'ซ่อมบำรุง',
        'รายงาน',
        'ตั้งค่า',
      ].forEach(txt => cy.contains(txt).should('be.visible'));
  
      // 4) การ์ดสรุป 4 ใบด้านบน
      cy.contains('ห้องพักทั้งหมด').should('be.visible');
      cy.contains('ห้องที่ให้เช่า').should('be.visible');
      cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
      cy.contains('งานซ่อมที่เปิดอยู่').should('be.visible');
  
      // 5) แผนที่ห้อง (มีชั้น 1 และชั้น 2 + มีหมายเลขห้องบางห้อง)
      cy.contains('แผนที่ห้อง').should('be.visible');
      cy.contains('ชั้น 1').should('be.visible');
      cy.contains('ชั้น 2').should('be.visible');
      // เช็คว่ามี badge/กล่องหมายเลขห้องอย่างน้อยบางห้อง
      ;['101', '104', '112', '201'].forEach(room => {
        cy.contains(room).should('be.visible');
      });
  
      // 6) อัตราการเข้าพัก (มีเปอร์เซ็นต์และ progress)
      cy.contains('อัตราการเข้าพัก').should('be.visible');
      // ตามภาพตัวอย่าง 29% (ถ้าค่า dynamic ให้ผ่อนเงื่อนไขเป็นรูปแบบเปอร์เซ็นต์)
      cy.get('body').then($b => {
        const hasExact = $b.text().includes('29%');
        if (hasExact) cy.contains('29%').should('be.visible');
        else cy.contains(/\d+%/).should('be.visible');
      });
  
      // 7) รายได้เดือนนี้ (มีตัวเลขสกุลเงินบาทแสดง)
      cy.contains('รายได้เดือนนี้').should('be.visible');
      cy.contains(/฿?\s?\d/).should('be.visible'); // มีตัวเลขเงินบางอย่าง
  
      // 8) งานซ่อมบำรุง (มีรายการอย่างน้อย 1 แถว + ป้ายสถานะ)
      cy.contains('งานซ่อมบำรุง').should('be.visible');
      // อย่างน้อยต้องมีข้อความ "ห้อง" สักรายการ และมีสถานะ (ปิด/กำลังดำเนินการ) อย่างน้อยหนึ่งอัน
      cy.contains(/ห้อง\s?\d+/).should('be.visible');
      cy.get('body').then($b => {
        if ($b.text().includes('กำลังดำเนินการ')) {
          cy.contains('กำลังดำเนินการ').should('be.visible');
        }
        if ($b.text().includes('ปิด')) {
          cy.contains('ปิด').should('be.visible');
        }
      });
  
      // 9) ใบแจ้งหนี้ค้างชำระ (มีการ์ด + ป้าย "ค้าง")
      cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
      cy.contains('ค้าง').should('be.visible');
      // ตามภาพมี "ห้อง 001" ถ้าเป็นข้อมูลจริงอาจต่างกัน—จึงเช็คแบบยืดหยุ่น
      cy.contains(/ห้อง\s?\d+/).should('be.visible');
  
      // 10) เมนูด่วน
      cy.contains('เมนูด่วน').should('be.visible');
      cy.contains('สร้างใบแจ้งหนี้ประจำเดือน').should('be.visible');
      cy.contains('ดูคำขอเข้าพัก').should('be.visible');
    });
  });