// 이름 입력 모달을 여는 얇은 브리지. 트리거(레슨 안의 버튼)와 모달(전역
// ParticipantBadge)이 서로를 모르게 유지한다.

type Opener = (onDone?: () => void) => void;

let opener: Opener | null = null;

export function openNameDialog(onDone?: () => void): void {
  if (opener) opener(onDone);
  else onDone?.(); // 모달이 아직 마운트 전이면 동작만 이어간다
}

export function registerNameDialog(fn: Opener): () => void {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}
