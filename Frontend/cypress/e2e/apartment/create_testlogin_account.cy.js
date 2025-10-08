// ==============================================================================================
// Pre-test Requirements:
// - Delete test user data from the database before running this test
// - If the test data already exists in DB (usernames, emails used for registration), the test will fail due to duplicate registration attempts
// =====================================================
// Post-test Cleanup:
// - Delete the test user data created by this test from the database after execution
// - This ensures subsequent test runs can execute without issues
// =====================================================
// ```sql
// DELETE FROM public.users
// WHERE email = 'register_cypress@apt.com';
// SELECT * FROM public.users
// ORDER BY id ASC;
// ```
//  ==============================================================================================

describe('User Registration Flow', () => {
    const newEmail = 'testlogin@apt.com';
    const validPassword = 'ict555';
    const registerUrl = '/register';
    const loginUrl = '/login';
  
    beforeEach(() => {
      cy.visit(registerUrl);
    });
  

  
    it('should register new user successfully with valid data', () => {
      // Step 1
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(validPassword + 'A'); // เพิ่มตัวอักษรให้ผ่าน rule
      cy.get('input[name="confirm"]').type(validPassword + 'A');
      cy.contains('button', 'ถัดไป').click();
  
      // Step 2 – กรอกถูกต้อง
      cy.get('input[name="fullname"]').type('Testlogin Cypress');
      cy.get('input[name="gender"][value="male"]').check();
      cy.get('input[name="phone"]').clear().type('0123456789');
      cy.get('input[name="job"]').type('Tester');
      cy.get('input[name="workplace"]').type('ICT Mahidol');
      cy.contains('button', 'ถัดไป').click();
  
      // Step 3 – ตรวจสรุปข้อมูล
  // Step 3 – ตรวจสรุปข้อมูล (แก้ใหม่)
  cy.contains('strong', 'อีเมล:').parent().should('contain', newEmail);
  cy.contains('strong', 'ชื่อ–นามสกุล:').parent().should('contain', 'Testlogin Cypress');
  cy.contains('strong', 'เพศ:').parent().should('contain', 'ชาย');
  cy.contains('strong', 'โทรศัพท์:').parent().should('contain', '0123456789');
  cy.contains('strong', 'อาชีพ:').parent().should('contain', 'Tester');
  cy.contains('strong', 'สถานที่ทำงาน:').parent().should('contain', 'ICT Mahidol');
  
      // กด "เสร็จสิ้น"
      cy.contains('button', 'เสร็จสิ้น').click();
  
      // ตรวจว่ากลับไปหน้า login
      cy.url({ timeout: 8000 }).should('include', loginUrl);
    });
  
    it('should login successfully with the newly registered account', () => {
      cy.visit(loginUrl);
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(validPassword + 'A');
      cy.get('button[type="submit"]').click();
  
      cy.url().should('not.include', loginUrl);
    });
  });