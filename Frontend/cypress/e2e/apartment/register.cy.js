describe('Register Page Flow', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/register')
    })
  
    it('ควรเห็นฟอร์มสมัครสมาชิก', () => {
      cy.contains('สมัครสมาชิก').should('be.visible')
      cy.get('input[placeholder="กรอกอีเมลของคุณ"]').should('exist')
      cy.get('input[placeholder="กรอกรหัสผ่าน"]').should('exist')
      cy.get('input[placeholder="ยืนยันรหัสผ่าน"]').should('exist')
    })
  
    it('กรอกข้อมูลไม่ถูกต้อง แล้วขึ้น error', () => {
      cy.get('input[placeholder="กรอกอีเมลของคุณ"]').type('testa2gmail.com')
      cy.get('input[placeholder="กรอกรหัสผ่าน"]').type('123')
      cy.get('input[placeholder="ยืนยันรหัสผ่าน"]').type('111111')
      cy.contains('ถัดไป').click()
  
      cy.contains('กรุณากรอกอีเมลที่ถูกต้อง').should('be.visible')
      cy.contains('รหัสผ่านยาว > 6 ตัว').should('be.visible')
      cy.contains('รหัสผ่านไม่ตรงกัน').should('be.visible')
    })
  
    it('กรอกข้อมูลถูกต้อง และไป Step 2', () => {
      cy.get('input[placeholder="กรอกอีเมลของคุณ"]').clear().type('testa@gmail.com')
      cy.get('input[placeholder="กรอกรหัสผ่าน"]').clear().type('12345678')
      cy.get('input[placeholder="ยืนยันรหัสผ่าน"]').clear().type('12345678')
      cy.contains('ถัดไป').click()
  
      cy.url().should('include', '/register')
      cy.contains('ข้อมูลส่วนตัว').should('be.visible')
    })
  
    it('กรอกข้อมูล Step 2 และไป Step 3', () => {
      // Step 2
      cy.get('input[placeholder="ชื่อ-นามสกุล"]').type('Sukollapat Pisuchpen')
      cy.get('input[placeholder="เบอร์โทรศัพท์"]').type('0958063131')
      cy.get('input[placeholder="เบอร์สำรอง"]').type('0111234567')
      cy.contains('ถัดไป').click()
  
      cy.contains('เสร็จสิ้น').should('be.visible')
    })
  
    it('Step 3 แสดงข้อมูลสรุปครบถ้วน', () => {
      cy.contains('อีเมล: testa@gmail.com').should('be.visible')
      cy.contains('Sukollapat Pisuchpen').should('be.visible')
      cy.contains('0958063131').should('be.visible')
      cy.contains('0111234567').should('be.visible')
    })
  })