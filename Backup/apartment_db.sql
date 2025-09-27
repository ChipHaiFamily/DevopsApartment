--
-- PostgreSQL database dump
--

\restrict vNMPoe8FR8xVObnE47IFkIHrScH651ftUyzsUBwWuzYFpAub2cDkXnHCpax2Dam

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    contract_num character varying(20) NOT NULL,
    tenant_id character varying(20),
    room_num character varying(10),
    start_date date,
    end_date date,
    rent_amount double precision,
    deposit double precision,
    billing_cycle character varying(255),
    status character varying(255),
    contract_link character varying(255)
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    item_id bigint NOT NULL,
    invoice_id character varying(20),
    description character varying(255),
    amount numeric(38,2)
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoice_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_item_id_seq OWNER TO postgres;

--
-- Name: invoice_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_items_item_id_seq OWNED BY public.invoice_items.item_id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id character varying(20) NOT NULL,
    tenant_id character varying(20),
    issue_date date,
    due_date date,
    total_amount numeric(38,2),
    status character varying(255)
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: maintenance_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_logs (
    log_id character varying(20) NOT NULL,
    room_num character varying(10),
    invoice_id character varying(20),
    request_date date,
    completed_date date,
    log_type character varying(255),
    description character varying(255),
    status character varying(255),
    technician character varying(255),
    cost double precision
);


ALTER TABLE public.maintenance_logs OWNER TO postgres;

--
-- Name: maintenance_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_schedule (
    schedule_id character varying(20) NOT NULL,
    task_name character varying(255),
    cycle_interval character varying(255),
    last_completed date,
    next_due date
);


ALTER TABLE public.maintenance_schedule OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id character varying(20) NOT NULL,
    invoice_id character varying(20),
    payment_date date,
    amount numeric(38,2),
    method character varying(255)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    reservation_num character varying(20) NOT NULL,
    tenant_id character varying(20),
    room_type_id character varying(10),
    date_time timestamp without time zone
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: room_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_types (
    room_type_id character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    price numeric(38,2) NOT NULL
);


ALTER TABLE public.room_types OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_num character varying(10) NOT NULL,
    floor integer NOT NULL,
    room_type_id character varying(10),
    status character varying(255) NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    tenant_id character varying(20) NOT NULL,
    citizen_id character varying(255) NOT NULL,
    emergency_contact character varying(255),
    emergency_relationship character varying(255)
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(20) NOT NULL,
    passwd character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    tel character varying(255),
    full_name character varying(255) NOT NULL,
    sex character varying(255),
    job character varying(255),
    workplace character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: invoice_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN item_id SET DEFAULT nextval('public.invoice_items_item_id_seq'::regclass);


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (contract_num, tenant_id, room_num, start_date, end_date, rent_amount, deposit, billing_cycle, status, contract_link) FROM stdin;
CTR-2025-001	USR-001	101	2025-01-01	2025-12-31	4500	9000	monthly	active	/contracts/CTR-2025-001.pdf
CTR-2025-002	USR-002	107	2025-03-15	2026-03-14	6000	12000	monthly	active	/contracts/CTR-2025-002.pdf
CTR-2024-005	USR-003	202	2024-06-01	2025-05-31	4500	9000	monthly	expired	/contracts/CTR-2024-005.pdf
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (item_id, invoice_id, description, amount) FROM stdin;
1	INV-05-001	Rent for May 2025	4500.00
2	INV-05-001	Water Bill	150.00
3	INV-05-001	Electricity Bill	700.50
4	INV-06-001	Rent for June 2025	4500.00
5	INV-06-001	Water Bill	160.00
6	INV-06-001	Electricity Bill	760.00
7	INV-06-002	Rent for June 2025	6000.00
8	INV-06-002	Water Bill	200.00
9	INV-06-002	Electricity Bill	900.00
10	INV-07-001	Plumbing: Leaky faucet	300.00
11	INV-07-002	Electrical: Replaced light bulb	50.00
12	INV-07-003	Painting: Bedroom wall	400.00
13	INV-07-004	Electrical: Fixed power socket	150.00
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (invoice_id, tenant_id, issue_date, due_date, total_amount, status) FROM stdin;
INV-05-001	USR-001	2025-05-01	2025-05-05	5350.50	paid
INV-06-001	USR-001	2025-06-01	2025-06-05	5420.00	pending
INV-06-002	USR-002	2025-06-01	2025-06-05	7100.00	paid
INV-07-001	USR-001	2025-05-21	2025-05-28	300.00	paid
INV-07-002	USR-001	2025-04-10	2025-04-17	50.00	paid
INV-07-003	USR-003	2025-07-02	2025-07-09	400.00	pending
INV-07-004	USR-002	2025-08-11	2025-08-18	150.00	pending
\.


--
-- Data for Name: maintenance_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_logs (log_id, room_num, invoice_id, request_date, completed_date, log_type, description, status, technician, cost) FROM stdin;
ML-001	104	INV-07-001	2025-05-20	2025-05-21	Plumbing	Leaky faucet in the bathroom sink.	completed	Somchai Service	300
ML-002	208	\N	2025-06-02	\N	Air-Con Servicing	Scheduled quarterly AC cleaning.	in_progress	Admin	0
ML-003	101	INV-07-002	2025-04-10	2025-04-10	Electrical	Replaced burned out light bulb in the kitchen.	completed	Admin	50
ML-004	102	INV-07-003	2025-07-01	2025-07-02	Painting	Repainted small wall in bedroom.	completed	Painter Co.	400
ML-005	105	\N	2025-08-05	\N	Plumbing	Clogged sink drain.	in_progress	Somchai Service	0
ML-006	107	INV-07-004	2025-08-10	2025-08-11	Electrical	Fixed malfunctioning power socket.	completed	Admin	150
ML-007	110	\N	2025-09-01	\N	Air-Con Servicing	Quarterly AC maintenance.	scheduled	Admin	0
\.


--
-- Data for Name: maintenance_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_schedule (schedule_id, task_name, cycle_interval, last_completed, next_due) FROM stdin;
MS-01	Quarterly Air-Con Servicing	90_days	2025-06-02	2025-09-02
MS-02	Annual Fire Extinguisher Check	365_days	2025-01-15	2026-01-15
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, invoice_id, payment_date, amount, method) FROM stdin;
PAY-001	INV-05-001	2025-05-03	5350.50	Bank Transfer
PAY-002	INV-06-002	2025-06-02	7100.00	Credit Card
PAY-003	INV-07-001	2025-05-22	300.00	Cash
PAY-004	INV-07-002	2025-04-12	50.00	Bank Transfer
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (reservation_num, tenant_id, room_type_id, date_time) FROM stdin;
RSV-2025-001	USR-003	RT02	2025-05-10 10:30:00
RSV-2025-002	USR-002	RT01	2025-05-15 14:00:00
RSV-2025-003	USR-001	RT02	2025-06-01 09:15:00
RSV-2025-004	USR-003	RT01	2025-06-05 11:45:00
RSV-2025-005	USR-002	RT02	2025-06-20 16:30:00
\.


--
-- Data for Name: room_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_types (room_type_id, name, description, price) FROM stdin;
RT01	Standard Studio	A cozy 25 sq.m. studio with a balcony.	4500.00
RT02	Deluxe Studio	A spacious 35 sq.m. studio with a kitchenette and a larger balcony.	6000.00
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (room_num, floor, room_type_id, status) FROM stdin;
101	1	RT01	occupied
102	1	RT01	occupied
103	1	RT01	available
104	1	RT01	maintenance
105	1	RT01	available
106	1	RT01	available
107	1	RT02	occupied
108	1	RT02	available
109	1	RT02	available
110	1	RT02	available
111	1	RT02	available
112	1	RT02	occupied
201	2	RT01	available
202	2	RT01	occupied
203	2	RT01	available
204	2	RT01	available
205	2	RT01	occupied
206	2	RT01	available
207	2	RT02	available
208	2	RT02	maintenance
209	2	RT02	occupied
210	2	RT02	available
211	2	RT02	available
212	2	RT02	available
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (tenant_id, citizen_id, emergency_contact, emergency_relationship) FROM stdin;
USR-001	1-1001-00123-45-6	089-876-5432	Mother
USR-002	1-2002-00456-78-9	088-765-4321	Father
USR-003	1-3003-00789-12-3	087-654-3210	Spouse
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, passwd, email, tel, full_name, sex, job, workplace) FROM stdin;
USR-001	pass123	somsak.j@example.com	081-234-5678	Somsak Jaidee	Male	Engineer	Bangkok Office
USR-002	pass456	jane.s@example.com	082-345-6789	Jane Smith	Female	Designer	Chiang Mai Studio
USR-003	pass789	mana.c@example.com	083-456-7890	Mana Chujai	Female	Teacher	Phuket School
USR-004	pass321	peter.k@example.com	084-567-1234	Peter Kong	Male	Accountant	Bangkok Office
USR-005	pass654	lisa.m@example.com	085-678-2345	Lisa Ma	Female	HR	Chiang Mai Office
USR-006	pass987	tom.w@example.com	086-789-3456	Tom Wong	Male	Security	Phuket Branch
\.


--
-- Name: invoice_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_items_item_id_seq', 13, true);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (contract_num);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (item_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: maintenance_logs maintenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_pkey PRIMARY KEY (log_id);


--
-- Name: maintenance_schedule maintenance_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_pkey PRIMARY KEY (schedule_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_num);


--
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (room_type_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_num);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (tenant_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_room_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_room_num_fkey FOREIGN KEY (room_num) REFERENCES public.rooms(room_num);


--
-- Name: contracts contracts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id);


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- Name: invoices invoices_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id);


--
-- Name: maintenance_logs maintenance_logs_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- Name: maintenance_logs maintenance_logs_room_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_room_num_fkey FOREIGN KEY (room_num) REFERENCES public.rooms(room_num);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- Name: reservations reservations_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(room_type_id);


--
-- Name: reservations reservations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id);


--
-- Name: rooms rooms_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(room_type_id);


--
-- Name: tenants tenants_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict vNMPoe8FR8xVObnE47IFkIHrScH651ftUyzsUBwWuzYFpAub2cDkXnHCpax2Dam

