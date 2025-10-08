// describe('Admin Tenant Management', () => {
//   before(() => {
//     cy.loginPreset('admin@apt.com', 'ict555');
//     cy.visit('http://localhost:3000/admin/tenants');
//     cy.contains('จัดการผู้เช่า', { timeout: 10000 }).should('be.visible');
//   });

//   it('checks title and summary cards', () => {
//     cy.contains('จัดการผู้เช่า').should('be.visible');
//     cy.get('.card.card-soft').should('have.length', 3);
//   });

//   it('performs tenant searches', () => {
//     const searchTerms = ['Somsak', '0812345678', 'USR-002', 'Chujai'];
//     searchTerms.forEach((term) => {
//       cy.get('input[placeholder="Search"]').clear().type(term);
//       cy.wait(250);
//       cy.get('input[placeholder="Search"]').clear();
//       cy.wait(250);
//     });
//   });

//   it('switches filters for gender and status', () => {
//     const genders = ['ทุกเพศ', 'ชาย', 'หญิง', 'ทุกเพศ'];
//     const statuses = ['ทุกสถานะ', 'กำลังเช่า', 'หมดสัญญา', 'ยกเลิก', 'ทุกสถานะ'];

//     genders.forEach((g) => {
//       cy.get('select[data-cy="genderFilter"]').select(g);
//       cy.wait(500);
//     });

//     statuses.forEach((s) => {
//       cy.get('select[data-cy="statusFilter"]').select(s);
//       cy.wait(500);
//     });
//   });

//   it('opens and closes tenant creation modal', () => {
//     cy.contains('button', 'สร้างผู้เช่าใหม่').click();
//     cy.get('#tenantModal .modal-title').should('contain', 'สร้างผู้เช่าใหม่');
//     cy.get('#tenantModal input[name="citizenId"]').type('1234567890987');
//     cy.get('#tenantModal input[name="emergencyContact"]').type('1234567890');
//     cy.get('#tenantModal input[name="emergencyName"]').type('Yara');
//     cy.get('#tenantModal input[name="emergencyRelationship"]').type('มารดา');
//     cy.contains('button', 'ยกเลิก').click({ force: true });
//     cy.get('#tenantModal').should('not.exist');
//   });
// });