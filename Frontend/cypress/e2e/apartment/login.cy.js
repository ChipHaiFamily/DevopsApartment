// cypress/e2e/auth/login.cy.js
// Login.jsx ที่ http://localhost:3000/login
// อีเมลว่าง/ผิด, รหัสผ่านสั้น, และเข้าสู่ระบบสำเร็จ (mock alert)
const URL = 'http://localhost:3000/login';

//  email 
const EXISTING_EMAIL = 'jane.s@example.com';   // case-insensitive
const VALID_PASSWORD = '123456';               // ≥ 6 

describe('Login page validations & happy path (mock)', () => {
  beforeEach(() => {
    cy.viewport(1440, 900); 
    cy.visit(URL);
  });

  it('invalid email (empty/wrong format) shows "กรุณากรอกอีเมลให้ถูกต้อง"', () => {
    // csee empty email
    cy.get('input[name="email"]').clear(); // เคลียร์ช่อง email
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD); // enter password ให้ผ่าน
    cy.contains('button', 'เข้าสู่ระบบ').click(); // submit
    cy.contains('กรุณากรอกอีเมลให้ถูกต้อง').should('be.visible'); // check error

    // case wrong format email  
    cy.get('input[name="email"]').clear().type('not-an-email'); // format ผิด
    cy.contains('button', 'เข้าสู่ระบบ').click(); // submit
    cy.contains('กรุณากรอกอีเมลให้ถูกต้อง').should('be.visible'); // check error
  });

  it('password shorter than 6 shows "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"', () => { // password < 6
    cy.get('input[name="email"]').clear().type(EXISTING_EMAIL); // email ถูก
    cy.get('input[name="password"]').clear().type('12345'); // 5 ตัว 
    cy.contains('button', 'เข้าสู่ระบบ').click(); // submit
    cy.contains('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร').should('be.visible'); // check error
  });

  //====== ไว้ทำทีหลัง ตอนเนย, พลอย ทำ backend เสร็จ======
  /*
  it('email exists format correct but NOT found → shows "ไม่พบบัญชีนี้ในระบบ"', () => {
    cy.get('input[name="email"]').clear().type('noone@example.com'); // format ถูก แต่ไม่มีในระบบ
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD);
    cy.contains('button', 'เข้าสู่ระบบ').click();
    cy.contains('ไม่พบบัญชีนี้ในระบบ').should('be.visible');
  });
  */

  it('happy path: existing email + password ≥ 6 → alert "เข้าสู่ระบบสำเร็จ (mock)"', () => {
    // ดัก alert
    const expected = 'เข้าสู่ระบบสำเร็จ (mock)';
    cy.on('window:alert', (msg) => { 
      expect(msg).to.contain(expected); // check alert message
    });

    cy.get('input[name="email"]').clear().type(EXISTING_EMAIL); // email ถูก
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD); // password ≥ 6
    cy.contains('button', 'เข้าสู่ระบบ').click(); // submit
  });
});