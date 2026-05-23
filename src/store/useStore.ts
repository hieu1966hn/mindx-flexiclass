import { create } from 'zustand';
import type { Grade } from '../lib/mockData';

interface Session {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'ended';
  started_at: string | null;
  duration_minutes: number;
}

interface Participant {
  id: string;
  session_id: string;
  name: string;
  student_code: string;
  grade: Grade;
  score: number;
  raw_score: number;
  hints_used: number;
  answers: any[];
  status: 'joined' | 'playing' | 'completed' | 'stuck';
}

interface AppState {
  role: 'teacher' | 'student' | null;
  session: Session | null;
  hostToken: string | null;
  participant: Participant | null;
  participants: Participant[]; // For teacher dashboard and leaderboard
  setRole: (role: 'teacher' | 'student' | null) => void;
  setSession: (session: Session | null) => void;
  setHostToken: (token: string | null) => void;
  setParticipant: (participant: Participant | null) => void;
  setParticipants: (participants: Participant[]) => void;
}

export const useStore = create<AppState>((set) => ({
  role: null,
  session: null,
  hostToken: null,
  participant: null,
  participants: [],
  setRole: (role) => set({ role }),
  setSession: (session) => set({ session }),
  setHostToken: (token) => set({ hostToken: token }),
  setParticipant: (participant) => set({ participant }),
  setParticipants: (participants) => set({ participants }),
}));
