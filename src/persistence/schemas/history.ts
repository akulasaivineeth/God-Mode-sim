import { z } from 'zod';

/**
 * HIST-001 / HIST-002 — Scaffolding only in M00.
 * Types for future true vs cultural history and causal traces.
 */
export const causalTraceContributorSchema = z.object({
  factor: z.string(),
  value: z.number(),
});

export const causalTraceSchema = z.object({
  decisionId: z.string(),
  selectedAction: z.string(),
  contributors: z.array(causalTraceContributorSchema),
});

export type CausalTrace = z.infer<typeof causalTraceSchema>;

export const culturalHistoryEntrySchema = z.object({
  eventId: z.string(),
  culturalAccount: z.string(),
  confidence: z.number().min(0).max(1),
});

export type CulturalHistoryEntry = z.infer<typeof culturalHistoryEntrySchema>;
