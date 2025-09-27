// cypress/e2e/public/room.cy.js
// Flow การจองหน้า Room.jsx — ใช้ /rooms/undefined (fallback เป็นห้องเล็ก)

const BASE = 'http://localhost:3000';

describe('Public → Room booking flow (flex)', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
    // ล็อกเวลาให้คงที่ (Bangkok ~ +07:00) เพื่อเทียบ "วันนี้หรืออนาคต"
    cy.clock(new Date('2025-09-26T09:00:00+07:00').getTime());
    cy.visit(`${BASE}/rooms/undefined`);
  });

  it('renders fallback to "ห้องเล็ก" when type is undefined; tabs switch types', () => {
    // ปุ่มสลับชนิดห้องอยู่ครบ
    cy.contains('a.btn', 'ห้องเล็ก').should('exist');
    cy.contains('a.btn', 'ห้องกลาง').should('exist');
    cy.contains('a.btn', 'ห้องใหญ่').should('exist');

    // /rooms/undefined ควร fallback เป็น "ห้องเล็ก" (ปุ่ม active)
    cy.contains('a.btn', 'ห้องเล็ก').should('have.class', 'active');

    // HERO มีหัวเรื่องและราคา (ไม่ล็อกตัวเลข)
    cy.contains(/ห้องพัก/).should('be.visible'); // เช่น "ห้องพักขนาดเล็ก"
    cy.contains(/เดือน/).should('be.visible');   // “–/เดือน” บริเวณราคา

    // สลับแท็บแบบยืดหยุ่น
    cy.contains('a.btn', 'ห้องกลาง').click();
    cy.url().should('match', /\/rooms\/medium$/);
    cy.contains('a.btn', 'ห้องกลาง').should('have.class', 'active');

    cy.contains('a.btn', 'ห้องใหญ่').click();
    cy.url().should('match', /\/rooms\/large$/);
    cy.contains('a.btn', 'ห้องใหญ่').should('have.class', 'active');

    // กลับมาห้องเล็ก
    cy.contains('a.btn', 'ห้องเล็ก').click();
    cy.url().should('match', /\/rooms\/small$/);
    cy.contains('a.btn', 'ห้องเล็ก').should('have.class', 'active');
  });

  it('opens/closes Terms modal from both links', () => {
    // จากลิงก์ "ข้อตกลงและเงื่อนไข"
    cy.contains('button', 'ข้อตกลงและเงื่อนไข').click();
    cy.contains('.modal .modal-title', 'ข้อตกลงและเงื่อนไขการจอง').should('be.visible');
    cy.get('.modal .btn-secondary,[data-bs-dismiss="modal"]').first().click();
    cy.get('.modal.show').should('not.exist');

    // จากลิงก์ "นโยบายความเป็นส่วนตัว"
    cy.contains('button', 'นโยบายความเป็นส่วนตัว').click();
    cy.contains('.modal .modal-title', 'ข้อตกลงและเงื่อนไขการจอง').should('be.visible');
    cy.get('.modal .btn-secondary,[data-bs-dismiss="modal"]').first().click();
    cy.get('.modal.show').should('not.exist');
  });

  it('shows error modal when submitting empty/invalid fields', () => {
    // ยกเลิก checkbox ทั้งสองเพื่อให้ติด validation
    cy.get('input#tos').uncheck({ force: true });
    cy.get('input#privacy').uncheck({ force: true });

    // ไม่ใส่วันที่ → submit
    cy.contains('button', 'ส่งคำขอ').click();

    // Error modal ต้องขึ้น และมีรายการ error อย่างน้อยหนึ่ง
    cy.contains('.modal .modal-title', 'กรอกข้อมูลไม่ครบถ้วน').should('be.visible');
    cy.get('.modal .modal-body ul li').its('length').should('be.greaterThan', 0);

    // ปิด error modal
    cy.get('.modal .btn.btn-primary,[data-bs-dismiss="modal"]').first().click();
    cy.get('.modal.show').should('not.exist');
  });

  it('blocks past move-in date (ต้องเป็นวันนี้หรืออนาคต)', () => {
    // ใส่วันที่ย้อนหลัง (ก่อน 2025-09-26)
    cy.get('input[type="date"]').clear().type('2025-09-01');
    // เช็คบ็อกซ์ให้ถูกต้อง (เพื่อให้ trigger เฉพาะ error วันที่)
    cy.get('input#tos').check({ force: true });
    cy.get('input#privacy').check({ force: true });

    cy.contains('button', 'ส่งคำขอ').click();

    // ต้องมี error modal พร้อมข้อความวันที่ (ตรวจแบบยืดหยุ่นด้วย regex)
    cy.contains('.modal .modal-title', 'กรอกข้อมูลไม่ครบถ้วน').should('be.visible');
    cy.get('.modal .modal-body').invoke('text').should(t =>
      expect(t).to.match(/วันที่เข้าอยู่ต้องเป็นวันนี้หรืออนาคต/)
    );

    // ปิด
    cy.get('.modal .btn.btn-primary,[data-bs-dismiss="modal"]').first().click();
    cy.get('.modal.show').should('not.exist');
  });

  it('success flow: valid date today/future + both checkboxes → success modal then redirect "/"', () => {
    // ไป /rooms/small ให้แน่ใจว่า select ถูก sync (ตอนแรก /rooms/undefined ก็โอเค แต่ไป small ชัวร์)
    cy.visit(`${BASE}/rooms/small`);

    // กรอกวันที่ “วันนี้” (2025-09-26 ตามที่ clock ไว้)
    cy.get('input[type="date"]').clear().type('2025-09-26');

    // checkbox ทั้งสองต้องติ๊กอยู่ (โค้ดตั้งค่าเริ่มเป็น true) — เผื่อก่อนหน้ามีการเปลี่ยน
    cy.get('input#tos').check({ force: true });
    cy.get('input#privacy').check({ force: true });

    // กดส่ง
    cy.contains('button', 'ส่งคำขอ').click();

    // Success modal แสดง
    cy.contains('.modal .modal-title', 'ส่งคำขอเรียบร้อย').should('be.visible');

    // กด "รับทราบ" แล้วต้องไปหน้า /
    cy.contains('.modal .btn.btn-primary', 'รับทราบ').click();
    cy.url().should('eq', `${BASE}/`);
  });
});