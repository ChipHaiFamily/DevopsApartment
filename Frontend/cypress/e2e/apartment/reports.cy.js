// cypress/e2e/admin/reports.cy.js
describe('Admin Reports Page', () => {
  beforeEach(() => {
    cy.loginPreset(); // login ก่อนทุก test
    cy.visit('/admin/reports');
  });

  it('should display reports dashboard correctly', () => {
    // ตรวจสอบ heading หลัก
    cy.contains(/รายงาน|Reports/i).should('be.visible');

    // ตรวจสอบ cards หลัก
    cy.contains(/อัตราการเข้าพัก|Occupancy/i).should('be.visible');
    cy.contains(/รายได้รวม|Revenue/i).should('be.visible');
    cy.contains(/ค่าส่วนบำรุง|Maintenance Cost/i).should('be.visible');
    cy.contains(/กำไรสุทธิ|Net Profit/i).should('be.visible');

    // ตรวจสอบ section ย่อย
    cy.contains(/รายได้|This Month/i).should('be.visible');
    cy.contains(/อัตราการเข้าพัก|Room Performance/i).should('be.visible');
    cy.contains(/งานซ่อมบำรุง|Maintenance/i).should('be.visible');
  });

  it('should click export buttons (CSV and PDF)', () => {
    // ปุ่มส่งออก CSV
    cy.contains('button', /ส่งออก CSV|Export CSV/i)
      .should('be.visible')
      .click({ force: true });

    // ปุ่มส่งออก PDF
    cy.contains('button', /ส่งออก PDF|Export PDF/i)
      .should('be.visible')
      .click({ force: true });

    
  });
});