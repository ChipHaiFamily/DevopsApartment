// cypress/e2e/homepage_rooms.cy.js
describe('Homepage Room Type Selection', () => {
    it('ควร redirect ไปที่ /rooms/undefined เมื่อเลือกประเภทห้องพัก', () => {
      // เข้า homepage
      cy.visit('http://localhost:3000/')
  
      // ตรวจสอบว่ามีข้อความ "ประเภทห้องพัก"
      cy.contains('ประเภทห้องพัก').should('be.visible')
  
      // คลิกที่ห้องเล็ก (หรือประเภทห้องใดห้องหนึ่ง)
      cy.contains('ห้องเล็ก').click()
  
      // ตรวจสอบว่า redirect ไปที่ /rooms/undefined
      cy.url().should('include', '/rooms/undefined')
  
      // ตรวจสอบว่าหน้ามี heading หรือข้อความ "ห้องพักขนาดเล็ก"
      cy.contains('ห้องพักขนาดเล็ก').should('be.visible')
    })
  })