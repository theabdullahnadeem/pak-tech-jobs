/**
 * Unit tests for notification delivery and queuing
 * Requirements: 13.2, 13.4, 13.5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/socketio", () => ({
  emitToUser: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser } from "@/lib/socketio";
import { GET } from "@/app/api/notifications/route";
import { PATCH } from "@/app/api/notifications/[id]/read/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.notification.findMany as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.notification.findUnique as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.notification.update as ReturnType<typeof vi.fn>;
const mockEmitToUser = emitToUser as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER_SESSION = {
  user: { id: "user-1", role: "APPLICANT" as const },
  expires: "",
};

const OTHER_USER_SESSION = {
  user: { id: "user-2", role: "APPLICANT" as const },
  expires: "",
};

const UNREAD_NOTIFICATION = {
  id: "notif-1",
  userId: "user-1",
  type: "APPLICATION_STATUS_CHANGE",
  title: "Application Updated",
  body: "Your application has been seen.",
  data: null,
  read: false,
  createdAt: new Date("2024-01-01T10:00:00Z"),
};

function makePatchRequest(id: string) {
  return new NextRequest(`http://localhost/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ---------------------------------------------------------------------------
// GET /api/notifications — auth guard (Requirement 13.2)
// ---------------------------------------------------------------------------

describe("GET /api/notifications — auth guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });
});

// ---------------------------------------------------------------------------
// GET /api/notifications — returns unread notifications (Requirement 13.2)
// ---------------------------------------------------------------------------

describe("GET /api/notifications — unread notifications (Req 13.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(USER_SESSION);
  });

  it("returns only unread notifications for the authenticated user", async () => {
    mockFindMany.mockResolvedValue([UNREAD_NOTIFICATION]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("notif-1");
    expect(body[0].read).toBe(false);

    // Verify the query filters by userId and read=false
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", read: false },
      })
    );
  });

  it("returns empty array when no unread notifications exist", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("queued notifications are returned on reconnect (offline delivery, Req 13.2)", async () => {
    // Simulates a user reconnecting and fetching stored unread notifications
    const queuedNotifications = [
      { ...UNREAD_NOTIFICATION, id: "notif-queued-1" },
      { ...UNREAD_NOTIFICATION, id: "notif-queued-2", type: "DIRECT_MESSAGE" },
    ];
    mockFindMany.mockResolvedValue(queuedNotifications);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body.map((n: { id: string }) => n.id)).toEqual([
      "notif-queued-1",
      "notif-queued-2",
    ]);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id]/read — auth guard (Requirement 13.5)
// ---------------------------------------------------------------------------

describe("PATCH /api/notifications/[id]/read — auth guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest("notif-1"), makeParams("notif-1"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id]/read — not found / ownership (Req 13.5)
// ---------------------------------------------------------------------------

describe("PATCH /api/notifications/[id]/read — not found and ownership (Req 13.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(USER_SESSION);
  });

  it("notification not found → 404", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest("nonexistent"), makeParams("nonexistent"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it("notification belongs to different user → 403", async () => {
    mockAuth.mockResolvedValue(OTHER_USER_SESSION);
    mockFindUnique.mockResolvedValue(UNREAD_NOTIFICATION); // owned by user-1

    const res = await PATCH(makePatchRequest("notif-1"), makeParams("notif-1"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/forbidden/i);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id]/read — valid mark-as-read (Req 13.5)
// ---------------------------------------------------------------------------

describe("PATCH /api/notifications/[id]/read — valid mark-as-read (Req 13.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(USER_SESSION);
    mockFindUnique.mockResolvedValue(UNREAD_NOTIFICATION);
  });

  it("valid mark-as-read → 200 with read=true", async () => {
    const updatedNotification = { ...UNREAD_NOTIFICATION, read: true };
    mockUpdate.mockResolvedValue(updatedNotification);

    const res = await PATCH(makePatchRequest("notif-1"), makeParams("notif-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.read).toBe(true);
    expect(body.id).toBe("notif-1");
  });

  it("emits notification:read event via Socket.io for real-time badge update (Req 13.4)", async () => {
    const updatedNotification = { ...UNREAD_NOTIFICATION, read: true };
    mockUpdate.mockResolvedValue(updatedNotification);

    await PATCH(makePatchRequest("notif-1"), makeParams("notif-1"));

    expect(mockEmitToUser).toHaveBeenCalledWith(
      "user-1",
      "notification:read",
      { notificationId: "notif-1" }
    );
  });
});
