# CLAUDE.md — Thrive Gym Frontend

## Project Overview
This is the web frontend for Thrive Gym. It connects to the backend API to display and manage gym data, including data synchronized from the offline desktop application.

## ⚠️ LIVE PRODUCTION SYSTEM — READ FIRST
This is maintenance and feature work on a **deployed system with a live production database holding real member, staff, and payment data**. Treat every action accordingly.
- **Do not touch the deployed database or production API.** Never point the app at production to test changes or submit forms against it.
- **Any database/migration change goes through the user.** If a feature needs a backend schema change, flag it and let the user review and apply it.
- **Never affect existing data.** Do not create, edit, or delete real records while developing or testing.
- **No testing with real data or real payments.** Do not use real accounts, real credentials, or real payment flows. Never trigger real charges or refunds. Use local/test environments and sandbox/mock payment setups only.
- When in doubt, stop and ask before proceeding.

## Rules
- Inspect the existing project structure, framework, routing, API client, state management, and UI components before making changes.
- Follow existing coding conventions and reuse established components and patterns.
- Keep API requests and frontend types consistent with the actual backend contracts.
- Implement role-based UI access where appropriate, including navigation, pages, actions, and buttons.
- Frontend permission checks are for user experience only. The backend must enforce all actual authorization.
- Handle loading, empty, error, and unauthorized states.
- Preserve existing functionality and desktop synchronization behavior.
- Do not assume synchronized records are editable from the website. Sync is intentionally one-way (desktop → website); do not build features that push data back to the desktop.
- Avoid unrelated refactoring, unnecessary dependencies, and changes outside the requested scope.
- Never hardcode credentials, tokens, or production API URLs.

## Working Process
1. Inspect the relevant code before implementing a feature.
2. Reuse existing patterns and make focused changes.
3. Check how changes interact with the backend and existing features.
4. Run relevant tests, type checks, or builds when available.
5. Summarize changed files and report test results honestly.

**Priority:** Build a secure, consistent web interface without breaking existing functionality or API integrations.