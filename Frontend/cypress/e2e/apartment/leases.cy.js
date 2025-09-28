// cypress/e2e/admin/leases.cy.js
// เงื่อนไข: ทุกเทสต์ต้องล็อกอินก่อน และเข้า /admin/leases

const openVisibleModal = () =>
  cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible', { timeout: 8000 }).first();

describe('Admin Leases Page', () => {
  beforeEach(() => {
    cy.loginPreset();   // 👈 login ก่อนทุก test
    cy.visit('/admin/leases');
  });

  it('renders header and table', () => {
    cy.contains(/สัญญาเช่า|Lease/i, { timeout: 8000 }).should('be.visible');
    cy.get('table').should('exist');
    cy.get('table thead th').its('length').should('be.greaterThan', 0);
    cy.get('table tbody tr').its('length').should('be.greaterThan', 0);
  });

  it('opens the create-lease modal, types fields, then CANCEL to close (mock)', () => {
    // เปิดโมดัลสร้างสัญญา
    cy.contains('button', /สร้างสัญญา|เพิ่มสัญญา|Create Lease|New Lease/i)
      .should('be.visible')
      .click();

    openVisibleModal().as('createModal');
    cy.get('@createModal').find('.modal-title').should('exist');

    // กรอกค่าแบบ mock (ไม่บันทึกจริง)
    cy.get('@createModal').within(() => {
      // เลขที่สัญญา
      cy.get('input[type=text], input:not([type])').first().clear().type('LSE-TEST-001');
      // ผู้เช่า
      cy.get('select').first().select(1);
      // ห้อง
      cy.get('select').eq(1).select(1);
      // วันที่เริ่ม
      cy.get('input[type=date]').first().clear().type('2025-10-01');
      // วันที่สิ้นสุด
      cy.get('input[type=date]').eq(1).clear().type('2026-09-30');
    });

    // ปิด modal (ไม่ save)
    cy.get('@createModal').within(() => {
      cy.get('[data-bs-dismiss="modal"], .btn-close').first().click({ force: true });
    });

    cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible').should('have.length', 0);
  });

  it('searches by contract no (mock) and finds tenant', () => {
    cy.get('input[placeholder="Search"]').should('exist').clear().type('CTR-2025-001');
    cy.contains('td', 'CTR-2025-001', { timeout: 8000 }).should('be.visible')
      .parents('tr')
      .within(() => {
        cy.contains(/ผู้เช่า|Tenant|Jane Smith|Somsak/i).should('exist');
      });
  });

  it('opens lease detail via magnifier, sees fields, then closes', () => {
    cy.get('table tbody tr:visible').first().as('firstRow');

    cy.get('@firstRow').within(() => {
      const clickSearch = () => cy.get('button i.bi-search').parents('button').first().click({ force: true });
      cy.get('button i.bi-search').then($i => {
        if ($i.length) clickSearch();
        else cy.contains('button', /รายละเอียด|Detail|View/i).click({ force: true });
      });
    });

    openVisibleModal().as('detailModal');

    cy.get('@detailModal').within(() => {
      cy.contains(/เลขที่.*สัญญา|lease no/i).should('exist');
      cy.contains(/ผู้เช่า|tenant/i).should('exist');
      cy.contains(/ห้อง|room/i).should('exist');
      cy.contains(/ค่าเช่า|rent/i).should('exist');
      cy.contains(/วันเริ่มต้น|start/i).should('exist');
      cy.contains(/วันสิ้นสุด|end/i).should('exist');
    });

    // ปิด detail modal
    cy.get('@detailModal').within(() => {
      cy.get('[data-bs-dismiss="modal"], .btn-close').first().click({ force: true });
    });

    cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible').should('have.length', 0);
  });
});