// cypress/e2e/admin/rooms.cy.js

describe('Admin Rooms Management Page', () => {
  beforeEach(() => {
    cy.loginPreset(); // 👈 login ก่อนทุก test
    cy.visit('/admin/rooms');
  });

  it('displays header, summary cards, and floor map correctly', () => {
    cy.contains(/จัดการห้อง|Rooms/i).should('be.visible');
    cy.contains(/รายงานและสถิติการดำเนินงาน|Overview/i).should('be.visible');

    cy.contains('ห้องพักทั้งหมด').should('exist');
    cy.contains('ห้องว่าง').should('exist');
    cy.contains('ห้องที่ให้เช่า').should('exist');
    cy.contains('ห้องปิดปรับปรุง').should('exist');
  });

  it('tests dropdown filters: ชั้น / ประเภท / สถานะ', () => {
    // ชั้น
    cy.get('select').eq(0).as('floorSelect');
    cy.get('@floorSelect').select('1');
    cy.get('.room-cell').should('exist');
    cy.wait(500);
    cy.get('@floorSelect').select('all');

    // ประเภท
    cy.get('select').eq(1).as('typeSelect');
    cy.get('@typeSelect').find('option').then($opts => {
      const opt = [...$opts].find(o => o.textContent.includes('Standard'));
      if (opt) cy.get('@typeSelect').select(opt.value);
    });
    cy.get('.room-cell').should('exist');
    cy.wait(500);
    cy.get('@typeSelect').select('all');

    // สถานะ
    cy.get('select').eq(2).as('statusSelect');
    cy.get('@statusSelect').select('occupied');
    cy.get('.room-cell').should('exist');
    cy.wait(500);
    cy.get('@statusSelect').select('all');
  });

  it('tests clicking rooms and verifying detail panel', () => {
    const verifyRoom = (num, type, status, price, tenant, buttonText) => {
      cy.contains('button', num).click();
      //  delay
      cy.wait(500);
      cy.contains(`${num}`).should('be.visible');
      cy.contains(type).should('be.visible');
      cy.contains('สถานะ').parent().should('contain', status);
      // cy.contains('ค่าเช่าต่อเดือน').parent().should('contain', price);
      cy.contains('ผู้เช่าปัจจุบัน').parent().should('contain', tenant);
      // cy.contains(buttonText).should('be.visible');
    };

    verifyRoom('101', 'Standard Studio', 'ว่าง', '฿ 8,000', '-', 'ปิดปรับปรุง');
    verifyRoom('102', 'Standard Studio', 'ว่าง', '฿ 8,000', '-', 'ปิดปรับปรุง');
    verifyRoom('104', 'Standard Studio', 'ไม่ว่าง', '฿ 8,000', 'Mana Chujai', 'ไม่สามารถเปลี่ยนสถานะได้');
    verifyRoom('208', 'Deluxe Studio', 'ปรับปรุง', '฿ 14,000', '-', 'เปิดให้เช่า');
  });

  it('tests toggling room 208 status (เปิดให้เช่า / ปรับปรุง)', () => {
    cy.contains('button', '208').click();
    cy.contains('ห้อง 208').should('exist');

    // เปิดให้เช่า → เปลี่ยนเป็น ว่าง
    cy.contains('button','เปิดให้เช่า').click({ force: true });
    cy.wait(1500);
    cy.contains('สถานะ', { timeout: 1000 }).parent().should('contain', 'ว่าง');
    cy.contains('ปิดปรับปรุง', { timeout: 1000 }).should('be.visible');

    // กลับไปปรับปรุง
    cy.contains('button','ปิดปรับปรุง').click({ force: true });
    cy.wait(1500);
    cy.contains('สถานะ', { timeout: 1000 }).parent().should('contain', 'ปรับปรุง');
    cy.contains('เปิดให้เช่า', { timeout: 1000 }).should('be.visible');
  });
});