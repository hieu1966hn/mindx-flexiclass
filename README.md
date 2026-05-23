# Math Arena MVP Demo (Internal BOD Demo)

This is a minimum viable product (MVP) web demo for the "Shared Competitive Self-Study Session" model, built for internal presentation and validation.

**⚠️ WARNING: DRAFT MODE / MOCK DATA ONLY**
- This is NOT a production app.
- Do NOT use real student or parent data.
- Do NOT use for actual pilots/rollouts without Academic and Legal review.
- The scoring formula and questions are strictly for demo purposes and must be verified by a Math SME.

## Features
- **Online Multi-user:** Teacher creates a session, 4-5 students join from different devices.
- **Shared Session:** All participants share the same timer and challenge rules.
- **Personalized Content:** Questions are tailored to each student's mapped profile (Grade 6, 7, 8, 9).
- **Teacher Dashboard:** Real-time tracking of progress, accuracy, and hint usage.
- **Normalized Leaderboard:** A unified leaderboard calculated via normalized scores.

## Tech Stack
- Frontend: React + Vite + TypeScript
- Styling: TailwindCSS + Lucide React
- State & Sync: Supabase Realtime (PostgreSQL) + Zustand

## Setup Instructions
1. `npm install`
2. Create `.env` based on `.env.example` and add your Supabase URL & Anon Key.
3. Apply the SQL schema provided in `supabase_schema.sql` to your Supabase project.
4. `npm run dev`

## Roles & Demo Flow
- **Teacher:** Starts a session, gets a Room Code. Only the creator (has `host_token`) can start/end the session.
- **Student:** Joins via the Room Code and a designated demo `student_code` (e.g., `S6-A`, `S7-B`, `S8-C`, `S9-D`, `S8-E`). The system automatically assigns the correct topic and grade based on this code.
