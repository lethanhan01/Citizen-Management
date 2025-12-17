export interface HouseholdMember {
  id: string;
  fullName: string;
  cccd: string;
  relationship: string;
  isHead: boolean;
}

export interface Household {
  id: string;
  code: string; // Mã hộ khẩu
  headName: string; // Tên chủ hộ
  headId: string; // ID chủ hộ (for linking to citizen detail)
  address: string;
  registrationDate: string;
  memberCount: number;
  members: HouseholdMember[];
  lastUpdated?: string; // Log thời gian cập nhật gần nhất
}
