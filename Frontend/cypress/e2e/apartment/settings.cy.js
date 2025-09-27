describe('Admin Settings Page', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.visit('http://localhost:3000/admin/settings');
    });
  
    it('shows settings page and tabs', () => {
      cy.contains('DevOps Apartment', { timeout: 8000 }).should('be.visible');
      cy.contains('ตั้งค่าระบบ').should('be.visible');
  
      // แท็บทั้งหมดต้องเห็น
      ['เทมเพลต', 'อัตราค่าบริการ', 'การแจ้งเตือน', 'ระบบ']
        .forEach(t => cy.contains('button, a, [role="tab"]', t).should('be.visible'));
    });
  
    it('tab: ระบบ — shows system fields, backup/restore and maintenance actions', () => {
      cy.contains('ระบบ').click();
  
      // อัตราค่าสาธารณูปโภค (ส่วนหัวแรกของหน้า ระบบ ในภาพ)
      cy.contains('อัตราค่าสาธารณูปโภค').should('be.visible');
      cy.contains('ชื่อระบบ').should('be.visible');
      cy.get('input').should('exist');
      cy.contains('เวอร์ชัน').should('be.visible');
  
      // การแจ้งเตือนอัตโนมัติ (สำรอง/กู้คืน)
      cy.contains('การแจ้งเตือนอัตโนมัติ').should('be.visible');
      cy.contains('สำรองข้อมูลตอนนี้').should('be.visible');
      cy.contains('กู้คืนข้อมูล').should('be.visible');
  
      // การบำรุงรักษาระบบ + ปุ่ม
      cy.contains('การบำรุงรักษาระบบ').should('be.visible');
      cy.contains('ล้างแคช').should('be.visible');
      cy.contains('รีเซ็ตระบบ').should('be.visible');
  
      // ปุ่มบันทึก
      cy.contains('บันทึกการเปลี่ยนแปลง').should('be.visible');
    });
  
    it('tab: เทมเพลต — shows contract and receipt template sections', () => {
      cy.contains('เทมเพลต').click();
  
      // ส่วนเทมเพลตสัญญา
      cy.contains('ข้อมูลส่วนตัว').should('be.visible');
      cy.contains('หัวข้อสัญญา').should('be.visible');
      cy.contains('เนื้อหาสัญญา').should('be.visible');
      cy.contains('ตัวแปรที่ใช้ได้').should('be.visible');
  
      // ส่วนเทมเพลตใบเสร็จ
      cy.contains('เทมเพลตใบเสร็จ').should('be.visible');
      cy.contains('หัวข้อใบเสร็จ').should('be.visible');
      cy.get('textarea, input').should('exist');
  
      cy.contains('บันทึกการเปลี่ยนแปลง').should('be.visible');
    });
  
    it('tab: อัตราค่าบริการ — shows rate & penalty policy fields', () => {
      cy.contains('อัตราค่าบริการ').click();
  
      cy.contains('อัตราค่าสาธารณูปโภค').should('be.visible');
      cy.contains('ค่าน้ำ (บาท/หน่วย)').should('be.visible');
      cy.contains('ค่าไฟ (บาท/หน่วย)').should('be.visible');
  
      cy.contains('นโยบายค่าปรับ').should('be.visible');
      cy.contains('ค่าปรับชำระล่าช้า (บาท/วัน)').should('be.visible');
      cy.contains('จำนวนงวดคงค้างก่อนคิดค่าปรับ').should('be.visible');
  
      cy.contains('บันทึกการเปลี่ยนแปลง').should('be.visible');
    });
  
    it('tab: การแจ้งเตือน — shows toggles and channels', () => {
      cy.contains('การแจ้งเตือน').click();
  
      // รายการ toggle การแจ้งเตือนอัตโนมัติ
      cy.contains('การแจ้งเตือนอัตโนมัติ').should('be.visible');
      cy.contains('แจ้งเตือนใบแจ้งหนี้ครบกำหนด').should('be.visible');
      cy.contains('แจ้งเตือนงานซ่อมบำรุงตามกำหนด').should('be.visible');
      cy.contains('แจ้งเตือนสัญญาใกล้หมดอายุ').should('be.visible');
  
      // ช่องทางการแจ้งเตือน
      cy.contains('ช่องทางการแจ้งเตือน').should('be.visible');
      cy.contains('อีเมล').should('be.visible');
      cy.contains('LINE Notify').should('be.visible');
  
      cy.contains('บันทึกการเปลี่ยนแปลง').should('be.visible');
    });
  
    // (ตัวเลือก) ตรวจว่าสลับแท็บไปมาได้
    it('can switch tabs back and forth without breaking UI', () => {
      cy.contains('อัตราค่าบริการ').click();
      cy.contains('อัตราค่าสาธารณูปโภค').should('be.visible');
  
      cy.contains('การแจ้งเตือน').click();
      cy.contains('การแจ้งเตือนอัตโนมัติ').should('be.visible');
  
      cy.contains('ระบบ').click();
      cy.contains('การบำรุงรักษาระบบ').should('be.visible');
    });
  });