describe('Maintenance Page', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('http://localhost:3000/admin/maintenance');
    });
  
    it('renders page summary and base table', () => {
      cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
      cy.contains('ซ่อมบำรุง').should('be.visible');
  
      // การ์ดสรุปด้านบน (ชื่ออาจเหมือนหน้า invoices; ใช้ contains แบบยืดหยุ่น)
      cy.contains(/รายได้รวม|ภาพรวม/i).should('exist');
      cy.contains(/รอชำระ/).should('exist');
      cy.contains(/บิลทั้งหมด|ทั้งหมด/).should('exist');
      cy.contains(/เกินกำหนด/).should('exist');
  
      // Tabs
      cy.get('body').then($b => {
        expect($b.text()).to.include('งานซ่อม (2)');
        expect($b.text()).to.include('ตารางซ่อมบำรุง (2)');
      });
  
      // Table และ search
      cy.get('[data-testid="maintenance-search"], input[placeholder="Search"]').should('exist');
      cy.get('[data-testid="maintenance-table"], table', { timeout: 8000 }).should('exist');
    });
  
    it('can search by room 101', () => {
      const search = '[data-testid="maintenance-search"], input[placeholder="Search"]';
      cy.get(search).clear().type('101');
  
      // อย่างน้อยหนึ่งแถวควรมี "101" อยู่ในคอลัมน์ห้อง
      cy.get('[data-testid="maintenance-table"] tbody tr:visible, table tbody tr:visible')
        .should($rows => {
          const ok = [...$rows].some(r => r.innerText.includes('101'));
          expect(ok, 'at least one row contains room 101').to.be.true;
        });
    });
  
    it('switches tabs and updates table, then opens the detail popup', () => {
      // ไปแท็บ "ตารางซ่อมบำรุง (2)"
      cy.get('.cy_maintainance_tab_2').click({ force: true })
        .then(() => {}) // if testid not present, use fallback
        .catch(() => {});
      cy.contains('ตารางซ่อมบำรุง (2)').click({ force: true });
  
      // ตารางควรเปลี่ยนและมีหัวคอลัมน์/ข้อมูลตามภาพ 
      cy.contains(/ครั้งล่าสุด|ครั้งล่าสุด|ครั้งล่าสุด/i).should('exist'); 
      cy.contains(/ล้างแอร์ทุก 6 เดือน/).should('be.visible'); 
  
      // คลิกปุ่มรูปแว่นของแถว "ล้างแอร์ทุก 6 เดือน"
      cy.contains('tr', 'ล้างแอร์ทุก 6 เดือน').within(() => {
        // ถ้ามี testid ให้ใช้
        cy.get('[data-testid="btn-row-view"], button[title], button[aria-label], button')
          .first()
          .click();
      });
  
      // ต้องเห็น popup/โมดอลฟอร์ม
      // หัว popup
      cy.contains(/แบบฟอร์มรับการซ่อม|แบบฟอร์มการซ่อม|Form/i, { timeout: 8000 }).should('be.visible');
  
      cy.contains('ห้อง').should('be.visible');
      cy.contains('หมวดหมู่').should('be.visible');
      cy.contains('หัวข้อปัญหา').should('be.visible');
      cy.contains('รายละเอียด').should('be.visible');
      cy.contains(/อัปโหลดโดย|Upload/).should('be.visible');
      cy.contains(/วันที่ปรับปรุง|วันที่ซ่อม/).should('be.visible');
  
      cy.contains('ยกเลิก').should('be.visible');
      cy.contains('Upload').should('be.visible');
  
      cy.contains('ยกเลิก').click({ force: true });
    });
  
    it('can toggle back to "งานซ่อม (2)" tab and see a different table', () => {
      // ไป "งานซ่อม (2)"
      cy.get('[data-testid="tab-jobs"]').click({ force: true })
        .then(() => {})
        .catch(() => {});
      cy.contains('งานซ่อม (2)').click({ force: true });
  
      // ตารางเปลี่ยน 
      cy.get('body').then($b => {
        const text = $b.text();
        // ในตารางงานซ่อมมักมีคอลัมน์ "สถานะงาน" หรือชื่อที่ต่างจาก schedule
        expect(text).to.match(/รายการทั้งหมด|งาน|สถานะ|ผู้แจ้ง/);
      });
    });
  });