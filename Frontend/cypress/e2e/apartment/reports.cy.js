describe('Admin Reports Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/admin/reports')
  })

  it('should display reports dashboard correctly', () => {
    // ตรวจสอบว่ามี heading
    cy.contains('รายงาน').should('be.visible')

    // check cards
    cy.contains('อัตราการเข้าพัก').should('be.visible')
    cy.contains('รายได้รวม').should('be.visible')
    cy.contains('ค่าซ่อมบำรุง').should('be.visible')
    cy.contains('กำไรสุทธิ').should('be.visible')

    // check key sections ตาราง/ข้อมูล
    cy.contains('รายได้เดือนนี้').should('be.visible')
    cy.contains('ประสิทธิภาพห้องพัก').should('be.visible')
    cy.contains('งานซ่อมบำรุง').should('be.visible')
  })

  //  dropdown
  it('should change report when selecting a different period from dropdown', () => {
    cy.get('select').first().select('สิงหาคม 2025')  // dropdown 
    cy.contains('สิงหาคม 2025').should('exist') // check เลือกแล้ว
  })

  it('should navigate to maintenance page when clicking ดูทั้งหมด', () => { // click ดูทั้งหมด maintenance
    cy.contains('งานซ่อมบำรุง').parent().within(() => { // หา parent ของ งานซ่อมบำรุง
      cy.contains('ดูทั้งหมด').click() // click ดูทั้งหมด
    })

    // check redirect ไปหน้า maintenance
    cy.url().should('include', '/admin/maintenance') // URL
    cy.contains('ซ่อมบำรุง').should('be.visible') // heading
  })
})