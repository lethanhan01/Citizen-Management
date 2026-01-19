import type { Citizen, Gender, ResidencyStatus } from "@/types/citizen";
import type { UnknownRecord } from "@/types/api";

const toGender = (value: unknown): Gender =>
  value === "male" || value === "female" || value === "other" || value === "unknown" ? value : "unknown";

const toResidencyStatus = (value: unknown): ResidencyStatus =>
  value === "permanent" ||
  value === "temporary_resident" ||
  value === "temporary_absent" ||
  value === "moved_out" ||
  value === "deceased"
    ? value
    : "permanent";

export function mapPersonToCitizen(p: UnknownRecord): Citizen {
  const households = (p as { households?: unknown }).households;
  const firstHousehold =
    Array.isArray(households) ? households[0] : households || null;

  const householdMembership =
    firstHousehold?.HouseholdMembership ||
    firstHousehold?.households?.HouseholdMembership;

  return {
    id: String((p as { person_id?: unknown; id?: unknown }).person_id ?? (p as { id?: unknown }).id ?? ""),
    cccd: String((p as { citizen_id_num?: unknown }).citizen_id_num ?? ""),
    fullName: String((p as { full_name?: unknown }).full_name ?? ""),
    dateOfBirth: String((p as { dob?: unknown }).dob ?? ""),
    gender: toGender((p as { gender?: unknown }).gender),
    status: toResidencyStatus((p as { residency_status?: unknown }).residency_status),
    start_date: String((p as { start_date?: unknown }).start_date ?? ""),
    end_date: String((p as { end_date?: unknown }).end_date ?? ""),

    ethnicity: String((p as { ethnicity?: unknown }).ethnicity ?? ""),
    hometown: String((p as { hometown?: unknown }).hometown ?? ""),

    householdCode: String((firstHousehold as { household_no?: unknown })?.household_no ?? ""),
    address: String(
      (firstHousehold as { address?: unknown })?.address ??
        (p as { previous_address?: unknown }).previous_address ??
        ""
    ),

    nationality: undefined,
    occupation: (p as { occupation?: string }).occupation ?? undefined,
    workplace: (p as { workplace?: string }).workplace ?? undefined,

    cmndCccdIssueDate: (p as { citizen_id_issued_date?: string }).citizen_id_issued_date ?? undefined,
    cmndCccdIssuePlace: (p as { citizen_id_issued_place?: string }).citizen_id_issued_place ?? undefined,

    permanentResidenceDate: (p as { residence_registered_date?: string }).residence_registered_date ?? undefined,

    isHead: Boolean((householdMembership as { is_head?: unknown })?.is_head ?? false),
    relationshipToHead: (householdMembership as { relation_to_head?: string })?.relation_to_head ?? undefined,

    isDeceased: String((p as { residency_status?: unknown }).residency_status ?? "").toLowerCase() === "deceased",
  };
}