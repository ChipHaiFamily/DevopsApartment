describe('Admin Leases Page', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('http://localhost:3000/admin/leases');
    });
  
    it('renders leases summary, filters, and table', () => {
      // Header/Sidebar
      cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
      cy.contains('สัญญาเช่า').should('be.visible');
  
      // ปุ่มมุมขวา
      cy.contains('สร้าง').should('be.visible');
      cy.contains('แก้ไข').should('be.visible');
  
      // การ์ดสรุป 3 ใบ
      cy.contains('สัญญาทั้งหมด').should('be.visible');
      cy.contains('สัญญาที่ใช้งาน').should('be.visible');
      cy.contains('หมดอายุ').should('be.visible');
  
      // กล่อง "สัญญาเช่า" + search + ตัวกรอง 3 ช่อง
      cy.contains('สัญญาเช่า').should('be.visible');
      cy.get('input[placeholder="Search"]').should('exist');

      
      // ตัวกรอง (ข้อความอาจต่างเล็กน้อย ใช้ contains แบบกว้าง)
      cy.contains('ทุกชั้น').should('be.visible');
      cy.contains(/ทุกวง|ทุกว\b/).should('be.visible'); // ทุกวงรบิล / ทุกวงบิล
      cy.contains('ทุกสถานะ').should('be.visible');
  
      // ตารางและหัวคอลัมน์
      cy.get('table', { timeout: 8000 }).should('exist');
      [
        'สัญญาเลขที่',
        'ห้อง',
        'ผู้เช่า',
        'วงจรบิล',
        'ค่าเช่า/มัดจำ',
        'ระยะเวลา',
        'สถานะ'
      ].forEach(h => cy.contains('th', h).should('be.visible'));
  
      // ต้องมีแถวข้อมูลอย่างน้อย 1 แถว
      cy.get('table tbody tr').its('length').should('be.greaterThan', 0);
  
      cy.contains('L-2025-0001').should('exist');
      cy.contains('John Smith').should('exist');
  
      // ป้าย satus (ใช้งาน / หมดอายุ
      cy.get('body').then($b => {
        const text = $b.text();
        expect(text).to.match(/ใช้งาน|หมดอายุ/);
      });
    });
  
    it('can search a lease number and narrow the table', () => {
      // ค้นหา "L-2025-0001"
      cy.get('input[placeholder="Search"]').type('L-2025-0001');
  
      // ควรเห็นแถวที่มี L-2025-0001 และซ่อนแถวอื่น ๆ 
      cy.contains('td', 'L-2025-0001', { timeout: 8000 }).should('be.visible');
  
      // ตรวจว่าจำนวนแถวน้อยลงกว่าเดิม 
      cy.get('table tbody tr').its('length').should('be.lte', 2);
    });
  });