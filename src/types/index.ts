export type UserRole = "auditor" | "lead_auditor" | "admin";
export type InspectionStatus = "draft" | "in_progress" | "completed";
export type FindingCategory = "safety" | "health" | "environment";
export type FindingSeverity = "low" | "medium" | "high" | "critical";

export interface HSEInspection {
  id: number;
  title: string;
  location: string;
  auditorId?: number;
  status: InspectionStatus;
  score?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface HSEFinding {
  id: number;
  inspectionId: number;
  category: FindingCategory;
  severity: FindingSeverity;
  description: string;
  actionPlan?: string;
  isResolved: boolean;
  createdAt: string;
}
