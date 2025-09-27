describe('Admin Dashboard UI snapshot', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit('http://localhost:3000/admin');
  });

  it('shows header and sidebar menu', () => {
    cy.contains('DevOps Apartment').should('be.visible');
    cy.contains('แดชบอร์ด').should('be.visible');
    cy.contains('จัดการห้อง').should('be.visible');
    cy.contains('คำขอเช่า').should('be.visible');
    cy.contains('ผู้เช่า').should('be.visible');
    cy.contains('สัญญาเช่า').should('be.visible');
    cy.contains('ใบแจ้งหนี้').should('be.visible');
    cy.contains('ซ่อมบำรุง').should('be.visible');
    cy.contains('รายงาน').should('be.visible');
    cy.contains('ตั้งค่า').should('be.visible');
  });

  it('shows top 4 metric cards', () => {
    cy.contains('ห้องพักทั้งหมด').should('be.visible').parent().should('contain', '24');
    cy.contains('ห้องที่ให้เช่า').should('be.visible').parent().should('contain', '7');
    cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible').parent().should('contain', '1');
    cy.contains('งานซ่อมที่เปิดอยู่').should('be.visible').parent().should('contain', '1');
  });

  it('shows room map with statuses', () => {
    cy.contains('แผนที่ห้อง').should('be.visible');

    // ตรวจห้องบางห้องจากสกรีนช็อต
    cy.contains('.room__num', '101').should('be.visible')
      .parent().should('contain', 'ไม่ว่าง');
    cy.contains('.room__num', '104').parent().should('contain', 'ซ่อม');
    cy.contains('.room__num', '108').parent().should('contain', 'ว่าง');
    cy.contains('.room__num', '112').parent().should('contain', 'ไม่ว่าง');
  });

  it('shows occupancy rate and revenue', () => {
    cy.contains('อัตราการเข้าพัก').should('be.visible')
      .parent().should('contain', '29%').and('contain', '7 จาก 24');
    cy.contains('รายได้เดือนนี้').should('be.visible')
      .parent().should('contain', '฿12,450.5').and('contain', 'จากการชำระ: 2 ใบ');
  });

  it('shows maintenance list', () => {
    cy.contains('งานซ่อมบำรุง').should('be.visible');
    cy.contains('ห้อง 104').should('be.visible')
      .parent().should('contain', 'Leaky faucet in the bathroom sink');
    cy.contains('ห้อง 208').should('be.visible')
      .parent().should('contain', 'Scheduled quarterly AC cleaning');
  });

  it('shows overdue invoices', () => {
    cy.contains('ใบแจ้งหนี้ค้างชำระ').should('be.visible');
    cy.contains('ห้อง 001').should('be.visible')
      .parent().should('contain', '฿5,420').and('contain', 'ครบกำหนด 2023-06-05');
  });

  it('navigates to /admin/rooms/101 when clicking room 101 on the map', () => {
    // scope: การ์ด "แผนที่ห้อง"
    cy.contains('แผนที่ห้อง')
      .closest('.card')
      .within(() => {
        // ถ้ามีสกอลล์ ให้เลื่อนให้เห็นก่อน
        cy.contains('.room .room__num', /^101$/)
          .scrollIntoView()
          .should('be.visible')
          .parents('.room')
          .first()
          .click({ force: true }); // กันกรณีซ้อน element เล็กน้อย
      });

    cy.url().should('match', /\/admin\/rooms\/101$/);
  });

  it('room 101 detail page layout & values (flexible assertions)', () => {
    // เข้าหน้า detail โดยตรง กันกรณีรันเดี่ยว
    cy.visit('http://localhost:3000/admin/rooms/101');

    // เฮดเดอร์/บริบทหน้า
    cy.contains(/DevOps Apartment/).should('be.visible');
    cy.contains(/ห้องพักหมายเลข\s*101/).should('be.visible');

    // การ์ดยอดค้างชำระ (รูปแบบเงิน)
    cy.contains(/ยอดค้างชำระ/).should('be.visible')
      .parent()
      .should($c => {
        expect($c.text()).to.match(/฿[\d,]+(\.\d+)?/);
      });

    // การ์ดคำขอการซ่อมแซม (x รายการ)
    cy.contains(/คำขอรอการซ่อมแซม/).should('be.visible')
      .parent()
      .should($c => {
        expect($c.text()).to.match(/\d+\s*รายการ/);
      });

    // การ์ดพักอาศัยแล้ว (x วัน)
    cy.contains(/พักอาศัยแล้ว/).should('be.visible')
      .parent()
      .should($c => {
        expect($c.text()).to.match(/\d+\s*วัน/);
      });

    // ส่วนเลือกช่วงเวลา: มี select ≥ 3
    cy.contains(/เลือกช่วงเวลา/).should('be.visible')
      .parent()
      .within(() => {
        cy.get('select').should('have.length.at.least', 3);
      });

    // กราฟการใช้ไฟฟ้า
    cy.contains(/การใช้ไฟ/).should('be.visible')
      .parentsUntil('body')
      .last()
      .within(() => {
        cy.get('svg, canvas').should('exist');
        cy.get('rect, path').its('length').should('be.greaterThan', 0);
      });

    // เมนูด้านซ้ายยังแสดง "จัดการห้อง"
    cy.contains('จัดการห้อง').should('be.visible');
  });

});
