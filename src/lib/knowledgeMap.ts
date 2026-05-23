export interface KnowledgeMapping {
  topic: string;
  knowledge_needed: string[];
  self_study_path: {
    step: number;
    title: string;
    description: string;
    duration: string;
    materials: { type: string; title: string; link?: string }[];
    practice_tasks?: string[];
  }[];
  competitive_content_scope: string[];
}

export const sgkToanDemoMap: Record<string, KnowledgeMapping> = {
  // LỚP 6
  "so_tu_nhien": {
    topic: "Chương I: Tập hợp các số tự nhiên",
    knowledge_needed: ["Tập hợp", "Lũy thừa", "Thứ tự thực hiện phép tính"],
    self_study_path: [
      {
        step: 1,
        title: "Lý thuyết: Tập hợp",
        description: "Đọc SGK Toán 6 Tập 1: Nhận biết ký hiệu thuộc và không thuộc.",
        duration: "10 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất từ Toan_6_Tap_1.pdf" }],
        practice_tasks: [
          "Liệt kê các phần tử của tập hợp A các số tự nhiên nhỏ hơn 10.",
          "Viết tập hợp B các số chẵn nhỏ hơn 20 bằng 2 cách.",
          "Cho tập hợp C = {1, 3, 5, 7}. Hãy dùng ký hiệu thuộc và không thuộc để mô tả các số 3 và 8 với tập hợp C."
        ]
      },
      {
        step: 2,
        title: "Ôn tập Lũy thừa & Thứ tự",
        description: "Nhớ quy tắc: Ngoặc tròn -> Vuông -> Nhọn.",
        duration: "15 min",
        materials: [{ type: "video", title: "Video bài giảng lũy thừa" }],
        practice_tasks: [
          "Tính giá trị biểu thức: $2^3 + 5 \\times (10 - 8)^2$",
          "Thực hiện phép tính: $100 - [30 + (5 - 1)^2]$",
          "Viết gọn tích sau dưới dạng một lũy thừa: $3^4 \\times 3^5$",
          "So sánh hai lũy thừa: $2^6$ và $8^2$"
        ]
      }
    ],
    competitive_content_scope: ["Tính giá trị biểu thức", "So sánh lũy thừa"]
  },
  "phan_so": {
    topic: "Chương VI: Phân số",
    knowledge_needed: ["Rút gọn phân số", "Quy đồng mẫu số", "Phép tính phân số"],
    self_study_path: [
      {
        step: 1,
        title: "Rút gọn & Quy đồng",
        description: "Đọc SGK Toán 6 Tập 2. Áp dụng quy tắc chia tử mẫu cho ƯCLL.",
        duration: "15 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất từ Toan_6_Tap_2.pdf" }],
        practice_tasks: [
          "Rút gọn phân số: $\\frac{24}{36}$ và $\\frac{45}{105}$",
          "Quy đồng mẫu số các phân số: $\\frac{1}{3}$ và $\\frac{1}{4}$",
          "So sánh hai phân số: $\\frac{5}{6}$ và $\\frac{7}{8}$ bằng cách quy đồng"
        ]
      },
      {
        step: 2,
        title: "Cộng trừ nhân chia",
        description: "Làm bài tập ứng dụng các phép tính cơ bản.",
        duration: "20 min",
        materials: [{ type: "quiz", title: "Bài tập nhỏ: Phép tính phân số" }],
        practice_tasks: [
          "Thực hiện phép tính: $(\\frac{1}{2} + \\frac{1}{3}) \\times \\frac{6}{5}$",
          "Tính nhanh: $\\frac{3}{7} \\times \\frac{5}{9} + \\frac{3}{7} \\times \\frac{4}{9}$",
          "Tìm $x$ biết: $x - \\frac{1}{4} = \\frac{5}{8}$",
          "Một tấm vải dài $24$m. Lần thứ nhất người ta cắt đi $\\frac{1}{3}$ tấm vải. Hỏi phần vải còn lại dài bao nhiêu mét?"
        ]
      }
    ],
    competitive_content_scope: ["Tìm phân số tối giản", "Giải bài toán đố về phân số"]
  },
  
  // LỚP 7
  "so_huu_ti": {
    topic: "Chương I: Số hữu tỉ",
    knowledge_needed: ["Cộng trừ số hữu tỉ", "Lũy thừa số hữu tỉ", "Quy tắc chuyển vế"],
    self_study_path: [
      {
        step: 1,
        title: "Số hữu tỉ & Các phép tính",
        description: "Đọc Toán 7 Tập 1. Chuyển đổi số thập phân, phân số về số hữu tỉ và tính toán.",
        duration: "20 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất Toán 7 Tập 1" }],
        practice_tasks: [
          "Thực hiện phép tính: $\\frac{-3}{4} + 1.5 - (\\frac{1}{2})^2$",
          "Tìm $x$ biết: $2x - \\frac{1}{3} = \\frac{5}{6}$",
          "Tính hợp lý: $(\\frac{-5}{7} + \\frac{3}{4}) - (\\frac{1}{4} - \\frac{2}{7})$",
          "Viết số hữu tỉ $\\frac{-2}{3}$ dưới dạng tổng của hai số hữu tỉ âm."
        ]
      }
    ],
    competitive_content_scope: ["Tính nhanh số hữu tỉ", "Bài toán tìm x"]
  },
  "ti_le_thuc": {
    topic: "Chương VI: Tỉ lệ thức và Đại lượng tỉ lệ",
    knowledge_needed: ["Tính chất dãy tỉ số bằng nhau", "Tỉ lệ thuận", "Tỉ lệ nghịch"],
    self_study_path: [
      {
        step: 1,
        title: "Dãy tỉ số bằng nhau",
        description: "Đọc Toán 7 Tập 2. Áp dụng a/b = c/d = (a+c)/(b+d).",
        duration: "20 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất Toán 7 Tập 2" }],
        practice_tasks: [
          "Tìm $x, y$ biết $\\frac{x}{2} = \\frac{y}{3}$ và $x + y = 20$",
          "Chia số 150 thành 3 phần tỉ lệ với 2, 3 và 5. Tìm mỗi phần.",
          "Bài toán: 3 người công nhân làm xong một công việc trong 12 ngày. Hỏi 4 người làm xong công việc đó trong bao lâu? (năng suất như nhau)",
          "Từ tỉ lệ thức $\\frac{a}{b} = \\frac{c}{d}$, hãy chứng minh: $\\frac{a+b}{b} = \\frac{c+d}{d}$"
        ]
      }
    ],
    competitive_content_scope: ["Bài toán chia tỉ lệ", "Đố vui đại lượng tỉ lệ"]
  },

  // LỚP 8
  "da_thuc": {
    topic: "Chương I: Đa thức",
    knowledge_needed: ["Nhân chia đa thức", "Hằng đẳng thức", "Phân tích nhân tử"],
    self_study_path: [
      {
        step: 1,
        title: "Hằng đẳng thức đáng nhớ",
        description: "Ôn tập 7 hằng đẳng thức từ SGK Toán 8 Tập 1.",
        duration: "20 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất Toán 8 Tập 1" }],
        practice_tasks: [
          "Khai triển biểu thức: $(x - 3)^2$ và $(2x + y)^2$",
          "Phân tích đa thức thành nhân tử: $x^2 - 9$",
          "Rút gọn biểu thức: $(x + 2)^2 - (x - 2)^2$",
          "Tính nhanh: $101^2$",
          "Phân tích đa thức: $x^3 - 8$ thành nhân tử."
        ]
      }
    ],
    competitive_content_scope: ["Rút gọn biểu thức đa thức", "Phân tích đa thức thành nhân tử"]
  },
  "pythagore": {
    topic: "Chương IV: Định lí Pythagore",
    knowledge_needed: ["Pythagore thuận", "Pythagore đảo", "Ứng dụng"],
    self_study_path: [
      {
        step: 1,
        title: "Định lý Pythagore",
        description: "Đọc SGK Toán 8 Tập 1. Bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông.",
        duration: "15 min",
        materials: [{ type: "video", title: "Mô phỏng Pythagore" }],
        practice_tasks: [
          "Cho tam giác ABC vuông tại A, AB = 3cm, AC = 4cm. Tính BC.",
          "Tam giác có ba cạnh là 5cm, 12cm, 13cm có phải là tam giác vuông không? Vì sao?",
          "Một chiếc thang dài 5m dựa vào tường. Khoảng cách từ chân thang đến tường là 3m. Tính chiều cao bức tường nơi thang chạm tới."
        ]
      }
    ],
    competitive_content_scope: ["Tìm cạnh tam giác vuông", "Chứng minh tam giác vuông"]
  },

  // LỚP 9
  "he_phuong_trinh": {
    topic: "Chương I: Phương trình và Hệ phương trình bậc nhất",
    knowledge_needed: ["Phương pháp thế", "Phương pháp cộng đại số", "Giải toán bằng cách lập hệ"],
    self_study_path: [
      {
        step: 1,
        title: "Giải hệ phương trình",
        description: "Luyện tập giải bằng phương pháp cộng đại số từ SGK Toán 9 Tập 1.",
        duration: "20 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất Toán 9 Tập 1" }],
        practice_tasks: [
          "Giải hệ phương trình bằng phương pháp thế: $\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$",
          "Giải hệ phương trình bằng phương pháp cộng: $\\begin{cases} 3x + 2y = 7 \\\\ 5x - 2y = 9 \\end{cases}$",
          "Bài toán thực tế: Hai lớp 9A và 9B có tổng cộng 80 học sinh. Nếu chuyển 5 học sinh từ 9A sang 9B thì số học sinh hai lớp bằng nhau. Tính số học sinh mỗi lớp lúc đầu.",
          "Tìm $m$ để hệ $\\begin{cases} mx + y = 3 \\\\ x + my = 3 \\end{cases}$ có nghiệm duy nhất."
        ]
      }
    ],
    competitive_content_scope: ["Giải hệ nhanh", "Bài toán thực tế hệ phương trình"]
  },
  "ham_so_bac_2": {
    topic: "Chương VI: Hàm số y = ax^2",
    knowledge_needed: ["Đồ thị Parabol", "Công thức nghiệm Delta", "Định lí Vi-et"],
    self_study_path: [
      {
        step: 1,
        title: "Giải PT bằng Delta",
        description: "Áp dụng công thức tính Delta và tìm nghiệm SGK Toán 9 Tập 2.",
        duration: "20 min",
        materials: [{ type: "pdf_extract", title: "Trích xuất Toán 9 Tập 2" }],
        practice_tasks: [
          "Giải phương trình: $x^2 - 5x + 6 = 0$ bằng công thức nghiệm ($\\Delta$).",
          "Tính nhẩm nghiệm của phương trình: $2x^2 + 7x + 5 = 0$.",
          "Cho phương trình $x^2 - 4x + m = 0$. Tìm $m$ để phương trình có nghiệm kép.",
          "Gọi $x_1, x_2$ là nghiệm của pt $x^2 - 6x + 8 = 0$. Không giải pt, tính $x_1^2 + x_2^2$."
        ]
      }
    ],
    competitive_content_scope: ["Giải nhanh PT bậc 2", "Áp dụng Vi-et"]
  }
};
