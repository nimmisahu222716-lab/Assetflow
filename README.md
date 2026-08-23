# AssetFlow ERP – Enterprise Asset & Resource Management System

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://assetflow-erp.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/nimmisahu222716-lab/Assetflow)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

**AssetFlow ERP** is a full-stack **Enterprise Asset & Resource Management System** built using the MERN stack. It helps organizations manage assets, employees, departments, shared resources, maintenance, transfers, audits, notifications, and operational analytics through secure role-based workflows.

##  Project Links

 **Live Demo:** https://assetflow-erp.netlify.app

 **GitHub Repository:** https://github.com/nimmisahu222716-lab/Assetflow

---

##  Key Features

-  **Authentication & Role-Based Access Control** – Secure JWT authentication with Admin, Asset Manager, Department Head, and Employee roles.
-  **Asset Management** – Register, search, filter, allocate, transfer, return, and track assets throughout their lifecycle.
-  **Double-Allocation Prevention** – Prevents an already allocated asset from being assigned to another user and provides a transfer request workflow.
-  **Resource Booking** – Book shared resources using time slots with automatic overlap validation.
-  **Maintenance Management** – Raise, approve, assign, track, and resolve maintenance requests with automatic asset status updates.
-  **Asset Audits** – Create audit cycles, assign auditors, verify assets, and generate discrepancy reports.
-  **Reports & Analytics** – Monitor asset utilization, maintenance activity, department allocations, and resource usage.
-  **Notifications & Activity Logs** – Track overdue returns, bookings, transfers, maintenance events, audit discrepancies, and user actions.
-  **Responsive UI** – Optimized for desktop, tablet, and mobile devices.

---

##  User Roles

| Role | Main Capabilities |
| :--- | :--- |
| **Admin** | Organization setup, employee & role management, audit cycles, analytics |
| **Asset Manager** | Asset registration, allocation, transfers, maintenance |
| **Department Head** | Department assets, approvals, resource booking |
| **Employee** | Assigned assets, resource booking, maintenance & transfer requests |

---

##  Demo Accounts

Use these accounts to explore different role-based workflows in the live application.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@assetflow.com` | `Admin123!` |
| **Asset Manager** | `manager@assetflow.com` | `Manager123!` |
| **Department Head** | `depthead@assetflow.com` | `Head123!` |
| **Employee** | `employee@assetflow.com` | `Emp123!` |

> **Tip:** Try logging in with different accounts to explore role-specific dashboards, permissions, and workflows.

---

##  Application Showcase

###  Home

<p align="center">
  <img src="docs/images/home1.png" alt="AssetFlow Home Page" width="100%">
</p>

###  Login

<p align="center">
  <img src="docs/images/login.png" alt="AssetFlow Login" width="100%">
</p>

###  Signup

<p align="center">
  <img src="docs/images/signup.png" alt="AssetFlow Signup" width="100%">
</p>

###  Dashboard

<p align="center">
  <img src="docs/images/dashboard.png" alt="AssetFlow Dashboard" width="100%">
</p>

###  Asset Directory

<p align="center">
  <img src="docs/images/asset-directory.png" alt="Asset Directory" width="100%">
</p>

###  Allocations & Transfers

<p align="center">
  <img src="docs/images/allocations-transfers.png" alt="Asset Allocations and Transfers" width="100%">
</p>

###  Resource Booking

<p align="center">
  <img src="docs/images/resource-booking.png" alt="Resource Booking" width="100%">
</p>

###  Maintenance Management

<p align="center">
  <img src="docs/images/maintenance-management.png" alt="Maintenance Management" width="100%">
</p>

###  Asset Audit

<p align="center">
  <img src="docs/images/asset-audit.png" alt="Asset Audit Cycle" width="100%">
</p>

###  Reports & Analytics

<p align="center">
  <img src="docs/images/reports-analytics.png" alt="Reports and Analytics" width="100%">
</p>

###  Activity Logs & Alerts

<p align="center">
  <img src="docs/images/activity-logs-alerts.png" alt="Activity Logs and Alerts" width="100%">
</p>

---

##  Core Business Logic

### Asset Allocation

Prevents double allocation of an asset that is already allocated, reserved, or under maintenance.

```text
Asset Allocation
       ↓
Conflict Check
       ↓
Allocated / Transfer Request

### Resource Booking

Prevents overlapping bookings for the same shared resource using time-slot validation.

```text
Booking Request
       ↓
Time-Slot Validation
       ↓
Confirmed / Rejected
```

### Maintenance Workflow

Asset status automatically changes throughout the maintenance process.

```text
Pending
   ↓
Approved
   ↓
Under Maintenance
   ↓
Resolved
   ↓
Available
```

### Asset Lifecycle

```text
Available ↔ Allocated
      ↓
   Reserved
      ↓
Under Maintenance
      ↓
   Available

Other states:
Lost | Retired | Disposed
```

---

##  Architecture

```text
React + Vite
     ↓
REST APIs
     ↓
Node.js + Express
     ↓
MongoDB + Mongoose
```

---

##  Tech Stack

**Frontend:** React.js, Vite, JavaScript, HTML5, CSS3  
**Backend:** Node.js, Express.js, REST APIs  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**Tools:** Git, GitHub, npm  
**Deployment:** Netlify + Render

---

##  Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB / MongoDB Atlas

### Installation

```bash
git clone https://github.com/nimmisahu222716-lab/Assetflow.git
cd Assetflow

npm install
npm run install-all
```

### Start the Backend

```bash
cd server
npm start
```

### Start the Frontend

Open a new terminal:

```bash
cd client
npm run dev
```

Create the required environment variables in `.env` before running the application.

---

##  About the Author

**Nimmi Sahu**  
MCA Student | Full-Stack Developer

I am an MCA student at **Jawaharlal Nehru University (JNU), New Delhi**, with a strong interest in full-stack web development and software engineering. I enjoy building practical applications using the **MERN stack** and solving real-world problems through technology.

###  Connect With Me

-  **LinkedIn:** [Nimmi Sahu](https://www.linkedin.com/in/nimmi-sahu-511b77324)
-  **GitHub:** [nimmisahu222716-lab](https://github.com/nimmisahu222716-lab)
-  **AssetFlow Live Demo:** [assetflow-erp.netlify.app](https://assetflow-erp.netlify.app)

---
