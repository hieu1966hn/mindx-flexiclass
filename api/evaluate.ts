// api/evaluate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const mode = data.aiMode || process.env.AI_MODE || 'mock';

    if (mode !== 'live') {
      // Mock mode fallback logic (handled mostly in frontend or mockAI.ts)
      return res.status(200).json({
        status: 'Đạt một phần',
        completionPercentage: 50,
        correctSteps: ['(MOCK MODE) Xác định được dạng bài'],
        missingSteps: ['(MOCK MODE) Chưa hoàn thiện kết quả cuối'],
        improvementHint: '(MOCK MODE) Đây là bản chạy nội bộ không kết nối Gemini.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const { goalText, answer } = data;
    
    if (!goalText || !answer) {
      return res.status(400).json({ error: 'Missing goalText or answer' });
    }

    const systemPrompt = `Bạn là một giáo viên dạy Toán cấp THCS chuyên chấm điểm bài tập của học sinh. 
Dưới đây là Đề Bài ban đầu học sinh nhận được, và Bài Nộp của học sinh.
Nhiệm vụ của bạn là chấm điểm, phân tích tính đúng sai từng bước và đưa ra nhận xét.
BẠN BẮT BUỘC PHẢI TRẢ VỀ DỮ LIỆU ĐỊNH DẠNG JSON THEO CẤU TRÚC SAU (không dùng markdown code block, chỉ trả về chuỗi JSON hợp lệ):
{
  "status": "Đạt" | "Đạt một phần" | "Chưa đạt",
  "completionPercentage": <số nguyên từ 0 đến 100>,
  "correctSteps": ["mô tả bước làm đúng thứ 1", "mô tả bước làm đúng thứ 2"],
  "missingSteps": ["mô tả bước bị sai hoặc thiếu thứ 1"],
  "improvementHint": "Lới khuyên tổng quan giúp học sinh khắc phục lỗi hoặc động viên nếu đạt."
}

Nội quy chấm điểm:
- Nếu bài làm quá sơ sài hoặc sai hoàn toàn: Chưa đạt (< 50%).
- Nếu làm đúng hướng nhưng sai số/nhầm dấu ở bước cuối: Đạt một phần (50-80%).
- Nếu giải đúng toàn bộ hoặc sai sót rất nhỏ gọn: Đạt (80-100%).
`;

    const promptText = `
### Đề bài:
${goalText}

### Bài nộp của học sinh:
${answer}
    `;

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        role: "user",
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Eval Error:", errText);
      return res.status(502).json({ error: 'Lỗi khi kết nối tới AI chấm điểm.' });
    }

    const result = await response.json();
    let replyText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      throw new Error("No response from AI");
    }

    // Parse the JSON directly since we requested application/json mime type
    const evalData = JSON.parse(replyText);

    return res.status(200).json(evalData);

  } catch (e) {
    console.error("Evaluation endpoint error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
