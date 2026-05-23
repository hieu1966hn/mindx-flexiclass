// api/generate-report.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const { sessionId, hostToken } = data;
    
    if (!sessionId || !hostToken) {
      return res.status(400).json({ error: 'Missing sessionId or hostToken' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing database configuration' });
    }
    
    const supabaseHeaders = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. Verify Session & Host Token
    const sessionRes = await fetch(`${supabaseUrl}/rest/v1/sessions?id=eq.${sessionId}&select=*`, { headers: supabaseHeaders });
    const sessions = await sessionRes.json();
    if (!sessions || sessions.length === 0 || sessions[0].host_token !== hostToken) {
       return res.status(403).json({ error: 'Invalid host token or session' });
    }
    const sessionData = sessions[0];

    // 2. Check if report already exists
    const existingReportRes = await fetch(`${supabaseUrl}/rest/v1/cs_handoff_reports?session_id=eq.${sessionId}&select=*`, { headers: supabaseHeaders });
    const existingReports = await existingReportRes.json();
    if (existingReports && existingReports.length > 0) {
       return res.status(200).json(existingReports[0]);
    }

    // 3. Fetch Participants
    const partsRes = await fetch(`${supabaseUrl}/rest/v1/participants?session_id=eq.${sessionId}&select=*`, { headers: supabaseHeaders });
    const participants = await partsRes.json();
    
    // 4. Generate Snapshot per student & calculate CS Status
    const studentsReport = [];
    let totalCompleted = 0;
    
    const mode = data.aiMode || process.env.VITE_AI_MODE || process.env.AI_MODE || 'mock';
    const apiKey = process.env.GEMINI_API_KEY;

    for (const p of participants) {
      const goalCompletion = p.practice_eval?.completionPercentage || 0;
      const hintsUsed = p.hints_used || 0;
      let csStatus = 'Red';
      if (goalCompletion >= 80 && hintsUsed <= 3) csStatus = 'Green';
      else if (goalCompletion >= 50 || hintsUsed > 3) csStatus = 'Yellow';
      if (p.status !== 'completed' && p.status !== 'goal_practice' && p.status !== 'playing') {
        csStatus = 'Red';
      }
      
      if (csStatus === 'Green') totalCompleted++;

      const studentData = {
        participant_id: p.id,
        name: p.name,
        student_code: p.student_code,
        grade: p.grade,
        goal: p.goal_data?.text || 'Không có mục tiêu',
        topic: p.knowledge_map?.topic || 'Không xác định',
        self_study_progress: p.status,
        goal_completion_percent: goalCompletion,
        practice_result: p.practice_eval?.status || 'Chưa nộp',
        hints_used: hintsUsed,
        competitive_score: p.raw_score || 0,
        teacher_note: p.teacher_note || '',
        cs_status: csStatus,
        parent_talking_points: '',
        recommended_next_steps: p.practice_eval?.improvementHint || 'Khuyên học sinh ôn tập lại bài cũ.'
      };
      
      // 5. Generate Parent Talking Points using Gemini
      if (mode === 'live' && apiKey) {
        try {
          const systemPrompt = `Bạn là chuyên viên chăm sóc khách hàng. Dựa vào kết quả học tập sau, hãy viết 1-2 câu ĐỂ NÓI TRỰC TIẾP VỚI PHỤ HUYNH về tình hình học của con. Phải khách quan, dựa đúng dữ liệu, không tự bịa thêm. (Kết quả học: Mục tiêu: ${studentData.goal}, Hoàn thành: ${studentData.goal_completion_percent}%, CS Status: ${csStatus}). Viết ngắn gọn.`;
          
          const payload = {
            contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          };
          
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json();
            studentData.parent_talking_points = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || 'Thông báo phụ huynh con đã tham gia buổi học.';
          } else {
            studentData.parent_talking_points = `(Fallback) Điểm hoàn thành của con là ${goalCompletion}%. Status: ${csStatus}.`;
          }
        } catch (err) {
          studentData.parent_talking_points = `(Fallback) Điểm hoàn thành: ${goalCompletion}%. Status: ${csStatus}.`;
        }
      } else {
        studentData.parent_talking_points = `(Template) Con đã tham gia buổi học với mục tiêu ${studentData.goal}. Hoàn thành ${goalCompletion}%.`;
      }
      
      studentsReport.push(studentData);
    }
    
    const overallSummary = {
       totalStudents: participants.length,
       greenCount: studentsReport.filter((r: any) => r.cs_status === 'Green').length,
       yellowCount: studentsReport.filter((r: any) => r.cs_status === 'Yellow').length,
       redCount: studentsReport.filter((r: any) => r.cs_status === 'Red').length,
       notes: "Snapshot generated successfully"
    };

    // 6. Save Report
    const insertPayload = {
      session_id: sessionId,
      session_code: sessionData.code,
      students_report: studentsReport,
      overall_summary: overallSummary
    };
    
    const saveRes = await fetch(`${supabaseUrl}/rest/v1/cs_handoff_reports`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(insertPayload)
    });
    
    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error("Save Report Error:", err);
      // Fallback response instead of crashing
      return res.status(200).json(insertPayload);
    }
    
    const savedData = await saveRes.json();

    // 7. Change session status to 'ended'
    await fetch(`${supabaseUrl}/rest/v1/sessions?id=eq.${sessionId}`, {
       method: 'PATCH',
       headers: supabaseHeaders,
       body: JSON.stringify({ status: 'ended' })
    });
    
    return res.status(200).json(savedData[0]);

  } catch (e) {
    console.error("Generate Report Endpoint Error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
