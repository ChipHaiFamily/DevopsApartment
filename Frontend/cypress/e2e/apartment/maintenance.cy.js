// cypress/e2e/admin/maintenance.cy.js

const openVisibleModal = () =>
  cy.get('.modal.fade.show,.modal.show,[aria-modal="true"],.modal:visible', { timeout: 8000 }).first();

describe('Maintenance Page', () => {
  beforeEach(() => {
    cy.loginPreset();   // login ก่อนทุก test
    cy.clock(new Date('2025-09-26T00:00:00+07:00').getTime()); // fix current date
    cy.visit('/admin/maintenance');
  });

  it('shows header and tabs', () => {
    cy.contains(/ซ่อมบำรุง|Maintenance/i).should('be.visible'); // header
    cy.contains(/จัดการงานซ่อม|การบำรุงรักษา|Manage/i).should('be.visible'); // subheader

    // tabs (งานซ่อม, ตารางซ่อมบำรุง)
    cy.contains(/งานซ่อม/i).should('exist');
    cy.contains(/ตารางซ่อมบำรุง/i).should('exist');
  });

  it('tickets tab: renders table and can open/close detail modal', () => {
    // table header อย่างน้อยต้องมีคำว่า "ห้อง" หรือ "ผู้เช่า"
    cy.get('table thead').within(() => {
      cy.contains(/ห้อง|Room/i).should('exist');
      cy.contains(/สถานะ|Status/i).should('exist');
    });

    // มีอย่างน้อย 1 แถว
    cy.get('table tbody tr').should('have.length.at.least', 1);

    // เปิด modal รายละเอียดจากปุ่มแว่น
    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click();
    });

    // ตรวจ modal แสดงผล
    openVisibleModal().within(() => {
      cy.contains(/แก้ไขงานซ่อม|Maintenance Form/i).should('exist');
      cy.contains(/ห้อง|Room/i).should('exist');
      cy.contains(/ประเภทงาน|Category/i).should('exist');
      cy.contains(/รายละเอียด|Title/i).should('exist');
    });

    // ปิดด้วยปุ่ม X
    cy.get('.modal.show .btn-close, .modal.fade.show .btn-close').click({ force: true });
    cy.get('.modal.show, .modal.fade.show').should('not.exist');
  });

  it('tickets tab: open create-maintenance modal then cancel', () => {
    cy.contains('button', /สร้างงานใหม่|สร้างงานซ่อม|New Ticket|Add/i)
      .should('exist')
      .click();

    openVisibleModal().as('createModal');

    cy.get('@createModal').within(() => {
      cy.contains(/สร้างงานซ่อมใหม่|Create Maintenance/i).should('exist');
    });

    // ปิด modal
    cy.get('@createModal').within(() => {
      if (Cypress.$('.btn-close').length) {
        cy.get('.btn-close').click({ force: true });
      } else {
        cy.contains('button', /ยกเลิก|ปิด|Cancel|Close/i).click({ force: true });
      }
    });

    cy.get('.modal.show, .modal.fade.show').should('not.exist');
  });

  it('plan tab: can click skip button on a schedule', () => {
    cy.contains(/ตารางซ่อมบำรุง|Plan/i).click();

    // verify tab active
    cy.contains('.nav-link.active', /ตารางซ่อมบำรุง|Plan/i).should('exist');

    // verify table headers
    cy.get('table thead').within(() => {
      cy.contains(/งาน|Task/i).should('exist');
      cy.contains(/ครั้งถัดไป|Scope/i).should('exist');
      cy.contains(/ความถี่|Frequency/i).should('exist');
    });

    // อย่างน้อย 1 แถว และกดปุ่ม "ข้ามครั้งนี้"
    cy.get('table tbody tr').should('have.length.at.least', 1).first().within(() => {
      cy.contains('button', /ข้ามครั้งนี้|Skip/i).click();
    });
  });
});

