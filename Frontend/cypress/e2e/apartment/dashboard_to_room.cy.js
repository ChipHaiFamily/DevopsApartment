describe('Dashboard → Room detail flow', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('http://localhost:3000/admin');
    });
  
    it('renders dashboard widgets and room map', () => {
      // Header/Sidebar หลัก
      cy.contains('DevOps Apartment').should('be.visible');
      [
        'แดชบอร์ด','จัดการห้อง','คำขอเช่า','ผู้เช่า',
        'สัญญาเช่า','ใบแจ้งหนี้','ซ่อมบำรุง','รายงาน','ตั้งค่า'
      ].forEach(txt => cy.contains(txt).should('be.visible'));
  
      // การ์ดสรุปด้านบน 4 ใบ
      cy.contains('ห้องพักทั้งหมด').should('be.visible');
      cy.contains('ห้องว่าง').should('be.visible');
      cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
      cy.contains('งานซ่อมที่เปิดอยู่').should('be.visible');
  
      // อัตราการเข้าพัก + รายได้เดือนนี้
      cy.contains('อัตราการเข้าพัก').should('be.visible');
      cy.contains(/\d+%/).should('be.visible');
      cy.contains('รายได้เดือนนี้').should('be.visible');
      cy.contains(/฿\s?\d/).should('be.visible');
  
      // แผนที่ห้องต้องมี
      cy.contains('แผนที่ห้อง').should('be.visible');
      cy.contains('ชั้น 1').should('be.visible');
    });
  
    it('clicks room 101 on the map and redirects to /admin/rooms/101', () => {
      // ---- เลือกห้อง 101 ----
      
      // cy.get('[data-testid="room-map"]').within(() => {
      //   cy.get('[data-testid="room-101"]').should('be.visible').click();
      // });
  
      // Fallback: อิงข้อความ "101" ในการ์ดห้อง
      // จำกัดขอบเขตในแผนที่ห้องก่อน เพื่อไม่ไปจับอย่างอื่นที่เป็น 101
      cy.contains('แผนที่ห้อง')
        .parent()      // การ์ด/เซคชันแผนที่
        .within(() => {
          cy.contains(/^101$/).should('be.visible').click(); // คลิกการ์ดห้อง 101
        });
  
      // ต้อง redirect ไปหน้า /admin/rooms/101
      cy.url().should('match', /\/admin\/rooms\/101$/);
  
      // หน้า Room 101 ควรมีหัวข้อและข้อมูลสำคัญ (ตามภาพ)
      cy.contains('ห้องพักหมายเลข 101').should('be.visible');
      cy.contains('ยอดค้างจ่าย').should('be.visible');
      cy.contains('คำขอการซ่อมบำรุง').should('be.visible');
      cy.contains('พักอาศัยแล้ว').should('be.visible');
  
      // มีกราฟการใช้ไฟ/น้ำ (หัวข้อ)
      cy.contains('การใช้ไฟฟ้า').should('be.visible');
      cy.contains('การใช้น้ำ').should('be.visible');
    });
  });