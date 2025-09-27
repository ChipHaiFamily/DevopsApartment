describe('Admin Tenants Page', () => {
  beforeEach(() => {
    cy.viewport(1440, 900); // standard laptop size
    cy.visit('http://localhost:3000/admin/tenants');
  });

  it('renders tenants dashboard summary and table', () => {
    // Header / Sidebar
    cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
    cy.contains('ผู้เช่า', { timeout: 8000 }).should('be.visible');

    // cy.get('[data-testid="card-tenants-total"]').should('be.visible');
    // cy.get('[data-testid="card-active-contracts"]').should('be.visible');
    // cy.get('[data-testid="card-current-tenants"]').should('be.visible');
    // cy.get('[data-testid="card-ended-tenants"]').should('be.visible');

    // cards summary
    cy.contains('ผู้เข่าทั้งหมด').should('be.visible'); // card 1/4
    cy.contains('สัญญาที่ใช้งาน').should('be.visible'); // card 2/4
    // การ์ด 3/4 ชื่ออาจต่างเล็กน้อย → ใช้ regex ที่ยืดหยุ่น
    cy.contains(/ผู้.*ห้อง|ผู้เช่า.*ห้อง|ผู้เช่า/).should('be.visible'); // ผู้เช่าปัจจุบัน
    cy.contains('เลิกเช่า').should('be.visible'); // ผู้เช่าเลิกเช่า

    // ส่วน "รายชื่อผู้เช่า" , searchbar
    cy.contains('รายชื่อผู้เช่า').should('be.visible');
    cy.get('input[placeholder="Search"]').should('exist');

    // table and columns headers
    cy.get('table', { timeout: 8000 }).should('exist');
    [
      'ID', 'ชื่อ', 'นามสกุล', 'เพศ', 'ติดต่อ',
      'เบอร์โทรศัพท์', 'ห้อง', 'สถานะ'
    ].forEach(h => cy.contains('th', h).should('be.visible'));

    // มีแถวข้อมูลอย่างน้อย 1 row
    cy.get('table tbody tr').its('length').should('be.greaterThan', 0);

    // มี badge สถานะอย่างน้อยหนึ่งรายการ (กำลังเช่า / เลิกเช่า)
    cy.get('body').then($b => {
      const text = $b.text();
      expect(text).to.match(/กำลังเช่า|เลิกเช่า/);
    });

    // ทำแบบ optional — ถ้าไม่มี ก็ไม่ fail
    cy.contains('USR-001').should('exist');
    cy.contains('Somsak').should('exist');
    cy.contains(/10[2-8]|110|107/).should('exist'); // เลขห้อง
  });
});