import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DepthLayers from "@/components/DepthLayers";
import DynamicBackground from "@/components/DynamicBackground";
import { AuthProvider } from "@/contexts/AuthContext";

// Stub framer-motion so animations don't interfere with assertions
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  const React = await import("react");
  const passthrough = (tag: string) =>
    React.forwardRef((props: any, ref: any) => React.createElement(tag, { ...props, ref }, props.children));
  return {
    ...actual,
    motion: new Proxy({}, { get: (_t, key: string) => passthrough(key) }),
    AnimatePresence: ({ children }: any) => children,
  };
});

// Auth not required for nav rendering — provide a noop wrapper
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthProvider>
);

describe("Navbar visibility & z-index with background layers", () => {
  beforeEach(() => {
    // Force "high" device tier so DepthLayers actually renders
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it("renders the <nav> element with role=navigation", () => {
    render(
      <Wrap>
        <DepthLayers />
        <DynamicBackground />
        <Navbar />
      </Wrap>
    );
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("Navbar wrapper sits above background layers (z-50 > z-0)", () => {
    const { container } = render(
      <Wrap>
        <DepthLayers />
        <DynamicBackground />
        <Navbar />
      </Wrap>
    );
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    // The fixed wrapper is the parent of <nav>
    const wrapper = nav.parentElement as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.className).toMatch(/\bz-50\b/);
    expect(wrapper.className).toMatch(/\bfixed\b/);

    // Background layers should be z-0 (or behind)
    const bgLayers = container.querySelectorAll('[aria-hidden="true"], .fixed.inset-0');
    bgLayers.forEach((el) => {
      const cls = (el as HTMLElement).className || "";
      // Must NOT carry z-40 or higher
      expect(cls).not.toMatch(/\bz-(4\d|50|9\d{2,})\b/);
    });
  });

  it("Navbar contains brand link to home", () => {
    render(
      <Wrap>
        <DepthLayers />
        <DynamicBackground />
        <Navbar />
      </Wrap>
    );
    const home = screen.getByLabelText(/masterchess home/i);
    expect(home).toBeInTheDocument();
    expect(home.getAttribute("href")).toBe("/");
  });

  it("Navbar is not hidden by display/visibility styles", () => {
    render(
      <Wrap>
        <DepthLayers />
        <DynamicBackground />
        <Navbar />
      </Wrap>
    );
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    const style = window.getComputedStyle(nav);
    expect(style.display).not.toBe("none");
    expect(style.visibility).not.toBe("hidden");
  });
});
