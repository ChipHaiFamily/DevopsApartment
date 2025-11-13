describe('Full E2E – Room Booking Flow (User + Admin)', () => {
  const userEmail = 'testlogin@apt.com';
  const userPassword = 'ict555';
  // const adminEmail = 'admin@apt.com';
  // const adminPassword = 'ict555';

  before(() => {
    cy.clearLocalStorage();
  });

  context('Visitor (Guest) flow', () => {
    it('visits all room types with delay 500ms each', () => {
      cy.visit('http://localhost:3000/rooms/undefined');

      const roomUrls = ['/rooms/small', '/rooms/medium', '/rooms/large'];
      const roomTitles = ['ห้องพักขนาดเล็ก', 'ห้องพักขนาดกลาง', 'ห้องพักขนาดใหญ่'];

      roomUrls.forEach((url, idx) => {
        cy.visit(`http://localhost:3000${url}`);
        cy.wait(500);
        cy.contains(roomTitles[idx]).should('be.visible');
      });
    });

    it('tries to book room without login → gets error modal', () => {
      cy.visit('http://localhost:3000/rooms/undefined');
      cy.get('select.form-select').select('medium'); // ห้องกลาง
      cy.get('#tos').check();
      cy.get('#privacy').check();
      cy.contains('ส่งคำขอ').click();
      // ควร redirect ไปหน้า login
      cy.url().should('include', '/login');
    });
  });

  context('User Login flow', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/login');
      cy.get('input[name="email"]').type(userEmail);
      cy.get('input[name="password"]').type(userPassword);
      cy.contains('เข้าสู่ระบบ').click();
      // cy.url().should('eq', 'http://localhost:3000/');
    });

    it('shows error modal when no room type selected', () => {
      cy.visit('http://localhost:3000/rooms/undefined');
      cy.get('select.form-select').select(''); // ยังไม่เลือก
      cy.contains('ส่งคำขอ').click();
      cy.wait(100);
    });

    it('books room successfully after accepting terms', () => {
      cy.visit('http://localhost:3000/rooms/undefined');
      cy.get('select.form-select').select('medium');
      cy.wait(1000);
 

      cy.get('#tos').check();
      cy.get('#privacy').check();
      cy.get('button')
        .contains('ส่งคำขอ')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      cy.wait(1000);
    });

  });
});