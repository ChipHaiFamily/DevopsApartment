describe('Homepage Room Type Selection', () => {
  it('ควร redirect ไปที่ /rooms/undefined เมื่อเลือกประเภทห้องพัก', () => {
    // viste homepage
    cy.visit('http://localhost:3000/')

    // check heading 
    cy.contains('ประเภทห้องพัก').should('be.visible') // heading

    // คลิกที่ห้องเล็ก
    cy.contains('ห้องเล็ก').click()

    // check redirect to /rooms/undefined
    cy.url().should('include', '/rooms/undefined') // URL

    // check heading ห้องพักขนาดเล็ก 
    cy.contains('ห้องพักขนาดเล็ก').should('be.visible') // heading
  })
})