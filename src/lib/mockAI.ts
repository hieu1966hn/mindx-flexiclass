// src/lib/mockAI.ts
import { sgkToanDemoMap } from './knowledgeMap';

// Simulated delay to mimic LLM API response time
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface KnowledgeMapping {
  topic: string;
  grade: number;
  prerequisites: string[];
  keyConcepts: string[];
  rawMapKey?: string;
}

export interface StudyBlock {
  id: string;
  type: 'concept' | 'example' | 'quick_check' | 'mini_practice';
  title: string;
  content: string;
  durationMinutes: number;
  practiceTasks?: string[];
}

export interface SelfStudyPath {
  goalSummary: string;
  estimatedTime: number;
  blocks: StudyBlock[];
}

export interface GoalPracticeEval {
  status: 'Đạt' | 'Đạt một phần' | 'Chưa đạt';
  completionPercentage: number;
  correctSteps: string[];
  missingSteps: string[];
  improvementHint: string;
}

export const mockAnalyzeGoal = async (goalText: string, grade: number): Promise<KnowledgeMapping> => {
  await simulateDelay(2000); // 2s delay
  
  const textLower = goalText.toLowerCase();
  let matchKey = 'so_tu_nhien';
  
  if (grade === 6) {
    if (textLower.includes('phân số') || textLower.includes('phan so')) matchKey = 'phan_so';
    else matchKey = 'so_tu_nhien';
  } else if (grade === 7) {
    if (textLower.includes('tỉ lệ') || textLower.includes('ti le')) matchKey = 'ti_le_thuc';
    else matchKey = 'so_huu_ti';
  } else if (grade === 8) {
    if (textLower.includes('pythagore') || textLower.includes('pytago') || textLower.includes('tam giác vuông')) matchKey = 'pythagore';
    else matchKey = 'da_thuc';
  } else if (grade === 9) {
    if (textLower.includes('hệ phương trình') || textLower.includes('he phuong trinh')) matchKey = 'he_phuong_trinh';
    else matchKey = 'ham_so_bac_2';
  }
  
  const mappedData = sgkToanDemoMap[matchKey];
  
  return {
    topic: mappedData.topic,
    grade: grade,
    prerequisites: mappedData.knowledge_needed,
    keyConcepts: mappedData.competitive_content_scope,
    rawMapKey: matchKey
  };
};

export const mockGenerateStudyPath = async (mapping: KnowledgeMapping): Promise<SelfStudyPath> => {
  await simulateDelay(1500);
  
  const mappedData = mapping.rawMapKey ? sgkToanDemoMap[mapping.rawMapKey] : null;
  
  // Convert from Demo Map to App StudyBlock format
  let blocks: StudyBlock[] = [];
  
  if (mappedData) {
    blocks = mappedData.self_study_path.map((step, idx) => ({
      id: `b${idx + 1}`,
      type: idx === 0 ? 'concept' : 'example',
      title: step.title,
      content: `${step.description}\n\nTài liệu đính kèm: ${step.materials.map(m => m.title).join(', ')}`,
      durationMinutes: parseInt(step.duration) || 15,
      practiceTasks: step.practice_tasks
    }));
    
    // Add a quick check & practice block to match old mock UI flow
    blocks.push({
      id: `b${blocks.length + 1}`,
      type: 'quick_check',
      title: 'Kiểm tra hiểu nhanh (Quick Check)',
      content: `Dựa vào kiến thức ${mapping.topic} vừa học, bạn hãy sẵn sàng áp dụng nhé!`,
      durationMinutes: 5
    });
    
    blocks.push({
      id: `b${blocks.length + 2}`,
      type: 'mini_practice',
      title: 'Thực hành ngắn (Mini Practice)',
      content: `Luyện tập kỹ năng ${mapping.keyConcepts.join(', ')} trước khi làm bài tập chính.`,
      durationMinutes: 20
    });
  } else {
    // Fallback if mapping not found
    blocks = [
      {
        id: 'b1',
        type: 'concept',
        title: 'Nhắc lại lý thuyết trọng tâm',
        content: `Các kiến thức cần nhớ:\n- ${mapping.keyConcepts.join('\n- ')}`,
        durationMinutes: 10
      }
    ];
  }
  
  return {
    goalSummary: `Lộ trình chinh phục: ${mapping.topic}`,
    estimatedTime: 60,
    blocks: blocks
  };
};

export const mockEvaluatePractice = async (answer: string, hintsUsed: number): Promise<GoalPracticeEval> => {
  await simulateDelay(3000);
  
  if (!answer || answer.trim().length < 15) {
    return {
      status: 'Chưa đạt',
      completionPercentage: 0,
      correctSteps: [],
      missingSteps: ['Chưa có lời giải chi tiết', 'Bài làm quá ngắn hoặc không có nội dung'],
      improvementHint: 'Bạn cần trình bày các bước giải chi tiết hơn. Hãy thử viết ra công thức và phép tính bạn dùng nhé!'
    };
  }
  
  if (hintsUsed === 0) {
    return {
      status: 'Đạt',
      completionPercentage: 100,
      correctSteps: ['Xác định đúng dạng bài', 'Áp dụng công thức chính xác', 'Trình bày logic rõ ràng'],
      missingSteps: [],
      improvementHint: 'Rất xuất sắc! Bạn đã nắm vững kiến thức, hãy thử các bài tập vận dụng cao hơn.'
    };
  } else if (hintsUsed <= 2) {
    return {
      status: 'Đạt một phần',
      completionPercentage: 75,
      correctSteps: ['Xác định được hướng giải chung', 'Hoàn thành 70% các bước tính toán'],
      missingSteps: ['Đôi chỗ còn nhầm lẫn dấu', 'Cần gợi ý ở bước biến đổi phức tạp'],
      improvementHint: 'Bạn làm khá tốt, nhưng cần chú ý cẩn thận hơn ở các bước biến đổi dấu. Xem lại tài liệu đính kèm nhé.'
    };
  } else {
    return {
      status: 'Chưa đạt',
      completionPercentage: 40,
      correctSteps: ['Biết viết ra giả thiết của đề bài'],
      missingSteps: ['Chưa xác định đúng công thức cần dùng', 'Mắc kẹt ở bước giải hệ/phương trình', 'Phụ thuộc nhiều vào gợi ý'],
      improvementHint: 'Có vẻ phần này còn hơi khó với bạn. Đừng nản chí! Hãy quay lại đọc kỹ khối lý thuyết trọng tâm nhé.'
    };
  }
};
