# 🚀 SagX

SagX is a full stack mission management system designed for structured enterprise workflows, real time collaboration, and rule based execution logic.

It simulates real operational environments where tasks, machines, and resources must follow strict business constraints before execution.

---

## Features

• Secure authentication system  
• Two Factor Authentication (2FA)  
• Refresh token session management  
• Mission and task management system  
• Real time chat system  
• Voice and video calling  
• Screen sharing  
• Role based access control (RBAC)  

---

## Workflow System

• Missions cannot start without required materials  
• Missing materials block execution automatically  
• Machine status cannot be set to “down” without a valid alert  
• Technicians must contact managers when resources are missing  
• All operations are validated before execution  

---

## Real Time System

• WebSocket based communication between users  
• Live chat system  
• Real time alerts for missions, machines, and materials  
• Instant synchronization across the application  

---

## Call System

• WebRTC based voice and video calls  
• Global call state managed with Zustand  
• Users cannot receive multiple calls at the same time  
• Calls are blocked when a user is already in a call  
• In call controls: mute, camera toggle, screen share, minimize  

---

## State Management

• Zustand handles global application state  
• Call state synchronization across the system  
• Real time UI updates across all modules  
• Consistent behavior between features  

---

## Tech Stack

Frontend  
• React  
• TypeScript  
• Tailwind CSS  
• Zustand  

Backend  
• Node.js  
• Express.js  

Database  
• MongoDB  

Real Time  
• Socket.io  
• WebSockets  
• WebRTC  

---

## Purpose

SagX simulates real enterprise workflow systems where:

• execution depends on resource validation  
• machine states depend on real system alerts  
• actions follow strict business rules  
• communication is embedded into workflows  
• real time coordination is required between users  

It represents how internal operational tools work in real companies.

---

## Status

Active development as part of a full stack engineering portfolio project.
