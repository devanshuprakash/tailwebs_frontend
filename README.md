# Assignment Portal – Frontend

React.js complete frontend portal for managing and submitting assignments. Features role-based access, JWT authentication, and TailwindCSS styled components.

## Tech Stack
- **Framework**: React 18 (Vite)
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v6
- **HTTP/API**: Axios
- **State Management**: React Context API

## Setup & Run

Assuming backend is already running on port 5001.

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Features & Implementation
- **Single Login Page**: Detects role and intelligently redirects. Auto-redirects if already authenticated.
- **Context API + Protected Routes**: Validates persistent JWTs, guards routes, and encapsulates roles (`admin/teacher`, `student`).
- **Teacher Flow**:
  - Full CRUD lifecycle on assignments using a state machine (Draft -> Published -> Completed).
  - Can only edit/delete drafts.
  - Dashboard analytics parsing counts of submissions and assignments based on status.
  - Submissions review view to grade/mark students.
- **Student Flow**:
  - Filtered view of only published assignments.
  - Submission modal checking against due date (`submitted_at <= due_date`).
  - Strict duplicate prevention per assignment (enforced by backend + UI restrictions to view read-only mode after submission).
- **Responsive Aesthetics**: Powered entirely by Vite + Tailwind CSS custom tokens. Inter typography UI, glassmorphism modal logic, consistent micro-interactions.
