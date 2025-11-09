// cypress/e2e/admin/reports.cy.js
// ทดสอบหน้า "รายงานและสถิติการดำเนินงาน" (Reports Page)
// รองรับ frontend ปัจจุบัน ไม่ fix ตัวเลข

describe('Admin Reports Page', () => {
  beforeEach(() => {
    cy.loginPreset(); // login ก่อนทุก test
    cy.visit('/admin/reports');
  });

  it('1 ตรวจ header, คำอธิบาย, ปุ่มส่งออก PDF', () => {
    // cy.contains('รายงาน').should('be.visible');
    cy.contains('รายงานและสถิติการดำเนินงาน').should('be.visible');
    cy.get('button.btn-primary').should('contain.text', 'ส่งออก PDF');
  });

  it('2 ตรวจช่องเลือกช่วงเวลาและเปลี่ยนเดือน', () => {
    cy.contains('เลือกช่วงเวลา').should('be.visible');
    cy.get('input[type="month"]').as('monthInput');
    cy.get('@monthInput').should('exist').and('have.value', '2025-11');

    // เปลี่ยนเดือนเป็นเดือนก่อนหน้า แล้วกลับ
    cy.get('@monthInput').clear().type('2025-10');
    cy.wait(200);
    cy.get('@monthInput').clear().type('2025-11');
  });

  it('3  ตรวจการ์ดสรุปสถิติ (อัตราการเข้าพัก, รายได้รวม, ค่าซ่อมบำรุง, กำไรสุทธิ)', () => {
    const summaryLabels = [
      'อัตราการเข้าพัก',
      'รายได้รวม',
      'ค่าซ่อมบำรุง',
      'กำไรสุทธิ'
    ];

    summaryLabels.forEach(label => {
      cy.contains(label).should('exist');
      cy.contains(label).parent().within(() => {
        cy.get('.fs-4, .fw-bold').should('exist'); // มีตัวเลขหรือสัญลักษณ์แสดงผล
      });
    });
  });

  it('4 ตรวจตารางข้อมูลห้องพัก (มีคอลัมน์ครบและแสดงข้อมูล)', () => {
    cy.contains('ข้อมูลห้องพัก').should('exist');
    cy.get('table').should('exist');
    const headers = ['ห้องพัก', 'ผู้เช่า', 'สถานะ', 'ใช้น้ำ', 'ใช้ไฟฟ้า', 'จำนวนงานซ่อม'];
    headers.forEach(header => cy.contains('th', header).should('exist'));

    // ตรวจแถวในตาราง
    cy.get('tbody tr').should('have.length.greaterThan', 5);
    cy.get('tbody tr').first().within(() => {
      cy.get('td').should('have.length', 6);
    });
  });

  it('5 ตรวจส่วน “ใบแจ้งหนี้”', () => {
    cy.contains('ใบแจ้งหนี้').should('be.visible');
    cy.get('.card').contains('ใบแจ้งหนี้').parent().within(() => {
      cy.get('.card-body').should('exist');
      cy.contains(/ไม่มีข้อมูลใบแจ้งหนี้|ใบแจ้งหนี้/).should('exist');
    });
  });

  it('6 ตรวจส่วน “สัญญาเช่า” และ “งานซ่อมบำรุง”', () => {
    cy.contains('สัญญาเช่า').should('exist');
    cy.get('.card').contains('สัญญาเช่า').parent().within(() => {
      cy.get('.card-body').should('exist');
      cy.contains(/ไม่มีข้อมูลสัญญาเช่า|สัญญาเช่า/).should('exist');
    });

    cy.contains('งานซ่อมบำรุง').should('exist');
    cy.get('.card').contains('งานซ่อมบำรุง').parent().within(() => {
      cy.get('.card-body').should('exist');
      cy.contains(/ไม่มีข้อมูลงานซ่อม|งานซ่อม/).should('exist');
    });
  });

  it('7 ตรวจการ scroll ของตาราง (custom-scroll)', () => {
    cy.get('.custom-scroll').should('exist');
    cy.get('.custom-scroll').first().scrollTo('bottom');
    cy.wait(300);
    cy.get('.custom-scroll').first().scrollTo('top');
  });
});