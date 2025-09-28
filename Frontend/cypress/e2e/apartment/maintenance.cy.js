// cypress/e2e/admin/maintenance.cy.js
// test: /admin/maintenance (MaintenancePage)
describe('Maintenance Page', () => {
  beforeEach(() => {
    // ล็อกเวลาให้ deterministic สำหรับการคำนวณ "เกินกำหนด"
    cy.loginPreset();   // 👈 login ก่อนทุก test
    cy.clock(new Date('2025-09-26T00:00:00+07:00').getTime()); // mock วันที่ปัจจุบันเป็น 2025-09-26 (วันที่ทำ)
    cy.visit('/admin/maintenance');
  });


  it('shows header and tabs', () => {
    cy.contains('ซ่อมบำรุง').should('be.visible'); // header

    cy.contains('จัดการงานซ่อมและการบำรุงรักษา').should('be.visible'); // subheader

    // tabs งานซ่อม (2) กับ ตารางซ่อมบำรุง (2) ที่กดสสลับได้
    cy.get('.tabs-line').within(() => {
      cy.contains('งานซ่อม (2)').should('have.class', 'active'); // งานซ่อม active
      cy.contains('ตารางซ่อมบำรุง (2)').should('exist'); // ตารางซ่อมบำรุง inactive
    });
  });


  it('tickets tab: top stat cards show correct values and formats', () => {

    // card 4 อัน (ตรวจค่าตาม data.json -> invoices_sum)
    // รวมทั้งหมด ฿17,870.5
    cy.contains('รายได้รวม').parent().should('contain', '฿17,870.5');

    // รอชำระ ฿5,420
    cy.contains('รอชำระ').parent().should('contain', '฿5,420');

    // บิลทั้งหมด 3
    cy.contains('บิลทั้งหมด').parent().should('contain', '3');

    // เกินกำหนด 1  (เพราะ INV-06-001 due 2023-06-05 ไม่ใช่ paid และ < วันนี้)
    cy.contains('เกินกำหนด').parent().should('contain', '1');
  });

  it('tickets tab: table renders headers, rows, and status badges', () => {
    // หัวตาราง 
    cy.contains('รายการทั้งหมด').should('be.visible'); // title
    cy.get('table thead tr').within(() => {
      [
        'เลขที่ใบแจ้งหนี้','ห้อง','งวด','ผู้เช่า', 'ยอดรวม','กำหนดชำระ','สถานะ' // table headers
      ].forEach(h => cy.contains('th', h).should('be.visible')); // ตรวจหัวตาราง

    });


    // ช็คจาก data.json 
    // INV-06-001 -> pending ->badge "รอดำเนินการ"
    cy.get('table tbody').within(() => { // body table
      cy.contains('td', 'INV-06-001').parent('tr')
        .should('contain', '101')
        .and('contain', '2023-06')
        .and('contain', 'Somsak Jaidee')
        .and('contain', '5420')
        .and('contain', '2023-06-05')
        .within(() => {
          cy.contains('.badge', 'รอดำเนินการ').should('be.visible'); // pending
        });


      // INV-05-001 => paid -> "ชำระแล้ว"
      cy.contains('td', 'INV-05-001').parent('tr')
        .within(() => {
          cy.contains('.badge', 'ชำระแล้ว').should('be.visible'); // paid
        });

      // INV-06-002 -> paid -> "ชำระแล้ว"
      cy.contains('td', 'INV-06-002').parent('tr') 
        .within(() => {
          cy.contains('.badge', 'ชำระแล้ว').should('be.visible'); // paid
        });
    });
  });

  it('tickets tab: open/close detail modal via search (magnifier) action', () => {
    // เปิดโมดัลจากปุ่มแว่นของแถวแรก

    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click(); // กดปุ่มแว่น เปิด modal
    });

    // ตรวจโมดัล + แบ็กดรอป
    cy.get('.modal.show').should('be.visible').within(() => {
      cy.contains('แบบฟอร์มการซ่อม').should('be.visible');
      cy.contains('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน').should('be.visible');

      // form labels
      cy.contains('label', 'ห้อง').should('be.visible');
      cy.contains('label', 'หมวดหมู่').should('be.visible');
      cy.contains('label', 'หัวข้อปัญหา').should('be.visible');
      cy.contains('label', 'รายละเอียด').should('be.visible');
      cy.contains('ภาพก่อนซ่อมแซม').should('be.visible'); 
    });
    cy.get('.modal-backdrop.show').should('exist'); // มี backdrop

    // close modal with x
    cy.get('.modal.show .btn-close').click(); // กดปุ่ม x
    cy.get('.modal.show').should('not.exist'); // modal ปิด
    cy.get('.modal-backdrop.show').should('not.exist'); // backdrop หาย

    // close modal with cancel button กดเอา
    cy.get('table tbody tr').first().within(() => {
      cy.get('button i.bi-search').parents('button').click(); // เปิด modal อีก
    });
    cy.contains('.modal.show .modal-footer .btn', 'ยกเลิก').click(); // กดปุ่ม ยกเลิก
    cy.get('.modal.show').should('not.exist'); // modal ปิด
  });

  it('switch to plan tab and verify controls + sample row + modal', () => {
    // กดไปแท็บ "ตารางซ่อมบำรุง (2)"
    cy.get('.tabs-line .nav-link').contains('ตารางซ่อมบำรุง (2)').click(); // switch tab
    cy.get('.tabs-line .nav-link.active').should('contain', 'ตารางซ่อมบำรุง (2)'); // active

    //search + filters
    cy.get('.input-group input[placeholder="Search"]').should('be.visible'); // search box
    cy.get('select').should('have.length.at.least', 3); // select 3 ตัว (ขอบเขต, ความถี่, สถานะ)

    // table headers
    cy.get('table thead tr').within(() => {
      ['งาน','ขอบเขต','ความถี่','ครั้งต่อไป','ครั้งล่าสุด'].forEach(h => {
        cy.contains('th', h).should('be.visible'); // หัวตาราง
      });
    });

    // แถวตัวอย่าง + ปุ่มในแถว
    cy.get('table tbody tr').should('have.length.at.least', 1).first().within(() => {  
      cy.contains('td', 'ล้างแอร์ทุก 6 เดือน').should('be.visible'); // งาน
      cy.contains('td', 'ห้องทั้งหมด').should('be.visible'); // ขอบเขต
      cy.contains('td', /\d{4}-\d{2}-\d{2}/).should('exist'); // วันที่
      cy.contains('button', 'ทำงานตอนนี้').should('be.visible'); // ปุ่ม ทำงานตอนนี้
      cy.contains('button', 'ข้ามครั้งนี้').should('be.visible'); // ปุ่ม ข้ามครั้งนี้

      // ปุ่มแว่น เปิดโมดัลได้
      cy.get('button i.bi-search').parents('button').click(); // เปิด modal
    });

    // modal เปิด 
    cy.get('.modal.show').should('be.visible'); // modal เปิด
    cy.get('.modal.show .btn-close').click(); // ปิด modal
    cy.get('.modal.show').should('not.exist'); // modal ปิด
  });
});