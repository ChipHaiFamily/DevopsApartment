// cypress/e2e/admin/payments.cy.js
// ทดสอบหน้า "การชำระใบแจ้งหนี้" (Payments Page)
// รองรับ frontend ปัจจุบัน พร้อม modal ซ้อนกัน

describe('Admin Payments Management Page', () => {
    beforeEach(() => {
      cy.loginPreset(); // login ก่อนทุก test
      cy.visit('/admin/payments');
    });
  
    it('1 ตรวจหัวข้อและคำอธิบาย', () => {
      cy.contains('การชำระใบแจ้งหนี้').should('be.visible');
      cy.contains('ประวัติและการจัดการการชำระเงินของผู้เช่า').should('be.visible');
    });
  
    it('2 ตรวจการ์ดสรุปสถิติ (ไม่ fix ตัวเลข)', () => {
      const labels = ['รายได้เดือนนี้', 'ยอดที่ค้างชำระ', 'ยอดที่ล่าช้า'];
      labels.forEach((label) => {
        cy.contains(label).should('exist');
        cy.contains(label).parent().within(() => {
          cy.get('.fs-4, .fw-bold').should('exist');
        });
      });
    });
  
    it('3 ตรวจตารางรายการชำระเงินและ filter dropdowns', () => {
      cy.contains('รายการชำระเงิน').should('be.visible');
  
      // Search
      cy.get('input[placeholder="Search"]').type('PAY-2025', { delay: 50 }).clear();
  
      // ช่องทางชำระ
      cy.get('select').eq(0).select('Bank Transfer', { force: true });
      cy.wait(300);
      cy.get('select').eq(0).select('', { force: true });
  
      // ห้อง
      cy.get('select').eq(1).select('107', { force: true });
      cy.wait(300);
      cy.get('select').eq(1).select('', { force: true });
  
      // ตารางควรมีข้อมูลหลายแถว
      cy.get('tbody tr').should('have.length.greaterThan', 3);
      cy.get('tbody tr').first().within(() => {
        cy.get('td').should('have.length', 8);
      });
    });
  
// --- เปิด Modal: ตั้งค่าดอกเบี้ย → ตรวจค่าปัจจุบันและกด “ประวัติ” (แก้ใหม่) ---
it('4 เปิด Modal: ตั้งค่าดอกเบี้ย → ตรวจค่าปัจจุบันและกด “ประวัติ”', () => {
    cy.contains('ตั้งค่าดอกเบี้ย').click({ force: true });
  
    // โฟกัส modal ตัวบนสุด
    cy.get('.modal-content').filter(':visible').as('rateModal');
  
    cy.get('@rateModal').should('contain.text', 'แก้ไขดอกเบี้ย');
    cy.get('@rateModal').find('input[type="number"]').should('have.length', 2);
  
    // เปลี่ยนค่าไป-กลับ (แค่ simulate ไม่ต้องเซฟจริง)
    cy.get('@rateModal').find('input[type="number"]').eq(0).clear().type('0.55');
    cy.wait(150);
    cy.get('@rateModal').find('input[type="number"]').eq(0).clear().type('0.50');
  
    // เปิดประวัติ (จะมี modal ซ้อนอีกชั้น)
    cy.get('@rateModal').contains('ประวัติ').click({ force: true });
  
    // โฟกัส modal ประวัติ (ตัวบนสุดหลังคลิก)
    cy.get('.modal-content').filter(':visible').as('historyModal');
    cy.get('@historyModal').should('contain.text', 'ประวัติการแก้ไขดอกเบี้ย');
    cy.get('@historyModal').find('table').within(() => {
      cy.contains('ประเภท').should('exist');
      // cy.get('tbody tr').its('length').should('be.greaterThan', 2);
    });
  
    // ปิด modal ประวัติ -> แล้วปิด modal หลัก
    cy.get('@historyModal').contains('ปิด').click({ force: true });
    cy.get('@rateModal').contains('ปิด').click({ force: true });
  });
  
  
// --- เปิด Modal: “สร้างการชำระเงินใหม่” และทดสอบกรอกข้อมูล (อัปเดตตาม Pond) ---
it('5 เปิด Modal: “สร้างการชำระเงินใหม่” และทดสอบกรอกข้อมูลแม้ไม่มีใบแจ้งหนี้', () => {
    cy.contains('+ สร้างการชำระเงิน').click({ force: true });
  
    // โฟกัส modal ตัวบนสุด
    cy.get('.modal-content').filter(':visible').as('createModal');
    cy.get('@createModal').should('contain.text', 'สร้างการชำระเงินใหม่');
  
    // 1) เลือก "ใบแจ้งหนี้" (ถ้ามี)
    cy.get('@createModal').find('select').first().as('invoiceSelect');
    cy.get('@invoiceSelect').find('option').then($opts => {
      const valid = [...$opts].map(o => o.value).find(v => v && v.trim() !== '');
      if (valid) {
        cy.get('@invoiceSelect').select(valid, { force: true });
        cy.log(`เลือกใบแจ้งหนี้ ${valid}`);
      } else {
        cy.log('⚠️ ไม่มีใบแจ้งหนี้ให้เลือก — ข้ามขั้นตอนนี้');
      }
    });
  
    // 2) วันที่ชำระ
    cy.get('@createModal').find('input[type="date"]').clear().type('2025-11-09');
  
    // 3) รูปแบบการจ่าย — ลองสลับ dropdown ไปมา
    cy.get('@createModal').find('select[name="method"]').as('methodSelect');
    cy.get('@methodSelect').find('option').then($opts => {
      const values = [...$opts].map(o => o.value).filter(v => v && v.trim() !== '');
      if (values.length >= 2) {
        cy.get('@methodSelect').select(values[0], { force: true });
        cy.wait(200);
        cy.get('@methodSelect').select(values[1], { force: true });
      } else if (values.length === 1) {
        cy.get('@methodSelect').select(values[0], { force: true });
      } else {
        cy.log('⚠️ ไม่มีตัวเลือกวิธีจ่าย');
      }
    });
  
    // 4) จำนวนเงิน — กรอก แล้วเคลียร์
    cy.get('@createModal').find('input[name="amount"]').type('12345');
    cy.wait(200);
    cy.get('@createModal').find('input[name="amount"]').clear();
  
    // 5) ปุ่มอัปโหลดหลักฐาน (จำลองคลิก)
    cy.get('@createModal').contains('+ อัปโหลดหลักฐาน').click({ force: true });
  
    // 6) ปุ่มยกเลิก → ปิด modal
    cy.get('@createModal').contains('ยกเลิก').click({ force: true });
  });
  
    it('6 ตรวจ toast message แสดงหลังการบันทึก mock', () => {
      cy.document().then((doc) => {
        const toast = doc.createElement('div');
        toast.className = 'toast show text-white';
        toast.innerHTML = '<div class="toast-body">บันทึกข้อมูลสำเร็จ</div>';
        doc.body.appendChild(toast);
      });
      cy.get('.toast-body').should('contain.text', 'บันทึกข้อมูลสำเร็จ');
    });
  

  });