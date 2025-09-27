describe('Admin Request Page', () => {
    it('should display request list', () => {
      // เข้า URL
      cy.visit('http://localhost:3000/admin/requests')
  
      // ตรวจสอบว่าหน้าโหลดเสร็จแล้วมี title หรือ heading ที่เกี่ยวข้อง
      cy.contains('คำขอเช่า').should('be.visible')
  
      // ตรวจสอบว่ามีตารางหรือ list ของคำขอ
      cy.get('table').should('exist') // ถ้าใช้ <table>
      
      // หรือถ้าเป็น <div> แบบ list แทน
      cy.get('div').contains('รายการทั้งหมด').should('be.visible')
  
      // ตรวจสอบว่ามี row แสดงข้อมูลคำขอ
      cy.get('tr').should('have.length.greaterThan', 1) // header + rows
  
      // ตรวจสอบ field ที่สำคัญ เช่น อีเมล / เบอร์
      cy.contains('email@example.com').should('be.visible')
      cy.contains('089-123-4567').should('be.visible')
    })
  })


  describe('Admin Requests flow', () => {
    it('opens first request detail from the list and verifies UI & approve rule', () => {
      // ไปหน้ารายการคำขอ
      cy.visit('http://localhost:3000/admin/requests');
  
      // เห็นหัวข้อ/section สำคัญ
      cy.contains('คำขอเช่า').should('be.visible');
      cy.contains('รายการทั้งหมด').should('be.visible');
  
      // ต้องเห็นอย่างน้อย 1 แถว
      cy.get('.cy_request_table tr').its('length').should('be.greaterThan', 0);
  
      // คลิกปุ่มแว่นของรายการแถวแรก
      cy.get('.cy_request_table tr .btn').first().should('exist').and('be.enabled')
      .then($btn => {cy.log($btn)})
      .click({ force: true });
      cy.wait(500); // รอโหลดส
      // ต้อง redirect ไปหน้า detail ของคำขอแรก
      cy.url().should('match', /\/admin\/requests\/1$/);
  
      // ===== ตรวจรายละเอียดหน้า detail =====
      // กล่องรายละเอียดผู้เช่า ด้านซ้าย
      cy.get('[data-testid="tenant-detail"]').should('be.visible');
      cy.get('[data-testid="tenant-detail"]').within(() => {
        cy.contains('อีเมล').should('be.visible');
        cy.contains('เบอร์').should('be.visible');
        cy.contains('อาชีพ').should('be.visible');
      });
  
      // เห็นปุ่ม "ปฏิเสธ" และ "อนุมัติ"
      cy.get('[data-testid="btn-reject"]').should('be.visible').and('be.enabled');
      cy.get('[data-testid="btn-approve"]').should('be.visible');
  
      // (rule) ยังไม่ได้เลือกห้อง → ปุ่มอนุมัติควร "disabled"
      cy.get('[data-testid="btn-approve"]').should('be.disabled');
  
      // ฝั่งขวา: ตาราง/ตัวเลือกห้องต้องมีให้เลือก
      // (รองรับ 2 แบบ: select หรือปุ่มกริด)
      cy.get('body').then($body => {
        if ($body.find('[data-testid="room-select"]').length) {
          // กรณีเป็น <select>
          cy.get('[data-testid="room-select"]').select(1); // เลือก option index 1
        } else {
          // กรณีเป็นปุ่มห้องแบบกริด
          cy.get('[data-testid="room-item"]').first().click();
        }
      });
  
      // เลือกห้องแล้ว → ปุ่มอนุมัติควร "enabled"
      cy.get('[data-testid="btn-approve"]').should('be.enabled');
  
      // กดอนุมัติ (ถ้ามี API ก็ใส่ intercept เพื่อยืนยันเรียกถูก)
      // cy.intercept('POST', '/api/requests/*/approve').as('approve');
      cy.get('[data-testid="btn-approve"]').click();
      // cy.wait('@approve').its('response.statusCode').should('be.oneOf', [200, 204]);
  
      // toast สำเร็จ/redirect
      // ตัวอย่างตรวจ toast:
      // cy.contains('อนุมัติสำเร็จ').should('be.visible');
    });
  });