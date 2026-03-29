---
description: Apply Deep Connected-System Thinking — a comprehensive system-architect methodology for designing, implementing, debugging, and updating features across all system layers.
---

# Deep Connected-System Thinking Method

> **Trigger phrases:** "Apply deep connected-system thinking", "Use DCST", "deep connected system thinking"

This workflow must be followed **before writing any code** whenever the user invokes it. The goal is to analyze every feature or change as a **full-system impact analysis**, not a quick UI tweak.

---

## 1️⃣ Identify the Root Objective

Do **not** start with the UI or the button. Start with the **why**.

Ask yourself:
- What is this feature **really** trying to achieve?
- What system-level concerns does it touch? (access control, data flow, auditability, scalability)

**Output:** Write a 1–2 sentence **Root Objective** statement.

---

## 2️⃣ Analyze All System Layers

For every feature/change/bugfix, systematically analyze **each layer** below.

### 🖥️ Frontend
- Where does the UI live? Which page/component?
- Who can see it? (role-based visibility)
- What components need to be created or changed?
- What API calls are needed?
- What loading/error/empty states must be handled?

### ⚙️ Backend (API)
- What API endpoints are needed? (method, route, body)
- What permissions must be enforced on each endpoint?
- What validation logic is required? (input sanitization, business rules)
- What services/controllers are affected?

### 🗄️ Database
- What schema fields are affected?
- Do we need a new table or migration?
- Are indexes needed for performance?
- What are the relationships (foreign keys, cascading)?

### 🔐 Authorization & Security
- **Who** can trigger this action?
- **Who** can be affected by it?
- Are there **escalation risks**? (e.g., user promoting themselves)
- Are there **privilege abuse** vectors?
- Is rate limiting needed?
- Is input sanitization sufficient?

### 🔗 Side Effects
Every feature may affect other systems. Check:
- Search indexes
- Analytics / metrics
- Moderation queues
- Notifications (email, push, in-app)
- Audit logs
- Caching / session invalidation
- Third-party integrations

### 🧑‍💻 UX / Workflow
Think beyond the button:
- How will the user **realistically** use this?
- What **mistakes** could they make?
- What **guardrails** are needed? (confirmation modals, undo, reason inputs)
- What is the step-by-step flow?

---

## 3️⃣ Think About Future Expansion

A good solution should **not break** when the product grows.

Ask:
- Will new roles / entities be added later?
- Will permissions become more granular?
- Is the schema flexible enough for future requirements?
- Are we using enums where a lookup table would be more extensible?

**Prefer extensible patterns:**
```
✅ roles → permissions → role_permissions → user_roles
❌ users.role = "admin"
```

---

## 4️⃣ Identify Failure Points

Ask:
- What can **break**? (network failures, race conditions, partial writes)
- What can be **abused**? (parameter tampering, replay attacks)
- What if the **API fails** mid-operation?
- What if the **DB write fails** after the UI updated?
- Do we need **rollback logic** or **optimistic UI reversion**?
- Are there **edge cases** in data? (null values, empty arrays, special characters)

---

## 5️⃣ Generate a Complete Implementation Plan

Before touching any code, produce a structured plan covering:

```
Frontend
  - Components to create/modify
  - State management changes
  - API integration
  - Error handling & loading states

Backend
  - Endpoints (method, route, request/response shape)
  - Permission checks
  - Validation rules
  - Service/controller changes

Database
  - Schema changes / migrations
  - New tables or fields
  - Index considerations

Security
  - Auth checks
  - Input validation
  - Abuse prevention

Side Effects
  - Audit logging
  - Cache invalidation
  - Notification triggers
  - Session handling

Testing
  - Unit tests needed
  - Integration tests needed
  - Edge cases to cover

Future Considerations
  - Extensibility notes
  - Known limitations
```

---

## 6️⃣ Execute With Traceability

When implementing:
- Reference the plan step-by-step
- Commit logically (one concern per change when possible)
- Validate each layer before moving to the next
- Run tests after each significant change

---

## Summary

> **Design every feature by analyzing how it affects the entire system — frontend, backend, database, security, roles, workflows, and future scalability — before implementing anything.**

```
Feature
  ↓ UI
  ↓ API
  ↓ Database
  ↓ Permissions
  ↓ Side Effects
  ↓ Future Scalability
  ↓ Failure Cases
  ↓ Implementation Plan
  ↓ Execute & Validate
```
