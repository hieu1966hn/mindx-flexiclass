import { supabase } from './supabase';
import type { ChatSession, ChatMessage } from '../store/useStore';

// 1. Restore or Create Chat Session
export const getOrCreateChatSession = async (
  sessionId: string,
  participantId: string,
  studentCode: string
): Promise<ChatSession> => {
  // Check if exists
  const { data: existing, error: findError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('participant_id', participantId)
    .single();

  if (existing) {
    return existing;
  }

  if (findError && findError.code !== 'PGRST116') {
    throw findError;
  }

  // Create new
  const { data: newSession, error: createError } = await supabase
    .from('chat_sessions')
    .insert([{
      session_id: sessionId,
      participant_id: participantId,
      student_code: studentCode,
      status: 'active'
    }])
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      // Duplicate key violation because of concurrent insert (e.g., React Strict Mode)
      const { data: retryData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('participant_id', participantId)
        .single();
      if (retryData) return retryData;
    }
    throw createError;
  }
  return newSession;
};

// 2. Fetch Chat Messages
export const getChatMessages = async (chatSessionId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_session_id', chatSessionId)
    .order('sequence_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

// 3. Add Message
export const addChatMessage = async (
  chatSession: ChatSession,
  sender: 'student' | 'ai' | 'system',
  messageType: 'goal_analysis' | 'hint' | 'explanation' | 'evaluation' | 'report' | 'free_question',
  content: string,
  metadata: any = {}
): Promise<ChatMessage> => {
  
  if (chatSession.status === 'locked') {
    throw new Error('Phiên chat đã bị khoá. Không thể gửi thêm tin nhắn.');
  }

  // Get current max index
  const { data: maxMsg } = await supabase
    .from('chat_messages')
    .select('sequence_index')
    .eq('chat_session_id', chatSession.id)
    .order('sequence_index', { ascending: false })
    .limit(1)
    .single();

  const nextIndex = maxMsg ? maxMsg.sequence_index + 1 : 0;

  const { data: newMsg, error } = await supabase
    .from('chat_messages')
    .insert([{
      chat_session_id: chatSession.id,
      sequence_index: nextIndex,
      sender,
      message_type: messageType,
      content,
      metadata
    }])
    .select()
    .single();

  if (error) throw error;
  return newMsg;
};

// 4. Lock All Sessions (Teacher action)
export const lockAllSessionsInBatch = async (sessionId: string) => {
  const now = new Date().toISOString();
  
  // Update sessions
  await supabase
    .from('sessions')
    .update({ 
      status: 'ended', 
      current_phase: 'ended' 
    })
    .eq('id', sessionId);

  // Update participants
  await supabase
    .from('participants')
    .update({ status: 'completed' })
    .eq('session_id', sessionId);

  // Update chat sessions
  await supabase
    .from('chat_sessions')
    .update({ 
      status: 'locked',
      locked_at: now
    })
    .eq('session_id', sessionId);
};
