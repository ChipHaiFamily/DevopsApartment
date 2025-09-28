describe('Admin Invoices Page', () => {
  beforeEach(() => {
    cy.loginPreset();   // 👈 login ก่อนทุก test
    cy.visit('/admin/invoices');
  });

  it('renders summary cards and table', () => {
    cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
    cy.contains('ใบแจ้งหนี้และการชำระเงิน').should('be.visible');

    // cards summary
    cy.contains('รายได้รวม').should('be.visible');
    cy.contains('รอชำระ').should('be.visible');
    cy.contains('บิลทั้งหมด').should('be.visible');
    cy.contains('เกินกำหนด').should('be.visible');

    // table
    // cy.contains('รายการทั้งหมด').should('be.visible');
    cy.get('input[placeholder="Search"]').should('exist');
    cy.get('table', { timeout: 8000 }).should('exist');

    // หัวคอลัมน์หลัก
    // ['เลขที่ใบแจ้งหนี้','ห้อง','งวด','ผู้เช่า','ยอดรวม','กำหนดชำระ','สถานะ']
    // .forEach(h => cy.contains('th', h).should('be.visible'));

    // at least 1 row
    cy.get('table tbody tr').its('length').should('be.greaterThan', 0);
  });

  it('supports searching by invoice no, tenant, and room 107', () => {
    // ===== ค้นหา: เลขที่ใบแจ้งหนี้ =====
    cy.get('input[placeholder="Search"]').clear().type('INV-2024-04-002');
    cy.contains('td', 'INV-2024-04-002', { timeout: 8000 }).should('be.visible');


    // ===== ค้นหา: ผู้เช่า (ตัวอย่างจากภาพ) =====
    cy.get('input[placeholder="Search"]').clear().type('Somsak Jaidee');
    cy.contains('td', 'Somsak Jaidee', { timeout: 8000 }).should('be.visible');

    cy.get('input[placeholder="Search"]').clear().type('Jane Smith');
    cy.contains('td', 'Jane Smith', { timeout: 8000 }).should('be.visible');

    // ===== ค้นหา: ห้อง 107 =====
    cy.get('input[placeholder="Search"]').clear().type('107');
    // ควรเห็น "ห้อง" มี 107
    cy.get('table tbody tr:visible').should($rows => {
      const has107 = [...$rows].some(r => r.innerText.includes('107'));
      expect(has107, 'at least one row with room 107').to.be.true;
    });
  });

  // // ==== CREATE INVOICE MODAL (ฟอร์ม) ====
  // it('open create-invoice modal, validate requireds, then create (mock)', () => {
  //   // เปิดโมดัล
  //   // cy.get('[data-testid="btn-open-create-invoice"]').click();
  //   // cy.get('[data-testid="invoice-form-modal"]').should('be.visible');
  //   // cy.contains('button', 'สร้างใบแจ้งหนี้').click();
  //   // cy.get('#invoiceFormModal').should('be.visible');
  //   // เปิดโมดัลด้วยปุ่มข้อความ (ไม่พึ่ง data-testid)
  //   cy.contains('button', /สร้างใบแจ้งหนี้|เพิ่มใบแจ้งหนี้/i).click();

  //   // รอ modal โผล่แบบยืดหยุ่น (รองรับทั้ง bootstrap และ react-modal)
  //   cy.get('.modal.fade.show,[aria-modal="true"],.modal:visible', { timeout: 8000 })
  //     .should('exist')
  //     .as('createModal');

  //   // ยืนยันหัวข้อในโมดัล (กันคลิกผิดโมดัล)
  //   cy.get('@createModal')
  //     .contains(/ใบแจ้งหนี้|แบบฟอร์ม|สร้าง|เพิ่ม/i)
  //     .should('be.visible');

  //   // กดบันทึกแบบว่าง ๆ เพื่อดู error (หาปุ่มด้วยข้อความหลากหลาย)
  //   cy.get('@createModal')
  //     .contains('button', /บันทึก|สร้าง|Save/i)
  //     .as('saveBtn')
  //     .click();

  //   // // ต้องเห็น error อย่างน้อย 1 จุด (คลาสไหนก็ได้ที่ใช้แสดง)
  //   // cy.get('@createModal')
  //   //   .find('.error, .invalid-feedback, .text-danger')
  //   //   .its('length')
  //   //   .should('be.greaterThan', 0);

  //   // กดบันทึกทั้งที่ว่าง → ต้องเห็น error (flexible)
  //   // cy.get('[data-testid="btn-save-invoice"]').click();
  //   // cy.get('[data-testid="invoice-form-modal"]').within(() => {
  //   //   cy.get('.error, .invalid-feedback, .text-danger')
  //   //     .its('length').should('be.greaterThan', 0);
  //   // });

  //   // กรอกค่าหลัก (ปรับ name/testid ให้ตรงของจริง)
  //   // cy.get('[data-testid="invoice-form-modal"]').within(() => {
  //   //   cy.get('input[name="invoice_id"]').clear().type('INV-TEST-001');
  //   //   cy.get('select[name="room"]').select(1); // หรือ .select('107')
  //   //   cy.get('input[name="tenant"]').clear().type('Somsak Jaidee');
  //   //   cy.get('input[name="period"]').clear().type('2025-09'); // หรือ start/end ที่มี 2 ช่อง
  //   //   cy.get('input[name="total"]').clear().type('12345.50');
  //   //   cy.get('input[name="due_date"]').clear().type('2025-10-05');
  //   //   cy.get('select[name="status"]').select('pending'); // หรือ 'paid'
  //   // });

  //   // บันทึก
  //   // cy.get('[data-testid="btn-save-invoice"]').click();

  //   // ผลลัพธ์เมื่อไม่มี backend:
  //   // A) เห็น toast สำเร็จ และโมดัลปิด
  //   cy.get('body').then($b => {
  //     const hasToast = $b.find('.toast, .alert, .snackbar').length > 0;
  //     if (hasToast) cy.wrap($b).find('.toast, .alert, .snackbar').should('be.visible');
  //   });
  //   // cy.get('[data-testid="invoice-form-modal"]').should('not.be.visible');

  //   // B) (ถ้าหน้าคุณเพิ่ม row ใหม่ทันที) → ค้นหา row จากเลขบิล
  //   cy.get('input[placeholder="Search"]').clear().type('INV-TEST-001');
  //   cy.contains('td', 'INV-TEST-001').should('be.visible');
  // });

  // // ==== DETAIL (แว่น) ====
  // it('open invoice detail (magnifier) and see fields', () => {
  //   // ค้นหาแถวที่มีอยู่จริงสักอัน
  //   cy.get('table tbody tr').first().as('row');
  //   cy.get('@row').within(() => {
  //     // กดปุ่มแว่น
  //     cy.get('[data-testid="btn-view-invoice"], button i.bi-search')
  //       .first()
  //       .parents('button').click({ force: true });
  //   });

  //   // โมดัลรายละเอียดต้องโผล่
  //   cy.get('[data-testid="invoice-detail-modal"]').should('be.visible')
  //     .within(() => {
  //       // ตรวจฟิลด์หลักแบบยืดหยุ่น
  //       cy.contains(/เลขที่ใบแจ้งหนี้|Invoice/i).should('exist');
  //       cy.contains(/ห้อง|Room/i).should('exist');
  //       cy.contains(/ผู้เช่า|Tenant/i).should('exist');
  //       cy.contains(/รวม|Total/i).should('exist');
  //       cy.contains(/กำหนดชำระ|Due/i).should('exist');
  //       cy.contains(/สถานะ|Status/i).should('exist');

  //       // ปุ่มเสริม (ถ้ามี)
  //       cy.get('[data-testid="btn-print"], [data-testid="btn-download"]').then($btns => {
  //         if ($btns.length) cy.wrap($btns).first().click({ force: true });
  //       });
  //     });

  //   // ปิดโมดัล
  //   cy.get('[data-testid="invoice-detail-modal"] [data-bs-dismiss="modal"], [data-testid="btn-close-detail"]').first().click({ force: true });
  //   cy.get('[data-testid="invoice-detail-modal"]').should('not.be.visible');
  // });
});