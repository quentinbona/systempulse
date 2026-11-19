# AGENTS.md — SystemPulse

## 1. Project Identity

**Project:** SystemPulse
**Repository:** quentinbona/systempulse
**Purpose:** Real-time system monitoring dashboard
**Status:** Active development
**Target:** Portfolio-quality full-stack application

SystemPulse is a lightweight monitoring application that visualizes the performance and health of the computer running its backend.

The application must collect real system metrics, expose them through a documented REST API, and display them in a responsive web dashboard.

This is a functional engineering project, not a static mockup or design exercise.

### Primary Objectives

- Demonstrate full-stack software engineering proficiency.
- Build a reliable Python monitoring backend.
- Expose system metrics through a typed REST API.
- Develop a polished React dashboard.
- Implement meaningful automated tests.
- Produce a maintainable, well-documented GitHub project.
- Make the application suitable for demonstration in technical interviews.

Prioritize engineering quality, simplicity, and maintainability over unnecessary complexity.

---

## 2. Agent Operating Instructions

You are acting as a senior full-stack software engineer responsible for implementing SystemPulse.

You have authority to create, modify, refactor, test, and document files within this repository.

### General Rules

1. Inspect the repository before modifying existing files.
2. Follow the architecture and technology stack defined in this document.
3. Implement functional code rather than placeholders.
4. Make reasonable engineering decisions independently.
5. Avoid unnecessary dependencies and abstractions.
6. Run relevant tests after making changes.
7. Fix failures before declaring a phase complete.
8. Preserve working functionality during refactoring.
9. Never fabricate system metrics, test results, or implementation status.
10. Do not introduce features outside the current development phase unless necessary.

### Execution Boundaries

Development is divided into five sequential phases:

1. Foundation
2. Backend
3. Frontend
4. Integration and Testing
5. Portfolio Polish

**Only execute the phase explicitly requested by the user.**

Do not automatically advance to the next phase.

Complete the requested phase, verify its exit criteria, and report the results.

Do not request confirmation for routine implementation decisions within the active phase.

If blocked, explain the issue and identify the remaining work.

### Completion Reporting

At the end of each phase, report:

- Files created or modified
- Features implemented
- Tests and commands executed
- Pass/fail results
- Remaining limitations
- Readiness for the next phase

Do not claim a test passed unless it was actually executed.

---

## 3. Technology Stack

### Backend

- Python 3.12+
- FastAPI
- Uvicorn
- psutil
- Pydantic v2
- Pytest
- HTTPX for API testing
- Ruff

### Frontend

- React
- TypeScript with strict mode
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Vitest
- React Testing Library
- ESLint

### Development

- Git and GitHub
- Environment-based configuration
- npm
- Python virtual environments

Use compatible stable dependency versions.

### Out of Scope

Do not introduce the following without explicit authorization:

- Databases
- Authentication systems
- Redis
- Docker orchestration
- Cloud infrastructure
- Remote monitoring agents
- User accounts
- Analytics or telemetry services
- Unnecessary state-management frameworks

---

## 4. Repository Architecture

Use the following structure as a baseline:

```text
systempulse/
├── AGENTS.md
├── README.md
├── LICENSE
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── metrics.py
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── public/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── index.html
```

Additional files may be introduced when justified.

Maintain separation between API routing, metric collection, data models, frontend presentation, and API communication.

---

## 5. Backend Specification

### Required System Metrics

Collect actual metrics from the computer running the FastAPI backend.

#### CPU

- Current CPU utilization percentage
- Physical core count
- Logical core count
- CPU frequency when available
- Timestamp of measurement

#### Memory

- Total physical memory
- Used memory
- Available memory
- Utilization percentage

#### Disk

- Total disk capacity
- Used disk capacity
- Free disk capacity
- Utilization percentage

Use the filesystem containing the system's primary disk or root volume. Document the selected disk scope.

#### System Information

- Hostname
- Operating system
- System uptime
- Boot timestamp
- Current UTC timestamp

#### Optional Metrics

Implement only after required functionality is stable:

- Network upload/download throughput
- Per-core CPU utilization

### Collection Requirements

- Use psutil for actual system measurements.
- Avoid blocking the FastAPI event loop during CPU sampling.
- Use a safe CPU sampling strategy.
- Handle unsupported hardware information gracefully.
- Avoid division-by-zero errors.
- Use UTC ISO 8601 timestamps.
- Calculate uptime using the system boot timestamp.
- Distinguish memory used from memory available.
- Avoid unnecessary exposure of sensitive system information.
- Keep metrics collection separate from API routes.

The dashboard monitors the backend host, which may differ from the computer running the browser.

### Required API Endpoints

#### GET /api/health

Returns backend health information.

#### GET /api/system

Returns system identity, operating system, uptime, and available hardware information.

#### GET /api/metrics

Returns a current metrics snapshot containing CPU, memory, disk, and timestamp information.

### API Standards

- Use Pydantic response models.
- Use consistent response structures.
- Use appropriate HTTP status codes.
- Provide descriptive errors.
- Enable FastAPI OpenAPI documentation.
- Restrict CORS to configured frontend origins.
- Bind to localhost by default.
- Do not expose unrestricted process information.

---

## 6. Frontend Specification

### Dashboard Requirements

Build a responsive, dark-first monitoring dashboard.

The interface must display:

- CPU utilization
- Memory utilization
- Disk utilization
- System uptime
- Hostname
- Operating system
- Last successful metrics update
- API connection status
- CPU historical utilization chart
- Memory historical utilization chart

### Layout

#### Sidebar

- SystemPulse branding
- Overview navigation
- Connection status

Do not create nonfunctional navigation links.

#### Top Bar

- Dashboard title
- Monitored hostname
- Last updated timestamp

#### Main Dashboard

1. Four summary cards
2. CPU utilization chart
3. Memory utilization chart
4. Disk utilization visualization
5. System information panel

The fourth summary card may display system uptime.

### Visual Design

SystemPulse should resemble a carefully designed developer monitoring tool.

#### Required Style

- Dark charcoal or near-black background
- Restrained accent colors
- Clear information hierarchy
- Compact layout
- Consistent spacing
- Subtle borders
- Clean typography
- Readable numerical values
- Responsive layouts
- Minimal, purposeful transitions

#### Avoid

- Excessive gradients
- Glassmorphism-heavy design
- Oversized rounded cards
- Decorative animations
- Emoji-heavy interfaces
- Generic SaaS marketing layouts
- Fake system metrics
- Placeholder buttons
- Unnecessary UI complexity

Use semantic HTML, accessible contrast, and clear status indicators.

### Real-Time Behavior

- Fetch metrics approximately every two seconds.
- Maintain approximately 60 historical samples in frontend memory.
- Pause unnecessary polling when the page is hidden.
- Resume polling when the page becomes visible.
- Prevent overlapping requests.
- Use AbortController to cancel obsolete requests.
- Prevent stale responses from overwriting newer data.
- Clean up timers and listeners on unmount.
- Preserve the last successful snapshot during temporary API failures.
- Clearly distinguish loading, connected, stale, and disconnected states.

Do not generate artificial metrics to populate charts.

### Frontend Architecture

- Use reusable React components.
- Define TypeScript interfaces for API responses.
- Separate API requests from presentation.
- Implement polling through a reusable custom hook.
- Centralize formatting utilities.
- Keep chart history bounded.
- Avoid unnecessary rerenders.
- Handle network failures and recovery.

---

## 7. Testing Standards

### Backend Testing

Use Pytest and mocked psutil data.

Cover:

- CPU metrics
- Memory metrics
- Disk metrics
- System information
- Uptime calculations
- Unsupported hardware values
- API response schemas
- Health endpoint
- Error handling

Tests must be deterministic and should not depend on the host machine's actual CPU or memory values.

### Frontend Testing

Use Vitest and React Testing Library.

Cover:

- Metric card rendering
- Data formatting
- Loading states
- Successful API responses
- Failed API requests
- Polling behavior
- Visibility pause/resume
- Request cancellation
- Historical data limits
- Connection status

Prefer behavior-oriented tests over superficial rendering assertions.

### Validation Commands

Backend:

```bash
pytest
ruff check .
```

Frontend:

```bash
npm test -- --run
npm run lint
npm run build
```

Fix all relevant failures before declaring the phase complete.

Do not weaken tests or disable lint rules simply to obtain passing results.

---

## 8. Development Phases

### Phase 1 — Foundation

**Objective:** Establish a clean, reproducible project foundation.

Tasks:

- Inspect the existing repository.
- Initialize the monorepo structure.
- Configure backend dependencies.
- Configure frontend dependencies and tooling.
- Create environment configuration examples.
- Configure Ruff and ESLint.
- Establish Pydantic API schemas.
- Configure .gitignore.
- Preserve the MIT license.

Exit Criteria:

- Project structure exists.
- Dependencies install successfully.
- Backend imports successfully.
- Frontend build succeeds.
- No unnecessary generated files are tracked.

### Phase 2 — Backend

**Objective:** Deliver a functional metrics API.

Tasks:

- Implement psutil metrics collection.
- Implement FastAPI application.
- Implement required endpoints.
- Implement response validation.
- Implement error handling.
- Write backend unit and API tests.
- Verify endpoint behavior.

Exit Criteria:

- Backend starts successfully.
- Required endpoints return valid JSON.
- Real system metrics are collected.
- Pytest passes.
- Ruff passes.

### Phase 3 — Frontend

**Objective:** Deliver the functional monitoring dashboard.

Tasks:

- Implement dashboard layout.
- Build reusable metric components.
- Implement CPU and memory charts.
- Implement disk visualization.
- Integrate the real API.
- Implement polling and historical buffers.
- Implement loading and error states.
- Implement responsive layouts.

Exit Criteria:

- Frontend builds successfully.
- TypeScript compilation succeeds.
- Dashboard consumes real API data.
- Polling behaves correctly.
- No fake production data is used.
- ESLint passes.

### Phase 4 — Integration and Testing

**Objective:** Verify the complete application.

Tasks:

- Write frontend tests.
- Execute backend and frontend test suites.
- Verify all API endpoints.
- Verify frontend/backend integration.
- Test API failure and recovery behavior.
- Check polling cleanup.
- Inspect desktop and mobile layouts if browser tools are available.
- Fix regressions.

Exit Criteria:

- Backend tests pass.
- Frontend tests pass.
- Ruff passes.
- ESLint passes.
- Frontend production build passes.
- Required API endpoints return valid responses.
- No known critical functional defects remain.

### Phase 5 — Portfolio Polish

**Objective:** Prepare SystemPulse for public GitHub presentation.

Tasks:

- Write the complete README.
- Document architecture.
- Document installation and startup.
- Document API endpoints.
- Document testing.
- Explain design decisions.
- Document limitations.
- Remove unused files and dead code.
- Review repository cleanliness.
- Run final regression checks.

Exit Criteria:

- README instructions are accurate.
- Repository contains no unintended generated artifacts.
- All required validation commands pass.
- Application can be demonstrated locally.
- Documentation accurately reflects implemented functionality.

---

## 9. README Requirements

The final README must contain:

1. Project title and description
2. Features
3. Technology stack
4. Architecture overview
5. Installation instructions
6. Backend startup instructions
7. Frontend startup instructions
8. API documentation
9. Testing instructions
10. Known limitations
11. Future improvements

Include a real screenshot only if one can be captured.

Do not invent screenshots, benchmarks, or test results.

Write documentation suitable for software engineering recruiters and technical interviewers.

---

## 10. Git and Repository Rules

Repository: `quentinbona/systempulse`

- Preserve existing useful files.
- Do not force-push.
- Do not overwrite unrelated work.
- Do not commit secrets.
- Do not track virtual environments or node_modules.
- Do not commit build caches.
- Use meaningful commit messages when commits are requested.
- Do not create additional repositories.
- Do not push changes without explicit authorization.

Inspect git status before and after substantial changes.

---

## 11. Definition of Done

SystemPulse is complete when:

- The backend starts reliably.
- The frontend starts reliably.
- Real metrics are collected.
- Metrics refresh automatically.
- CPU and memory charts work.
- Disk and system information are displayed.
- All required API endpoints work.
- Error and disconnected states work.
- Backend tests pass.
- Frontend tests pass.
- Linters pass.
- Production build succeeds.
- README instructions are accurate.
- The repository is suitable for a portfolio demonstration.

Do not declare the entire project complete before Phase 5 has been verified.

## 12. Final Agent Directive

Build SystemPulse as a real, maintainable software engineering project.

Focus on correctness, clarity, reliability, and demonstrable technical skill.

Avoid speculative features, unnecessary complexity, and superficial polish that does not improve the application.

**Execute only the explicitly requested phase, verify its exit criteria, and report the results before stopping.**
