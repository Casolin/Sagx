SagX

SagX is a full-stack mission management platform designed for organizations that require structured and rule-based workflows to replace manual coordination.

It combines task management, asset validation rules (machines/materials), and real-time communication tools into a single enterprise-style system.

Key Features
Authentication & Security
Secure authentication system
Refresh token-based session management
Two-Factor Authentication (2FA)
Role-Based Access Control (RBAC)
Mission & Workflow System
Mission assignment and tracking system
Material validation before mission execution
Rule-based workflow constraints:
Technicians cannot start a mission without required materials
System blocks execution and returns validation errors
Requires manager approval or reassignment if materials are missing
Machine status logic:
Machine cannot be marked as “down” unless an alert exists for it
Real-time alerts for missions, machines, and materials
Real-Time Communication
Real-time chat system using WebSockets
Voice and video calls using WebRTC
Screen sharing for collaboration
In-call controls:
mute / unmute microphone
enable/disable camera
minimize call while navigating the app
Call state management:
users cannot receive multiple simultaneous calls
system prevents calling a user already in an active call
State Management
Zustand used for global state management
Handles:
call state across the entire application
active user sessions
real-time UI synchronization
Tech Stack

Frontend

React
TypeScript
Tailwind CSS

Backend

Node.js
Express.js

Database

MongoDB

Real-Time Systems

WebSockets
Socket.io
WebRTC
Purpose

SagX simulates a real-world enterprise workflow system combining task execution, asset validation, and real-time communication.

It is designed to reflect how internal operational tools work in organizations where:

tasks depend on resource availability
actions are restricted by business rules
communication is integrated directly into workflow execution
Status

This project is actively being improved as part of a full-stack development portfolio.
