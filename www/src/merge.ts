import { Span } from '.';

export interface Interval {
  kind: string,
  span: Span,
}

export enum EdgeType {
  Entry,
  Exit,
}

export type Edge = {
  edge: number,
  kind: string,
  type: EdgeType,
};

export function edges(intervals: Iterable<Interval>): Edge[] {
  const edges: Edge[] = [];
  for (const { kind, span: [entry, length] } of intervals) {
    edges.push({
      edge: entry,
      kind,
      type: EdgeType.Entry,
    });
    edges.push({
      edge: entry + length,
      kind,
      type: EdgeType.Exit,
    });
  }
  return edges.sort((
    { edge: edgeA, type: typeA },
    { edge: edgeB, type: typeB },
  ) => (
    edgeA - edgeB || typeB - typeA
  ));
}

export function merge(intervals: Iterable<Interval>): { kinds: string[], span: Span }[] {
  const parts: { kinds: string[], span: Span | [number] }[] = [];
  let last = 0;
  for (const edge of edges(intervals)) {
    if (edge.type === EdgeType.Entry) {
      if (parts.length > 0) {
        parts[parts.length - 1].span[1] = edge.edge - last;
      }
      const kinds = parts[parts.length - 1]
        ? [...(parts[parts.length - 1].kinds)] : [];
      kinds.push(edge.kind);
      parts.push({
        kinds,
        span: [edge.edge],
      });
      last = edge.edge;
    } else if (edge.type === EdgeType.Exit) {
      const kinds = parts[parts.length - 1]
        ? [...(parts[parts.length - 1].kinds)] : [];
      kinds.splice(kinds.indexOf(edge.kind), 1);
      if (parts.length > 0) {
        parts[parts.length - 1].span[1] = edge.edge - last;
      }
      parts.push({
        kinds,
        span: [edge.edge, 0],
      });
      last = edge.edge;
    }
  }
  return (<{ kinds: string[], span: Span }[]>parts)
    .filter(({ kinds, span: [entry, length] }) => (
      kinds.length > 0 && length > 0
    ));
}
