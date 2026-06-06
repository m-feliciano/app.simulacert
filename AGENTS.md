# AGENTS.md

## Purpose

This document defines the operating standards, architectural principles, coding conventions, and delivery expectations for all AI agents and engineers contributing to this Angular 21 application.

The primary objective is to maintain a scalable, testable, secure, and high-performance frontend platform that can evolve without accumulating unnecessary technical debt.

---

# Technology Stack

## Core

* Angular 21
* TypeScript (strict mode enabled)
* RxJS
* Angular Signals
* Angular Router
* Angular Forms
* Angular HttpClient

## Testing

* Jest
* Angular Testing Utilities
* Cypress (E2E)

## Quality

* ESLint
* Prettier
* Husky
* lint-staged

---

# Engineering Principles

## 1. Simplicity First

Prefer the simplest implementation that satisfies the requirements.

Avoid:

* Premature abstractions
* Generic frameworks inside the application
* Over-engineering
* Unnecessary inheritance

Favor:

* Composition
* Clear naming
* Explicit behavior

---

## 2. Maintainability Over Cleverness

Code should be optimized for future developers.

If a solution requires extensive explanation, redesign it.

---

## 3. Strong Typing

Never use:

```typescript
any
```

Avoid:

```typescript
unknown
```

unless justified.

Always create explicit interfaces, types, and domain models.

Example:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}
```

---

## 4. Standalone Components Only

All new components must use Angular standalone APIs.

Example:

```typescript
@Component({
  standalone: true
})
export class UserListComponent {}
```

NgModules are prohibited unless required by a third-party library.

---

# Architecture

## Feature-Based Structure

Organize by business domain.

```text
src/
├── app/
│   ├── core/
│   ├── shared/
│   ├── features/
│   │   ├── authentication/
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── settings/
```

Do not organize by technical type.

Avoid:

```text
components/
services/
models/
pipes/
```

at the root level.

---

## Core Layer

Contains:

* Authentication
* HTTP Interceptors
* Global Error Handling
* Application Configuration
* Route Guards
* Global Providers

Core must not depend on feature modules.

---

## Shared Layer

Contains reusable:

* UI components
* Pipes
* Directives
* Utility functions

Shared code must remain domain-agnostic.

---

## Feature Layer

A feature owns:

* Pages
* Components
* Services
* State
* Routes
* Models

A feature should be independently understandable.

---

# State Management

## Signals First

Prefer Angular Signals for local and feature state.

Example:

```typescript
readonly users = signal<User[]>([]);
```

---

## Computed State

Use computed values instead of imperative recalculation.

```typescript
readonly activeUsers = computed(() =>
  this.users().filter(user => user.active)
);
```

---

## Effects

Use effects only for side effects.

Never use effects to synchronize state that can be derived.

---

## RxJS Usage

Use RxJS for:

* HTTP requests
* WebSockets
* Event streams
* Complex async workflows

Avoid RxJS for simple local component state.

---

# Components

## Single Responsibility

Each component should have one clear purpose.

If a component requires multiple sections of unrelated logic, split it.

---

## Smart vs Presentational

### Smart Components

Responsibilities:

* API communication
* Routing
* State orchestration

### Presentational Components

Responsibilities:

* Rendering
* Inputs
* Outputs

No business logic.

---

## Inputs and Outputs

Use strongly typed APIs.

Example:

```typescript
@Input({ required: true })
user!: User;

@Output()
saved = new EventEmitter<User>();
```

---

# Services

Services contain business logic.

Components should orchestrate UI behavior only.

Avoid:

```typescript
@Component(...)
export class UserComponent {
  saveUser() {
    ...
  }
}
```

Prefer:

```typescript
@Injectable()
export class UserService {
  saveUser() {
    ...
  }
}
```

---

# HTTP Layer

## API Access

Never call HttpClient directly from components.

Always use dedicated services.

Example:

```typescript
@Injectable()
export class UserApiService {}
```

---

## DTO Separation

Never expose API DTOs directly to UI.

Use mapping layers.

```typescript
UserDto
    ↓
Mapper
    ↓
User
```

---

# Routing

## Lazy Loading Required

All feature routes must be lazy loaded.

Example:

```typescript
{
  path: 'users',
  loadComponent: () =>
    import('./users/users.page')
      .then(m => m.UsersPage)
}
```

---

## Route Guards

Protect routes at the routing level.

Do not rely solely on UI hiding.

---

# Error Handling

## Global Error Handler

Unexpected errors must flow through a centralized handler.

Example:

```typescript
ErrorHandler
```

implementation.

---

## User Feedback

Never silently swallow errors.

Always:

* Log
* Track
* Display meaningful feedback

---

# Performance

## Track Functions

Always provide tracking for list rendering.

Example:

```html
@for (user of users(); track user.id) {
}
```

---

## Lazy Loading

Lazy load:

* Features
* Heavy components
* Large third-party libraries

---

## Bundle Discipline

Before introducing a dependency:

1. Evaluate bundle impact.
2. Evaluate maintenance risk.
3. Evaluate Angular-native alternatives.

---

# Security

## Never Trust Client Data

Validate all inputs.

Assume API responses can be malformed.

---

## XSS Prevention

Never bypass Angular sanitization unless formally reviewed.

Avoid:

```typescript
bypassSecurityTrustHtml()
```

unless absolutely necessary.

---

## Secrets

Never hardcode:

* API keys
* Tokens
* Credentials

Use environment configuration and secure secret management.

---

# Accessibility

Every feature must support:

* Keyboard navigation
* Screen readers
* Focus management
* Semantic HTML

Accessibility is a requirement, not an enhancement.

---

# Testing

## Unit Tests

Required for:

* Services
* Business logic
* Utility functions
* Guards

Target meaningful coverage rather than percentage goals.

---

## Component Tests

Test:

* Inputs
* Outputs
* Rendering
* User interactions

---

## E2E Tests

Critical flows must be covered:

* Authentication
* Authorization
* Navigation
* Primary business workflows

---

# Code Review Standards

Every contribution must verify:

* Correctness
* Readability
* Testability
* Performance
* Accessibility
* Security

Reject code that is merely functional but introduces long-term maintenance costs.

---

# Documentation

Document:

* Architectural decisions
* Public APIs
* Complex business rules

Do not document obvious code.

The code should explain itself whenever possible.

---

# AI Agent Rules

When generating code:

1. Use Angular 21 best practices.
2. Use standalone components.
3. Use Signals before RxJS state.
4. Use strict TypeScript.
5. Use feature-based architecture.
6. Avoid NgModules.
7. Avoid `any`.
8. Create tests for business logic. 
9. Favor maintainability over abstraction.

When uncertain:

* Choose the simpler implementation.
* Choose explicitness over magic.
* Choose readability over cleverness.

The application must remain understandable by a senior engineer with no prior project context.
