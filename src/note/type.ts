export interface NoteMeta {
  id?: string;
  tags: string[];
  created: string;
  updated: string;
  title: string;
  archived?: boolean;
}

export interface NoteContent {
  id?: string;
  nid?: string; // refers to NoteMeta id
  content: any;
  counter: number;
}
