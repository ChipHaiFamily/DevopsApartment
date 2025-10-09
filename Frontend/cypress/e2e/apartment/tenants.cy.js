// cypress/e2e/admin_tenants_full_flow.cy.js

describe('Full E2E – Admin Tenant Management Page', () => {
    before(() => {
      cy.loginPreset(); //  ใช้ login function ของ Pond
      cy.visit('/admin/tenants');
      cy.viewport(1400, 900);
      cy.contains(/จัดการผู้เช่า/).should('be.visible');
      cy.contains(/จัดการ.*ผู้เช่าและผู้สนใจ/).should('be.visible');
    });
  
    it('verifies header and summary cards', () => {
      cy.get('h3').should('contain', 'จัดการผู้เช่า');
      cy.get('.card.card-soft').should('have.length', 3);
      cy.contains('ผู้เข่าทั้งหมด');
      cy.contains('สัญญาที่ใช้งาน');
      cy.contains('เลิกเช่า');
    });
  
    // it('tests search bar with multiple terms', () => {
    //   const terms = ['Somsak', '0812345678', 'USR-002', 'Chujai'];
  
    //   terms.forEach((term) => {
    //     cy.get('input[placeholder="Search"]').should('exist').clear().type(term);
    //     cy.wait(250);
    //     cy.get('input[placeholder="Search"]').clear().wait(250);
    //   });
    // });
  
    // it('switches filters for gender', () => {
    //   const genderSequence = ['ทุกเพศ', 'ชาย', 'หญิง', 'ทุกเพศ'];
    //   genderSequence.forEach((opt) => {
    //     cy.get('select.form-select').eq(0).should('exist').select(opt, { force: true });
    //     cy.wait(500);
    //   });
    // });
  
    // it('switches filters for status', () => {
    //   const statusSequence = ['ทุกสถานะ', 'กำลังเช่า', 'หมดสัญญา', 'ยกเลิก', 'ทุกสถานะ'];
    //   statusSequence.forEach((opt) => {
    //     cy.get('select.form-select').eq(1).should('exist').select(opt, { force: true });
    //     cy.wait(500);
    //   });
    // });
  
    // it('opens and interacts with tenant creation modal', () => {
    //   // เปิด modal
    //   cy.contains('button', 'สร้างผู้เช่าใหม่', { timeout: 10000 }).should('be.visible').click({ force: true });
    //   cy.get('.modal-content .modal-title').should('contain', 'สร้างผู้เช่าใหม่');
  
    //   // ลองกรอกค่าทั้งหมด
    //   cy.get('input[name="citizenId"]').type('1234567890987');
    //   cy.get('input[name="emergencyContact"]').type('1234567890');
    //   cy.get('input[name="emergencyName"]').type('Yara');
    //   cy.get('input[name="emergencyRelationship"]').type('มารดา');
  
    //   // ลองเลือกผู้ใช้ react-select (ถ้ามี)
    //   cy.get('.css-13cymwt-control').click({ force: true });
    //   cy.get('input[id^="react-select"]').type('Ben{enter}');
  
    //   // ลบค่าออก
    //   cy.get('input[name="citizenId"]').clear();
    //   cy.get('input[name="emergencyContact"]').clear();
    //   cy.get('input[name="emergencyName"]').clear();
    //   cy.get('input[name="emergencyRelationship"]').clear();
  
    //   // ปิด modal ด้วยปุ่ม “ยกเลิก” หรือ “ปิด”
    //   cy.contains('button', 'ยกเลิก').click({ force: true });
    //   cy.wait(500);
    //   cy.get('.modal-content').should('not.exist');
    // });
  
    // it('opens tenant detail modals for first 3 rows and closes them', () => {
    //   cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 3);
  
    //   // loop แถว 0, 1, 2
    //   for (let i = 0; i < 3; i++) {
    //     cy.get('table tbody tr').eq(i).within(() => {
    //       cy.get('button.btn-sm i.bi-search').click({ force: true });
    //     });
  
    //     // ตรวจว่ามี modal รายละเอียดขึ้นมา
    //     cy.get('.modal-content .modal-title', { timeout: 10000 })
    //       .should('contain', 'รายละเอียดผู้เช่า');
  
    //     // ตรวจว่ามี input ข้อมูล เช่น รหัสผู้เช่า
    //     cy.get('.modal-body input[readonly]').should('exist');
  
    //     // ปิด modal
    //     cy.contains('button', 'ปิด').click({ force: true });
    //     cy.wait(500);
    //     cy.get('.modal-content').should('not.exist');
    //   }
    // });
  });