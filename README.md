# Apartment Management System (Admin Tool)

**Bilingual README (English)** **Project by ChipHaiFamily Team**

**Application:** Apartment Management

**Course:** ITDS323 Practical DevOps and Applications

**URL:** https://muict.app/chiphaifamily-frontend

**Presentation Slide:** [Click to View Presentation](https://www.canva.com/design/DAG0F4YESkE/LaqAhwXaGYaYWi47PpS1VA/edit?utm_content=DAG0F4YESkE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

**GitHub Repository (Private):** https://github.com/ChipHaiFamily/DevopsApartment

# Team Members ChipHaiFamily (Ready)

1. **Yatavee Wariyot 6687013** 
2. **Sukollapat Pisuchpen 6687052** 
3. **Ploy Jomboon 6687066**

# Overview

A web-based **Apartment Management System** designed for administrators to manage tenants, room assignments, maintenance tasks, billing, and operational workflows. The system supports 24 rooms (configurable), 2 floors, and includes real-world DevOps implementations such as CI/CD pipelines, monitoring, logging, and Kubernetes-based deployment.

This project is part of the course **ITDS323 Practical DevOps and Applications**, demonstrating industry-standard practices:

- Web application development
- Automated testing (unit + e2e)
- Infrastructure as code
- Containerization (Docker)
- Cluster deployment (Kubernetes)
- Observability (Prometheus, Grafana, OTEL)

# Core Features

### Room & Tenant Management

- Assign tenants to rooms
- Track check-in / check-out
- Prevent double booking

### Billing & Contract

- Generate rental receipts (rent, electricity, water)
- Download printable rent contracts
- Monthly or annual billing cycles

### Maintenance Management

- Log maintenance tasks (plumbing, air-con, lighting)
- Per-room maintenance history
- Scheduled maintenance reminders

### Dashboard

- 24 rooms (12 per floor)
- Occupancy status overview

# Phase 2 Features

- Dynamic room rate (keeps historical values unchanged)
- Supply stock tracking + low inventory alerts
- Summary report: by unit / tenant / month
- Import water/electricity usage via CSV
- Graphs by room/floor/month/year
- Configurable number of rooms/floors
- Payment & debt tracking + optional proof upload
- Store scanned documents (contracts, receipts, maintenance)
- Unpaid bill accumulation + configurable interest rate
- Extra charge per room
- Bulk printing receipt
- RBAC (Manager / Maintenance / Accountant)

# Tech Stack

### **Frontend**

- React + Vite
- TailwindCSS

### **Backend**

- Spring Boot (Java 17)
- Spring Data JPA
- PostgreSQL

### **Infrastructure**

- Docker
- Docker Compose
- Kubernetes (Minikube)
- Nginx Reverse Proxy

### **Monitoring**

- **OTEL Collector** (Config: `/monitoring/otel-collector-config.yaml`)
- **Prometheus** (Config: `/monitoring/prometheus.yml`)
- **Grafana Dashboards**

# Installation & Run (Simple)

### Backend

```
cd Backend
./gradlew bootRun
```

### Frontend

```
cd Frontend
npm install
npm run dev

```

### Full Stack (Docker Compose)

```
docker-compose up -d
```

# Monitoring Quick Start

| **Component** | **Port** | **Description** |
| --- | --- | --- |
| **OTLP HTTP** | `4318` | Receive traces/metrics |
| **Prometheus** | `9090` | Metrics DB |
| **Grafana** | `3001` | Dashboards |
| **Jaeger** | `16686` | Trace viewer |

# Testing

- [x]  Unit Tests (Backend)
- [x]  Cypress E2E tests
- [x]  API Integration Tests

# Project Structure

```
project/
│── Backend/
│── Frontend/
│── k8s/
│── monitoring/
│── docker-compose.yml
│── README.md
```

# License

2026 ChipHaiFamily

# Contributors — ChipHaiFamily

- **Yatavee Wariyot** (6687013)
- **Sukollapat Pisuchpen** (6687052)
- **Ploy Jomboon** (6687066)

# Course Information

This project is part of

**ITDS323 – Practical DevOps and Applications** **Faculty of ICT, Mahidol University.**
