// cypress/e2e/admin/maintenance.cy.js
// Test for Maintenance Page (Admin)

const openModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();

const safeCloseModal = (alias) => {
  cy.get(alias).then($m => {
    const closeBtn = $m.find('.btn-outline-secondary, .btn-close, button:contains("ยกเลิก"), button:contains("ปิด")');
    if (closeBtn.length) cy.wrap(closeBtn.first()).click({ force: true });
    else cy.get('body').type('{esc}');
  });
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
};

describe(' Admin Maintenance Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.clock(new Date('2025-10-30T00:00:00+07:00').getTime());
    cy.visit('/admin/maintenance');
    cy.contains('ซ่อมบำรุง', { timeout: 10000 }).should('be.visible');
  });

  // ────────────────────────────────
  it('1️ แสดง Header, Tabs และตารางงานซ่อม', () => {
    cy.contains('จัดการงานซ่อม').should('exist');
    cy.contains('งานซ่อม').should('exist');
    cy.contains('ตารางซ่อมบำรุง').should('exist');

    cy.get('table thead').within(() => {
      cy.contains(/รหัสงาน|ห้อง|ประเภท|สถานะ/i).should('exist');
    });
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  // ────────────────────────────────
  it('2️ เปิด Modal รายละเอียดงานซ่อมจากปุ่มแว่น แล้วปิดได้', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click({ force: true });
    });

    openModal().as('detailModal');

    cy.get('@detailModal').should('contain.text', 'แก้ไขงานซ่อม');
    cy.get('@detailModal').should('contain.text', 'ห้อง');
    cy.get('@detailModal').should('contain.text', 'ประเภทงาน');
    cy.get('@detailModal').should('contain.text', 'รายละเอียด');

    safeCloseModal('@detailModal');
  });

  // ────────────────────────────────
  it('3️ เปิด "สร้างงานซ่อมใหม่" แล้วตรวจ Validation Form', () => {
    cy.contains('button', '+ สร้างงานใหม่').click();
    openModal().as('modal');
    cy.get('@modal').should('contain.text', 'สร้างงานซ่อมใหม่');

    // (1) กดสร้างทันทีโดยไม่กรอกค่า → ต้องเตือนครบ
    cy.get('@modal').contains('button', /สร้าง|บันทึก/i).click({ force: true });
    cy.contains('กรุณากรอก หมายเลขห้อง').should('be.visible');
    cy.contains('กรุณากรอก ประเภทงาน').should('be.visible');
    cy.contains('กรุณากรอก ชื่อผู้ดำเงินงาน').should('be.visible');
    cy.contains('กรุณากรอก จำนวนเงิน ค่าใช้จ่าย').should('be.visible');

    // (2) กรอกวันที่เสร็จก่อนวันแจ้ง → เตือน
    cy.get('@modal').find('input[name="completedDate"]').clear().type('2020-01-01');
    cy.get('@modal').contains('button', /สร้าง|บันทึก/i).click({ force: true });
    cy.contains('วันที่เสร็จ ต้องอยู่อหลังวันที่แจ้ง').should('be.visible');

    // (3) กรอกค่าให้ถูกต้องทั้งหมด
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    cy.get('@modal').find('input[name="roomNum"]').clear().type('207');
    cy.get('@modal').find('input[name="logType"]').clear().type('Electrical');
    cy.get('@modal').find('input[name="technician"]').clear().type('Somchai Service');
    cy.get('@modal').find('input[name="cost"]').clear().type('150');
    cy.get('@modal').find('input[name="completedDate"]').clear().type(nextDayStr);

    // (4) ตรวจว่าไม่มีข้อความ "กรุณา..." เหลืออยู่
    cy.get('@modal').contains('button', /สร้าง|บันทึก/i).click({ force: true });
    cy.contains(/^กรุณา/).should('not.exist');

    // ปิด modal (ไม่ save จริง)
    safeCloseModal('@modal');
  });

  // ────────────────────────────────
  it('4️ สลับแท็บ "ตารางซ่อมบำรุง" และกดข้ามได้', () => {
    cy.contains('ตารางซ่อมบำรุง').click();
    

    cy.contains('.nav-link.active', 'ตารางซ่อมบำรุง').should('exist');

    cy.get('table thead').within(() => {
      cy.contains(/งาน|ความถี่|ครั้งถัดไป/i).should('exist');
    });

    cy.get('table tbody tr').first().within(() => {
      cy.contains('button', /ข้ามครั้งนี้|Skip/i).click({ force: true });
    });
  });
});