import type { Citizen } from "@/types/citizen";

export function mapPersonToCitizen(p: any): Citizen {
  const households = p?.households;
  const firstHousehold =
    Array.isArray(households) ? households[0] : households || null;

  const householdMembership =
    firstHousehold?.HouseholdMembership ||
    firstHousehold?.households?.HouseholdMembership;

  return {
    id: String(p?.person_id ?? p?.id ?? ""),
    cccd: String(p?.citizen_id_num ?? ""),
    fullName: String(p?.full_name ?? ""),
    dateOfBirth: String(p?.dob ?? ""),
    gender: (p?.gender ?? "unknown") as any,
    status: (p?.residency_status ?? "permanent") as any,

    householdCode: String(firstHousehold?.household_no ?? ""),
    address: String(firstHousehold?.address ?? p?.previous_address ?? ""),

    nationality: undefined,
    occupation: p?.occupation ?? undefined,
    workplace: p?.workplace ?? undefined,

    cmndCccdIssueDate: p?.citizen_id_issued_date ?? undefined,
    cmndCccdIssuePlace: p?.citizen_id_issued_place ?? undefined,

    permanentResidenceDate: p?.residence_registered_date ?? undefined,

    isHead: Boolean(householdMembership?.is_head ?? false),
    relationshipToHead: householdMembership?.relation_to_head ?? undefined,

    isDeceased: false,
  };
}