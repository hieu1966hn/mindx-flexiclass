import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalBanner from './components/GlobalBanner';
import Home from './pages/Home';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentJoin from './pages/StudentJoin';
import StudentQuiz from './pages/StudentQuiz';
import TemplateLibrary from './pages/TemplateLibrary';
import StudentGoalIntake from './pages/StudentGoalIntake';
import SelfStudyPath from './pages/SelfStudyPath';
import GoalPractice from './pages/GoalPractice';
import StudentReport from './pages/StudentReport';
import CSReportView from './pages/CSReportView';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';

function GlobalListener() {
  const navigate = useNavigate();
  const participant = useStore((state) => state.participant);
  const session = useStore((state) => state.session);
  const reset = useStore((state) => state.reset);

  // Validate state on mount (F5 resume)
  useEffect(() => {
    const validateState = async () => {
      if (!participant || !session) return;
      
      const { data: pData } = await supabase.from('participants').select('*').eq('id', participant.id).single();
      const { data: sData } = await supabase.from('sessions').select('*').eq('id', session.id).single();

      if (!pData || pData.status === 'kicked' || !sData) {
        if (pData?.status === 'kicked') {
          alert('Bạn đã được giáo viên mời ra khỏi phiên học.');
        }
        reset();
        navigate('/');
      } else {
        // Sync local state with fresh DB state
        useStore.getState().setSession(sData);
        useStore.getState().setParticipant(pData);
      }
    };
    
    validateState();
  }, []);

  // Listen to soft kick update
  useEffect(() => {
    if (!participant) return;

    const sub = supabase.channel('global_kick_listener')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'participants', filter: `id=eq.${participant.id}` }, (payload) => {
        if (payload.new.status === 'kicked') {
          alert('Bạn đã được giáo viên mời ra khỏi phiên học.');
          reset();
          navigate('/');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [participant, navigate, reset]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mx-bg flex flex-col font-sans text-mx-text relative">
        <GlobalListener />
        <GlobalBanner />
        <main className="flex-1 w-full pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/templates" element={<TemplateLibrary />} />
            <Route path="/join" element={<StudentJoin />} />
            <Route path="/intake" element={<StudentGoalIntake />} />
            <Route path="/path" element={<SelfStudyPath />} />
            <Route path="/practice" element={<GoalPractice />} />
            <Route path="/quiz" element={<StudentQuiz />} />
            <Route path="/report" element={<StudentReport />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/cs-report" element={<CSReportView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
