describe('Admin Reports Page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/admin/reports')
    })
  
    it('should display reports dashboard correctly', () => {
      // ตรวจสอบว่ามี heading
      cy.contains('รายงาน').should('be.visible')
  
      // ตรวจสอบการ์ดสรุป
      cy.contains('อัตราการเข้าพัก').should('be.visible')
      cy.contains('รายได้รวม').should('be.visible')
      cy.contains('ค่าซ่อมบำรุง').should('be.visible')
      cy.contains('กำไรสุทธิ').should('be.visible')
  
      // ตรวจสอบว่าแสดงตาราง/ข้อมูลด้านล่าง
      cy.contains('รายได้เดือนนี้').should('be.visible')
      cy.contains('ประสิทธิภาพห้องพัก').should('be.visible')
      cy.contains('งานซ่อมบำรุง').should('be.visible')
    })
  
    it('should change report when selecting a different period from dropdown', () => {
      cy.get('select').first().select('สิงหาคม 2025')  // dropdown 
      cy.contains('สิงหาคม 2025').should('exist')
    })
  
    it('should navigate to maintenance page when clicking ดูทั้งหมด', () => {
      cy.contains('งานซ่อมบำรุง').parent().within(() => {
        cy.contains('ดูทั้งหมด').click()
      })
  
      // ตรวจสอบว่าถูก redirect ไปหน้า maintenance
      cy.url().should('include', '/admin/maintenance')
      cy.contains('ซ่อมบำรุง').should('be.visible')
    })
  })