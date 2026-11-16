// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { usePublicationCreate } from "./usePublicationCreate";

const auth = vi.hoisted(() => ({ user: null as { id: string } | null, loading: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
afterEach(cleanup);
const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe("publication creation continuation", () => {
  it("opens auth for a guest and creates once after that user signs in", async () => {
    auth.user = null;
    const create = vi.fn();
    const { result, rerender } = renderHook(() => usePublicationCreate(create), { wrapper });
    act(() => result.current.requestCreate());
    expect(result.current.authOpen).toBe(true);
    expect(create).not.toHaveBeenCalled();
    auth.user = { id: "owner" };
    rerender();
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(result.current.authOpen).toBe(false);
  });
  it("cancelling login does not later open an unwanted form", () => {
    auth.user = null;
    const create = vi.fn();
    const { result, rerender } = renderHook(() => usePublicationCreate(create), { wrapper });
    act(() => result.current.requestCreate());
    act(() => result.current.closeAuth());
    auth.user = { id: "owner" };
    rerender();
    expect(create).not.toHaveBeenCalled();
  });
  it("consumes a footer create intent for signed-in users", async () => {
    auth.user = { id: "owner" };
    const create = vi.fn();
    renderHook(() => usePublicationCreate(create), { wrapper: ({ children }) => <MemoryRouter initialEntries={["/?action=create"]}>{children}</MemoryRouter> });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  });
});