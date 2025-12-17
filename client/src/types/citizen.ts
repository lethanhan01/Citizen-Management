export interface Citizen {
  id: string;
  cccd: string;
  fullName: string;
  dateOfBirth: string;
  gender: "Nam" | "Nữ";
  householdCode: string;
  address: string;
  status: "Thường trú" | "Tạm trú" | "Đã chuyển đi";
  nationality?: string;
  occupation?: string;
  workplace?: string;
  cmndCccdIssueDate?: string;
  cmndCccdIssuePlace?: string;
  permanentResidenceDate?: string;
  isDeceased?: boolean;
  relationshipToHead?: string;
  isHead?: boolean;
}
