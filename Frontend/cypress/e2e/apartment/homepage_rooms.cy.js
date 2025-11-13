describe('Homepage Room Type Selection', () => {
  it('ควร redirect ไปยัง path ของประเภทห้อง ตาม card ที่คลิก', () => {
    // เปิดหน้าแรก
    cy.visit('/')

    // ตรวจ heading
    cy.contains('ประเภทห้องพัก').should('be.visible')

    // คลิก card ห้อง Standard Studio (small)
    cy.contains('Standard Studio').click()

    // เช็ค redirect => /rooms/small
    cy.url().should('include', '/rooms/small')

    // เช็ค heading ของหน้า rooms/small
    cy.contains(/Standard Studio|ห้องพักขนาดเล็ก/i).should('be.visible')
  })
})