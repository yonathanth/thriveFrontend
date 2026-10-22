# CLAUDE.md — Thrive Gym Frontend

## Project Overview
This is the web frontend for Thrive Gym. It connects to the backend API to display and manage gym data, including data synchronized from the offline desktop application.

## Rules
- Inspect the existing project structure, framework, routing, API client, state management, and UI components before making changes.
- Follow existing coding conventions and reuse established components and patterns.
- Keep API requests and frontend types consistent with the actual backend contracts.
- Implement role-based UI access where appropriate, including navigation, pages, actions, and buttons.
- Frontend permission checks are for user experience only. The backend must enforce all actual authorization.
- Handle loading, empty, error, and unauthorized states.
- Preserve existing functionality and desktop synchronization behavior.
- Do not assume synchronized records are editable from the website.
- Avoid unrelated refactoring, unnecessary dependencies, and changes outside the requested scope.
- Never hardcode credentials, tokens, or production API URLs.

## Working Process
1. Inspect the relevant code before implementing a feature.
2. Reuse existing patterns and make focused changes.
3. Check how changes interact with the backend and existing features.
4. Run relevant tests, type checks, or builds when available.
5. Summarize changed files and report test results honestly.

**Priority:** Build a secure, consistent web interface without breaking existing functionality or API integrations.