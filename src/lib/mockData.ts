export type Grade = 6 | 7 | 8 | 9;

export interface Question {
  id: string;
  topic: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  hints: string[]; // 3 hints per question
}

export const DEMO_PROFILES: Record<string, { grade: Grade, topic: string }> = {
  'S6-A': { grade: 6, topic: 'Số nguyên và phân số' },
  'S7-B': { grade: 7, topic: 'Số hữu tỉ và tỉ lệ thức' },
  'S8-C': { grade: 8, topic: 'Hằng đẳng thức' },
  'S9-D': { grade: 9, topic: 'Hàm số bậc nhất' },
  'S8-E': { grade: 8, topic: 'Phân tích đa thức' },
};

export const MOCK_QUESTIONS: Record<Grade, Question[]> = {
  6: [
    {
      id: 'q6-1',
      topic: 'Số nguyên và phân số',
      questionText: 'Tính: -15 + 8 = ?',
      options: ['-7', '7', '-23', '23'],
      correctAnswer: '-7',
      hints: [
        'Nhớ lại quy tắc cộng hai số nguyên khác dấu.',
        'Ta lấy số lớn hơn trừ đi số bé hơn rồi đặt dấu của số lớn hơn trước kết quả.',
        'Số lớn hơn ở đây là 15 (dấu âm), số bé hơn là 8.'
      ]
    },
    {
      id: 'q6-2',
      topic: 'Số nguyên và phân số',
      questionText: 'Phân số nào sau đây tối giản?',
      options: ['2/4', '3/9', '5/7', '10/15'],
      correctAnswer: '5/7',
      hints: [
        'Phân số tối giản là phân số mà tử và mẫu không có ước chung nào khác 1.',
        'Kiểm tra xem tử và mẫu của từng phân số có chia hết cho số nào không.',
        'Chỉ có 5 và 7 là hai số nguyên tố cùng nhau.'
      ]
    },
    {
      id: 'q6-3',
      topic: 'Số nguyên và phân số',
      questionText: 'Tính: 1/2 + 1/3 = ?',
      options: ['2/5', '5/6', '1/6', '6/5'],
      correctAnswer: '5/6',
      hints: [
        'Để cộng hai phân số khác mẫu, ta phải quy đồng mẫu số.',
        'Mẫu chung nhỏ nhất của 2 và 3 là 6.',
        'Quy đồng: 1/2 = 3/6; 1/3 = 2/6. Sau đó cộng tử số.'
      ]
    }
  ],
  7: [
    {
      id: 'q7-1',
      topic: 'Số hữu tỉ và tỉ lệ thức',
      questionText: 'Tìm $x$ biết: $\\frac{x}{4} = \\frac{3}{2}$',
      options: ['6', '8', '12', '2'],
      correctAnswer: '6',
      hints: [
        'Sử dụng tính chất cơ bản của tỉ lệ thức.',
        'Nếu a/b = c/d thì a*d = b*c.',
        'Nhân chéo: x * 2 = 4 * 3.'
      ]
    },
    {
      id: 'q7-2',
      topic: 'Số hữu tỉ và tỉ lệ thức',
      questionText: 'Giá trị tuyệt đối của -3.5 là?',
      options: ['3.5', '-3.5', '0', '7'],
      correctAnswer: '3.5',
      hints: [
        'Giá trị tuyệt đối là khoảng cách từ số đó đến số 0 trên trục số.',
        'Khoảng cách không bao giờ âm.',
        'Bỏ dấu âm đi ta được giá trị tuyệt đối.'
      ]
    },
    {
      id: 'q7-3',
      topic: 'Số hữu tỉ và tỉ lệ thức',
      questionText: 'Cho x, y tỉ lệ thuận với 2, 3. Nếu x = 4 thì y bằng mấy?',
      options: ['6', '5', '8', '9'],
      correctAnswer: '6',
      hints: [
        'Tỉ lệ thuận nghĩa là x/2 = y/3.',
        'Thay x = 4 vào biểu thức: 4/2 = y/3.',
        'Giải phương trình: 2 = y/3.'
      ]
    }
  ],
  8: [
    {
      id: 'q8-1',
      topic: 'Hằng đẳng thức & Phân tích đa thức',
      questionText: 'Khai triển: $(x - 2)^2 = ?$',
      options: ['$x^2 - 4$', '$x^2 + 4$', '$x^2 - 4x + 4$', '$x^2 + 4x + 4$'],
      correctAnswer: '$x^2 - 4x + 4$',
      hints: [
        'Sử dụng hằng đẳng thức: (a - b)^2.',
        'Công thức là: a^2 - 2ab + b^2.',
        'Thay a = x, b = 2 vào công thức.'
      ]
    },
    {
      id: 'q8-2',
      topic: 'Hằng đẳng thức & Phân tích đa thức',
      questionText: 'Phân tích đa thức thành nhân tử: $x^2 - 9$',
      options: ['$(x-3)(x-3)$', '$(x-3)(x+3)$', '$(x-9)(x+1)$', '$x(x-9)$'],
      correctAnswer: '$(x-3)(x+3)$',
      hints: [
        'Sử dụng hằng đẳng thức hiệu hai bình phương.',
        'Công thức: a^2 - b^2 = (a-b)(a+b).',
        'Nhận thấy 9 = 3^2, thay a=x và b=3.'
      ]
    },
    {
      id: 'q8-3',
      topic: 'Hằng đẳng thức & Phân tích đa thức',
      questionText: 'Tính nhanh: $101^2 - 1^2 = ?$',
      options: ['10000', '10200', '100', '10201'],
      correctAnswer: '10200',
      hints: [
        'Áp dụng hằng đẳng thức a^2 - b^2 = (a-b)(a+b).',
        'Thay a=101, b=1.',
        '(101-1) * (101+1) = 100 * 102.'
      ]
    }
  ],
  9: [
    {
      id: 'q9-1',
      topic: 'Hàm số bậc nhất',
      questionText: 'Hệ số góc của đường thẳng y = 2x + 3 là?',
      options: ['3', '2', '-2', '1/2'],
      correctAnswer: '2',
      hints: [
        'Hàm số bậc nhất có dạng y = ax + b.',
        'Hệ số góc chính là hệ số a đi kèm với x.',
        'Nhìn vào phương trình, số nào đang nhân với x?'
      ]
    },
    {
      id: 'q9-2',
      topic: 'Hàm số bậc nhất',
      questionText: 'Đường thẳng y = -x + 5 cắt trục tung tại điểm có tung độ bằng?',
      options: ['-1', '0', '5', '-5'],
      correctAnswer: '5',
      hints: [
        'Điểm cắt trục tung có hoành độ x = 0.',
        'Thay x = 0 vào phương trình y = -x + 5.',
        'y = -0 + 5 = ?'
      ]
    },
    {
      id: 'q9-3',
      topic: 'Hàm số bậc nhất',
      questionText: 'Hai đường thẳng y = 2x - 1 và y = ax + 3 song song với nhau. Tìm a.',
      options: ['a = -1', 'a = 3', 'a = -2', 'a = 2'],
      correctAnswer: 'a = 2',
      hints: [
        'Hai đường thẳng song song thì hệ số góc của chúng bằng nhau.',
        'Đường thẳng thứ nhất có hệ số góc là 2.',
        'Vậy đường thẳng thứ hai cũng phải có hệ số góc bằng 2.'
      ]
    }
  ]
};

// Demo scoring formula (used by client before updating DB)
export function calculateNormalizedScore(
  isCorrect: boolean,
  timeSpentSec: number,
  hintsUsed: number,
  streak: number
): { rawScore: number, normalizedScore: number } {
  const correctPoints = isCorrect ? 100 : 0;
  
  const speedBonus = isCorrect ? Math.max(0, 30 - Math.floor(timeSpentSec / 5)) : 0;
  const streakBonus = isCorrect ? streak * 5 : 0;
  const hintPenalty = hintsUsed * 8;
  
  const rawScore = Math.max(0, correctPoints + speedBonus + streakBonus - hintPenalty);
  // For demo, normalized score is just rawScore scaled roughly by a demo weight (e.g. 1.2)
  const normalizedScore = Math.round(rawScore * 1.2);
  
  return { rawScore, normalizedScore };
}

// Tug of War Scoring
// Team pulling power: Correct answer adds power. Hints reduce power.
export const tugOfWarScoring = (isCorrect: boolean, hintsUsed: number) => {
  if (!isCorrect) return 0; // Wrong answers don't pull
  const basePull = 10;
  const hintPenalty = hintsUsed * 3;
  return Math.max(1, basePull - hintPenalty); // Minimum pull is 1 for correct answer
};
