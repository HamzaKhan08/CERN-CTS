##CERN Control Tools Suite (CTS)

CERN Control Tools Suite (CTS) is a CERN-inspired full-stack web application designed to simulate how scientific experiments and power converter systems can be monitored, analyzed, and managed in operational research environments. The project focuses on real-time data visualization, system reliability, role-based access, and structured operational workflows.

CTS consists of two core modules: an Experiment Monitoring Dashboard for real-time sensor visualization, alerts, and historical analysis, and a Power Converter Health Tracking System for fault management, maintenance history, approval workflows, and audit trails. The application is built with Vue 3 on the frontend, FastAPI on the backend, PostgreSQL for structured data storage, WebSockets for real-time communication, and Docker for environment consistency.

The project emphasizes clean architecture, modular design, security, scalability, and usability — reflecting the principles required in scientific and research-driven software systems. CTS was created as a learning and demonstration platform to understand CERN-style operational tools and to align full-stack development skills with real scientific infrastructure needs.

Key Features

• Real-time experiment sensor monitoring
• Interactive scientific data visualization
• Power converter fault and maintenance tracking
• Approval workflows with audit logs
• Role-based access control
• Admin management panel
• WebSocket real-time updates
• Clean modular architecture
• Dockerized deployment

Tech Stack

Frontend: Vue 3, Pinia, Vite, ECharts
Backend: FastAPI, Pydantic, SQLAlchemy
Database: PostgreSQL
Realtime: WebSockets
DevOps: Docker, Docker Compose

Project Vision

CTS is not a generic dashboard project — it is an operational system prototype inspired by CERN’s mission to support scientific discovery through reliable and scalable software systems.
