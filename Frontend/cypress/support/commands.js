// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// command สำหรับ login แบบ preset
Cypress.Commands.add('loginPreset', () => {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');
  
    cy.session([username, password], () => {
      cy.visit('/login');
  
      // กรอกฟอร์ม login
      cy.get('input[name="email"]').clear().type(username);
      cy.get('input[name="password"]').clear().type(password);
      cy.get('button[type="submit"]').click();
  
      // ยืนยันว่า login สำเร็จ → redirect /admin
      cy.url().should('include', '/admin');
  
      // ตรวจว่ามี token และ role ใน localStorage
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        const role = win.localStorage.getItem('role');
        expect(token).to.be.a('string').and.not.be.empty;
        expect(role).to.eq('ADMIN'); // ถ้า role เก็บเป็น 'ADMIN'
      });
    }, {
      validate() {
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.be.a('string');
          expect(win.localStorage.getItem('role')).to.eq('ADMIN');
        });
      }
    });
  });