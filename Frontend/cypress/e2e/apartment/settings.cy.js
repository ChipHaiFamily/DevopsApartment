// cypress/e2e/admin/settings.cy.js
// Flexible assertions for SettingsPage 
// at /admin/settings
const visitSettings = () => {
  cy.viewport(1440, 900);
  cy.loginPreset(); // 👈 login ก่อนทุก test
  cy.visit('admin/settings');
  cy.contains(/ตั้งค่าระบบ/).should('be.visible'); // Page title
  cy.contains(/จัดการ.*กำหนดค่า/).should('be.visible'); // Page subtitle
};

describe('Admin Settings Page (flex)', () => {
  beforeEach(visitSettings);

  it('renders tabs and default active (Template)', () => {
    cy.get('.nav.nav-tabs').within(() => {
      cy.contains('button.nav-link.active', /^เทมเพลต$/).should('exist'); // Default active tab
      ['อัตราค่าบริการ', 'การแจ้งเตือน', 'ระบบ'].forEach(txt => { // Other tabs exist
        cy.contains('button.nav-link', new RegExp(`^${txt}$`)).should('exist'); // Other tabs exist
      });
    });

    // Template tab blocks
    cy.contains(/ข้อมูลส่วนตัว/).should('be.visible'); 
    cy.contains(/เทมเพลตใบเสร็จ/).should('be.visible');

    // Inputs exist & editable (flexible values))
    cy.contains(/หัวข้อสัญญา/).parent().find('input')
      .should('exist')
      .invoke('val').should('match', /.+/)        // มีค่าเริ่มต้นใดๆ
      .then(() => {
        cy.contains(/หัวข้อสัญญา/).parent().find('input')
          .clear().type('สัญญาทดลอง').should('have.value', 'สัญญาทดลอง');
      });

    cy.contains(/หัวข้อใบเสร็จ/).parent().find('input')
      .should('exist').invoke('val').should('match', /.+/);

    // Save button exists & clickable
    cy.contains(/บันทึกเทมเพลต/).should('be.visible').click();
  });

  // อัตราค่าบริการ
  it('Rates tab: utility rates & penalty policy are editable (no hard numbers)', () => {
    cy.get('.nav.nav-tabs').within(() => {
      cy.contains('button.nav-link', /^อัตราค่าบริการ$/).click();
      cy.contains('button.nav-link.active', /^อัตราค่าบริการ$/).should('exist');
    });

    // ตรวจว่าเป็น number และพิมพ์ได้
    const asNumberEditable = (label, newVal = '99') => {
      cy.contains(new RegExp(label)).parent().find('input[type="number"]')
        .as('num')
        .should('exist')
        .invoke('val').then(v => {
          // ต้องเป็นตัวเลข (ยอมรับค่าว่างไม่ได้)
          expect(String(v)).to.match(/^\d+(\.\d+)?$/);
        });
      cy.get('@num').clear().type(newVal).should('have.value', newVal);
    };

    //  4 ค่า flexible check
    asNumberEditable('ค่าน้ำ.*หน่วย', '20');
    asNumberEditable('ค่าไฟ.*หน่วย', '7');
    asNumberEditable('ค่าปรับชำระล่าช้า', '60');
    asNumberEditable('จำนวนงวดคงค้างก่อนคิดค่าปรับ', '2');

    cy.contains(/บันทึกการเปลี่ยนแปลง/).should('be.visible').click();
  });

  // การแจ้งเตือน
  it('Notify tab: switches toggle and channels present', () => {
    cy.get('.nav.nav-tabs').within(() => {
      cy.contains('button.nav-link', /^การแจ้งเตือน$/).click();
      cy.contains('button.nav-link.active', /^การแจ้งเตือน$/).should('exist');
    });

    // 3 แถวการแจ้งเตือนอัตโนมัติ flexible check
    cy.get('.list-group-item').should('have.length.at.least', 3)
      .each($row => {
        cy.wrap($row).find('input.form-check-input[type="checkbox"]') 
          .should('exist')
          .then($chk => {
            const initiallyChecked = $chk.is(':checked'); // initial state
            cy.wrap($chk).click().should(`${initiallyChecked ? 'not.' : ''}be.checked`); 
            cy.wrap($chk).click().should(`${initiallyChecked ? '' : 'not.'}be.checked`);
          });
      });

    
    cy.contains(/ช่องทางการแจ้งเตือน/).should('be.visible'); // Section header
    cy.get('.list-group-item').filter((i, el) =>
      /อีเมล|LINE/i.test(el.innerText) 
    ).should('have.length.at.least', 2)
     .each($row => cy.wrap($row).find('input[type="checkbox"]').should('exist')); // Checkboxes exist

    cy.contains(/บันทึกการเปลี่ยนแปลง/).click();
  });

  // ระบบ
  it('System tab: system info, backup controls, maintenance actions (flex)', () => {
    cy.get('.nav.nav-tabs').within(() => {
      cy.contains('button.nav-link', /^ระบบ$/).click();
      cy.contains('button.nav-link.active', /^ระบบ$/).should('exist');
    });

    // System info (ไม่ล็อกค่าที่แน่นอน แค่มี/แก้ไขได้) flexible
    cy.contains(/ชื่อระบบ/).parent().find('input')
      .should('exist')
      .invoke('val').should('match', /.+/)
      .then(() => {
        cy.contains(/ชื่อระบบ/).parent().find('input')
          .clear().type('DevOps Apartment System')
          .should('have.value', 'DevOps Apartment System');
      });

    cy.contains(/เวอร์ชัน/).parent().find('input')
      .should('exist').and('be.disabled');

    // Backup controls + toggle
    cy.contains(/สำรองข้อมูลอัตโนมัติ/).should('be.visible');
    cy.contains(/สำรองข้อมูลทุกวันเวลา/).should('be.visible');
    cy.contains(/สำรองข้อมูลตอนนี้/).click();
    cy.contains(/กู้คืนข้อมูล/).click();

  
    cy.get('.form-check.form-switch .form-check-input')
      .should('exist')
      .then($chk => {
        const initiallyChecked = $chk.is(':checked');
        cy.wrap($chk).click().should(`${initiallyChecked ? 'not.' : ''}be.checked`);
        cy.wrap($chk).click().should(`${initiallyChecked ? '' : 'not.'}be.checked`);
      });


    // Maintenance section exists & buttons clickable

    cy.contains(/การบำรุงรักษาระบบ/).should('be.visible');
    cy.get('.alert.alert-warning').should('contain', 'คำเตือน');
    cy.contains(/ล้างแคช/).click();
    cy.contains(/รีเซ็ตระบบ/).click();

    cy.contains(/บันทึกการเปลี่ยนแปลง/).click();
  });
});