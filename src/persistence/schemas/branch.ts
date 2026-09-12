import { z } from 'zod';

/**
 * EXP-001 — Scaffolding only in M00.
 * Branch metadata schema for future timeline branching; not executed in M00.
 */
export const branchMetadataSchema = z.object({
  branchId: z.string(),
  parentBranchId: z.string().optional(),
  parentCheckpointId: z.string().optional(),
  forkSimTime: z.number().int().nonnegative().optional(),
});

export type BranchMetadata = z.infer<typeof branchMetadataSchema>;
