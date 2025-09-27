describe('Rooms Management Page', () => {
    it('should search and show room detail correctly', () => {
      cy.viewport(1440, 900);
  
      // เข้า URL
      cy.visit('http://localhost:3000/admin/rooms');
  
      // 1) เห็นหัวข้อหลักและการ์ด summary
      cy.contains('จัดการห้อง').should('be.visible');
      cy.contains('ห้องพักทั้งหมด').should('be.visible');
      cy.contains('ห้องว่าง').should('be.visible');
      cy.contains('ห้องที่ให้เช่า').should('be.visible');
      cy.contains('ห้องปิดปรับปรุง').should('be.visible');
  
      // 2) เห็นแผนที่ห้อง (เช็คว่ามีชั้น 1 และมีห้องอย่างน้อย 1)
      cy.contains('แผนที่ห้อง').should('be.visible');
      cy.contains('ชั้น 1').should('be.visible');
      cy.contains(/101|102|103/).should('be.visible');
  
      // 3) ใช้ searchbar ค้นหา "1"
      cy.get('input[placeholder="Search"]').type('1');
  
      // ต้องเหลือแต่ห้องที่มีเลข "1" แสดง
      cy.get('body').then($body => {
        const text = $body.text();
        expect(text).to.include('101');
        expect(text).to.include('110');
        expect(text).to.include('112');
      });
  
      // 4) คลิกห้อง 101
      cy.contains('101').click();
  
      // 5) ด้านขวาต้องขึ้นรายละเอียดห้อง 101
      cy.get('body').then($body => {
        expect($body.text()).to.include('ห้อง 101');
        expect($body.text()).to.include('Standard Studio'); // ประเภท
        expect($body.text()).to.include('ไม่ว่าง');         // สถานะ
        expect($body.text()).to.include('฿ 4,500');        // ค่าเช่า
      });
  
      // 6) คลิกห้อง 110
      cy.contains('110').click();
  
      // 7) ด้านขวาต้องเปลี่ยนเป็นรายละเอียดห้อง 110
      cy.get('body').then($body => {
        expect($body.text()).to.include('ห้อง 110');
        expect($body.text()).to.include('Deluxe Studio');
        expect($body.text()).to.include('ว่าง');
        expect($body.text()).to.include('฿ 6,000');
      });
    });
  });