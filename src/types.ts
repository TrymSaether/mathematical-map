import { z } from "zod";

export const NodeKind = z.enum([
  "definition", "theorem", "lemma", "example", "proposition", "corollary",
]);
export type NodeKind = z.infer<typeof NodeKind>;

export const Relation = z.enum(["statement", "proof", "illustration"]);
export type Relation = z.infer<typeof Relation>;

export const EdgeSource = z.enum(["auto", "verified"]);
export type EdgeSource = z.infer<typeof EdgeSource>;

const RelationCounts = z.record(z.number());

export const NodeGraphMetadata = z.object({
  inDegree: z.number().int().nonnegative().optional(),
  outDegree: z.number().int().nonnegative().optional(),
  degree: z.number().int().nonnegative().optional(),
  inByRelation: RelationCounts.optional(),
  outByRelation: RelationCounts.optional(),
  conceptMapPriority: z.number().optional(),
  conceptMapPriorityV2: z.number().optional(),
  pagerank: z.number().optional(),
  betweenness: z.number().optional(),
  closeness: z.number().optional(),
  component: z.number().int().optional(),
  learnerRank: z.number().int().optional(),
});
export type NodeGraphMetadata = z.infer<typeof NodeGraphMetadata>;

export const NodeSemanticMetadata = z.object({
  layer: z.string().optional(),
  layerOrder: z.number().int().optional(),
  layerName: z.string().optional(),
  conceptBuckets: z.array(z.string()).default([]),
  role: z.string().optional(),
  shortLabel: z.string().optional(),
  sortKey: z.array(z.union([z.string(), z.number()])).optional(),
  isCoreConcept: z.boolean().optional(),
});
export type NodeSemanticMetadata = z.infer<typeof NodeSemanticMetadata>;

export const MergedNodeFragment = z.object({
  id: z.string(),
  reason: z.string().optional(),
  cleanText: z.string().optional(),
});
export type MergedNodeFragment = z.infer<typeof MergedNodeFragment>;

export const EdgeReviewMetadata = z.object({
  flags: z.array(z.string()).default([]),
  needsHumanReview: z.boolean().default(false),
});
export type EdgeReviewMetadata = z.infer<typeof EdgeReviewMetadata>;

export const TopoNode = z.object({
  id: z.string(),
  kind: NodeKind,
  number: z.string(),
  title: z.string(),
  chapter: z.string(),
  section: z.string(),
  sectionTitle: z.string(),
  topicCluster: z.string(),
  originalText: z.string(),
  formalStatement: z.string().default(""),
  explanation: z.string().default(""),
  statementDependencies: z.array(z.string()).default([]),
  proofDependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Optional enrichment fields produced by the cleanup/enrichment pass.
  label: z.string().optional(),
  chapterGroup: z.string().optional(),
  cleanText: z.string().optional(),
  statementText: z.string().optional(),
  qualityFlags: z.array(z.string()).default([]),
  mergedFrom: z.array(MergedNodeFragment).default([]),
  graph: NodeGraphMetadata.optional(),
  semantic: NodeSemanticMetadata.optional(),
});
export type TopoNode = z.infer<typeof TopoNode>;

export const TopoEdge = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  relation: Relation,
  source: EdgeSource,
  confidence: z.number().min(0).max(1),

  // Optional enrichment fields produced by the cleanup/enrichment pass.
  rationale: z.string().optional(),
  label: z.string().optional(),
  review: EdgeReviewMetadata.optional(),
});
export type TopoEdge = z.infer<typeof TopoEdge>;

export const TopoMeta = z.record(z.unknown());
export type TopoMeta = z.infer<typeof TopoMeta>;

export const TopoData = z.object({
  _meta: TopoMeta.optional(),
  nodes: z.array(TopoNode),
  edges: z.array(TopoEdge),
});
export type TopoData = z.infer<typeof TopoData>;

export const KIND_LABEL: Record<NodeKind, string> = {
  definition: "Definition",
  theorem: "Theorem",
  lemma: "Lemma",
  example: "Example",
  proposition: "Proposition",
  corollary: "Corollary",
};

export const RELATION_COLOR: Record<Relation, string> = {
  statement: "#0077B6",
  proof: "#6D597A",
  illustration: "#D99A2B",
};

export const RELATION_LABEL: Record<Relation, string> = {
  statement: "needed to state/define",
  proof: "used to prove",
  illustration: "illustrated by",
};
