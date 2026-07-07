// Shell types
export interface ParsedCommand {
  command: string;
  args: string[];
  redirectOp?: ">" | ">>";
  redirectTarget?: string;
}

export interface CommandResult {
  output: string;
  isError?: boolean;
  clear?: boolean;
  cwd?: string; // set by cd command to update shell cwd
  edit?: { path: string; content: string }; // edit 명령 — 에디터 오버레이를 연다
}

export type CommandHandler = (args: string[], context: ShellContext) => Promise<CommandResult>;

export interface ShellContext {
  fs: any; // LightningFS instance
  dir: string; // git repo root (always '/')
  cwd: string;
  pendingMerge: { theirs: string } | null;
  setPendingMerge: (merge: { theirs: string } | null) => void;
}

// Validation types
export type ValidationType =
  | "file-exists"
  | "file-content"
  | "git-staged"
  | "commit-count"
  | "branch-exists"
  | "current-branch"
  | "commit-message"
  | "merge-commit"
  | "no-conflict-markers"
  | "remote-exists"
  | "command-run";

export interface ValidationRule {
  type: ValidationType;
  path?: string;
  contains?: string;
  matches?: string;
  min?: number;
  name?: string;
  pattern?: string;
}

export interface LessonStep {
  id: string;
  instruction: string;
  hint: string;
  validation: ValidationRule;
}

// Content types
export interface LessonMeta {
  title: string;
  slug: string;
  order: number;
  hasTerminal: boolean;
  steps: LessonStep[];
}

export interface LessonContent {
  meta: LessonMeta;
  html: string;
}

export interface Section {
  id: string;
  order: number;
  slug: string;
  title: string;
  description: string;
  file: string;
  hasTerminal: boolean;
}

export interface SectionsData {
  name: string;
  description: string;
  sections: Section[];
}

// Reference types — content/references.json (강의 참고 자료)
export interface Reference {
  title: string;
  url: string;
  description: string;
  tag?: string;
}

export interface ReferenceCategory {
  title: string;
  items: Reference[];
}

export interface ReferenceData {
  categories: ReferenceCategory[];
}

// Progress types
export type ProgressMap = Record<string, boolean>;

// Fixture types
export interface FixtureConfig {
  version: number;
  setup: (fs: any) => Promise<void>;
}

// Course types — 정적 커리큘럼 (content/course.json)
export interface Course {
  cohort: string; // "1기"
  sessions: Session[];
}

export interface Session {
  id: string; // "s1"
  order: number; // 1~4
  title: string;
  goal: string;
  periods: Period[]; // 시간표 — 표시 전용, 추적 없음
  activities: Activity[]; // 진행 추적 단위
}

export interface Period {
  order: number; // 1~6
  title: string;
  durationMin: number;
}

export type Activity =
  | { type: "checkin"; id: string }
  | { type: "checkout"; id: string }
  | { type: "survey"; id: string; items: { id: string; label: string }[] }
  | { type: "lecture"; id: string; title: string; deck?: string }
  | { type: "lesson"; id: string; slug: string }
  | {
      type: "mission";
      id: string;
      title: string;
      link?: string;
      steps: { id: string; label: string }[];
    };

// Course runtime state — localStorage 이벤트 소싱
export interface Participant {
  id: string; // uuid — 익명 식별자
  name: string; // 리더보드 표시명
}

export type ProgressEvent =
  | { kind: "checkin"; sessionId: string; score: number; reason: string; at: number }
  | { kind: "checkout"; sessionId: string; score: number; reason: string; at: number }
  | { kind: "survey"; sessionId: string; answers: Record<string, boolean>; at: number }
  | { kind: "lecture-done"; activityId: string; at: number }
  | { kind: "mission-step"; missionId: string; stepId: string; done: boolean; at: number }
  | { kind: "lesson-step"; slug: string; stepId: string; at: number }
  | { kind: "lesson-done"; slug: string; at: number };

// Phase 2 동기화 결합점 — Phase 1에서는 인터페이스만 존재
export interface SyncAdapter {
  publish(e: ProgressEvent, who: Participant): Promise<void>;
  subscribe(onPeer: (peer: { participant: Participant; events: ProgressEvent[] }) => void): () => void;
}

// Course derived-view types — 이벤트 로그의 reduce 결과
export type ActivityStatus =
  | { type: "checkin" | "checkout"; done: boolean; score?: number; reason?: string; at?: number }
  | { type: "survey"; done: boolean; answers?: Record<string, boolean>; at?: number }
  | { type: "lecture"; done: boolean; at?: number }
  | { type: "lesson"; done: boolean; stepsDone: string[]; at?: number }
  | { type: "mission"; done: boolean; steps: Record<string, boolean>; at?: number };

export type ActivityStatusMap = Record<string, ActivityStatus>;
