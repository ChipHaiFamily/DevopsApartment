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
  const existingEmail = 'testlogin@apt.com';
  const newEmail = 'register_cypress@apt.com';
  const validPassword = 'ict555';
  const weakPassword = '123';
  const mismatchedPassword = 'ict556';

  const registerUrl = '/register';
  const loginUrl = '/login';

  beforeEach(() => {
    cy.visit(registerUrl);
  });

  it('should show error when email already exists', () => {
    cy.get('input[name="email"]').type(existingEmail);
    cy.get('input[name="password"]').type(validPassword);
    cy.get('input[name="confirm"]').type(validPassword);
    cy.contains('button', 'ถัดไป').click();

    cy.contains('อีเมลนี้มีอยู่แล้วในระบบ').should('be.visible');
  });

  it('should show validation errors for invalid email and password', () => {
    // อีเมลผิดรูปแบบ
    cy.get('input[name="email"]').type('wrongemail');
    cy.get('input[name="password"]').type(weakPassword);
    cy.get('input[name="confirm"]').type(mismatchedPassword);
    cy.contains('button', 'ถัดไป').click();

    cy.contains('กรุณากรอกอีเมลเท่านั้น เช่น email@example.com').should('be.visible');
    cy.contains('รหัสผ่านยาว ≥ 6 ตัว มีตัวอักษรและตัวเลข').should('be.visible');
    cy.contains('รหัสผ่านไม่ตรงกัน').should('be.visible');
  });

  it('should register new user successfully with valid data', () => {
    // Step 1
    cy.get('input[name="email"]').type(newEmail);
    cy.get('input[name="password"]').type(validPassword + 'A'); // เพิ่มตัวอักษรให้ผ่าน rule
    cy.get('input[name="confirm"]').type(validPassword + 'A');
    cy.contains('button', 'ถัดไป').click();

    // Step 2 – กรอกผิดก่อน
    cy.get('input[name="fullname"]').clear();
    cy.get('input[name="phone"]').type('12345');
    cy.get('input[name="job"]').clear();
    cy.get('input[name="workplace"]').clear();
    cy.contains('button', 'ถัดไป').click();

    cy.contains('กรุณากรอกชื่อ–สกุล').should('be.visible');
    cy.contains('กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก').should('be.visible');
    cy.contains('กรุณากรอกอาชีพ').should('be.visible');
    cy.contains('กรุณากรอกสถานที่ทำงาน').should('be.visible');

    // Step 2 – กรอกถูกต้อง
    cy.get('input[name="fullname"]').type('Register Cypress');
    cy.get('input[name="gender"][value="male"]').check();
    cy.get('input[name="phone"]').clear().type('0123456789');
    cy.get('input[name="job"]').type('Tester');
    cy.get('input[name="workplace"]').type('ICT Mahidol');
    cy.contains('button', 'ถัดไป').click();

    // Step 3 – ตรวจสรุปข้อมูล
// Step 3 – ตรวจสรุปข้อมูล (แก้ใหม่)
cy.contains('strong', 'อีเมล:').parent().should('contain', newEmail);
cy.contains('strong', 'ชื่อ–นามสกุล:').parent().should('contain', 'Register Cypress');
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