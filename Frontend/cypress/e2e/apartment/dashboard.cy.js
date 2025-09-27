describe('Admin Dashboard', () => {
  it('should render dashboard widgets and key sections', () => {
    cy.viewport(1440, 900);


    cy.visit('http://localhost:3000/admin');

    cy.contains('DevOps Apartment').should('be.visible');

    // Sidebar 
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

    // cards widgets 
    cy.contains('ห้องพักทั้งหมด').should('be.visible');
    cy.contains('ห้องที่ให้เช่า').should('be.visible');
    cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
    cy.contains('งานซ่อมที่เปิดอยู่').should('be.visible');

    // แผนที่ห้อง
    cy.contains('แผนที่ห้อง').should('be.visible');
    cy.contains('ชั้น 1').should('be.visible');
    cy.contains('ชั้น 2').should('be.visible');
    // เช็คว่ามี badge/กล่องหมายเลขห้อง
    ;['101', '104', '112', '201'].forEach(room => {
      cy.contains(room).should('be.visible');
    });

    // อัตราการเข้าพักเปอร์เซ็นต์ progress
    cy.contains('อัตราการเข้าพัก').should('be.visible');
    // ตามภาพตัวอย่าง 29% (ถ้าค่า dynamic ให้ผ่อนเงื่อนไขเป็นรูปแบบเปอร์เซ็นต์)
    //  เปอร์เซ็นต์อาจเปลี่ยนได้ หลังเชื่อม backend เช็คแบบ flexible
    cy.get('body').then($b => {
      const hasExact = $b.text().includes('29%');
      if (hasExact) cy.contains('29%').should('be.visible');
      else cy.contains(/\d+%/).should('be.visible'); // percent format
    });

    // รายได้เดือนนี้ (มีตัวเลขสกุลเงินบาทแสดง)
    cy.contains('รายได้เดือนนี้').should('be.visible');
    cy.contains(/฿?\s?\d/).should('be.visible'); //เลขเงิน

    // งานซ่อมบำรุง 
    cy.contains('งานซ่อมบำรุง').should('be.visible');
    // อย่างน้อยต้องมีข้อความ ห้อง
    // status ปิด กำลังดำเนินการ
    cy.contains(/ห้อง\s?\d+/).should('be.visible');
    cy.get('body').then($b => {
      if ($b.text().includes('กำลังดำเนินการ')) {
        cy.contains('กำลังดำเนินการ').should('be.visible');
      }
      if ($b.text().includes('ปิด')) {
        cy.contains('ปิด').should('be.visible');
      }
    });

    // ใบแจ้งหนี้ค้างชำระ 
    cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
    cy.contains('ค้าง').should('be.visible');
    // flexible check เลขห้อง
    cy.contains(/ห้อง\s?\d+/).should('be.visible');

    // shortcuts
    cy.contains('เมนูด่วน').should('be.visible');
    cy.contains('สร้างใบแจ้งหนี้ประจำเดือน').should('be.visible');
    cy.contains('ดูคำขอเข้าพัก').should('be.visible');
  });
});