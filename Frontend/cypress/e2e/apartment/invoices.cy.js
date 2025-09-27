describe('Admin Invoices Page', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit('http://localhost:3000/admin/invoices');
  });

  it('renders summary cards and table', () => {
    cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
    cy.contains('ใบแจ้งหนี้และการชำระเงิน').should('be.visible');

    // cards summary
    cy.contains('รายได้รวม').should('be.visible');
    cy.contains('รอชำระ').should('be.visible');
    cy.contains('บิลทั้งหมด').should('be.visible');
    cy.contains('เกินกำหนด').should('be.visible');

    // table
    cy.contains('รายการทั้งหมด').should('be.visible');
    cy.get('input[placeholder="Search"]').should('exist');
    cy.get('table', { timeout: 8000 }).should('exist');

    // หัวคอลัมน์หลัก
    ['เลขที่ใบแจ้งหนี้','ห้อง','งวด','ผู้เช่า','ยอดรวม','กำหนดชำระ','สถานะ']
      .forEach(h => cy.contains('th', h).should('be.visible'));

    // at least 1 row
    cy.get('table tbody tr').its('length').should('be.greaterThan', 0);
  });

  it('supports searching by invoice no, tenant, and room 107', () => {
    // ===== ค้นหา: เลขที่ใบแจ้งหนี้ =====
    cy.get('input[placeholder="Search"]').clear().type('INV-06-001');
    cy.contains('td', 'INV-06-001', { timeout: 8000 }).should('be.visible');
    
    cy.get('table tbody tr:visible').its('length').should('be.lte', 2); // header + 1 row

    // ===== ค้นหา: ผู้เช่า (ตัวอย่างจากภาพ) =====
    cy.get('input[placeholder="Search"]').clear().type('Somsak Jaidee');
    cy.contains('td', 'Somsak Jaidee', { timeout: 8000 }).should('be.visible');

    cy.get('input[placeholder="Search"]').clear().type('Jane Smith');
    cy.contains('td', 'Jane Smith', { timeout: 8000 }).should('be.visible');

    // ===== ค้นหา: ห้อง 107 =====
    cy.get('input[placeholder="Search"]').clear().type('107');
    // ควรเห็น "ห้อง" มี 107
    cy.get('table tbody tr:visible').should($rows => {
      const has107 = [...$rows].some(r => r.innerText.includes('107'));
      expect(has107, 'at least one row with room 107').to.be.true;
    });
  });
});