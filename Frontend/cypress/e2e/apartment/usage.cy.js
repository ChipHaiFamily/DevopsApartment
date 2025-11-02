// cypress/e2e/admin/usage.cy.js
// ทดสอบหน้า "การใช้น้ำและไฟฟ้า" (AdminUsagePage)

const openModal = () =>
    cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();
  
  const closeModal = (alias) => {
    cy.get(alias)
      .find('.btn-outline-secondary, .btn-close, button:contains("ยกเลิก"), button:contains("ปิด")')
      .first()
      .click({ force: true });
    cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
  };
  
  describe('⚡ AdminUsagePage', () => {
    beforeEach(() => {
      // ล็อกอินก่อนทุกครั้ง
      cy.loginPreset();
  
      // ไปยังหน้า /admin/usage หลังล็อกอิน
      cy.visit('/admin/usage');
  
      // รอให้โหลด Dashboard สำเร็จ
      cy.contains('การใช้น้ำและไฟฟ้า', { timeout: 10000 }).should('be.visible');
      cy.contains('บันทึกการใช้น้ำและไฟฟ้า').should('exist');
    });
  
    // ────────────────────────────────
    it('1️ แสดง Dashboard และตารางการใช้น้ำ/ไฟฟ้า', () => {
      cy.contains('การใช้น้ำรวมเดือนนี้').should('exist');
      cy.contains('การใช้ไฟฟ้ารวมเดือนนี้').should('exist');
      cy.contains('ค่าน้ำต่อหน่วย').should('exist');
      cy.contains('ค่าไฟฟ้าต่อหน่วย').should('exist');
  
      cy.get('table').should('exist');
      cy.contains('MTR-2025-10-105-01').should('be.visible');
    });

      // ────────────────────────────────
  it('2️ ค้นหา "MTR-2025-10-105-02" แล้วเจอข้อมูล และสลับ dropdown filter ไปมา', () => {
    // 🔍 พิมพ์ค้นหา
    cy.get('input[placeholder="Search"]').should('exist').clear().type('MTR-2025-10-105-02');
    cy.contains('td', 'MTR-2025-10-105-02', { timeout: 5000 })
      .should('be.visible')
      .parents('tr')
      .within(() => {
        cy.contains('105').should('exist');
        cy.contains('ไฟฟ้า').should('exist');
        cy.contains('2025-10').should('exist');
      });

    // ทดสอบสลับ Dropdown Filter ไปมา

    // ห้อง
    cy.get('select.form-select').eq(0).select('105', { force: true });
    cy.wait(100);
    cy.get('select.form-select').eq(0).select('101', { force: true });
    cy.wait(100);
    cy.get('select.form-select').eq(0).select('102', { force: true });
    cy.wait(100);
    cy.get('select.form-select').eq(0).select('107', { force: true });
    cy.wait(300);
    cy.get('select.form-select').eq(0).select('', { force: true });

    // ประเภท
    cy.get('select.form-select').eq(1).select('น้ำ', { force: true });
    cy.wait(300);
    cy.get('select.form-select').eq(1).select('ไฟฟ้า', { force: true });
    cy.wait(300);
    cy.get('select.form-select').eq(1).select('', { force: true });

    // รอบบิล
    cy.get('select.form-select').eq(2).select('2025-10', { force: true });
    cy.wait(300);
    cy.get('select.form-select').eq(2).select('2025-08', { force: true });
    cy.wait(300);
    cy.get('select.form-select').eq(2).select('', { force: true });

    //  ตรวจว่า dropdown กลับเป็นค่า default (ว่าง) ทั้งหมด
    cy.get('select.form-select').eq(0).should('have.value', '');
    cy.get('select.form-select').eq(1).should('have.value', '');
    cy.get('select.form-select').eq(2).should('have.value', '');
  });
  
    // ────────────────────────────────
    it('3 เปิด "ตั้งค่าราคาต่อหน่วย" แล้วลองแก้ไขค่าและคืนกลับเดิม', () => {
      cy.contains('button', 'ตั้งค่าราคาต่อหน่วย').click();
      openModal().as('settingModal');
  
      cy.get('@settingModal').should('contain.text', 'แก้ไขค่าน้ำ/ค่าไฟต่อหน่วย');
  
      // เก็บและเปลี่ยนราคาน้ำ
      cy.get('@settingModal').find('input[type="number"]').first().invoke('val').then((waterRate) => {
        cy.log(' ราคาน้ำเดิม: ' + waterRate);
        cy.get('@settingModal').find('input[type="number"]').first().clear().type('9');
        cy.wait(300);
        cy.get('@settingModal').find('input[type="number"]').first().clear().type(waterRate);
      });
  
      // ⚡ เก็บและเปลี่ยนราคาไฟ
      cy.get('@settingModal').find('input[type="number"]').eq(1).invoke('val').then((electricRate) => {
        cy.log('⚡ ค่าไฟเดิม: ' + electricRate);
        cy.get('@settingModal').find('input[type="number"]').eq(1).clear().type('15');
        cy.wait(300);
        // cy.get('@settingModal').find('input[type="number"]').eq(1).clear().type(electricRate);
      });
  
      // ปิด modal โดยไม่บันทึกจริง
      closeModal('@settingModal');
    });
  
    // ────────────────────────────────
    it('4 เปิด "สร้างบันทึกใหม่" แล้วกรอกค่าทดลอง + คืนค่าเดิม', () => {
      cy.contains('button', '+ สร้างบันทึกใหม่').click();
      openModal().as('createModal');
      cy.get('@createModal').should('contain.text', 'บันทึกการใช้น้ำ/ไฟฟ้า');
  
      // กรอก mock ข้อมูล
      cy.get('@createModal').within(() => {
        cy.get('select[name="room"]').select('105', { force: true });
        cy.get('input[name="period"]').type('2025-11');
        cy.get('input[name="recordDate"]').clear().type('2025-11-02');
        cy.get('select[name="type"]').select('น้ำ', { force: true });
        cy.get('input[name="unit"]').clear().type('99.5');
      });
  
      // ตรวจว่ากรอกสำเร็จ
      cy.get('@createModal').find('input[name="unit"]').should('have.value', '99.5');
  
      // ล้างค่า (คืนสภาพ)
      cy.get('@createModal').within(() => {
        cy.get('select[name="room"]').select('', { force: true });
        cy.get('input[name="period"]').clear();
        cy.get('input[name="unit"]').clear();
      });
  
      // ปิด modal
      closeModal('@createModal');
    });
  
    // ────────────────────────────────
    it('5 เปิด "แก้ไขบันทึก" จากแถวแรก → แก้ไขค่า + คืนเดิม (ไม่บันทึก)', () => {
      // คลิกไอคอนแว่นในแถวแรก
      cy.get('table tbody tr').first().within(() => {
        cy.get('button i.bi-search').parents('button').click({ force: true });
      });
  
      // ตรวจ modal
      openModal().as('editModal');
      cy.get('@editModal').should('contain.text', 'แก้ไขบันทึกการใช้น้ำ/ไฟฟ้า');
  
      // เก็บค่าเดิมของ "การใช้งาน (หน่วย)"
      cy.get('@editModal').find('input[name="unit"]').invoke('val').then((oldValue) => {
        cy.log('🔹 ค่าเดิม: ' + oldValue);
  
        // แก้ไขเป็น mock
        cy.get('@editModal').find('input[name="unit"]').clear().type('123.4');
        cy.get('@editModal').find('input[name="unit"]').should('have.value', '123.4');
  
        // คืนค่าเดิม
        cy.get('@editModal').find('input[name="unit"]').clear().type(oldValue);
        cy.get('@editModal').find('input[name="unit"]').should('have.value', oldValue);
      });
  
      // ปิด modal โดยไม่กดบันทึก
      closeModal('@editModal');
    });
  });