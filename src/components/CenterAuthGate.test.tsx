// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CenterAuthGate from "./CenterAuthGate";

const auth = vi.hoisted(() => ({ user: null as { id: string } | null, loading: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/useLanguage", () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/AuthModal", () => ({ default: ({ open, redirectTo, defaultRegisterRole }: { open: boolean; redirectTo: string; defaultRegisterRole: string }) => open ? <div data-testid="auth" data-destination={redirectTo} data-role={defaultRegisterRole} /> : null }));
afterEach(cleanup);

describe("center entry", () => {
  it("requires authentication before mounting the center editor and preserves its destination", () => {
    auth.user = null;
    render(<MemoryRouter initialEntries={["/club/edit"]}><CenterAuthGate><div data-testid="editor" /></CenterAuthGate></MemoryRouter>);
    expect(screen.queryByTestId("editor")).toBeNull();
    expect(screen.getByTestId("auth").getAttribute("data-destination")).toBe("/club/edit");
    expect(screen.getByTestId("auth").getAttribute("data-role")).toBe("club_owner");
  });
  it("opens the editor for a signed-in user", () => {
    auth.user = { id: "owner" };
    render(<MemoryRouter><CenterAuthGate><div data-testid="editor" /></CenterAuthGate></MemoryRouter>);
    expect(screen.queryByTestId("editor")).not.toBeNull();
    expect(screen.queryByTestId("auth")).toBeNull();
  });
});