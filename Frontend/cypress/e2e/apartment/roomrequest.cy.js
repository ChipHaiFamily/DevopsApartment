describe('Admin Requests Page', () => {
  beforeEach(() => {
    cy.loginPreset();
    cy.visit('/admin/requests');
  });

  it('checks table structure and first 3 rows modals', () => {
    // ตรวจว่าตารางโหลด
    cy.contains('คำขอจองห้องเช่า').should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 3);

    // เปิด modal ทีละแถว 3 แถวแรก
    for (let i = 0; i < 3; i++) {
      cy.get('table tbody tr').eq(i).within(() => {
        cy.get('button i.bi-search').parents('button').click();
      });
      cy.get('.modal.show').should('be.visible');
      cy.get('.modal.show .btn-close, .modal.show button:contains("ปิด")')
        .first()
        .click({ force: true });
      cy.get('.modal.show').should('not.exist');
    }
  });

  it('searches RSV-2023-021 and sees Somsak Jaidee', () => {
    cy.get('input[placeholder="Search"]').type('RSV-2023-021');
    cy.contains('td', 'RSV-2023-021').should('exist').parents('tr')
      .within(() => {
        cy.contains(/Somsak Jaidee/i).should('exist');
      });
  });

  it('searches RSV-2025-001 and sees Jane Smith', () => {
    cy.get('input[placeholder="Search"]').type('RSV-2025-001');
    cy.contains('td', 'RSV-2025-001').should('exist').parents('tr')
      .within(() => {
        cy.contains(/Jane Smith/i).should('exist');
      });
  });

  it('searches RSV-2025-002	 and sees Jane Smith', () => {
    cy.get('input[placeholder="Search"]').type('RSV-2025-002');
    cy.contains('td', 'RSV-2025-002').should('exist').parents('tr')
      .within(() => {
        cy.contains(/Mana Chujai/i).should('exist');
      });
    // ล้างช่องค้นหา
    cy.get('input[placeholder="Search"]').clear().should('have.value', '');
  });

  

  it('searches RSV-2025-001 and sees Jane Smith', () => {
    cy.get('input[placeholder="Search"]').clear().type('RSV-2025-001');
    cy.contains('td', 'RSV-2025-001', { timeout: 8000 }).should('exist').parents('tr')
      .within(() => {
        cy.contains(/Jane Smith/i).should('exist');
      });

    cy.get('input[placeholder="Search"]').clear().should('have.value', '');
  });

  it('searches RSV-2025-002 and sees Mana Chujai', () => {
    cy.get('input[placeholder="Search"]').clear().type('RSV-2025-002');
    cy.contains('td', 'RSV-2025-002', { timeout: 8000 }).should('exist').parents('tr')
      .within(() => {
        cy.contains(/Mana Chujai/i).should('exist');
      });

    cy.get('input[placeholder="Search"]').clear().should('have.value', '');
  });

  it('tests filter: status dropdown switching', () => {
    // หา dropdown ของสถานะ (label: ทุกสถานะ)
    cy.get('select').contains('ทุกสถานะ').should('exist');
    cy.get('select').then($sels => {
      const statusSel = $sels.last(); // ส่วนใหญ่ select สุดท้ายเป็นสถานะ
      const options = ['รออนุมัติ', 'อนุมัติ', 'ปฏิเสธ', 'ทำสัญญาแล้ว', 'ไม่มาทำสัญญา'];

      options.forEach(opt => {
        cy.wrap(statusSel).select(opt, { force: true });
        cy.wait(500);
        cy.get('table tbody tr:visible').should('exist');
      });

      // กลับมาเลือก "ทุกสถานะ"
      cy.wrap(statusSel).select('ทุกสถานะ', { force: true });
    });
  });

  it('tests filter: room type dropdown switching', () => {
    // หา dropdown ของประเภทห้อง (label: ทุกประเภท)
    cy.get('select').contains('ทุกประเภท').should('exist');
    cy.get('select').then($sels => {
      const roomSel = $sels.first(); // ส่วนใหญ่ select ตัวแรกเป็นประเภทห้อง
      const roomTypes = ['Standard Studio', 'Deluxe Studio', 'Superior Studio'];

      roomTypes.forEach(opt => {
        cy.wrap(roomSel).select(opt, { force: true });
        cy.wait(500);
        cy.get('table tbody tr:visible').should('exist');
      });

      // กลับมาเลือก "ทุกประเภท"
      cy.wrap(roomSel).select('ทุกประเภท', { force: true });
    });
  });


});