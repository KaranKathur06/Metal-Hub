---
name: autonomous-deep-connected-system-thinking (ADCST)
description: Autonomously design, analyze, and implement features using full-system architectural intelligence. Use this skill when building, debugging, scaling, or modifying any product feature across frontend, backend, database, APIs, and infrastructure. Infers missing requirements, evaluates system-wide impact, and produces production-grade implementation blueprints without relying on user clarification.
license: Complete terms in LICENSE.txt
---

# Autonomous Deep Connected-System Thinking (ADCST)

This skill enables **self-driven system design**, where the system reconstructs requirements, architecture, and risks automatically without depending on user completeness.

The user provides a feature, issue, or goal. The system expands it into a **full production-ready system plan**.

---

## Core Execution Philosophy

Before doing anything:

- Do NOT ask for missing details  
- Do NOT assume incomplete scope  
- Do NOT operate at UI level  

Instead:

> **Infer → Expand → Model → Stress-Test → Design → Deliver**

Every input is treated as a **partial signal of a larger system requirement**.

---

## 1️⃣ Autonomous Context Reconstruction

Infer system context automatically:

- Product Type (SaaS / marketplace / dashboard / platform)
- Architecture (default: modular monolith → scalable)
- User Roles (guest, user, admin, super admin)
- Scale Tier:
  - Default: 10K–100K users
- Data Sensitivity:
  - Assume moderate unless stated

### Default Context:

System Type: Web Platform
Architecture: Scalable Monolith
Users: Multi-role system
Traffic: Mid-scale

---

## 2️⃣ Root Objective Expansion

Convert the feature into:

- Functional Goal  
- System Goal  
- Risk Boundary  


Functional Goal:
What the feature does

System Goal:
What system behavior it enforces

Risk Boundary:
What must NOT break or be abused


---

## 3️⃣ Implicit Requirement Discovery

Automatically derive:

### Functional Requirements
- Core actions and flows

### Non-Functional Requirements
- Performance
- Security
- Scalability
- Reliability

### Edge Requirements
- Failure cases
- Empty states
- Abuse scenarios

---

## 4️⃣ Domain & Ownership Modeling

Define:

- Core entities
- Relationships
- Ownership rules
- Write authority


Entity → Owner → Access Level → Lifecycle


---

## 5️⃣ System-Wide Impact Mapping

Map full system interaction:


Frontend
→ API Layer
→ Auth Layer
→ Business Logic
→ Database
→ Cache
→ External Systems


Also include:
- Analytics
- Logging
- Notifications

---

## 6️⃣ Layered Deep Analysis

### 🖥️ Frontend

- Component placement based on feature type
- Role-based rendering
- State strategy:
  - Optimistic (default)
  - Pessimistic (if critical)
- Handle:
  - Loading states
  - Error states
  - Retry logic
  - Duplicate actions

---

### ⚙️ Backend (Contract-First)

- API endpoints (method + route)
- Request/response schema
- Validation rules
- Permission checks
- Idempotency handling
- Concurrency handling

---

### 🗄️ Database

- Schema design
- Relationships
- Indexing strategy
- Migration planning
- Normalization vs performance trade-offs

---

### 🔐 Security (Threat Modeling)

- Vertical access control
- Horizontal access control
- Injection protection
- Rate limiting
- Replay attack prevention

---

### 🔗 Side Effects

Always consider:

- Audit logging
- Analytics tracking
- Cache invalidation
- Notification triggers

---

## 7️⃣ State, Consistency & Concurrency Modeling

Define:

- Optimistic vs pessimistic updates
- Locking vs versioning


Use optimistic locking with version control where applicable


Handle:
- Race conditions
- Duplicate requests

---

## 8️⃣ Performance & Scale Simulation

Simulate:

- Normal load
- Peak load
- Stress scenarios

Identify:

- Database bottlenecks
- API latency risks
- Caching opportunities
- N+1 query issues

---

## 9️⃣ Failure & Resilience Modeling

Simulate:

- API failure
- Database failure
- Partial writes
- Timeouts

Define:

- Retry strategies
- Rollback mechanisms
- Fallback behavior
- Graceful degradation

---

## 🔟 Observability (Mandatory)

Include:

- Structured logging
- Metrics
- Distributed tracing


Event: action_performed
Metric: success_rate
Trace: request lifecycle


---

## 1️⃣1️⃣ Deployment & Migration Strategy

Schema update
Backfill data
Deploy backend
Enable frontend
Monitor system
Rollback plan ready

Ensure:

- Zero downtime
- Backward compatibility

---

## 1️⃣2️⃣ Testing Strategy

- Unit tests
- Integration tests
- API contract tests
- Edge case tests
- Load tests

---

## 1️⃣3️⃣ Final Output Structure

Always produce:

Assumed System Context
Root Objective
Derived Requirements
Domain Model
System Impact Map
Frontend Plan
Backend Plan
Database Plan
Security Plan
Consistency Strategy
Performance Plan
Failure Handling
Observability Plan
Deployment Plan
Testing Strategy
Future Expansion Notes

---

## Critical Rules

- Never rely on user completeness  
- Never design in isolation  
- Never skip failure scenarios  
- Never ignore scalability  
- Never produce partial solutions  

---

## Skill Definition

> Autonomously transforms any feature request into a complete, production-ready syst