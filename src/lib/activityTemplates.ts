import { Swords, Zap, Star, ShieldAlert, Navigation, HelpCircle, Users } from 'lucide-react';

export type TemplateStatus = 'available' | 'preview' | 'roadmap';

export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  icon: any; // Lucide icon
  status: TemplateStatus;
  color: string;
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'speed-challenge',
    title: 'Speed Challenge',
    description: 'Thử thách tốc độ cá nhân. Cùng một thời gian, xem ai giải được nhiều câu hỏi đúng nhất.',
    icon: Zap,
    status: 'available',
    color: 'text-amber-500'
  },
  {
    id: 'tug-of-war',
    title: 'Kéo co tri thức (Tug of War)',
    description: 'Chia lớp thành 2 đội Đỏ và Xanh. Mỗi câu trả lời đúng sẽ kéo vạch chiến thắng về phía đội mình.',
    icon: Swords,
    status: 'available',
    color: 'text-blue-500'
  },
  {
    id: 'star-race',
    title: 'Star Race',
    description: 'Đua phi thuyền không gian. Trả lời đúng liên tiếp để tăng tốc độ cho phi thuyền.',
    icon: Star,
    status: 'preview',
    color: 'text-purple-500'
  },
  {
    id: 'boss-battle',
    title: 'Boss Battle',
    description: 'Cả lớp cùng hợp lực đánh bại một con Boss Toán Học bằng cách giải quyết các bài toán khó.',
    icon: ShieldAlert,
    status: 'preview',
    color: 'text-red-500'
  },
  {
    id: 'team-relay',
    title: 'Team Relay',
    description: 'Đua tiếp sức. Người thứ nhất làm xong mới chuyển quyền trả lời cho người thứ hai.',
    icon: Users,
    status: 'preview',
    color: 'text-green-500'
  },
  {
    id: 'error-hunter',
    title: 'Error Hunter',
    description: 'Tìm lỗi sai trong các bước giải có sẵn thay vì tự giải từ đầu đến cuối.',
    icon: HelpCircle,
    status: 'preview',
    color: 'text-pink-500'
  },
  {
    id: 'treasure-hunt',
    title: 'Treasure Hunt',
    description: 'Giải mã bản đồ kho báu. Mỗi câu đúng mở ra một mảnh ghép của tấm bản đồ.',
    icon: Navigation,
    status: 'preview',
    color: 'text-yellow-600'
  }
];
