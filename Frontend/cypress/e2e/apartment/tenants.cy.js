const openVisibleModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible', { timeout: 8000 }).first();

describe('Admin Tenants Page', () => {
  before(() => {
    cy.loginPreset(); // 👈 Login ก่อน
    cy.visit('/admin/tenants');
    cy.viewport(1400, 900);
  });

  it('renders header and summary cards', () => {
    cy.contains('จัดการผู้เช่า', { timeout: 500 }).should('be.visible');
    cy.contains('จัดการข้อมูลผู้เช่าและผู้สนใจ').should('be.visible');
    cy.get('.card.card-soft', { timeout: 500 }).should('have.length', 3);
    cy.contains('ผู้เข่าทั้งหมด');
    cy.contains('สัญญาที่ใช้งาน');
    cy.contains('เลิกเช่า');
  });

  it('searches tenants by multiple terms', () => {
    // const terms = ['Somsak', '0812345678', 'USR-002', 'Chujai'];
    cy.get('input[placeholder="Search"]').should('exist').clear().type('Somsak');
    cy.get('input[placeholder="Search"]').should('exist').clear().type('0812345678');
    cy.get('input[placeholder="Search"]').should('exist').clear().type('SR-002');
    cy.get('input[placeholder="Search"]').should('exist').clear().type('Chujai');
    cy.get('input[placeholder="Search"]').should('exist').clear();
    // cy.get('input[placeholder="Search"]', { timeout: 500 }).should('exist');

    // terms.forEach((term) => {
    //   cy.get('input[placeholder="Search"]').clear().type(term);
    //   cy.wait(250);
    //   cy.get('input[placeholder="Search"]').clear().wait(250);
    // });
  });

  // ทดสอบ filter เพศ
  it('switches gender filters sequentially', () => {
    cy.get('select.form-select').eq(0).as('genderSelect'); // สมมติ select ตัวที่ 0 คือ filter เพศ
    cy.get('select.form-select').should('exist');

    // ทุกเพศ
    cy.get('@genderSelect').select('ทุกเพศ', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // ชาย
    cy.get('@genderSelect').select('ชาย', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // หญิง
    cy.get('@genderSelect').select('หญิง', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // กลับมาทุกเพศ
    cy.get('@genderSelect').select('ทุกเพศ', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);
  });


  // ทดสอบ filter สถานะ
  it('switches status filters sequentially', () => {
    cy.get('select.form-select').eq(1).as('statusSelect');

    // ทุกสถานะ
    cy.get('@statusSelect').select('ทุกสถานะ', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // กำลังเช่า
    cy.get('@statusSelect').select('กำลังเช่า', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // หมดสัญญา
    cy.get('@statusSelect').select('หมดสัญญา', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // ยกเลิก
    cy.get('@statusSelect').select('ยกเลิก', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);

    // กลับมาทุกสถานะ
    cy.get('@statusSelect').select('ทุกสถานะ', { force: true });
    cy.get('table tbody tr').should('exist');
    cy.wait(500);
  });

  // cypress/e2e/admin/tenant.cy.js
// 🧩 Test for Tenant Management Page (Admin)

const openVisibleModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();

describe('🧾 Admin Tenant Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.visit('/admin/tenants');
    cy.contains('ผู้เช่า', { timeout: 10000 }).should('be.visible');
  });

  // ────────────────────────────────
  it('opens tenant creation modal, types mock data, runs validation, then CANCELS', () => {
    // เปิด modal “สร้างผู้เช่าใหม่”
    cy.contains('button', /สร้างผู้เช่าใหม่|New Tenant/i, { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    openVisibleModal().as('createModal');
    cy.get('@createModal').find('.modal-title').should('contain', 'สร้างผู้เช่าใหม่');

    // ───── (1) กรอกเลขบัตรผิด → ไม่ครบ 13 หลัก
    cy.get('@createModal').find('input[name="citizenId"]').clear().type('112998');
    cy.get('@createModal').contains('button', /บันทึก|Create/i).click({ force: true });
    cy.contains('เลขบัตรไม่ถูกต้อง หรืออาจไม่มีอยู่จริง กรุณากรอกเลขบัตรที่ถูกต้อง').should('be.visible');

    // ───── (2) กรอกเลขบัตรผิดรูปแบบ → 1129986242874
    cy.get('@createModal').find('input[name="citizenId"]').clear().type('1129986242874');
    cy.get('@createModal').contains('button', /บันทึก|Create/i).click({ force: true });
    cy.contains('เลขบัตรไม่ถูกต้อง หรืออาจไม่มีอยู่จริง กรุณากรอกเลขบัตรที่ถูกต้อง').should('be.visible');

    // ───── (3) กรอกเลขบัตรถูกต้อง → 1129986242875
    cy.get('@createModal').find('input[name="citizenId"]').clear().type('1129986242875');
    cy.get('@createModal').find('input[name="emergencyContact"]').clear().type('000000000');
    cy.contains('เลขบัตรไม่ถูกต้อง หรืออาจไม่มีอยู่จริง กรุณากรอกเลขบัตรที่ถูกต้อง').should('not.exist');

    // ───── (4) กรอกเบอร์ผิด → ไม่ครบ 10 หลัก
    cy.get('@createModal').find('input[name="emergencyContact"]').clear().type('000000000');
    // cy.get('@createModal').contains('button', /บันทึก|Create/i).click({ force: true });
    // cy.contains('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเลข จำนวน 10 หลัก').should('be.visible');;

    // ───── (5) กรอกชื่อฉุกเฉิน และความสัมพันธ์ ว่าง → ต้องเตือนครบ 2 ช่อง
    cy.get('@createModal').find('input[name="emergencyName"]').clear();
    cy.get('@createModal').find('input[name="emergencyRelationship"]').clear();
    cy.get('@createModal').contains('button', /บันทึก|Create/i).click({ force: true });
    // cy.contains('กรุณากรอกข้อมูลให้ครบถ้วน').should('have.length', 2);

    // ───── (6) กรอกข้อมูลถูกทั้งหมด
    cy.get('@createModal').within(() => {
      cy.get('input[name="emergencyContact"]').clear().type('0912345678');
      cy.get('input[name="emergencyName"]').clear().type('Yara');
      cy.get('input[name="emergencyRelationship"]').clear().type('มารดา');

      // React-Select (เลือก user)
      cy.get('.css-13cymwt-control').click({ force: true });
      cy.get('input[id^="react-select"]').type('Ben{enter}');
    });

    // ตรวจว่าไม่มี error คงเหลือ
    cy.contains(/^เลขบัตรไม่ถูกต้อง/).should('not.exist');
    cy.contains(/^เบอร์โทรศัพท์ไม่ถูกต้อง/).should('not.exist');
    cy.contains(/^กรุณากรอกข้อมูลให้ครบถ้วน/).should('not.exist');

    // ───── (7) ปิด modal โดยกดยกเลิก (ไม่ save)
    cy.get('@createModal')
      .find('button.btn-outline-secondary, [data-bs-dismiss="modal"], .btn-close')
      .first()
      .click({ force: true });

    // ตรวจว่า modal ปิดลงจริง
    cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible').should('have.length', 0);
  });
});

  it('opens tenant detail modal for first 3 rows, checks info, then closes', () => {
    cy.get('table tbody tr', { timeout: 8000 }).should('have.length.at.least', 3);

    for (let i = 0; i < 3; i++) {
      cy.get('table tbody tr').eq(i).within(() => {
        cy.get('button i.bi-search').parents('button').first().click({ force: true });
      });

      openVisibleModal().as('detailModal');
      cy.get('@detailModal').find('.modal-title').should('contain', 'รายละเอียดผู้เช่า');

      // ตรวจช่องข้อมูลสำคัญใน modal
      cy.get('@detailModal').within(() => {
        cy.contains(/รหัสผู้เช่า|ชื่อ-นามสกุล|เพศ|สถานะปัจจุบัน|อีเมล/i).should('exist');
        cy.get('input[readonly]').should('exist');
      });

      // ปิด modal
      cy.get('@detailModal')
        .find('button.btn-outline-secondary, [data-bs-dismiss="modal"], .btn-close')
        .first()
        .click({ force: true });

      cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible').should('have.length', 0);
      cy.wait(500);
    }
  });
});