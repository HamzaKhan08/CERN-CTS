# 🧪 CERN Control Tools Suite (CTS)
### This project is intentionally documented in detail to reflect the importance of clarity, traceability, and knowledge sharing in scientific and research-driven environments such as CERN.

### Login Page --- 
<p align="center">
  <img src="screenshots/Screenshot 2026-01-21 at 1.59.58 AM.png" width="800"/>
</p>

### Login as an ADMIN ( also able to login based on role ) - must get approval from admin first then login 
### here Hamzakhan@cern.ch is default admin.. 
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.00.42 AM.png" width="800"/>
</p>

### A built-in chat support system for members who are online on platform ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.03.11 AM.png" width="800"/>
</p>

### A built-in chatbot powered by Gemini that solve query ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.03.46 AM.png" width="800"/>
</p>

### CERN Control Tools Suite (CTS) is a CERN-inspired, enterprise-grade full-stack web application designed to simulate how large-scale scientific experiments and power converter systems are monitored, managed, and analyzed in real operational environments.

### This project focuses on real-time data visualization, system reliability, structured workflows, and role-based access control, reflecting the principles used in research-driven organizations like CERN.

# 🚀 Overview

### CTS provides a unified control platform consisting of two core modules:

### 🔬 Experiment Monitoring Dashboard
#### Main dashboard where Experiment Monitor set by default --
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.01.02 AM.png" width="800"/>
</p>

### A real-time monitoring system that visualizes experiment sensor data such as temperature, voltage, beam intensity, and pressure. It supports live updates, historical analysis, threshold-based alerts, and scientific data visualization.

### ⚡ Power Converter Health Tracking System
#### This is Power Converters Dashboard ( all values are for demonstration purpose, not real ) --
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.01.27 AM.png" width="800"/>
</p>
#### A detail view option for Power Converter Systems ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.08.02 AM.png" width="800"/>
</p>


### This is 3D Demonstration of LHC collison simulator ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.01.45 AM.png" width="800"/>
</p>

### A structured system to track power converter status, faults, severity levels, maintenance history, approval workflows, and audit logs to ensure operational reliability and traceability.

# ✨ Key Features

### 📊 Real-time sensor data streaming using WebSockets

### 📈 Interactive charts and historical trend analysis

### 🚨 Threshold-based alerts and notifications
### Real time notification panel for easily know issue and alerts ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.04.20 AM.png" width="800"/>
</p>

### ⚡ Power converter fault and maintenance tracking

### 🔐 Role-based access control (Admin, Scientist, Engineer, Operator, Supervisor)

### 🧾 Approval workflows with full audit trails

### 🛠 Administrative control panel for user and system management
#### This is System logs ( only visible to admin ) ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.02.14 AM.png" width="800"/>
</p>

### This is Access Control only visible to admin ---
<p align="center">
<img src="screenshots/Screenshot 2026-01-21 at 2.02.35 AM.png" width="800"/>
</p>


### 🧩 Modular, scalable, and clean architecture

# 🧠 Architecture

### CTS follows a modern full-stack architecture:

### Frontend: Vue 3 (Composition API), Pinia, Vite, ECharts

### Backend: FastAPI (async), Pydantic, SQLAlchemy

### Database: PostgreSQL

### Realtime: WebSockets

### The system is designed for scalability, maintainability, and reliability, with clear separation of concerns between frontend, backend, and data layers.

# 🎯 Purpose & Motivation

### CTS is not a generic dashboard project. It was built to understand and demonstrate how operational tools are designed for scientific infrastructures, where correctness, clarity, and reliability are critical.
### The project aligns with CERN’s mission of supporting scientific discovery through robust and well-engineered software systems.

# 📌 Future Enhancements

### Integration with real experimental or IoT data sources

### AI-based anomaly detection and predictive maintenance

### Advanced analytics and reporting

### Kubernetes-based deployment

# 📄 License

### This project is for educational and demonstration purposes, inspired by CERN-style operational systems.
