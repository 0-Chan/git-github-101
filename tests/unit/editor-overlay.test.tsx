import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorOverlay } from "@/components/EditorOverlay";

afterEach(cleanup);

function setup(overrides: Partial<Parameters<typeof EditorOverlay>[0]> = {}) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <EditorOverlay
      path="/docs/greeting.txt"
      initialContent="hello"
      onSave={onSave}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onSave, onCancel, textarea: screen.getByRole("textbox") as HTMLTextAreaElement };
}

describe("EditorOverlay", () => {
  it("shows the file name and initial content, focusing the textarea", () => {
    const { textarea } = setup();
    expect(screen.getByText(/greeting\.txt/)).toBeTruthy();
    expect(textarea.value).toBe("hello");
    expect(document.activeElement).toBe(textarea);
  });

  it("calls onSave with the edited content", () => {
    const { onSave, textarea } = setup();
    fireEvent.change(textarea, { target: { value: "Hello, Git!" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenCalledWith("Hello, Git!");
  });

  it("saves with Ctrl+S / Cmd+S", () => {
    const { onSave, textarea } = setup();
    fireEvent.change(textarea, { target: { value: "edited" } });
    fireEvent.keyDown(textarea, { key: "s", ctrlKey: true });
    expect(onSave).toHaveBeenCalledWith("edited");
  });

  it("cancels with the button and with Escape", () => {
    const { onCancel, textarea } = setup();
    fireEvent.keyDown(textarea, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /취소/ }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("accepts Korean text (IME-friendly plain textarea)", () => {
    const { onSave, textarea } = setup();
    fireEvent.change(textarea, { target: { value: "안녕하세요, Git!" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSave).toHaveBeenCalledWith("안녕하세요, Git!");
  });
});
