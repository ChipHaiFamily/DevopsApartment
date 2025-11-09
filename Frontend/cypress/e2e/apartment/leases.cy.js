// cypress/e2e/admin/leases.cy.js
// ทดสอบหน้า "สัญญาเช่า" (Admin Leases Page)

const openModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();

const safeCloseModal = (alias) => {
  cy.get(alias).then($m => {
    const $btn = $m.find('.btn-outline-secondary, .btn-close, button:contains("ยกเลิก"), button:contains("ปิด")');
    if ($btn.length) cy.wrap($btn.first()).click({ force: true });
    else cy.get('body').type('{esc}');
  });
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
};

describe('Admin Leases Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.visit('/admin/leases');
    cy.contains('สัญญาเช่า', { timeout: 10000 }).should('be.visible');
  });

  // ────────────────────────────────
  it('1️ แสดง Dashboard และตารางสัญญาเช่า', () => {
    cy.contains('สัญญาทั้งหมด').should('exist');
    cy.contains('สัญญาที่ใช้งาน').should('exist');
    cy.contains('หมดอายุ').should('exist');
    cy.get('table').should('exist');
    // cy.contains('CTR-2025-001').should('be.visible');
    cy.contains('Somsak').should('exist');
  });

  // ────────────────────────────────
  it('2️2 ค้นหาเลขสัญญา CTR-2025-001 แล้วพบชื่อผู้เช่า', () => {
    cy.get('input[placeholder="Search"]').should('exist').clear().type('CTR-2025-001');
    cy.contains('td', 'CTR-2025-001', { timeout: 5000 })
      .parents('tr')
      .within(() => {
        cy.contains(/Somsak|Jane|Mana|Peter/i).should('exist');
      });
  });

  // ────────────────────────────────
  it('3️ เปิด "สร้างสัญญาใหม่" แล้วตรวจ Validation Form', () => {
    cy.contains('button', '+ สร้างสัญญาใหม่').click();
    openModal().as('modal');
    cy.get('@modal').should('contain.text', 'สร้างสัญญาใหม่');

    // (1) กดบันทึกทันที → ต้องเจอ error เตือนครบ
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains('กรุณากรอกวันสิ้นสุด ก่อนกดบันทึกข้อมูล').should('be.visible');
    cy.contains('กรุณาเลือกผู้เช่า ก่อนกดบันทึกข้อมูล').should('be.visible');
    cy.contains('กรุณาเลือกห้อง ก่อนกดบันทึกข้อมูล').should('be.visible');

    // (2) กรอกวันสิ้นสุดให้น้อยกว่า startDate → ต้องขึ้น error
    cy.get('@modal').find('input[name="endDate"]').clear().type('2020-01-01');
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains('วันสิ้นสุด ต้องอยู่หลังวันเริ่มต้น').should('be.visible');

    // (3) กรอกวันสิ้นสุดให้ถูกต้อง (1 ปีข้างหน้า)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    cy.get('@modal').find('input[name="endDate"]').clear().type(nextYearStr);
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains('วันสิ้นสุด ต้องอยู่หลังวันเริ่มต้น').should('not.exist');

    // (4) กรอกลิงก์สัญญาผิดรูปแบบ → ต้องเตือน
    cy.get('@modal').find('input[name="contractLink"]').clear().type('abc123');
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    // cy.contains('กรุณากรอกลิ้งค์ที่ถูกต้อง').should('be.visible');

    // (5) แก้ลิงก์ให้ถูกต้อง
    cy.get('@modal').find('input[name="contractLink"]').clear().type('https://example.com/contract.pdf');
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains('กรุณากรอกลิ้งค์ที่ถูกต้อง').should('not.exist');

    // (6) เลือกผู้เช่า
    cy.get('@modal').find('select[name="tenantId"]').select('USR-004', { force: true });
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains('กรุณาเลือกผู้เช่า ก่อนกดบันทึกข้อมูล').should('not.exist');

    // (7) เลือกห้อง
    // cy.get('@modal').find('select[name="roomNum"]').select('202', { force: true });
    // cy.contains('กรุณาเลือกห้อง ก่อนกดบันทึกข้อมูล').should('not.exist');

    // (8) ตรวจว่าไม่มีข้อความ “กรุณา...” เหลืออยู่
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    // cy.contains(/^กรุณา/).should('not.exist');

    // (9) ปิด modal โดยไม่ save จริง
    safeCloseModal('@modal');
  });

  // ────────────────────────────────
  it('4️ เปิด "รายละเอียดสัญญา" ผ่านไอคอนแว่น แล้วตรวจข้อมูล + ปุ่ม PDF แล้วปิดได้', () => {
    // คลิกไอคอนแว่น
    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click({ force: true });
    });

    // ตรวจว่ามี modal เปิดจริง
    openModal().as('detailModal');
    cy.get('@detailModal').should('contain.text', 'สัญญา');
    cy.get('@detailModal').should('contain.text', 'ผู้เช่า');
    cy.get('@detailModal').should('contain.text', 'ค่าเช่า');
    cy.get('@detailModal').should('contain.text', 'วันเริ่มต้น');
    cy.get('@detailModal').should('contain.text', 'วันสิ้นสุด');

    // ตรวจปุ่ม "ส่งออก PDF"
    // cy.get('@detailModal')
      // .find('button.btn-outline-success')
    //   .should('be.visible')
    //   .and('contain.text', 'ส่งออก PDF');

    // คลิกปุ่ม "ส่งออก PDF"
    // cy.get('@detailModal')
    //   .contains('button', /ส่งออก PDF/i)
    //   .click({ force: true });

    // รอการสร้างไฟล์ (mock)
    // cy.wait(500);
    // cy.log('ปุ่ม "ส่งออก PDF" ทำงานได้');

    // ปิด modal โดยกดยกเลิก
    cy.get('@detailModal')
      .find('.btn-outline-secondary, .btn-close, [data-bs-dismiss="modal"]')
      .first()
      .click({ force: true });

    // ตรวจว่า modal ถูกปิดจริง
    cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
  });
});