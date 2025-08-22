import { describe, expect, it, jest } from "@jest/globals";

// Isolated session cleanup logic for testing
class SessionManager {
  private transports = new Map<string, any>();
  private sessionLastUsed = new Map<string, number>();
  private timeoutMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(timeoutMs = 1800000) {
    this.timeoutMs = timeoutMs;
  }

  addSession(sid: string): void {
    this.transports.set(sid, {});
    this.sessionLastUsed.set(sid, Date.now());
  }

  touchSession(sid: string): void {
    if (this.transports.has(sid)) {
      this.sessionLastUsed.set(sid, Date.now());
    }
  }

  getSessionCount(): number {
    return this.transports.size;
  }

  cleanupExpired(): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sid, lastUsed] of this.sessionLastUsed.entries()) {
      if (now - lastUsed > this.timeoutMs) {
        this.transports.delete(sid);
        this.sessionLastUsed.delete(sid);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

describe("Session Cleanup Logic", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should cleanup expired sessions after timeout", () => {
    const manager = new SessionManager(1800000); // 30 minutes
    
    manager.addSession("test-session-1");
    expect(manager.getSessionCount()).toBe(1);
    
    // Fast-forward past timeout
    jest.advanceTimersByTime(1800000 + 1000);
    
    const cleaned = manager.cleanupExpired();
    expect(cleaned).toBe(1);
    expect(manager.getSessionCount()).toBe(0);
  });

  it("should not cleanup active sessions", () => {
    const manager = new SessionManager(1800000);
    
    manager.addSession("test-session-1");
    expect(manager.getSessionCount()).toBe(1);
    
    // Advance 15 minutes and touch session
    jest.advanceTimersByTime(900000);
    manager.touchSession("test-session-1");
    
    // Advance past original timeout
    jest.advanceTimersByTime(900000 + 1000);
    
    const cleaned = manager.cleanupExpired();
    expect(cleaned).toBe(0);
    expect(manager.getSessionCount()).toBe(1);
  });

  it("should cleanup multiple expired sessions", () => {
    const manager = new SessionManager(1800000);
    
    manager.addSession("test-session-1");
    manager.addSession("test-session-2");
    manager.addSession("test-session-3");
    expect(manager.getSessionCount()).toBe(3);
    
    jest.advanceTimersByTime(1800000 + 1000);
    
    const cleaned = manager.cleanupExpired();
    expect(cleaned).toBe(3);
    expect(manager.getSessionCount()).toBe(0);
  });

  it("should automatically cleanup with interval", () => {
    const manager = new SessionManager(1800000);
    manager.startCleanup(300000); // 5 minutes
    
    manager.addSession("test-session-1");
    expect(manager.getSessionCount()).toBe(1);
    
    // Fast-forward past session timeout + cleanup interval
    jest.advanceTimersByTime(1800000 + 300000);
    
    expect(manager.getSessionCount()).toBe(0);
    
    manager.stopCleanup();
  });
});