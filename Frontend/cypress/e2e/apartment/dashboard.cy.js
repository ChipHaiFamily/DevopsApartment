// cypress/e2e/admin/dashboard.cy.js
// ทดสอบหน้าแดชบอร์ดแอดมิน /admin
// - รองรับ frontend ใหม่
// - ตรวจหัวข้อ, cards, room map, charts, dropdown
// - เพิ่มทดสอบ งานซ่อมบำรุง + คลังสิ่งของ

describe('Admin Dashboard Overview Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.visit('/admin');
  });

  it('1 แสดงหัวข้อหลักและคำอธิบายครบ', () => {
    cy.contains('แดชบอร์ดแอดมิน').should('be.visible');
    cy.contains('ภาพรวมระบบจัดการอพาร์ตเมนต์').should('be.visible');
  });

  it('2 ตรวจการ์ดสถิติหลัก (ไม่ fix ตัวเลข)', () => {
    const cards = [
      'ห้องพักทั้งหมด',
      'ห้องที่ให้เช่า',
      'ใบแจ้งหนี้ค้างชำระ',
      'งานซ่อมที่เปิดอยู่'
    ];

    cards.forEach((label) => {
      cy.contains(label).should('exist');
      cy.contains(label).parent().within(() => {
        cy.get('.fs-4, .fw-bold').should('exist');
      });
    });
  });

  it('3 ตรวจส่วน “แผนที่ห้อง” ว่ามีห้องแสดง และกดได้', () => {
    cy.contains('แผนที่ห้อง').should('be.visible');
    cy.get('.room').should('have.length.greaterThan', 5);
    cy.get('.room').first().click();
  });

  it('4 ตรวจส่วน “อัตราการเข้าพัก” และ “รายได้เดือนนี้”', () => {
    cy.contains('อัตราการเข้าพัก').should('exist');
    cy.get('.progress-bar').should('exist');

    cy.contains('รายได้เดือนนี้').should('exist');
    cy.contains('฿').should('exist');
  });

  it('5 ตรวจส่วน “การใช้น้ำ-ไฟฟ้า” และสลับ dropdown filter', () => {
    cy.contains('การใช้น้ำ-ไฟฟ้า').should('exist');

    cy.get('select.form-select-sm').as('usageSelects');

    cy.get('@usageSelects').eq(0).select('1', { force: true });
    cy.get('@usageSelects').eq(0).select('2', { force: true });

    cy.get('@usageSelects').eq(1).select('มกราคม', { force: true });
    cy.get('@usageSelects').eq(1).select('ตุลาคม', { force: true });

    cy.get('@usageSelects').eq(2).select('พฤศจิกายน', { force: true });
    cy.get('@usageSelects').eq(2).select('ธันวาคม', { force: true });

    cy.get('@usageSelects').eq(3).select('2025', { force: true });
    cy.get('@usageSelects').eq(3).select('2024', { force: true });

    cy.get('.recharts-surface').should('exist');
  });

  it('6 ตรวจส่วน “งานซ่อมบำรุง” และ “ใบแจ้งหนี้ค้างชำระ”', () => {

    // งานซ่อมบำรุง
    cy.contains('งานซ่อมบำรุง')
      .closest('.card')
      .within(() => {
        cy.get('.vstack').should('exist');
        cy.contains(/ไม่มีรายการซ่อมบำรุง|ห้อง|ซ่อม/i).should('exist');
      });

    // ใบแจ้งหนี้ค้างชำระ
    cy.contains('ใบแจ้งหนี้ค้างชำระ')
      .closest('.card')
      .within(() => {
        cy.contains(/ค้างชำระ|ห้อง/i).should('exist');
      });
  });

  it('7 ตรวจส่วน “ตารางซ่อมบำรุง” และ “คลังสิ่งของ”', () => {
    // ตารางซ่อมบำรุง
    cy.contains('ตารางซ่อมบำรุง').should('exist');
    cy.contains('ตารางซ่อมบำรุง')
      .parent()
      .parent()
      .within(() => {
        // cy.contains(/ไม่มีตารางการซ่อมบำรุง/).should('exist');
      });

    // คลังสิ่งของ
    cy.contains('คลังสิ่งของ').should('exist');
    cy.contains('คลังสิ่งของ')
      .parent()
      .parent()
      .within(() => {
        cy.get('.vstack').should('exist');
        cy.contains(/คงเหลือ|หมด|เหลือน้อย/).should('exist');
      });
  });
});