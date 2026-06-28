🚀 SagX

A real-time mission management & collaboration system built for structured enterprise workflows.

SagX is a full-stack platform that simulates internal enterprise operations where missions, machines, materials, and communication are tightly controlled by business rules.

It combines task orchestration + real-time collaboration + rule-based constraints in one system.

⚡ Core Idea

Not just a task manager.

SagX enforces real operational logic:

You can’t start a mission without required materials ❌
Machine status can’t be changed without an alert ❌
Users can’t be called if they’re already in a call ❌
Managers must resolve material issues before execution ✔️

This makes SagX behave like a real industrial workflow system, not a basic CRUD app.

🧠 Key Features
🔐 Auth & Security
JWT authentication system
Refresh token session handling
Two-Factor Authentication (2FA)
Role-Based Access Control (RBAC)
📋 Mission System (Smart Workflow Engine)
Mission assignment & tracking
Material validation before execution
Machine-state enforcement rules
Manager escalation flow when resources are missing
Real-time alerts for:
missions
machines
materials
📡 Real-Time Collaboration
💬 Live chat (WebSockets)
📞 Voice & video calls (WebRTC)
🖥️ Screen sharing for collaboration
🔇 In-call controls (mute / camera / minimize UI)
📞 Smart Call System
Prevents multiple calls per user
Blocks incoming calls during active sessions
Real-time call state sync across the app
Global call handling via Zustand
🧩 State Architecture
Zustand global state management
Centralized call/session control
Real-time UI sync across modules
🛠️ Tech Stack

Frontend

React
TypeScript
Tailwind CSS
Zustand

Backend

Node.js
Express.js

Database

MongoDB

Realtime Layer

Socket.io
WebSockets
WebRTC
🎯 Why this project exists

SagX was built to simulate real enterprise workflow systems where:

operations depend on resource validation
actions follow strict business rules
communication is embedded inside workflows
real-time collaboration is essential

It reflects how internal tools work in logistics, telecom, and industrial environments.

🧪 Status

Actively evolving into a production-grade full-stack system.
