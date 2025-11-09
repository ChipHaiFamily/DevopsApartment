// cypress/e2e/admin/invoices.cy.js
// รองรับ modal bootstrap + react + field disabled

//  หา modal แรกที่เปิดอยู่
const getOpenModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 10000 }).first();

//  ปิด modal แบบ fallback
const safeCloseModal = (modalAlias) => {
  cy.get(modalAlias).then($m => {
    // 1) ปุ่ม X
    const $x = $m.find('.btn-close');
    if ($x.length) {
      cy.wrap($x.first()).click({ force: true });
      return;
    }
    // 2) ปุ่มยกเลิก / ปิด
    const closeTexts = ['ยกเลิก', 'ปิด', 'Close', 'Cancel'];
    for (const label of closeTexts) {
      const $btn = $m.find(`button:contains(${label})`);
      if ($btn.length) {
        cy.wrap($btn.first()).click({ force: true });
        return;
      }
    }
    // 3) กัน error ให้ กด ESC แทน
    cy.get('body').type('{esc}', { force: true });
  });

  // หลังปิดแล้วห้ามใช้ alias เดิม เช็กจาก DOM ตรงๆ แทน
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible')
    .should('not.exist');
};

describe(' Admin Invoices Page (fixed disabled + close)', () => {
  beforeEach(() => { 
    cy.loginPreset();
    cy.visit('/admin/invoices');
    cy.contains('ใบแจ้งหนี้', { timeout: 10000 }).should('be.visible');
  });

  // 1) เช็กหน้า
  it('1️ แสดง dashboard + ตารางบิล', () => {
    cy.contains('รายได้รวม').should('exist');
    cy.contains('ใบแจ้งหนี้').should('exist');
    cy.contains('INV-2025-06-001').should('exist');
  });

  // 2) ค้นหา
  it('2️ ค้นหา INV-2025-06-001 แล้วเจอ Jane Smith', () => {
    cy.get('input[placeholder="Search"]').clear().type('INV-2025-06-001');
    cy.contains('td', 'INV-2025-06-001')
      .parents('tr')
      .within(() => {
        cy.contains(/Jane Smith/i).should('be.visible');
      });
  });

  // 3) สร้าง + validation
  it('3️ เปิด "สร้างใบแจ้งหนี้ใหม่" แล้วตรวจ Validation', () => {
    cy.contains('button', '+ สร้างใบแจ้งหนี้ใหม่').click();

    getOpenModal().as('modal');
    // cy.get('@modal').should('contain.text', 'ใบแจ้งหนี้').or('contain.text', 'สร้างใบแจ้งหนี้');

    // 3.1 กดบันทึกเปล่า → ต้องมี error
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });

    // ข้อความ error อาจขึ้นเป็น <small> หรือ <div> → ใช้ contains เอา
    cy.contains(/กรุณากรอกวันกำหนดชำระ/i).should('be.visible');
    cy.contains(/กรุณาเลือกผู้เช่า/i).should('be.visible');

    // 3.2 ช่องกำหนดชำระตอนนี้อาจถูก disable → ต้องแก้แบบเงื่อนไข
    const next7 = new Date();
    next7.setDate(next7.getDate() + 7);
    const next7Str = next7.toISOString().split('T')[0];

    cy.get('@modal').find('input[name="dueDate"]').then($el => {
      if ($el.is(':disabled')) {
        // ถ้ามันถูก disable ให้ลองโฟกัส/คลิกที่ modal ก่อน 1 ที (บางโปรเจ็กต์ enable หลังมี tenant)
        // → เลือกผู้เช่าก่อน แล้วค่อยกรอก dueDate
        cy.get('@modal')
          .find('select[name="tenantId"]', { timeout: 5000 })
          .should('be.visible')
          .select('USR-004', { force: true }); // Peter Kong

        // ตอนนี้ลองกรอกใหม่อีกรอบ
        cy.get('@modal')
          .find('input[name="dueDate"]', { timeout: 5000 })
          .should('not.be.disabled')
          .clear()
          .type(next7Str);
      } else {
        // ไม่ได้ disabled → กรอกได้เลย
        cy.wrap($el).clear().type(next7Str);
      }
    });

    // 3.3 เพิ่มรายการ แล้วกรอกช่องแรกเท่านั้น (เมื่อกี้มันเจอ 4 element)
    cy.get('@modal').contains('+ เพิ่มรายการ').click({ force: true });
    cy.wait(200);

    // หา input จำนวนเงินแถวแรกจริงๆ
    cy.get('@modal')
      .find('input[placeholder="จำนวนเงิน"]')
      .first()
      .clear()
      .type('150');

    // ถ้ามีช่องคำอธิบายแบบพิมพ์ได้ (ไม่ readonly) ก็กรอก
    cy.get('@modal')
      .find('input[placeholder="กรอกรายละเอียดค่าใช้จ่ายอื่น ๆ"]')
      .then($els => {
        const editable = [...$els].find(el => !el.hasAttribute('readonly'));
        if (editable) {
          cy.wrap(editable).clear().type('ค่าบำรุงรักษา');
        }
      });

    // 3.4 ถ้ายังไม่ได้เลือกผู้เช่า (ในกรณีบนไม่ได้เข้าเงื่อนไข disabled)
    cy.get('@modal')
      .find('select[name="tenantId"]')
      .then($sel => {
        const val = $sel.val();
        if (!val) {
          cy.wrap($sel).select('USR-004', { force: true });
        }
      });

    // 3.5 กดบันทึกอีกที ไม่ควรมีข้อความ “กรุณา...” เหลือแล้ว
    cy.get('@modal').contains('button', 'บันทึก').click({ force: true });
    cy.contains(/^กรุณา/).should('not.exist');

    // ปิด modal แบบ safe
    safeCloseModal('@modal');
  });

  // 4) รายละเอียดใบแจ้งหนี้
  it('4️⃣ เปิด "รายละเอียดใบแจ้งหนี้" แล้วปิดได้', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click({ force: true });
    });

    getOpenModal().as('detailModal');

    cy.get('@detailModal').should('contain.text', 'รายละเอียดใบแจ้งหนี้');
    cy.get('@detailModal').should('contain.text', 'กำหนดชำระ');
    // ใน UI จริงไม่มีคำว่า "ยอดรวม" แต่มี "รวม" ในตาราง เปลี่ยน assert
    cy.get('@detailModal').should('contain.text', 'รวม');
    cy.get('@detailModal').contains(/[฿]?\s?\d[\d,]*(\.\d+)?/).should('exist');

    // save pdf (มีจริงใน UI)
    cy.get('@detailModal')
      .contains('button', /Save as PDF/i)
      .scrollIntoView()
      .click({ force: true });

    // ⚠️ สำคัญ: หลังจากนี้ห้ามใช้ @detailModal อีก ให้ปิดด้วยฟังก์ชัน
    safeCloseModal('@detailModal');
  });

  // 5) ส่งออกหลายชุด
  it('5️⃣ เปิด "ส่งออกใบแจ้งหนี้หลายชุด" แล้วปิดได้', () => {
    cy.contains('button', 'ส่งออกหลายชุด').click();
    getOpenModal().as('bulkModal');

    cy.get('@bulkModal').should('contain.text', 'ส่งออกใบแจ้งหนี้หลายชุด');
    cy.get('@bulkModal').find('input[id^="react-select"]').should('exist');

    // ปิด modal แล้วค่อย assert ว่าหาย
    safeCloseModal('@bulkModal');
  });
});