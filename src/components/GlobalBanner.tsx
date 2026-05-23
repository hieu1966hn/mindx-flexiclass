import { AlertTriangle } from 'lucide-react';

export default function GlobalBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-mx-warning bg-[#FEF3C7] px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#92400E]">
      <AlertTriangle className="w-5 h-5" />
      <span>
        Bản demo nội bộ. Câu hỏi cần SME Toán duyệt trước khi dùng với học viên thật.
      </span>
    </div>
  );
}
