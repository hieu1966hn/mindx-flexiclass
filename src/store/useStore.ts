import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Grade } from '../lib/mockData';

export interface Session {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'ended';
  template_id?: string;
  started_at?: string;
  current_phase?: 'waiting' | 'goal-intake' | 'self-study' | 'goal-practice' | 'competitive' | 'ended';
  phase_started_at?: string;
  phase_duration_minutes?: number;
  duration_minutes: number;
}

interface Participant {
  id: string;
  session_id: string;
  name: string;
  student_code: string;
  grade: Grade;
  team?: 'blue' | 'red';
  score: number;
  raw_score: number;
  hints_used: number;
  answers: any[];
  goal_data?: any;
  study_path?: any;
  practice_eval?: any;
  teacher_note?: string;
  status: 'joined' | 'goal_intake' | 'self_study' | 'goal_practice' | 'playing' | 'completed' | 'stuck' | 'kicked';
  kicked_at?: string;
  kicked_reason?: string;
}

export interface ChatSession {
  id: string;
  session_id: string;
  participant_id: string;
  student_code: string;
  status: 'active' | 'locked';
  started_at: string;
  ended_at?: string;
  locked_at?: string;
  summary: any;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  sequence_index: number;
  sender: 'student' | 'ai' | 'system';
  message_type: 'goal_analysis' | 'hint' | 'explanation' | 'evaluation' | 'report' | 'free_question';
  content: string;
  metadata: any;
  created_at: string;
}

export interface AppState {
  role: 'teacher' | 'student' | null;
  session: Session | null;
  hostToken: string | null;
  participant: Participant | null;
  participants: Participant[]; // For teacher dashboard and leaderboard
  chatSession: ChatSession | null;
  chatMessages: ChatMessage[];
  setRole: (role: 'teacher' | 'student' | null) => void;
  setSession: (session: Session | null) => void;
  setHostToken: (token: string | null) => void;
  setParticipant: (participant: Participant | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setChatSession: (chatSession: ChatSession | null) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      session: null,
      hostToken: null,
      participant: null,
      participants: [],
      chatSession: null,
      chatMessages: [],
      setRole: (role) => set({ role }),
      setSession: (session) => set({ session }),
      setHostToken: (token) => set({ hostToken: token }),
      setParticipant: (participant) => set({ participant }),
      setParticipants: (participants) => set({ participants }),
      setChatSession: (chatSession) => set({ chatSession }),
      setChatMessages: (chatMessages) => set({ chatMessages }),
      addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      reset: () => set({ role: null, session: null, hostToken: null, participant: null, participants: [], chatSession: null, chatMessages: [] }),
    }),
    {
      name: 'math-arena-storage',
      partialize: (state) => ({
        role: state.role,
        session: state.session,
        hostToken: state.hostToken,
        participant: state.participant,
        chatSession: state.chatSession,
      }),
    }
  )
);
