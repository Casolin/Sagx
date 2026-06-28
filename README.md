# 🚀 SagX

SagX is a full stack mission management platform designed for organizations that need structured, rule based workflows instead of manual task coordination.

It also includes real time communication features such as chat, voice and video calls, and screen sharing to support collaboration inside the system.

---

<br>

## ✨ Features

<br>

• 🔐 Secure authentication system  
• 🔑 Two Factor Authentication (2FA)  
• 🔄 Refresh token based session management  
• 📋 Mission and task management system  
• 💬 Real time chat system  
• 📞 Voice and video calling  
• 🖥️ Screen sharing  
• 👥 Role based access control  

---

<br>

## ⚙️ Core Workflow Logic

<br>

SagX enforces real operational constraints similar to enterprise systems.

<br>

• 📦 A mission cannot start if required materials are missing  
• 🚫 Missing materials block execution and require manager approval  
• ⚠️ Machine status cannot be changed to “down” without a valid alert  
• 🧑‍🔧 Technicians must contact managers when resources are missing  
• 🔁 All actions are validated before being accepted by the system  

---

<br>

## 📡 Real Time System

<br>

• 🌐 WebSocket based communication  
• 💬 Live chat between users  
• 🔔 Real time alerts for missions, machines and materials  
• ⚡ Instant updates without page refresh  
• 🔄 Synchronized state across all users  

---

<br>

## 📞 Call System

<br>

• 📞 Voice and video calls using WebRTC  
• 🧠 Global call state managed with Zustand  
• 🚫 Users cannot receive multiple calls at the same time  
• 📵 Calls are blocked when user is already busy  
• 🎛️ In call controls (mute, camera, screen share, minimize)  

---

<br>

## 🧠 State Management

<br>

• Zustand handles global application state  
• Manages call state across the entire system  
• Keeps real time data synchronized  
• Ensures consistent UI behavior across modules  

---

<br>

## 🛠️ Tech Stack

<br>

### Frontend
• React  
• TypeScript  
• Tailwind CSS  
• Zustand  

<br>

### Backend
• Node.js  
• Express.js  

<br>

### Database
• MongoDB  

<br>

### Real Time Layer
• Socket.io  
• WebSockets  
• WebRTC  

---

<br>

## 🎯 Purpose

<br>

SagX simulates a real world enterprise workflow system where:

• tasks depend on resource availability  
• machine states are controlled by system alerts  
• actions follow strict business rules  
• communication is embedded into workflows  
• real time coordination is required between users  

It reflects how internal operational tools work in industries like logistics, telecom, and field operations.

---

<br>

## 📌 Status

<br>

Actively being improved as part of a full stack engineering portfolio project.
