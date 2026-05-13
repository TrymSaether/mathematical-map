import { z } from "zod";
import { relationColors } from "./lib/colors";

export const NodeKindSchema = z.enum([
  "definition",
  "theorem",
  "lemma",
  "example",
  "proposition",
  "corollary",
]);

export type NodeKind = z.infer<typeof NodeKindSchema>;

export const RelationSchema = z.enum(["statement", "proof", "illustration"]);

export type Relation = z.infer<typeof RelationSchema>;

export const EdgeSourceSchema = z.enum(["auto", "verified"]);

export type EdgeSource = z.infer<typeof EdgeSourceSchema>;

const IdSchema = z.string().trim().min(1);

const OptionalTextSchema = z.string().trim().default("");

const RequiredTextSchema = z.string().trim().min(1);

const StringArraySchema = z.array(z.string().trim().min(1)).default([]);

export const TopoNodeSchema = z.object({
  id: IdSchema,

  kind: NodeKindSchema,

  number: RequiredTextSchema,
  title: RequiredTextSchema,

  chapter: RequiredTextSchema,
  section: RequiredTextSchema,
  sectionTitle: RequiredTextSchema,

  topicCluster: RequiredTextSchema,

  originalText: RequiredTextSchema,

  formalStatement: OptionalTextSchema,
  mathematicalFormula: OptionalTextSchema,
  explanation: OptionalTextSchema,

  statementDependencies: StringArraySchema,
  proofDependencies: StringArraySchema,

  tags: StringArraySchema,

  qualityFlags: StringArraySchema,
});

export type TopoNode = z.infer<typeof TopoNodeSchema>;

export const TopoEdgeSchema = z.object({
  id: IdSchema,

  from: IdSchema,
  to: IdSchema,

  relation: RelationSchema,
  source: EdgeSourceSchema.default("auto"),

  confidence: z.number().min(0).max(1).default(1),
});

export type TopoEdge = z.infer<typeof TopoEdgeSchema>;

export const TopoDataSchema = z
  .object({
    nodes: z.array(TopoNodeSchema).default([]),
    edges: z.array(TopoEdgeSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const nodeIds = new Set<string>();

    for (const node of data.nodes) {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nodes"],
          message: `Duplicate node id: ${node.id}`,
        });
      }

      nodeIds.add(node.id);
    }

    const edgeIds = new Set<string>();

    for (const edge of data.edges) {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges"],
          message: `Duplicate edge id: ${edge.id}`,
        });
      }

      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", edge.id, "from"],
          message: `Edge ${edge.id} references missing source node: ${edge.from}`,
        });
      }

      if (!nodeIds.has(edge.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", edge.id, "to"],
          message: `Edge ${edge.id} references missing target node: ${edge.to}`,
        });
      }
    }

    for (const node of data.nodes) {
      for (const depId of [
        ...node.statementDependencies,
        ...node.proofDependencies,
      ]) {
        if (!nodeIds.has(depId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["nodes", node.id],
            message: `Node ${node.id} references missing dependency: ${depId}`,
          });
        }
      }
    }
  });

export type TopoData = z.infer<typeof TopoDataSchema>;

export const KIND_LABEL = {
  definition: "Definition",
  theorem: "Theorem",
  lemma: "Lemma",
  example: "Example",
  proposition: "Proposition",
  corollary: "Corollary",
} satisfies Record<NodeKind, string>;

export const RELATION_LABEL = {
  statement: "Statement",
  proof: "Proof",
  illustration: "Illustration",
} satisfies Record<Relation, string>;

export const RELATION_COLOR = relationColors satisfies Record<Relation, string>;

export function parseTopoNode(input: unknown): TopoNode {
  return TopoNodeSchema.parse(input);
}

export function parseTopoEdge(input: unknown): TopoEdge {
  return TopoEdgeSchema.parse(input);
}

export function parseTopoData(input: unknown): TopoData {
  return TopoDataSchema.parse(input);
}

export function safeParseTopoData(input: unknown) {
  return TopoDataSchema.safeParse(input);
}
