import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalBanner from './components/GlobalBanner';
import Home from './pages/Home';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentJoin from './pages/StudentJoin';
import StudentQuiz from './pages/StudentQuiz';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mx-bg flex flex-col font-sans text-mx-text relative">
        <GlobalBanner />
        <main className="flex-1 w-full pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<StudentJoin />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/quiz" element={<StudentQuiz />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
