#!/usr/bin/env python3
"""Convert old mathematical-map topology JSON into the new field graph JSON shape.

Input shape:
  {
    "schemaVersion": "...",
    "metadata": {...},
    "nodes": [...],
    "edges": [...]
  }

Output shape:
  {
    "schema": {...},
    "graph": {
      "id": "...",
      "label": "...",
      "field": "...",
      "model": "directed_typed_multigraph",
      "design_notes": [...],
      "items": [...],
      "edges": [...]
    },
    "views": {...},
    "query_model": {...},
    "example_queries": [...]
  }

Usage:
  python3 scripts/convert_topology_to_field_json.py \
    --input src/data/topology.json \
    --output src/data/maps/topology.json \
    --field topology \
    --label "Topology"
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

DEPENDENCY_CLASSES = [
    "definitional_dependency",
    "logical_dependency",
    "assumption_dependency",
    "construction_dependency",
    "notation_dependency",
    "pedagogical_dependency",
    "historical_dependency",
]

ITEM_KINDS = [
    "axiom",
    "assumption",
    "definition",
    "structure",
    "object",
    "property",
    "construction",
    "notation",
    "example",
    "non_example",
    "counterexample",
    "lemma",
    "proposition",
    "theorem",
    "corollary",
    "conjecture",
    "proof",
    "proof_step",
    "proof_method",
    "application",
]

EDGE_TYPES: dict[str, dict[str, Any]] = {
    "defines": {
        "meaning": "source definition defines target item",
        "inverse_edge_type": "defined_by",
        "transitive": False,
        "symmetric": False,
    },
    "defined_by": {
        "meaning": "source item is defined by target definition",
        "inverse_edge_type": "defines",
        "transitive": False,
        "symmetric": False,
    },
    "introduces": {
        "meaning": "source field, text, theorem, or construction introduces target item",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "assumes": {
        "meaning": "source result or proof assumes target assumption/property/structure",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "requires": {
        "meaning": "source item requires target to be stated or constructed",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "uses": {
        "meaning": "source proof, theorem, application, or step uses target method/result/item",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "proves": {
        "meaning": "source proof establishes target result",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "implies": {
        "meaning": "source result logically implies target result",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "equivalent_to": {
        "meaning": "source and target are mathematically equivalent",
        "inverse_edge_type": "equivalent_to",
        "transitive": True,
        "symmetric": True,
    },
    "generalizes": {
        "meaning": "source generalizes target",
        "inverse_edge_type": "specializes",
        "transitive": True,
        "symmetric": False,
    },
    "specializes": {
        "meaning": "source specializes target",
        "inverse_edge_type": "generalizes",
        "transitive": True,
        "symmetric": False,
    },
    "subtype_of": {
        "meaning": "source structure/object is a subtype of target",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "instance_of": {
        "meaning": "source example/object is an instance of target class/structure/property",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "inherits_from": {
        "meaning": "source inherits operations/properties from target",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "constructed_from": {
        "meaning": "source construction/object is built from target item",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "induces": {
        "meaning": "source item canonically induces target item",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "has_property": {
        "meaning": "source item has target property",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "has_example": {
        "meaning": "source class/result has target as example",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "has_counterexample": {
        "meaning": "source item is linked to target counterexample or non-example",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "shows_necessity_of": {
        "meaning": "source counterexample demonstrates that target assumption/property cannot be dropped",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "violates_assumption": {
        "meaning": "source example/counterexample violates target assumption/property",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "motivates": {
        "meaning": "source item motivates target item pedagogically or historically",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
    "prerequisite_for": {
        "meaning": "source is useful or necessary to learn before target",
        "inverse_edge_type": None,
        "transitive": True,
        "symmetric": False,
    },
    "applied_to": {
        "meaning": "source result/method is applied to target application/context",
        "inverse_edge_type": None,
        "transitive": False,
        "symmetric": False,
    },
}

# Old topology edges point from prerequisite/source item to dependent/target item.
# The most faithful new edge type for that direction is usually prerequisite_for.
RELATION_MAP = {
    "statement": ("prerequisite_for", "definitional_dependency"),
    "statementDependency": ("prerequisite_for", "definitional_dependency"),
    "proof": ("prerequisite_for", "logical_dependency"),
    "proofDependency": ("prerequisite_for", "logical_dependency"),
    "illustration": ("has_example", "pedagogical_dependency"),
}

SEMANTIC_RELATION_MAP = {
    "definition-use": ("prerequisite_for", "definitional_dependency"),
    "proof-use": ("prerequisite_for", "logical_dependency"),
    "application-of": ("applied_to", "logical_dependency"),
    "illustration": ("has_example", "pedagogical_dependency"),
    "counterexample-to": ("has_counterexample", "logical_dependency"),
    "consequence-of": ("implies", "logical_dependency"),
    "computes": ("uses", "logical_dependency"),
    "construction-step": ("constructed_from", "construction_dependency"),
    "equivalent-formulation-of": ("equivalent_to", "logical_dependency"),
    "generalizes": ("generalizes", "logical_dependency"),
    "motivates": ("motivates", "pedagogical_dependency"),
    "special-case-of": ("specializes", "logical_dependency"),
}

CONFIDENCE_TO_LABEL = [
    (0.80, "high"),
    (0.50, "medium"),
    (0.0, "low"),
]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_") or "field"




def make_id_map(ids: list[str]) -> dict[str, str]:
    used: dict[str, int] = {}
    out: dict[str, str] = {}
    for old_id in ids:
        base = slugify(old_id)
        if base[0].isdigit():
            base = f"item_{base}"
        count = used.get(base, 0)
        used[base] = count + 1
        out[old_id] = base if count == 0 else f"{base}_{count + 1}"
    return out


def map_ids(values: Any, id_map: dict[str, str]) -> list[str]:
    return [id_map.get(value, value) for value in list_of_strings(values)]


def compact_text(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)
    value = value.strip()
    return value or None


def list_of_strings(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()] if str(value).strip() else []


def empty_dependencies() -> dict[str, list[str]]:
    return {key: [] for key in DEPENDENCY_CLASSES}


def confidence_label(value: Any) -> str:
    if isinstance(value, str):
        value = value.lower().strip()
        if value in {"high", "medium", "low"}:
            return value
    try:
        score = float(value)
    except (TypeError, ValueError):
        return "medium"
    for threshold, label in CONFIDENCE_TO_LABEL:
        if score >= threshold:
            return label
    return "low"


def map_edge_type(edge: dict[str, Any]) -> tuple[str, str | None]:
    semantic = compact_text(edge.get("semanticRelation"))
    if semantic in SEMANTIC_RELATION_MAP:
        return SEMANTIC_RELATION_MAP[semantic]

    relation = compact_text(edge.get("relation")) or compact_text(edge.get("edgeType"))
    if relation in RELATION_MAP:
        return RELATION_MAP[relation]

    return "prerequisite_for", "logical_dependency"


def convert_node(node: dict[str, Any], id_map: dict[str, str]) -> dict[str, Any]:
    kind = compact_text(node.get("kind")) or "object"
    if kind not in ITEM_KINDS:
        kind = "object"

    original_text = compact_text(node.get("originalText"))
    formal = compact_text(node.get("formalStatement")) or compact_text(node.get("mathematicalFormula"))
    explanation = compact_text(node.get("explanation"))

    deps = empty_dependencies()
    deps["definitional_dependency"] = map_ids(node.get("statementDependencies"), id_map)
    deps["logical_dependency"] = map_ids(node.get("proofDependencies"), id_map)

    title = compact_text(node.get("title")) or compact_text(node.get("number")) or compact_text(node.get("id")) or "Untitled"
    tags = list_of_strings(node.get("tags"))

    topic = compact_text(node.get("topicCluster"))
    if topic:
        topic_tag = slugify(topic).replace("_", "-")
        if topic_tag not in tags:
            tags.append(topic_tag)

    source_bits = []
    for key in ("chapter", "section", "sectionTitle", "number"):
        text = compact_text(node.get(key))
        if text:
            source_bits.append(f"{key}:{text}")

    item: dict[str, Any] = {
        "id": id_map.get(compact_text(node.get("id")) or "", slugify(title)),
        "label": title,
        "kind": kind,
        "statement": original_text if kind != "definition" else None,
        "formal_statement": formal,
        "definition": original_text if kind == "definition" else None,
        "intuition": explanation,
        "notation": None,
        "assumptions": [],
        "dependencies": deps,
        "outgoing_relations": [],
        "metadata": {
            "tags": tags,
            "syllabus_priority": "medium",
            "source": "; ".join(source_bits) if source_bits else None,
        },
    }

    if kind in {"theorem", "lemma", "proposition", "corollary"}:
        item.update(
            {
                "hypotheses": [],
                "conclusion": formal or original_text or title,
                "proof_methods": [],
                "related_theorems": [],
                "examples": [],
                "applications": [],
                "variants": [],
            }
        )
    elif kind == "definition":
        item.update(
            {
                "introduced_object": title,
                "genus": topic or "mathematical item",
                "differentia": [],
                "examples": [],
                "non_examples": [],
                "equivalent_definitions": [],
            }
        )
    elif kind == "example":
        item.update(
            {
                "satisfies": [],
                "violates": [],
                "demonstrates": map_ids(node.get("statementDependencies"), id_map),
                "related_theorems": map_ids(node.get("proofDependencies"), id_map),
            }
        )

    return item


def convert_edge(edge: dict[str, Any], id_map: dict[str, str], index: int) -> dict[str, Any]:
    old_source = compact_text(edge.get("from")) or compact_text(edge.get("source"))
    old_target = compact_text(edge.get("to")) or compact_text(edge.get("target"))
    source = id_map.get(old_source or "", old_source)
    target = id_map.get(old_target or "", old_target)
    if not source or not target:
        raise ValueError(f"Edge is missing source/target: {edge!r}")

    edge_type, dependency_class = map_edge_type(edge)
    relation = compact_text(edge.get("semanticRelation")) or compact_text(edge.get("relation")) or compact_text(edge.get("edgeType")) or edge_type
    rationale = compact_text(edge.get("rationale"))

    return {
        "id": f"e{index + 1:03d}",
        "source": source,
        "target": target,
        "type": edge_type,
        "dependency_class": dependency_class,
        "label": compact_text(edge.get("label")) or f"{source} {relation} {target}",
        "direction": "source_to_target",
        "confidence": confidence_label(edge.get("confidence")),
        "notes": rationale,
    }


def build_schema(field: str) -> dict[str, Any]:
    edge_types = {
        name: {
            "meaning": spec["meaning"],
            "allowed_source_kinds": ITEM_KINDS,
            "allowed_target_kinds": ITEM_KINDS,
            "inverse_edge_type": spec.get("inverse_edge_type"),
            "transitive": spec["transitive"],
            "symmetric": spec["symmetric"],
        }
        for name, spec in EDGE_TYPES.items()
    }

    return {
        "id": f"{field}_kg_schema_v1",
        "model": "directed_typed_multigraph",
        "item_kinds": ITEM_KINDS,
        "dependency_classes": DEPENDENCY_CLASSES,
        "item_schema": {
            "required_fields": {
                "id": "string",
                "label": "string",
                "kind": "item_kind",
                "statement": "string|null",
                "formal_statement": "string|null",
                "definition": "string|null",
                "intuition": "string|null",
                "notation": "string|list[string]|null",
                "assumptions": "list[string]",
                "dependencies": {key: "list[string]" for key in DEPENDENCY_CLASSES},
                "outgoing_relations": "list[string]",
                "metadata": {
                    "tags": "list[string]",
                    "syllabus_priority": "low|medium|high|core",
                    "source": "string|null",
                },
            },
        },
        "edge_schema": {
            "required_fields": {
                "id": "string",
                "source": "string",
                "target": "string",
                "type": "edge_type",
                "dependency_class": "dependency_class|null",
                "label": "string",
                "direction": "source_to_target",
                "confidence": "high|medium|low",
                "notes": "string|null",
            }
        },
        "edge_types": edge_types,
    }


def build_views() -> dict[str, Any]:
    all_edges = list(EDGE_TYPES.keys())
    return {
        "concept_map": {
            "description": "All items and all converted relationships.",
            "included_item_kinds": ITEM_KINDS,
            "included_edge_types": all_edges,
            "included_dependency_classes": DEPENDENCY_CLASSES,
            "root_items": [],
            "example_traversal": "Start from any item and follow outgoing edges by selected type.",
        },
        "definition_dependency_graph": {
            "description": "Definitions and definitional prerequisites.",
            "included_item_kinds": ["definition", "structure", "object", "property", "notation"],
            "included_edge_types": ["defines", "defined_by", "requires", "prerequisite_for"],
            "included_dependency_classes": ["definitional_dependency", "notation_dependency"],
            "root_items": [],
            "example_traversal": "Follow incoming prerequisite_for edges to see what a definition depends on.",
        },
        "theorem_dependency_graph": {
            "description": "Theorem-like items and logical prerequisites.",
            "included_item_kinds": ["lemma", "proposition", "theorem", "corollary"],
            "included_edge_types": ["prerequisite_for", "implies", "uses", "applied_to"],
            "included_dependency_classes": ["logical_dependency", "definitional_dependency"],
            "root_items": [],
            "example_traversal": "Follow incoming logical prerequisite edges to recover proof dependencies.",
        },
        "example_map": {
            "description": "Examples, illustrations, and counterexamples.",
            "included_item_kinds": ["definition", "structure", "property", "theorem", "example", "counterexample", "non_example"],
            "included_edge_types": ["has_example", "has_counterexample", "shows_necessity_of", "violates_assumption"],
            "included_dependency_classes": ["pedagogical_dependency", "logical_dependency"],
            "root_items": [],
            "example_traversal": "Follow outgoing has_example and has_counterexample edges from a selected item.",
        },
    }


def convert_dataset(source: dict[str, Any], field: str, label: str | None = None) -> dict[str, Any]:
    metadata = source.get("metadata") if isinstance(source.get("metadata"), dict) else {}
    nodes = source.get("nodes")
    edges = source.get("edges")

    if not isinstance(nodes, list):
        raise ValueError("Input JSON must contain a top-level nodes array")
    if not isinstance(edges, list):
        raise ValueError("Input JSON must contain a top-level edges array")

    old_ids = [compact_text(node.get("id")) or f"item_{index}" for index, node in enumerate(nodes)]
    id_map = make_id_map(old_ids)

    items = [convert_node(node, id_map) for node in nodes]
    converted_edges = [convert_edge(edge, id_map, index) for index, edge in enumerate(edges)]

    edge_ids_by_source: dict[str, list[str]] = defaultdict(list)
    for edge in converted_edges:
        edge_ids_by_source[edge["source"]].append(edge["id"])

    for item in items:
        generated = edge_ids_by_source.get(item["id"], [])
        existing = item.get("outgoing_relations") or []
        item["outgoing_relations"] = list(dict.fromkeys([*existing, *generated]))

    item_ids = {item["id"] for item in items}
    missing_refs = sorted(
        {
            ref
            for edge in converted_edges
            for ref in (edge["source"], edge["target"])
            if ref not in item_ids
        }
    )
    if missing_refs:
        raise ValueError(f"Converted edges reference missing item ids: {missing_refs[:20]}")

    kind_counts = Counter(item["kind"] for item in items)
    edge_type_counts = Counter(edge["type"] for edge in converted_edges)

    graph_label = label or compact_text(metadata.get("title")) or field.replace("_", " ").title()
    return {
        "schema": build_schema(field),
        "graph": {
            "id": f"{field}_graph_v1",
            "label": graph_label,
            "field": field,
            "model": "directed_typed_multigraph",
            "design_notes": [
                "Converted from the old mathematical-map topology nodes/edges format.",
                "Old nodes are converted to first-class graph items.",
                "Old dependency and semantic edges are converted to directed typed multigraph edges.",
            ],
            "items": items,
            "edges": converted_edges,
        },
        "views": build_views(),
        "query_model": {
            "description": "Field graph queries operate on graph.items and graph.edges.",
            "node_lookup": "graph.items[id]",
            "edge_lookup": "graph.edges[id]",
            "transitive_closure": "Follow directed edges filtered by type and dependency_class.",
            "multigraph_rule": "Multiple typed edges may connect the same pair of items.",
        },
        "example_queries": [
            {
                "query_name": "direct_prerequisites",
                "start_node_kind": "theorem",
                "edge_filter": {
                    "edge_types": ["prerequisite_for"],
                    "dependency_classes": ["definitional_dependency", "logical_dependency"],
                },
                "traversal_direction": "incoming",
                "expected_output": "Items that are direct prerequisites for the selected theorem.",
                "example": "For a selected theorem, list incoming prerequisite_for edges.",
            },
            {
                "query_name": "examples_of_definition",
                "start_node_kind": "definition",
                "edge_filter": {
                    "edge_types": ["has_example", "has_counterexample"],
                    "dependency_classes": ["pedagogical_dependency", "logical_dependency"],
                },
                "traversal_direction": "outgoing",
                "expected_output": "Examples and counterexamples linked to the selected definition.",
                "example": "For a selected definition, list outgoing illustration edges.",
            },
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert old topology JSON to new field graph JSON")
    parser.add_argument("--input", default="src/data/topology.json", help="Old topology JSON path")
    parser.add_argument("--output", default="src/data/maps/topology.json", help="Output field JSON path")
    parser.add_argument("--field", default="topology", help="Field id, e.g. topology")
    parser.add_argument("--label", default=None, help="Human-readable graph label")
    parser.add_argument("--indent", type=int, default=2, help="JSON indent")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    source = json.loads(input_path.read_text(encoding="utf-8"))
    field = slugify(args.field)
    converted = convert_dataset(source, field=field, label=args.label)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(converted, ensure_ascii=False, indent=args.indent) + "\n", encoding="utf-8")

    print(f"wrote {output_path}")
    print(f"items: {len(converted['graph']['items'])}")
    print(f"edges: {len(converted['graph']['edges'])}")
    print("edge types:", dict(sorted(Counter(edge["type"] for edge in converted["graph"]["edges"]).items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
