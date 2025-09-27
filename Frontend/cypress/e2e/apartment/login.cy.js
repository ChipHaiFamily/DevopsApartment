describe('Login Page Validation', () => {
    beforeEach(() => {
      cy.viewport(1280, 800);
      cy.visit('http://localhost:3000/login#');
    });
  
    it('shows validation errors when email and password are invalid', () => {
      // กรอกอีเมลผิดรูปแบบ
      cy.get('input[placeholder="กรอกอีเมลของคุณ"]').type('eee');
  
      // กรอกรหัสผ่านสั้นเกินไป (< 6 ตัวอักษร)
      cy.get('input[placeholder="กรอกรหัสผ่าน"]').type('123');
  
      // คลิกปุ่มเข้าสู่ระบบ
      cy.contains('เข้าสู่ระบบ').click();
  
      // ตรวจสอบว่า error เตือนแสดงผล
      cy.contains('กรุณากรอกอีเมลให้ถูกต้อง', { timeout: 5000 }).should('be.visible');
      cy.contains('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').should('be.visible');
    });
  });