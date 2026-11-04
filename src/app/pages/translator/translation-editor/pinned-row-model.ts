export interface PinnedRow {
  placeholder: Comment;
  rowSpans: Array<{ cell: HTMLTableCellElement; value: string | null }>;
  onStateChange: (pinned: boolean) => void;
}
