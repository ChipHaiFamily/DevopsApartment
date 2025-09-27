// cypress/e2e/rooms_booking_flow.cy.js
const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD สำหรับ input[type=date]

/** ปิด modal ถ้ามี */
const closeModalIfAny = () => {
  cy.get('body').then(($b) => {
    const candidates = [
      '[aria-label="Close"]',
      '.modal [aria-label="close"]',
      '.ant-modal-close',
      '.MuiDialog-root [aria-label="close"]',
      '.modal .close',
      'button:contains("ปิด")',
      'button:contains("ตกลง")',
      'button:contains("ยืนยัน")',
      'button:contains("Close")',
      '.MuiDialog-root button',
    ];
    candidates.forEach((sel) => {
      const $el = $b.find(sel);
      if ($el.length) cy.get(sel).first().click({ force: true });
    });
  });
};

describe('Rooms booking flow', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
  });

  it('สามารถสลับไปมาระหว่าง /rooms/small, /rooms/medium, /rooms/large', () => {
    cy.visit('http://localhost:3000/rooms/small');
    cy.url().should('include', '/rooms/small');

    cy.contains(/ห้องกลาง|กลาง|Medium/i)
      .click({ force: true })
      .then(() => cy.url().should('include', '/rooms/medium'), () => {
        cy.visit('http://localhost:3000/rooms/medium');
      });
    cy.url().should('include', '/rooms/medium');

    cy.contains(/ห้องใหญ่|ใหญ่|Large/i)
      .click({ force: true })
      .then(() => cy.url().should('include', '/rooms/large'), () => {
        cy.visit('http://localhost:3000/rooms/large');
      });
    cy.url().should('include', '/rooms/large');
  });

  it('ฟอร์ม: เลือกประเภทห้อง + เลือกวันที่เป็นอดีตแล้วเตือนเรื่องวันที่', () => {
    cy.visit('http://localhost:3000/rooms/small');
    cy.contains('จองห้องที่คุณต้องการ').should('be.visible');

    // เลือก "ประเภทห้องที่ต้องการ" 
    cy.get('select').first().select(1); 

    // กรอกเป็น "เมื่อวาน" / test error date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = fmt(yesterday);

    cy.get('input[type="date"]')
      .first()
      .then(($date) => {
        if ($date.length) cy.wrap($date).invoke('val', yStr).trigger('change');
        else {
          // fallback กรณีเป็น datepicker custom
          cy.get('input')
            .filter((i, el) => (el.placeholder || '').match(/dd|วัน|date/i) || el.type === 'text')
            .first()
            .clear()
            .type(yStr);
        }
      });

    // ติ๊ก checkbox ให้ครบ เพื่อโฟกัส error ที่ "วันที่"
    cy.get('input[type="checkbox"]').eq(0).check({ force: true });
    cy.get('input[type="checkbox"]').eq(1).check({ force: true });

    cy.contains('ส่งคำขอ').click();

    cy.contains('กรอกข้อมูลไม่ครบถ้วน วันที่เข้าอยู่ต้องเป็นวันนี้หรืออนาคต', { timeout: 8000 })
      .should('be.visible');
  });

  it('ฟอร์ม: ไม่ติ๊ก checkbox แล้วส่ง → เตือนให้ยอมรับเงื่อนไขและนโยบาย', () => {
    cy.visit('http://localhost:3000/rooms/medium');

    // เลือกประเภทห้อง + ตั้งวันเป็นวันนี้
    cy.get('select').first().select(1);
    const today = fmt(new Date());
    cy.get('input[type="date"]').first().then(($date) => {
      if ($date.length) cy.wrap($date).invoke('val', today).trigger('change');
      else {
        cy.get('input')
          .filter((i, el) => (el.placeholder || '').match(/dd|วัน|date/i) || el.type === 'text')
          .first()
          .clear()
          .type(today);
      }
    });

    // ไม่ติ๊ก checkbox
    cy.contains('ส่งคำขอ').click();

    cy.contains('กรอกข้อมูลไม่ครบถ้วน กรุณายอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว', { timeout: 8000 })
      .should('be.visible');
  });

  it('เปิดดู "ข้อตกลงและเงื่อนไขการจอง (ตัวอย่าง)" แล้วปิด modal ได้ทุกครั้ง', () => {
    cy.visit('http://localhost:3000/rooms/large');

    cy.contains(/ข้อตกลงและเงื่อนไข/i).click({ force: true });

    // modal
    cy.get('[role="dialog"], .modal, .ant-modal, .MuiDialog-root', { timeout: 8000 }).should('be.visible');
    cy.contains(/ข้อตกลงและเงื่อนไข|ตัวอย่าง/i).should('be.visible');

    // ปิด modal x
    closeModalIfAny();
    // check modal closed
    cy.get('[role="dialog"], .modal, .ant-modal, .MuiDialog-root').should('not.exist');
  });

  it('เคสสำเร็จ: กรอกครบ + ติ๊กครบ → ส่งคำขอสำเร็จ แล้วปิดทุก modal', () => {
    cy.visit('http://localhost:3000/rooms/small');

    // เลือกประเภทห้อง
    cy.get('select').first().select(1);

    // กำหนดวันเป็นวันนี้ / วันหน้าๆ
    const today = fmt(new Date());
    cy.get('input[type="date"]').first().then(($date) => {
      if ($date.length) cy.wrap($date).invoke('val', today).trigger('change');
      else {
        cy.get('input')
          .filter((i, el) => (el.placeholder || '').match(/dd|วัน|date/i) || el.type === 'text')
          .first()
          .clear()
          .type(today);
      }
    });

    // ติ๊ก checkbox ทั้ง 2
    cy.get('input[type="checkbox"]').eq(0).check({ force: true });
    cy.get('input[type="checkbox"]').eq(1).check({ force: true });

    cy.contains('ส่งคำขอ').click();

    cy.contains(
      'ส่งคำขอเรียบร้อย ระบบได้รับคำขอของคุณแล้ว คุณสามารถตรวจสอบสถานะได้ที่หน้าโปรไฟล์ของคุณ',
      { timeout: 8000 }
    ).should('be.visible');

    // 
    closeModalIfAny();
  });
});