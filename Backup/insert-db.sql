-- ============================
-- DROP TABLES
-- ============================
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS maintenance_schedule CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS room_types CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================
-- CREATE TABLES
-- ============================

-- Room Types
CREATE TABLE room_types (
    room_type_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
	room_image TEXT NOT NULL
);

-- Rooms
CREATE TABLE rooms (
    room_num VARCHAR(10) PRIMARY KEY,
    floor INT NOT NULL,
    room_type_id VARCHAR(10) REFERENCES room_types(room_type_id),
    status VARCHAR(20) NOT NULL
);

-- Users Table
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    passwd VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    tel VARCHAR(20),
    full_name VARCHAR(100) NOT NULL,
    sex VARCHAR(10),
    job VARCHAR(50),
    workplace VARCHAR(100)
);


-- Tenants
CREATE TABLE tenants (
    tenant_id VARCHAR(20) PRIMARY KEY, 
    citizen_id VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20),
    emergency_relationship VARCHAR(50),
    emergency_name VARCHAR(50),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);


-- Contracts
CREATE TABLE contracts (
    contract_num VARCHAR(20) PRIMARY KEY,
    tenant_id VARCHAR(20) REFERENCES tenants(tenant_id),
    room_num VARCHAR(10) REFERENCES rooms(room_num),
    start_date DATE,
    end_date DATE,
    rent_amount DECIMAL(10,2),
    deposit DECIMAL(10,2),
    billing_cycle VARCHAR(20),
    status VARCHAR(20),
    contract_link VARCHAR(200)
);

-- Invoices
CREATE TABLE invoices (
    invoice_id VARCHAR(20) PRIMARY KEY,
    tenant_id VARCHAR(20) REFERENCES tenants(tenant_id),
    issue_date DATE,
    due_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- Invoice Items
CREATE TABLE invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(20) REFERENCES invoices(invoice_id),
    description VARCHAR(200),
    amount DECIMAL(10,2)
);

-- Payments
CREATE TABLE payments (
    payment_id VARCHAR(20) PRIMARY KEY,
    invoice_id VARCHAR(20) REFERENCES invoices(invoice_id),
    payment_date DATE,
    amount DECIMAL(10,2),
    method VARCHAR(50)
);

-- Maintenance Logs
CREATE TABLE maintenance_logs (
    log_id VARCHAR(20) PRIMARY KEY,
    room_num VARCHAR(10) REFERENCES rooms(room_num),
	invoice_id VARCHAR(20) REFERENCES invoices(invoice_id),
    request_date DATE,
    completed_date DATE,
    log_type VARCHAR(50),
    description TEXT,
    status VARCHAR(20),
    technician VARCHAR(100),
    cost DECIMAL(10,2)
);

-- Maintenance Schedule
CREATE TABLE maintenance_schedule (
    schedule_id VARCHAR(20) PRIMARY KEY,
    task_name VARCHAR(100),
    cycle_interval VARCHAR(20),
    last_completed DATE,
    next_due DATE
);

-- Reservations
CREATE TABLE reservations (
    reservation_num VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) REFERENCES users(id),
    room_type_id VARCHAR(10) REFERENCES room_types(room_type_id),
    date_time TIMESTAMP,
	status VARCHAR(20) NOT NULL
);

-- ============================
-- INSERT SAMPLE DATA
-- ============================

-- Room Types
INSERT INTO room_types VALUES
('RT01', 'Standard Studio', 
 'A cozy 30 sq.m. studio featuring a smart layout with essential furnishings and a private balcony, ideal for everyday living.', 
 8000.00, 
 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/517144873.jpg?k=243847b4fafb8460f08043aef43371febb01b499ef31c2a85ff2e4f08ea0d504&o='),
('RT02', 'Deluxe Studio', 
 'A stylish 40 sq.m. studio with modern décor, a convenient kitchenette, and a larger balcony that offers more comfort and space.', 
 14000.00, 
 'https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('RT03', 'Superior Studio', 
 'A spacious 50 sq.m. studio offering premium furnishings, a fully equipped kitchenette, and an expansive balcony with scenic views.', 
 21000.00, 
 'https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- Rooms
INSERT INTO rooms VALUES
('101', 1, 'RT01', 'available'),
('102', 1, 'RT01', 'available'),
('103', 1, 'RT01', 'available'),
('104', 1, 'RT01', 'occupied'),
('105', 1, 'RT02', 'available'),
('106', 1, 'RT02', 'available'),
('107', 1, 'RT02', 'occupied'),
('108', 1, 'RT02', 'available'),
('109', 1, 'RT03', 'occupied'),
('110', 1, 'RT03', 'available'),
('111', 1, 'RT03', 'available'),
('112', 1, 'RT03', 'available'),
('201', 2, 'RT01', 'available'),
('202', 2, 'RT01', 'available'),
('203', 2, 'RT01', 'available'),
('204', 2, 'RT01', 'available'),
('205', 2, 'RT02', 'available'),
('206', 2, 'RT02', 'occupied'),
('207', 2, 'RT02', 'occupied'),
('208', 2, 'RT02', 'maintenance'),
('209', 2, 'RT03', 'available'),
('210', 2, 'RT03', 'available'),
('211', 2, 'RT03', 'available'),
('212', 2, 'RT03', 'available');

-- User
INSERT INTO users VALUES
('USR-001', 'pass123', 'somsak.j@example.com', '0812345678', 'Somsak Jaidee', 'Male', 'Engineer', 'Bangkok Office'),
('USR-002', 'pass456', 'jane.s@example.com', '0823456789', 'Jane Smith', 'Female', 'Designer', 'Chiang Mai Studio'),
('USR-003', 'pass789', 'mana.c@example.com', '0834567890', 'Mana Chujai', 'Female', 'Teacher', 'Phuket School'),
('USR-004', 'pass321', 'peter.k@example.com', '0845671234', 'Peter Kong', 'Male', 'Accountant', 'Bangkok Office'),
('USR-005', 'pass654', 'lisa.m@example.com', '0856782345', 'Lisa Ma', 'Female', 'HR', 'Chiang Mai Office'),
('USR-006', 'pass987', 'ben.w@example.com', '0867893456', 'Benedict Wong', 'Male', 'Security', 'Phuket Branch'),
('USR-007', 'passWee', 'jack.d@example.com', '0855549889', 'Jack Dawson', 'Male', 'Scammer', 'Titanic'),
('USR-008', 'passAway', 'ben.t@example.com', '0873257841', 'Ben Tennyson', 'Male', 'Student', 'Van');

-- Tenants
INSERT INTO tenants VALUES
('USR-001', '1100100123456', '0898765432', 'Mother', 'Somying Jaidum'),
('USR-002', '1200200456789', '0887654321', 'Father', 'Thong Smith'),
('USR-003', '1300300789123', '0876543210', 'Spouse', 'Stamina Limited'),
('USR-004', '1204400456784', '0897444324', 'Spouse', 'Jane Marry'),
('USR-005', '1200200999799', '0887659999', 'Brother', 'Jack Ma'),
('USR-006', '1300300888123', '0873257894', 'Friend', 'Stephen Strange');

-- Contracts
INSERT INTO contracts VALUES
('CTR-2025-001', 'USR-001', '101', '2024-01-01', '2024-12-31', 8000.00, 16000.00, 'monthly', 'expired', '/contracts/CTR-2025-001.pdf'),
('CTR-2025-002', 'USR-002', '107', '2025-03-15', '2026-03-14', 14000.00, 28000.00, 'monthly', 'active', '/contracts/CTR-2025-002.pdf'),
('CTR-2025-003', 'USR-003', '104', '2025-03-16', '2026-03-15', 8000.00, 16000.00, 'monthly', 'active', '/contracts/CTR-2025-003.pdf'),
('CTR-2025-004', 'USR-004', '207', '2025-04-15', '2026-04-14', 14000.00, 28000.00, 'monthly', 'active', '/contracts/CTR-2025-004.pdf'),
('CTR-2025-005', 'USR-005', '109', '2025-05-01', '2026-05-31', 21000.00, 42000.00, 'monthly', 'active', '/contracts/CTR-2024-005.pdf'),
('CTR-2025-006', 'USR-006', '206', '2025-06-15', '2026-06-14', 14000.00, 28000.00, 'monthly', 'active', '/contracts/CTR-2025-006.pdf');

-- Invoices 
INSERT INTO invoices VALUES
('INV-2024-04-002', 'USR-001', '2025-04-01', '2025-04-05', 9750.50, 'paid'),
('INV-2025-06-001', 'USR-002', '2025-06-01', '2025-06-05', 17070.00, 'paid'),
('INV-2025-06-002', 'USR-003', '2025-06-01', '2025-06-05', 9260.00, 'paid'),
('INV-2025-07-001', 'USR-004', '2025-07-21', '2025-07-28', 300.00, 'paid'),
('INV-2025-07-002', 'USR-005', '2025-07-30', '2025-08-06', 50.00, 'paid'),
('INV-2025-08-001', 'USR-003', '2025-08-02', '2025-08-09', 400.00, 'overdue'),
('INV-2025-08-002', 'USR-002', '2025-08-11', '2025-08-18', 150.00, 'overdue');

-- Invoice Items
INSERT INTO invoice_items (invoice_id, description, amount) VALUES
('INV-2024-04-002', 'Rent for April 2024', 8000.00),
('INV-2024-04-002', 'Water Bill', 50.00),
('INV-2024-04-002', 'Electricity Bill', 1700.50),
('INV-2025-06-001', 'Rent for June 2025', 14000.00),
('INV-2025-06-001', 'Water Bill', 70.00),
('INV-2025-06-001', 'Electricity Bill', 3000.00),
('INV-2025-06-002', 'Rent for June 2025', 8000.00),
('INV-2025-06-002', 'Water Bill', 60.00),
('INV-2025-06-002', 'Electricity Bill', 900.00),
('INV-2025-07-001', 'Plumbing: Leaky faucet', 300.00),
('INV-2025-07-002', 'Electrical: Replaced light bulb', 50.00),
('INV-2025-08-001', 'Painting: Bedroom wall', 400.00),
('INV-2025-08-002', 'Electrical: Fixed power socket', 150.00);

-- Payments
INSERT INTO payments VALUES
('PAY-2024-04-001', 'INV-2024-04-002', '2024-04-03', 9750.50, 'Bank Transfer'),
('PAY-2025-06-001', 'INV-2025-06-001', '2025-06-02', 17070.00, 'Credit Card'),
('PAY-2025-06-002', 'INV-2025-06-002', '2025-06-02', 9260.00, 'Cash'),
('PAY-2025-07-003', 'INV-2025-07-001', '2025-07-26', 300.00, 'Bank Transfer'),
('PAY-2025-07-002', 'INV-2025-07-002', '2025-08-02', 50.00, 'Cash');

-- Maintenance Logs
INSERT INTO maintenance_logs (log_id, room_num, invoice_id, request_date, completed_date, log_type, description, status, technician, cost) VALUES
('ML-2025-001', '207', 'INV-2025-07-001', '2025-07-20', '2025-07-21', 'Plumbing', 'Leaky faucet in the bathroom sink.', 'completed', 'Somchai Service', 300.00),
('ML-2025-002', '208', NULL, '2025-07-02', NULL, 'Air-Con Servicing', 'Scheduled quarterly AC cleaning.', 'in_progress', 'Admin', 0.00),
('ML-2025-003', '109', 'INV-2025-07-002', '2025-07-30', '2025-07-30', 'Electrical', 'Replaced burned out light bulb in the kitchen.', 'completed', 'Admin', 50.00),
('ML-2025-004', '104', 'INV-2025-08-001', '2025-07-28', '2025-08-02', 'Painting', 'Repainted small wall in bedroom.', 'completed', 'Painter Co.', 400.00),
('ML-2025-005', '105', NULL, '2025-08-05', NULL, 'Plumbing', 'Clogged sink drain.', 'in_progress', 'Somchai Service', 0.00),
('ML-2025-006', '107', 'INV-2025-08-002', '2025-08-10', '2025-08-11', 'Electrical', 'Fixed malfunctioning power socket.', 'completed', 'Admin', 150.00),
('ML-2025-007', '110', NULL, '2025-09-01', NULL, 'Air-Con Servicing', 'Quarterly AC maintenance.', 'scheduled', 'Admin', 0.00);

-- Maintenance Schedule
INSERT INTO maintenance_schedule VALUES
('MS-01', 'Quarterly Air-Con Servicing', '90_days', '2025-06-02', '2025-09-02'),
('MS-02', 'Annual Fire Extinguisher Check', '365_days', '2025-01-15', '2026-01-15');

-- Reservations
INSERT INTO reservations VALUES
('RSV-2023-021', 'USR-001', 'RT01', '2023-12-28 09:15:00', 'accepted'),
('RSV-2025-001', 'USR-002', 'RT02', '2025-03-12 11:30:00', 'accepted'),
('RSV-2025-002', 'USR-003', 'RT01', '2025-03-12 16:45:00', 'accepted'),
('RSV-2025-003', 'USR-007', 'RT02', '2025-04-01 10:30:00', 'rejected'),
('RSV-2025-004', 'USR-004', 'RT02', '2025-04-10 14:00:00', 'accepted'),
('RSV-2025-005', 'USR-005', 'RT03', '2025-04-28 13:06:00', 'accepted'),
('RSV-2025-006', 'USR-006', 'RT02', '2025-06-10 15:50:00', 'accepted'),
('RSV-2025-007', 'USR-008', 'RT01', '2025-09-26 12:00:00', 'processing');


alter table reservations add assigned_room VARCHAR(10) default NULL;
UPDATE reservations SET assigned_room = '101' WHERE reservation_num = 'RSV-2023-021';
UPDATE reservations SET assigned_room = '107' WHERE reservation_num = 'RSV-2025-001';
UPDATE reservations SET assigned_room = '104' WHERE reservation_num = 'RSV-2025-002';
UPDATE reservations SET assigned_room = NULL WHERE reservation_num = 'RSV-2025-003';
UPDATE reservations SET assigned_room = '207' WHERE reservation_num = 'RSV-2025-004';
UPDATE reservations SET assigned_room = '109' WHERE reservation_num = 'RSV-2025-005';
UPDATE reservations SET assigned_room = '206' WHERE reservation_num = 'RSV-2025-006';
UPDATE reservations SET assigned_room = NULL WHERE reservation_num = 'RSV-2025-007';
INSERT INTO reservations VALUES
('RSV-2025-008', 'USR-007', 'RT01', '2025-09-26 19:00:00', 'no_show');

UPDATE invoices SET status = 'Paid' WHERE status = 'paid';
UPDATE invoices SET status = 'Pending' WHERE status = 'pending';
UPDATE invoices SET status = 'Overdue' WHERE status = 'overdue';