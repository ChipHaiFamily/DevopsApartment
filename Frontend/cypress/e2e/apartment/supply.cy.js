// cypress/e2e/admin/supply.cy.js
// (AdminSupplyPage)

const openModal = () =>
    cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();
  
  const closeModal = (alias) => {
    cy.get(alias)
      .find('.btn-outline-secondary, .btn-close, button:contains("ยกเลิก"), button:contains("ปิด")')
      .first()
      .click({ force: true });
    cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
  };
  
  describe('Admin Supply Page', () => {
    beforeEach(() => {
      cy.loginPreset();
      cy.visit('/admin/supply');
      cy.contains('คลังสิ่งของ', { timeout: 10000 }).should('be.visible');
    });
  
    // ────────────────────────────────
    it('1 ตรวจ Dashboard และตารางรายการสิ่งของ', () => {
      cy.contains('คลังสิ่งของ').should('be.visible');
      cy.contains('รายการสิ่งของ').should('exist');
      cy.get('table').should('exist');
      cy.contains('ITM-001').should('exist');
      cy.contains('Light bulb').should('exist');
    });
  
    // ────────────────────────────────
    it('2 ค้นหา ITM-002 แล้วสลับ dropdown filter ไปมา', () => {
      cy.get('input[placeholder="Search"]').clear().type('ITM-002');
      cy.contains('td', 'ITM-002', { timeout: 5000 })
        .should('be.visible')
        .parents('tr')
        .within(() => {
          cy.contains('Pen').should('exist');
        });
  
      // สลับ dropdown สถานะ
      cy.get('select.form-select').first().select('ปกติ', { force: true });
      cy.wait(300);
      cy.get('select.form-select').first().select('หมด', { force: true });
      cy.wait(300);
      cy.get('select.form-select').first().select('', { force: true });
  
      cy.get('select.form-select').first().should('have.value', '');
    });
  
    // ────────────────────────────────
    it('3 เปิด "สร้างบันทึกสิ่งของใหม่" แล้วลองกรอกค่าและคืนกลับ', () => {
      cy.contains('button', '+ สร้างบันทึกสิ่งของ').click();
      openModal().as('createModal');
      cy.get('@createModal').should('contain.text', 'สร้างบันทึกสิ่งของ');
  
      // data
      cy.get('@createModal').within(() => {
        cy.get('input[name="item_Name"]').type('Mock Item');
        cy.get('input[name="quantity"]').type('50');
        cy.get('input[name="item_Name"]').should('have.value', 'Mock Item');
        cy.get('input[name="quantity"]').should('have.value', '50');
      });
  
      // คืนค่าเดิม ล้างฟอร์ม
      cy.get('@createModal').within(() => {
        cy.get('input[name="item_Name"]').clear();
        cy.get('input[name="quantity"]').clear();
      });
  
      // ปิดโดยไม่บันทึก
      closeModal('@createModal');
    });
  
    // ────────────────────────────────
    it('4 เปิด "จัดการสิ่งของ" แล้วเปลี่ยนค่าไปมาและคืนเดิม (ไม่บันทึก)', () => {
      // เปิด modal จัดการสิ่งของ (คลิกแว่น ITM-001)
      cy.get('table tbody tr').first().within(() => {
        cy.get('button i.bi-search').parents('button').click({ force: true });
      });
  
      openModal().as('manageModal');
      cy.get('@manageModal').should('contain.text', 'จัดการสิ่งของ');
  
      // เก็บค่าเดิม
      cy.get('@manageModal').find('select[name="action"]').invoke('val').then((oldAction) => {
        cy.log('🔧 action เดิม:', oldAction);
        cy.get('@manageModal').find('select[name="action"]').select('restock', { force: true });
        cy.wait(300);
        cy.get('@manageModal').find('select[name="action"]').select(oldAction, { force: true });
      });
  
      // กรอกจำนวนทดลอง
      cy.get('@manageModal').find('input[name="quantity"]').type('15');
      cy.wait(300);
      cy.get('@manageModal').find('input[name="quantity"]').clear();
  
      // กรอกชื่อผู้ดำเนินการ แล้วคืนค่า
      cy.get('@manageModal').find('input[name="operator"]').type('PondTest');
      cy.wait(300);
      cy.get('@manageModal').find('input[name="operator"]').clear();
  
      // ปิด modal โดยไม่บันทึก
      closeModal('@manageModal');
    });
  
    // ────────────────────────────────
    it('5 สลับแท็บ รายการ ↔ ประวัติ แล้วกลับมาหน้าเดิม', () => {
      cy.contains('button', 'ประวัติ').click({ force: true });
      cy.contains('ประวัติการจัดการสิ่งของ', { timeout: 5000 }).should('be.visible');
      cy.contains('HIT-2025-08-001').should('exist');
  
      // ทดสอบค้นหาในแท็บประวัติ
      cy.get('input[placeholder="Search"]').clear().type('HIT-2025-08-003');
      cy.contains('td', 'HIT-2025-08-003').should('be.visible');
  
      // สลับ dropdown filter ในแท็บประวัติ
      cy.get('select.form-select').eq(0).select('restock', { force: true });
      cy.wait(200);
      cy.get('select.form-select').eq(1).select('Light bulb', { force: true });
      cy.wait(200);
      cy.get('select.form-select').eq(0).select('', { force: true });
      cy.get('select.form-select').eq(1).select('', { force: true });
  
      // กลับแท็บ “รายการ”
      cy.contains('button', 'รายการ').click({ force: true });
      cy.contains('รายการสิ่งของ').should('be.visible');
    });
  });