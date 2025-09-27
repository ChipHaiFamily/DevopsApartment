// cypress/e2e/auth/register.cy.js
// ทดสอบหน้า Register.jsx ที่ http://localhost:3000/register
// case: frontend (no backend)
// backend ยังไม่เสร็จ รอเนย

const URL = 'http://localhost:3000/register';

// data.json
const DUP_EMAIL = 'jane.s@example.com';

// ค่าที่จะใช้สมัครใหม่ ต้องไม่ชนกับของเดิม
const NEW_EMAIL = `new.user${Date.now()}@example.com`;
const VALID_PASSWORD = 'abc123';    // ≥6 และมีทั้งตัวอักษร+ตัวเลข
const BAD_SHORT = 'a1b2c';   // สั้นกว่า 6
const BAD_NO_NUM = 'abcdef';       // ไม่มีเลข
const BAD_NO_ALPHA = '123456';    // ไม่มีตัวอักษร
const FULLNAME = 'ทดสอบ ลงทะเบียน';  // กี่ชื่อก็ได้
const PHONE_OK = '0891234567';     // 10 หลัก
const PHONE_BAD = '12345';            

const goStep1Next = () => cy.contains('button', 'ถัดไป').click(); // Step 1 Next
const goStepBack = () => cy.contains('button', 'ย้อนกลับ').click(); // Back button

// multi-step form
describe('Register (multi-step form)', () => { 
  beforeEach(() => {
    cy.viewport(1440, 900);
    // เคลียร์ tenants_extra เพื่อให้ State เดิมไม่กวนผลทดสอบ
    cy.visit(URL, {
      onBeforeLoad(win) {
        win.localStorage.removeItem('tenants_extra'); // clear field before load
      }
    });
  });

  // Step 1: email, password, confirm
  it('Step 1 validations: email format, duplicate, password rules, confirm mismatch', () => {
    // 1 อีเมลผิด format
    cy.get('input[name="email"]').type('not-an-email'); // format ผิด
    cy.get('input[name="password"]').type(VALID_PASSWORD); // พาสเวิร์ดถูก
    cy.get('input[name="confirm"]').type(VALID_PASSWORD); // confirm ถูก
    goStep1Next(); // submit
    cy.contains('กรุณากรอกอีเมลเท่านั้น เช่น email@example.com').should('be.visible'); // check error

    // 2 อีเมลซ้ำ (ต้องกรอกพาสเวิร์ดถูก เพื่อให้ error โฟกัสที่อีเมล)
    cy.get('input[name="email"]').clear().type(DUP_EMAIL); // อีเมลซ้ำ
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD); // พาสเวิร์ดถูก
    cy.get('input[name="confirm"]').clear().type(VALID_PASSWORD); // confirm ถูก
    goStep1Next(); // submit
    cy.contains('อีเมลนี้มีอยู่แล้วในระบบ').should('be.visible'); // check error

    // 3 รหัสผ่านไม่ผ่าน rules (ต้องกรอกอีเมลถูก เพื่อให้ error โฟกัสที่พาสเวิร์ด)
    // 3.1 password < 6
    cy.get('input[name="email"]').clear().type(NEW_EMAIL); // อีเมลใหม่
    cy.get('input[name="password"]').clear().type(BAD_SHORT); // สั้นกว่า 6
    cy.get('input[name="confirm"]').clear().type(BAD_SHORT);  // confirm เหมือนกัน
    goStep1Next(); 
    cy.contains('รหัสผ่านยาว ≥ 6 ตัว มีตัวอักษรและตัวเลข').should('be.visible'); 

    // 3.2 ไม่มีตัวเลข
    cy.get('input[name="password"]').clear().type(BAD_NO_NUM);  
    cy.get('input[name="confirm"]').clear().type(BAD_NO_NUM); 
    goStep1Next(); 
    cy.contains('รหัสผ่านยาว ≥ 6 ตัว มีตัวอักษรและตัวเลข').should('be.visible'); // check error

    // 3.3 ไม่มีตัวอักษร
    cy.get('input[name="password"]').clear().type(BAD_NO_ALPHA); 
    cy.get('input[name="confirm"]').clear().type(BAD_NO_ALPHA); 
    goStep1Next(); // submit
    cy.contains('รหัสผ่านยาว ≥ 6 ตัว มีตัวอักษรและตัวเลข').should('be.visible');

    // 4) ยืนยันรหัสผ่านไม่ตรง
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD);
    cy.get('input[name="confirm"]').clear().type('wrong123'); // ไม่ตรง
    goStep1Next();
    cy.contains('รหัสผ่านไม่ตรงกัน').should('be.visible');

    // ผ่าน Step 1
    cy.get('input[name="email"]').clear().type(NEW_EMAIL);
    cy.get('input[name="password"]').clear().type(VALID_PASSWORD);
    cy.get('input[name="confirm"]').clear().type(VALID_PASSWORD);
    goStep1Next();

    // check ว่า Step 2 แสดงแล้ว
    cy.contains('ข้อมูลส่วนตัว').should('have.class', 'step__title'); // title Step 2
    cy.contains('ชื่อ–นามสกุล').should('be.visible');
  });

  it('Step 2 validations and navigate to Step 3 summary', () => {
    // ไป Step 2 ด้วยข้อมูลถูกต้องจาก Step 1
    cy.get('input[name="email"]').type(NEW_EMAIL);
    cy.get('input[name="password"]').type(VALID_PASSWORD);
    cy.get('input[name="confirm"]').type(VALID_PASSWORD);
    goStep1Next();

    // 1) ชื่อ–นามสกุล ว่าง
    cy.get('input[name="fullname"]').clear();
    cy.get('input[name="phone"]').clear().type(PHONE_OK);
    cy.contains('button', 'ถัดไป').click();
    cy.contains('กรุณากรอกชื่อ–สกุล').should('be.visible');

    // 2) เบอร์โทรไม่ครบ 10 หลัก
    cy.get('input[name="fullname"]').type(FULLNAME);
    cy.get('input[name="phone"]').clear().type(PHONE_BAD);
    cy.contains('button', 'ถัดไป').click();
    cy.contains('กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก').should('be.visible');

    // ผ่าน Step 2
    cy.get('input[name="phone"]').clear().type(PHONE_OK); // เบอร์ถูก
    cy.contains('button', 'ถัดไป').click();

    // Step 3 summary
    cy.contains('เสร็จสิ้น').should('have.class', 'step__title'); // title Step 3
    cy.contains('อีเมล:').parent().should('contain', NEW_EMAIL);
    cy.contains('ชื่อ–นามสกุล:').parent().should('contain', FULLNAME);
    cy.contains('เพศ:').parent().should('contain', 'ชาย'); // default = male
    cy.contains('โทรศัพท์:').parent().should('contain', PHONE_OK);

    // ย้อนกลับได้
    goStepBack();
    cy.contains('ข้อมูลส่วนตัว').should('be.visible'); // title Step 2
  });

  it('Submit → alert success and writes to localStorage (tenants_extra)', () => {
    // จับ alert
    const expected = 'สมัครสมาชิกสำเร็จ (mock) — ลองไปหน้าเข้าสู่ระบบได้เลย'; 
    cy.on('window:alert', (msg) => {
      expect(msg).to.contain(expected); // check alert message
    });

    // ไป Step 3
    cy.get('input[name="email"]').type(NEW_EMAIL);
    cy.get('input[name="password"]').type(VALID_PASSWORD);
    cy.get('input[name="confirm"]').type(VALID_PASSWORD);
    goStep1Next();

    cy.get('input[name="fullname"]').type(FULLNAME);
    cy.get('input[name="phone"]').type(PHONE_OK);
    cy.get('input[name="altphone"]').type('0890000000');
    cy.contains('button', 'ถัดไป').click();

    // ตรวจ localStorage ก่อน submit
    cy.window().then((win) => {
      const before = JSON.parse(win.localStorage.getItem('tenants_extra') || '[]');
      // กด "เสร็จสิ้น" (submit)
      cy.contains('button', 'เสร็จสิ้น').click().then(() => {
        const after = JSON.parse(win.localStorage.getItem('tenants_extra') || '[]');
        expect(after.length).to.eq(before.length + 1);
        // ตรวจโครงข้อมูลล่าสุด
        const last = after[after.length - 1];
        expect(last).to.have.all.keys('id','full_name','email','tel','citizen_id','emergency_contact','emergency_relationship');
        expect(last.email).to.eq(NEW_EMAIL);
        expect(last.full_name).to.eq(FULLNAME);
        expect(last.tel).to.eq(PHONE_OK);
      });
    });
  });

  // ======= เว้นไว้ก่อน รอ backend ของเนย, พอยทำเสร็จ =======
  // case: backend (เช่น ตรวจ OTP/ส่งอีเมล/เรียก API) — ตามสเปกให้คอมเมนต์ไว้ก่อน
  /*
  it('Backend-driven checks (to be enabled when API is ready)', () => {
    // ตัวอย่าง: ตรวจว่าเรียก /api/register แล้วได้ 201
    // cy.intercept('POST', '/api/register').as('register');
    // ... กด submit ...
    // cy.wait('@register').its('response.statusCode').should('eq', 201);
  });
  */
});