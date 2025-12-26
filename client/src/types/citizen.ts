export type Gender = "male" | "female" | "other" | "unknown";

export type ResidencyStatus =
  | "permanent"
  | "temporary_resident"
  | "temporary_absent"
  | "moved_out"
  | "deceased";

export interface Citizen {
  id: string;
  cccd: string;
  fullName: string;
  dateOfBirth: string; // ISO string
  gender: Gender;
  householdCode: string;
  address: string;
  status: ResidencyStatus;

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