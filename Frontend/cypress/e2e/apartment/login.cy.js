describe('Login and Admin Navigation Flow', () => {
  const adminEmail = 'admin@apt.com';
  const adminPass = 'ict555';
  const userEmail = 'testlogin@apt.com';
  const userPass = 'ict555';

  // Helper: login
  const login = (email, password) => {
    cy.visit('/login');
    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();
  };

  // Helper: logout
  const logout = () => {
    cy.get('button')
      // .contains('ออกจากระบบ')
      // .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/login');
  };

  // Helper: ตรวจเมนูใน sidebar
  const checkMenu = (label, url, headingRegex) => {
    cy.get('.sb__nav').within(() => {
      cy.contains('.sb__label', label).should('exist').click({ force: true });
    });
    cy.url().should('include', url);
    cy.contains(headingRegex, { timeout: 8000 }).should('be.visible');
  };

  it('Admin can login, navigate all menus, and logout', () => {
    login(adminEmail, adminPass);

    // Dashboard
    cy.url().should('include', '/admin');
    cy.contains(/แดชบอร์ด|Dashboard/i).should('be.visible');

    // ตรวจเมนูทั้งหมดใน sidebar
    checkMenu('จัดการห้อง', '/admin/rooms', /จัดการห้อง|Room/i);
    checkMenu('คำขอเช่า', '/admin/requests', /คำขอ|Request/i);
    checkMenu('ผู้เช่า', '/admin/tenants', /ผู้เช่า|Tenant/i);
    checkMenu('สัญญาเช่า', '/admin/leases', /สัญญา|Lease/i);
    checkMenu('ใบแจ้งหนี้', '/admin/invoices', /ใบแจ้งหนี้|Invoice/i);
    checkMenu('ซ่อมบำรุง', '/admin/maintenance', /ซ่อมบำรุง|Maintenance/i);
    checkMenu('รายงาน', '/admin/reports', /รายงาน|Report/i);
    checkMenu('ตั้งค่า', '/admin/settings', /ตั้งค่า|Setting/i);

    // กลับหน้าแดชบอร์ด
    checkMenu('แดชบอร์ด', '/admin', /แดชบอร์ด|Dashboard/i);

    // ออกจากระบบ
    logout();
  });

  it('User can login and logout successfully', () => {
    login(userEmail, userPass);

    // ตรวจว่าล็อกอินสำเร็จ (ไม่อยู่ที่ /login)
    // cy.url().should('not.include', '/login');
    // cy.get('button.nv__link').should('contain', 'ออกจากระบบ');

    logout();
  });

  it('should show error when using invalid email format', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('invalidemail');
    cy.get('input[name="password"]').type('123456');
    cy.get('button[type="submit"]').click();

    // ต้องเห็นข้อความ error ของอีเมล
    cy.contains(/กรุณากรอกอีเมลให้ถูกต้อง/i).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should show error when using wrong password', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    // ต้องเห็นข้อความ error ของรหัสผ่านผิด
    cy.contains(/อีเมลหรือรหัสผ่านไม่ถูกต้อง|เข้าสู่ระบบล้มเหลว/i, { timeout: 6000 })
      .should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should show error when both fields are empty', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();

    // ต้องมี error ทั้งสองฟิลด์
    cy.contains(/กรุณากรอกอีเมลให้ถูกต้อง/i).should('be.visible');
    cy.contains(/รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร/i).should('be.visible');
    cy.url().should('include', '/login');
  });
});