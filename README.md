# Math Arena MVP Demo (Internal BOD Demo)

This is a minimum viable product (MVP) web demo for the "Shared Competitive Self-Study Session" model, built for internal presentation and validation.

**⚠️ WARNING: DRAFT MODE / MOCK DATA ONLY**
- This is NOT a production app.
- Do NOT use real student or parent data.
- Do NOT use for actual pilots/rollouts without Academic and Legal review.
- The scoring formula and questions are strictly for demo purposes and must be verified by a Math SME.

## Features
- **AI Goal-Based Self-Study:** Students input goals (text/mock upload), AI generates 60-min personalized study paths and 30-min goal practice.
- **Dedicated Chatbot Session:** Each student has a unique, isolated AI Coach chat history that restores on reconnect.
- **Session Locking Rules:** Once the teacher ends the session, all AI chats are locked to prevent further modification.
- **Activity Template Library:** Choose from various gameplay modes (e.g. Speed Challenge, Tug of War) as the final competitive activity.
- **Online Multi-user:** Teacher creates a session, students join from different devices.
- **Personalized Content & Reports:** Take-home reports for students and consolidated dashboard for teachers with AI usage stats.

## Tech Stack
- Frontend: React + Vite + TypeScript
- Styling: TailwindCSS + Lucide React
- State & Sync: Supabase Realtime (PostgreSQL) + Zustand

## Setup Instructions
1. `npm install`
2. Create `.env` based on `.env.example` and add your Supabase URL & Anon Key.
3. Apply the SQL schemas in Supabase SQL Editor:
   - `supabase_schema.sql`
   - `supabase/003_ai_goal_chatbot_sessions.sql`
4. `npm run dev`

## Roles & Demo Flow
- **Teacher:** Starts by selecting an Activity Template, gets a Room Code. Can monitor student goals, AI usage, add Teacher Notes, and lock the session at the end.
- **Student:** 
  1. Joins via Room Code.
  2. Submits learning Goal / Homework (Text/Upload Mock).
  3. Follows the AI-generated Self-Study Path (60m).
  4. Practices the Goal with tiered AI Hints (30m).
  5. Joins the final Competitive Activity (e.g. Tug of War).
  6. Receives Take-home Report when session ends.

## How to Demo Tug of War (Kéo co tri thức)
1. Teacher clicks **Tạo phòng học mới** -> Select **Kéo co tri thức (Tug of War)**.
2. Open at least 2 incognito windows for students.
3. Join the same Room Code. The system will automatically alternate assigning Team Blue and Team Red to new students.
4. Teacher clicks Start. 
5. As students answer correctly, observe the real-time Tug of War progress bar moving on both Teacher Dashboard and Student Quiz screens.
