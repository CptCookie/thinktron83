import { describe, it, expect, beforeEach } from "vitest";
import Session from "./session";

describe("Session — ring buffer for terminal command history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── Storing commands ────────────────────────────────────────────────────────

  describe("add", () => {
    it("starts empty", () => {
      expect(new Session().storedLen).toBe(0);
    });

    it("tracks the number of stored commands", () => {
      const s = new Session();
      s.add("ls");
      s.add("pwd");
      expect(s.storedLen).toBe(2);
    });

    it("caps realLength at maxSize when the buffer wraps", () => {
      const s = new Session(3);
      s.add("a");
      s.add("b");
      s.add("c");
      s.add("d");
      expect(s.storedLen).toBe(3);
    });
  });

  // ─── Navigating backward (Up arrow) ─────────────────────────────────────────

  describe("getPrev", () => {
    it("returns undefined when history is empty", () => {
      expect(new Session().getPrev()).toBeUndefined();
    });

    it("returns the most recently added command on the first call", () => {
      const s = new Session();
      s.add("first");
      s.add("second");
      expect(s.getPrev()).toBe("second");
    });

    it("walks backward through all commands from newest to oldest", () => {
      const s = new Session();
      s.add("cmd1");
      s.add("cmd2");
      s.add("cmd3");
      expect(s.getPrev()).toBe("cmd3");
      expect(s.getPrev()).toBe("cmd2");
      expect(s.getPrev()).toBe("cmd1");
    });
  });

  // ─── Navigating forward (Down arrow) ─────────────────────────────────────────

  describe("getNext", () => {
    it("returns undefined before the user has scrolled back with getPrev", () => {
      const s = new Session();
      s.add("cmd1");
      s.add("cmd2");
      // No getPrev() yet — not in scroll mode
      expect(s.getNext()).toBeUndefined();
    });

    it("moves forward toward the newer command after going back", () => {
      const s = new Session();
      s.add("cmd1");
      s.add("cmd2");
      s.add("cmd3");
      s.getPrev(); // cmd3
      s.getPrev(); // cmd2
      s.getPrev(); // cmd1
      expect(s.getNext()).toBe("cmd2");
      expect(s.getNext()).toBe("cmd3");
      expect(s.getNext()).toBeUndefined();
      expect(s.getNext()).toBeUndefined();
    });
  });

  // ─── Clearing history ─────────────────────────────────────────────────────────

  describe("delete", () => {
    it("resets storedLen to zero", () => {
      const s = new Session();
      s.add("a");
      s.add("b");
      s.delete();
      expect(s.storedLen).toBe(0);
    });

    it("makes getPrev return undefined after clearing", () => {
      const s = new Session();
      s.add("a");
      s.delete();
      expect(s.getPrev()).toBeUndefined();
    });

    it("clears localStorage", () => {
      const s = new Session();
      s.add("a");
      s.delete();
      expect(JSON.parse(localStorage.getItem("terminalSession")!)).toHaveLength(
        0,
      );
    });
  });

  // ─── Ring buffer overflow ─────────────────────────────────────────────────────

  describe("ring buffer overflow", () => {
    it("drops the oldest entry to make room for the newest", () => {
      const s = new Session(2);
      s.add("oldest");
      s.add("middle");
      s.add("newest"); // oldest is dropped
      const stored = JSON.parse(localStorage.getItem("terminalSession")!);
      expect(stored).toContain("newest");
      expect(stored).not.toContain("oldest");
    });

    it("keeps realLength at maxSize after overflow", () => {
      const s = new Session(2);
      s.add("a");
      s.add("b");
      s.add("c");
      expect(s.storedLen).toBe(2);
    });
  });

  // ─── localStorage persistence ─────────────────────────────────────────────────

  describe("localStorage persistence", () => {
    it("stores commands in chronological order (oldest first)", () => {
      const s = new Session();
      s.add("first");
      s.add("second");
      expect(JSON.parse(localStorage.getItem("terminalSession")!)).toEqual([
        "first",
        "second",
      ]);
    });

    it("restores the full history when a new Session is created", () => {
      const s1 = new Session();
      s1.add("remembered");
      const s2 = new Session();
      expect(s2.storedLen).toBe(1);
      expect(s2.getPrev()).toBe("remembered");
    });

    it("handles missing localStorage entry without throwing", () => {
      expect(() => new Session()).not.toThrow();
    });

    it("handles corrupt localStorage data without throwing", () => {
      localStorage.setItem("terminalSession", "{{not-json}}");
      expect(() => new Session()).not.toThrow();
    });
  });
});
