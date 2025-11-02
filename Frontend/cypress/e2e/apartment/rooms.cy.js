// cypress/e2e/admin/rooms.cy.js

const openModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible', { timeout: 8000 }).first();

const closeModal = (alias) => {
  cy.get(alias)
    .find('.btn-outline-secondary, .btn-outline-dark, .btn-close, button:contains("ยกเลิก"), button:contains("ปิด")')
    .first()
    .click({ force: true });
  cy.get('.modal.fade.show,[aria-modal="true"],.modal.d-block:visible').should('not.exist');
};

describe(' Admin Rooms Management Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.visit('/admin/rooms');
  });

  it('1 displays header, summary cards, and floor map correctly', () => {
    cy.contains(/จัดการห้อง|Rooms/i).should('be.visible');
    cy.contains(/รายงานและสถิติการดำเนินงาน|Overview/i).should('be.visible');
    cy.contains('ห้องพักทั้งหมด').should('exist');
    cy.contains('ห้องว่าง').should('exist');
    cy.contains('ห้องที่ให้เช่า').should('exist');
    cy.contains('ห้องปิดปรับปรุง').should('exist');
  });

  it('2 tests dropdown filters: ชั้น / ประเภท / สถานะ', () => {
    // ชั้น
    cy.get('select').eq(0).as('floorSelect');
    cy.get('@floorSelect').select('1', { force: true });
    cy.wait(300);
    cy.get('@floorSelect').select('all', { force: true }).should('exist');

    // ประเภทห้อง (เลือกจากข้อความ เช่น "Studio")
    cy.get('select').eq(1).as('typeSelect');
    cy.get('@typeSelect').find('option').then(($opts) => {
      const studioOpt = [...$opts].find(opt =>
        opt.textContent.toLowerCase().includes('studio')
      );
      if (studioOpt) {
        cy.get('@typeSelect').select(studioOpt.textContent.trim(), { force: true });
        cy.wait(300);
      }
    });

    // กลับค่าเดิม (เลือก option แรก)
    cy.get('@typeSelect').find('option').first().then(($opt) => {
      const firstText = $opt.text().trim();
      cy.get('@typeSelect').select(firstText, { force: true });
    });

    // สถานะ
    cy.get('select').eq(2).as('statusSelect');
    cy.get('@statusSelect').find('option').then(($opts) => {
      const availableOpt = [...$opts].find(opt =>
        opt.textContent.match(/ว่าง|available|พร้อม|occupied/i)
      );
      if (availableOpt) {
        cy.get('@statusSelect').select(availableOpt.textContent.trim(), { force: true });
        cy.wait(300);
      }
    });

    // กลับค่าเดิม (เลือก option แรก)
    cy.get('@statusSelect').find('option').first().then(($opt) => {
      const firstText = $opt.text().trim();
      cy.get('@statusSelect').select(firstText, { force: true });
    });
  });

  it('3 tests clicking rooms and verifying detail panel', () => {
    const verifyRoom = (num, type, status, tenant) => {
      cy.contains('button', num).click();
      cy.wait(500);
      cy.contains(`ห้อง ${num}`).should('exist');
      cy.contains(type).should('exist');
      cy.contains('สถานะ').parent().should('contain', status);
      cy.contains('ผู้เช่าปัจจุบัน').parent().should('contain', tenant);
    };
    verifyRoom('101', 'Standard Studio', 'ว่าง', '-');
    verifyRoom('104', 'Standard Studio', 'ไม่ว่าง', 'Mana Chujai');
    verifyRoom('208', 'Deluxe Studio', 'ปรับปรุง', '-');
  });

  it('4 tests toggling room 208 status (เปิดให้เช่า / ปรับปรุง)', () => {
    cy.contains('button', '208').click();
    cy.contains('ห้อง 208').should('exist');

    cy.contains('button', 'เปิดให้เช่า').click({ force: true });
    cy.wait(1200);
    cy.contains('สถานะ').parent().should('contain', 'ว่าง');
    cy.contains('button', 'ปิดปรับปรุง').should('be.visible');

    cy.contains('button', 'ปิดปรับปรุง').click({ force: true });
    cy.wait(1200);
    cy.contains('สถานะ').parent().should('contain', 'ปรับปรุง');
    cy.contains('button', 'เปิดให้เช่า').should('be.visible');
  });

  // ────────────────────────────────
  it('5 opens "จัดการประเภทห้องพัก" modal, edits values, reverts, and closes without saving', () => {
    // เปิด modal
    cy.contains('button', /จัดการประเภทห้องพัก|Room Type/i, { timeout: 10000 })
      .should('exist')
      .click({ force: true });

    openModal().as('typeModal');
    cy.get('@typeModal').should('contain.text', 'จัดการประเภทห้องพัก');

    // แก้ค่า “Superior Studio”
    cy.get('@typeModal').find('input[type="text"]').first().as('typeName');
    cy.get('@typeModal').find('input[type="number"]').first().as('typePrice');
    cy.get('@typeModal').find('textarea').first().as('typeDesc');

    cy.get('@typeName').invoke('val').then((oldName) => {
      cy.get('@typeName').clear().type(`${oldName} X`);
      cy.wait(300);
      cy.get('@typeName').clear().type(oldName);
    });

    cy.get('@typePrice').invoke('val').then((oldPrice) => {
      cy.get('@typePrice').clear().type('9999');
      cy.wait(300);
      cy.get('@typePrice').clear().type(oldPrice);
    });

    cy.get('@typeDesc').invoke('val').then((oldDesc) => {
      cy.get('@typeDesc').clear().type('Test temporary description');
      cy.wait(300);
      cy.get('@typeDesc').clear().type(oldDesc);
    });

    // ปิด modal โดยไม่บันทึก
    closeModal('@typeModal');
  });

  // ────────────────────────────────
  it('6 opens "เพิ่มห้องพักใหม่" modal, fills mock data, clears, and closes', () => {
    cy.contains('button', /เพิ่มห้องพัก|สร้างห้องพักใหม่|\+ สร้างห้อง/i)
      .should('exist')
      .click({ force: true });

    openModal().as('createModal');
    cy.get('@createModal').should('contain.text', 'สร้างห้องพักใหม่');

    // กรอก mock
    cy.get('@createModal').within(() => {
      cy.get('select[name="roomTypeId"]').select('RT01', { force: true });
      cy.get('input[name="roomNum"]').type('999');
      cy.get('input[name="floor"]').type('9');
      cy.get('input[name="roomNum"]').should('have.value', '999');
    });

    // ล้างค่า (คืนเดิม)
    cy.get('@createModal').within(() => {
      cy.get('select[name="roomTypeId"]').select('', { force: true });
      cy.get('input[name="roomNum"]').clear();
      cy.get('input[name="floor"]').clear();
    });

    // ปิด modal โดยไม่บันทึก
    closeModal('@createModal');
  });
});