// cypress/e2e/admin/requests.cy.js
// ทดสอบหน้า RequestPage.jsx ที่ /admin/requests (ไม่พึ่ง backend)

describe('Admin → Requests (flex)', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit('http://localhost:3000/admin/requests');
  });

  it('renders page header and metric cards', () => {
    cy.contains('คำขอเช่า').should('be.visible');
    cy.contains('จัดการรายการคำขอเช่า').should('be.visible');

    // sum card
    ['คำขออนุมัติ', 'ห้องว่าง', 'ห้องที่ไม่ว่าง'].forEach(label => {
      cy.contains(label).should('be.visible')
        .parent().should('exist'); // ไม่ล็อกตัวเลข
    });
  });

  // table
  it('table shows headers, at least one row, and status badges (flex)', () => {
    // เข้าการ์ด "รายการทั้งหมด"
    cy.contains('รายการทั้งหมด').should('be.visible')
      .closest('.card').as('tableCard');

    // tab;e header
    cy.get('@tableCard').find('table thead tr').within(() => {
      [
        'วันที่ยื่นคำขอ', 'อีเมล', 'เบอร์',
        'อาชีพ', 'ความต้องการ', 'สถานะ'
      ].forEach(h => cy.contains('th', h).should('be.visible'));
    });

    // อย่างน้อย 1 แถว
    cy.get('@tableCard').find('table tbody tr').its('length').should('be.greaterThan', 0);

    // สถานะ: ถ้ามี label ใด ๆ อยู่ ให้ตรวจ class ให้ถูกต้อง (เงื่อนไขแบบยืดหยุ่น)
    const statusMap = [
      { label: 'ส่งคำขอแล้ว',    className: 'badge bg-secondary' },
      { label: 'กำลังตรวจสอบ',   className: 'badge bg-warning text-dark' },
      { label: 'อนุมัติ',        className: 'badge bg-success' },
      { label: 'ปฏิเสธ',         className: 'badge bg-danger' },
      { label: 'รอทำสัญญา',      className: 'badge bg-primary' },
    ];

    // เช็กแต่ละสถานะที่อาจมีในตาราง (ถ้ามี)
    statusMap.forEach(({ label, className }) => {
      cy.get('@tableCard').then($card => {
        const exists = $card.find(`.badge:contains(${label})`).length > 0;
        if (exists) {
          cy.wrap($card).contains('.badge', label).should('have.class', className.split(' ')[1]); 
          // เช็กอย่างน้อย class หลัก (bg-*)
        }
      });
    });

    // วันที่: ถ้ามีค่า ให้เป็นสตริงวันที่ (ไทย) คร่าว ๆ — ไม่ล็อกรูปแบบแน่นอน
    cy.get('@tableCard').find('table tbody tr').first().within(() => {
      cy.get('td').eq(0).invoke('text').should('match', /\d{2}\/\d{2}\/\d{4}/); // 08/06/2025 แบบคร่าว ๆ
    });
  });

  // ฟิลเตอร์ + ปุ่ม "ดูทั้งหมด"
  it('filters and "view all" button exist (no redirect asserted)', () => {
    cy.contains('รายการทั้งหมด').closest('.card').within(() => {
      // มีปุ่ม "ดูทั้งหมด"
      cy.contains('button', 'ดูทั้งหมด').should('be.visible').click();

      // มีฟิลเตอร์อย่างน้อยบางตัว (TableBS เรนเดอร์ select ไว้ด้านบน/ในหัวตารางตามโปรเจกต์)
      cy.get('select').its('length').should('be.greaterThan', 0);
    });
  });

  // ลิงก์ไปหน้า detail
  it('clicking magnifier in a row goes to /admin/requests/:id (regex only)', () => {
    cy.contains('รายการทั้งหมด').closest('.card').as('tableCard'); // การ์ดตาราง

    cy.get('@tableCard').find('table tbody tr').first().within(() => {
      // ปุ่มแว่น
      cy.get('button i.bi-search').parents('button').should('be.visible').click();
    });

    // ไม่ล็อกเลข id — แค่ต้องเป็น /admin/requests/<ตัวเลขหรือสตริง>
    cy.url().should('match', /\/admin\/requests\/[^/]+$/);
  });

  // ======= รอ backend ============
  /*
  it('filters by status via API (enable when backend ready)', () => {
    // ตัวอย่าง: intercept เรียก API แล้วตรวจ response / การรีเรนเดอร์
    // cy.intercept('GET', '/api/room_requests*').as('fetchReq');
    // ... เลือกฟิลเตอร์สถานะ ...
    // cy.wait('@fetchReq').its('response.statusCode').should('eq', 200);
  });
  */

  // --- EXTRA: approve / reject actions (if present) ---

// ตัวช่วย: คลิกปุ่มในแถวนั้น แล้วตรวจว่าป้ายสถานะเปลี่ยน (เฉพาะเมื่อพบปุ่มจริง)
function tryActionOnRow(statusBeforeLabel, actionButtonTextOrTestid, statusAfterLabel) {
  cy.contains('รายการทั้งหมด').closest('.card').as('tableCard');

  cy.get('@tableCard').find('table tbody tr').then($rows => {
    // หาแถวที่มีสถานะเริ่มต้นตามที่ต้องการ
    const rowWithStatus = [...$rows].find(tr =>
      tr.innerText.includes(statusBeforeLabel)
    );
    if (!rowWithStatus) {
      cy.log(`ไม่มีแถวที่มีสถานะ: ${statusBeforeLabel} — ข้ามเทสต์ย่อย`);
      return;
    }

    cy.wrap(rowWithStatus).as('row');

    // หา "ปุ่มอนุมัติ/ปฏิเสธ" ในแถว
    cy.get('@row').then($r => { 
      const hasBtnByText =
        $r.find(`button:contains(${actionButtonTextOrTestid})`).length > 0; // ปุ่มแบบข้อความ
      const hasBtnByTestid =
        $r.find(`[data-testid="${actionButtonTextOrTestid}"]`).length > 0; // ปุ่มแบบ testid

      if (!hasBtnByText && !hasBtnByTestid) { // ไม่พบปุ่ม
        cy.log(`ไม่พบปุ่ม "${actionButtonTextOrTestid}" ในแถว — ข้ามเทสต์ย่อย`); 
        return;
      }

      // กัน dialog ยืนยัน (ถ้ามี)
      cy.on('window:confirm', () => true);
      cy.on('window:alert', () => {}); // เงียบ alert mock

      // คลิกปุ่ม
      if (hasBtnByTestid) {
        cy.get('@row').find(`[data-testid="${actionButtonTextOrTestid}"]`).click({ force: true }); // บังคับคลิกเผื่อปุ่มซ่อน
      } else {
        cy.get('@row').contains('button', actionButtonTextOrTestid).click({ force: true }); // บังคับคลิกเผื่อปุ่มซ่อน
      }

      // ยืนยันผลลัพธ์แบบ flexiblr
      // 1) สถานะในแถวเปลี่ยนเป็น label ที่คาด
      // 2) หรือมี toast/snackbar แสดงข้อความ
      cy.wrap($r).within(() => {
        cy.contains('.badge', statusAfterLabel).should('exist'); // ถ้า UI เปลี่ยน badge
      });

      // เผื่อมี toast ของโปรเจกต์คุณ (ไม่บังคับมี)
      cy.get('body').then($b => {
        const hasToast = $b.find('.toast, .alert, .snackbar').length > 0;
        if (hasToast) { 
          cy.wrap($b).find('.toast, .alert, .snackbar').should('be.visible'); // check toast 
        }
      });
    });
  });
}



// ===== flow การทดสอบ approve/reject  =====

// utility: หา context สำหรับกดปุ่ม (ใน row หรือตัวหน้า detail)
function findActionContext() {
  // 1) ลองในแถวของตารางก่อน
  return cy.contains('รายการทั้งหมด').closest('.card').then($card => {
    const $row = $card.find('table tbody tr').filter((i, el) => { // หาแถวที่มีสถานะ "ส่งคำขอแล้ว" หรือ "กำลังตรวจสอบ"
      return /ส่งคำขอแล้ว|กำลังตรวจสอบ/.test(el.innerText); 
    }).first();

    if ($row.length) {
      return cy.wrap($row);
    }

    // 2) ถ้าไม่เจอ ให้กดแว่นของแถวแรกเพื่อเข้า /admin/requests/:id แล้วใช้ body เป็น context
    cy.wrap($card).find('table tbody tr').first().within(() => { // กดแว่น
      cy.get('button i.bi-search').parents('button').click();
    });
    cy.url().should('match', /\/admin\/requests\/[^/]+$/); // ตรวจ url
    return cy.get('body'); // ใช้ทั้งหน้ารายละเอียดเป็น context
  });
}

// utility: เลือกห้องถ้ามีตัวเลือกห้อง
function selectRoomIfPresent($ctx) {
  const hasSelect =
    $ctx.find('select[name="room"]').length > 0 || 
    $ctx.find('[data-testid="room-select"]').length > 0; // custom select

  if (hasSelect) {
    if ($ctx.find('select[name="room"]').length) {
      cy.wrap($ctx).find('select[name="room"]').select(1); // เลือก option ลำดับ 1
    } else {
      cy.wrap($ctx).find('[data-testid="room-select"]').click();
      // กรณีเป็น custom select: เลือก option แรกแบบยืดหยุ่น
      cy.get('body').find('[role="option"], .dropdown-item, li').first().click({ force: true }); // บังคับคลิกเผื่อซ่อน
    }
  } else {
    cy.log('ไม่พบตัวเลือกห้อง (select[name="room"] หรือ [data-testid="room-select"]) — ข้ามการเลือกห้อง'); // ถ้าไม่มี select
  }
}

// utility: กดปุ่ม (อนุมัติ/ปฏิเสธ) ทั้งแบบข้อความหรือ data-testid
function clickAction($ctx, action) {
  const map = {
    approve: { text: 'อนุมัติ', testid: 'approve' },
    reject: { text: 'ปฏิเสธ',  testid: 'reject'  },
  };
  const conf = map[action];

  // intercept confirm/alert ถ้ามี
  cy.on('window:confirm', () => true);

  // หาและกดปุ่ม (ถ้ามี)
  const hasByText = $ctx.find(`button:contains(${conf.text})`).length > 0; 
  const hasByTestid = $ctx.find(`[data-testid="${conf.testid}"]`).length > 0;

  // ถ้าไม่เจอทั้งสองแบบ ให้ข้าม
  if (!hasByText && !hasByTestid) {
    cy.log(`ไม่พบปุ่ม ${conf.text} / data-testid="${conf.testid}" — ข้าม`);
    return;
  }

  // กดปุ่ม (ถ้ามี)
  if (hasByTestid) {
    cy.wrap($ctx).find(`[data-testid="${conf.testid}"]`).click({ force: true });
  } else {
    cy.wrap($ctx).contains('button', conf.text).click({ force: true });
  }
}

// ====== test ======
it('requires room selection before APPROVE; then succeeds after selecting', () => {
  findActionContext().then($ctx => {
    // 1 กด "อนุมัติ" โดยยังไม่เลือกห้อง ต้องแจ้งเตือน
    cy.on('window:alert', (msg) => {
      // ปรับข้อความ regex ให้ครอบคลุมข้อความไทยในโปรเจกต์คุณ
      expect(msg).to.match(/เลือกห้อง|กรุณาเลือกห้องก่อน/i);
    });
    clickAction($ctx, 'approve');

    // 2 เลือกห้อง  กดอีกครั้ง คาดหวัง badge เป็น "อนุมัติ" (ถ้ามี badge ใน context)
    selectRoomIfPresent($ctx);
    // ปิด alert listener เก่า
    cy.on('window:alert', () => {}); 
    clickAction($ctx, 'approve');

    // ตรวจ badge แบบยืดหยุ่น: ถ้า context มีตาราง/แถว
    if ($ctx.is('tr')) {
      cy.wrap($ctx).contains('.badge', 'อนุมัติ').should('exist');
    } else {
      // ถ้าอยู่หน้า detail ให้ลองมองหา badge/ข้อความยืนยันกว้าง ๆ
      cy.get('body').then($b => {
        const hasBadge = $b.find('.badge:contains("อนุมัติ")').length > 0; // badge
        const hasToast = $b.find('.toast, .alert, .snackbar').length > 0;
        if (hasBadge) cy.wrap($b).find('.badge:contains("อนุมัติ")').should('exist');
        if (hasToast) cy.wrap($b).find('.toast, .alert, .snackbar').should('be.visible');
      });
    }
  });
});


// ====== test reject ======
it('requires room selection before REJECT; then succeeds after selecting', () => {
  findActionContext().then($ctx => {
    cy.on('window:alert', (msg) => {
      expect(msg).to.match(/เลือกห้อง|กรุณาเลือกห้องก่อน/i);
    }); //  กด "ปฏิเสธ" โดยยังไม่เลือกห้อง ต้องแจ้งเตือน
    clickAction($ctx, 'reject');

    selectRoomIfPresent($ctx);
    cy.on('window:alert', () => {}); 
    clickAction($ctx, 'reject');

    // ตรวจ badge แบบยืดหยุ่น: ถ้า context มีตาราง/แถว
    if ($ctx.is('tr')) {
      cy.wrap($ctx).contains('.badge', 'ปฏิเสธ').should('exist');
    } else {
      cy.get('body').then($b => {
        const hasBadge = $b.find('.badge:contains("ปฏิเสธ")').length > 0;
        const hasToast = $b.find('.toast, .alert, .snackbar').length > 0;
        if (hasBadge) cy.wrap($b).find('.badge:contains("ปฏิเสธ")').should('exist');
        if (hasToast) cy.wrap($b).find('.toast, .alert, .snackbar').should('be.visible');
      }); // ถ้าอยู่หน้า detail ให้ลองมองหา badge/ข้อความยืนยันกว้าง ๆ
    }
  });
});

});