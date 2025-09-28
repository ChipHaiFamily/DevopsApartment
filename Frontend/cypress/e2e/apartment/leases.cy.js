describe('Admin Leases Page', () => {
  beforeEach(() => {
    cy.loginPreset();   // 👈 login ก่อนทุก test
    cy.visit('/admin/leases');
  });

  it('renders leases summary, filters, and table', () => {
    // Header/Sidebar
    cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
    cy.contains('สัญญาเช่า').should('be.visible');

    // ปุ่มมุมขวา
    cy.contains('สร้างสัญญาใหม่').should('be.visible');


    // card
    cy.contains('สัญญาทั้งหมด').should('be.visible');
    cy.contains('สัญญาที่ใช้งาน').should('be.visible');
    cy.contains('หมดอายุ').should('be.visible');

    // กล่อง สัญญาเช่า search filter
    cy.contains('สัญญาเช่า').should('be.visible'); // heading
    cy.get('input[placeholder="Search"]').should('exist'); // search

    
    // filter 
    cy.contains('ทุกชั้น').should('be.visible'); // ทุกชั้น
    cy.contains(/ทุกวง|ทุกว\b/).should('be.visible'); // ทุกวงรบิล / ทุกวงบิล
    cy.contains('ทุกสถานะ').should('be.visible'); // ทุกสถานะ

    // table and columns
    // cy.get('table', { timeout: 8000 }).should('exist');
    // [
    //   'สัญญาเลขที่',
    //   'ห้อง',
    //   'ผู้เช่า',
    //   'วงจรบิล',
    //   'ค่าเช่า/มัดจำ',
    //   'ระยะเวลา',
    //   'สถานะ'
    // ].forEach(h => cy.contains('th', h).should('be.visible'));

    // ต้องมีแถวข้อมูลอย่างน้อย 1 แถว
    cy.get('table tbody tr').its('length').should('be.greaterThan', 0);

    cy.contains('CTR-2025-001').should('exist');
    cy.contains('Somsak Jaidee').should('exist');

    //  satus (ใช้งาน / หมดอายุ
    cy.get('body').then($b => {
      const text = $b.text();
      expect(text).to.match(/ใช้งาน|หมดอายุ/);
    });
  });

  it('can search a lease number and narrow the table', () => {
    // ค้นหา "CTR-2025-001"
    cy.get('input[placeholder="Search"]').type('CTR-2025-001');

    // เห็นแถวท CTR-2025-001 และซ่อนแถวอื่น ๆ 
    cy.contains('td', 'CTR-2025-001', { timeout: 8000 }).should('be.visible');

    // ตรวจว่าจำนวนแถวน้อยลงกว่าเดิม 
    cy.get('table tbody tr').its('length').should('be.lte', 2);
  });
});