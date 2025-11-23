export type TimelineEventTime = {
  type: 'relative';
  relative: string;
  difference: string;
  end?: string;
} | {
  type: 'absolute';
  start: string;
  end?: string;
}
