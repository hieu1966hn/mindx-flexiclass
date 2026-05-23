// api/ai-coach.ts
// LƯU Ý: Đây là serverless endpoint (có thể chạy trên Vercel/Node.js)
// Không chạy trên trình duyệt (client-side).

export default async function handler(req: any, res: any) {
  // Chỉ nhận POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const { messages, userMessage, aiMode } = req.body || {};
    
    // Nếu chế độ là mock, hoặc biến môi trường quy định là mock, trả về mock
    const mode = aiMode || process.env.AI_MODE || 'mock';
    
    if (mode !== 'live') {
      return res.end(JSON.stringify({ 
        reply: `Đây là bản Demo (MOCK MODE). Tôi đã nhận được câu hỏi của bạn: ${userMessage || ''}` 
      }));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Missing GEMINI_API_KEY. Fallback to mock.");
      return res.end(JSON.stringify({ 
        reply: `(Fallback Mock) Tôi đã nhận được: ${userMessage || ''}` 
      }));
    }

    // Giới hạn context: Lấy 10 tin nhắn gần nhất để tiết kiệm token
    const recentMessages = (messages || []).slice(-10);
    
    // Khởi tạo Gemini format
    let contents = recentMessages.map((msg: any) => ({
      role: (msg.sender || msg.sender_role) === 'student' ? 'user' : 'model',
      parts: [{ text: msg.content || msg.message_text || "" }]
    })).filter((c: any) => c.parts[0].text.trim() !== "");

    if (userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    // Nhét system prompt vào tin nhắn đầu tiên (Gemini API 1.5 flash hỗ trợ system_instruction, nhưng để đơn giản ta dùng dạng tin nhắn hoặc config chuẩn)
    const systemInstruction = {
      parts: [{
        text: "Bạn là AI Coach dạy Toán cấp THCS (lớp 6-9). Nhiệm vụ: Đóng vai người hướng dẫn, KHÔNG được giải trực tiếp bài tập hay đưa đáp án cuối cùng. Chỉ đưa ra gợi ý (hint) từng bước một ngắn gọn. Nếu học sinh hỏi kiến thức ngoài lề, hãy nhắc nhở quay lại bài học. Luôn xưng 'tôi' và gọi học viên là 'bạn'. Trả lời ngắn gọn dưới 3-4 câu."
      }]
    };

    const payload = {
      system_instruction: systemInstruction,
      contents: contents
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", errText);
      
      let replyMsg = `(Lỗi kết nối AI - Fallback) Câu hỏi của bạn: ${userMessage}`;
      if (response.status === 429) {
        replyMsg = `(Hệ thống AI đang chạm giới hạn số lượng tin nhắn của bản miễn phí. Vui lòng đợi khoảng 30 giây rồi thử lại nhé!)`;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ reply: replyMsg }));
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tôi chưa hiểu ý bạn, bạn có thể nói rõ hơn không?";

    return res.end(JSON.stringify({ reply: replyText }));

  } catch (error) {
    console.error("Serverless Function Error:", error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}
