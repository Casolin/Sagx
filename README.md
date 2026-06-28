# 🚀 SagX

SagX is a full stack mission management platform built for organizations that need structured, rule based workflows instead of manual task coordination.

It also includes real time communication features like chat, voice and video calls, and screen sharing to support collaboration inside the system.

---

<br>

## ✨ Features

<br>

• 🔐 Secure authentication system  
• 🔑 Two Factor Authentication  
• 🔄 Refresh token session management  
• 📋 Mission and task management system  
• 💬 Real time chat system  
• 📞 Voice and video calling  
• 🖥️ Screen sharing  
• 👥 Role based access control  

---

<br>

## ⚙️ How the system works

<br>

SagX is not a basic CRUD app. It behaves like a real operational system with strict rules.

<br>

• 📦 A mission cannot start if required materials are missing  
• 🚫 Missing materials block execution and require manager approval  
• ⚠️ Machine status cannot be changed to “down” without a valid alert  
• 🧑‍🔧 Technicians must contact managers when resources are missing  
• 🔁 Every action is validated before being accepted by the system  

---

<br>

## 📡 Real time system

<br>

• 🌐 WebSocket communication across the entire app  
• 💬 Live chat between users  
• 🔔 Real time alerts for missions, machines and materials  
• ⚡ Instant updates without refreshing the page  

---

<br>

## 📞 Call system

<br>

• 📞 Voice and video calls using WebRTC  
• 🧠 Global call state managed with Zustand  
• 🚫 Users cannot receive multiple calls at the same time  
• 📵 Calls are blocked when a user is already busy  
• 🎛️ In call controls (mute, camera, screen share, minimize)  

---

<br>

## 🧠 State management

<br>

• Zustand handles global state across the app  
• Manages call state and session state  
• Keeps real time updates synchronized everywhere  
• Ensures consistent behavior across all modules  

---

<br>

## 🛠️ Tech stack

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

### Real time
• Socket.io  
• WebSockets  
• WebRTC  

---

<br>

## 🎯 Purpose

<br>

SagX simulates real enterprise systems where everything depends on rules, resources and coordination between users.

It reflects how internal tools work in real companies where actions must be validated and cannot happen freely without constraints.

---

<br>

## 📌 Status

<br>

Still being improved as part of a full stack portfolio project.
