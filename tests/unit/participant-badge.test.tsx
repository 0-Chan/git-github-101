import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParticipantBadge } from "@/components/ParticipantBadge";
import { openNameDialog } from "@/lib/nameDialog";
import { clearParticipant, createParticipant, getParticipant } from "@/lib/participant";

beforeEach(() => {
  localStorage.clear();
  clearParticipant();
});
afterEach(cleanup);

describe("ParticipantBadge", () => {
  it("shows a set-name CTA without a participant and the name with one", () => {
    const { unmount } = render(<ParticipantBadge />);
    expect(screen.getByText("이름 설정")).toBeTruthy();
    unmount();

    createParticipant("홍길동");
    render(<ParticipantBadge />);
    expect(screen.getByText("홍길동")).toBeTruthy();
  });

  it("opens the dialog on click, prefills, and saves keeping the uuid", () => {
    const original = createParticipant("처음");
    render(<ParticipantBadge />);
    fireEvent.click(screen.getByText("처음"));

    const input = screen.getByPlaceholderText("예: 홍길동") as HTMLInputElement;
    expect(input.value).toBe("처음");
    fireEvent.change(input, { target: { value: "바꾼이름" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(getParticipant()).toEqual({ id: original.id, name: "바꾼이름" });
    expect(screen.queryByPlaceholderText("예: 홍길동")).toBeNull(); // 모달 닫힘
  });

  it("openNameDialog opens the modal and runs onDone after close", () => {
    render(<ParticipantBadge />);
    const onDone = vi.fn();
    act(() => openNameDialog(onDone));
    expect(screen.getByText("수강생 이름을 입력 해주세요.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(getParticipant()).toBeNull(); // 취소는 저장하지 않음
  });

  it("Escape cancels without saving", () => {
    render(<ParticipantBadge />);
    fireEvent.click(screen.getByText("이름 설정"));
    const input = screen.getByPlaceholderText("예: 홍길동");
    fireEvent.change(input, { target: { value: "임시" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(getParticipant()).toBeNull();
  });
});
