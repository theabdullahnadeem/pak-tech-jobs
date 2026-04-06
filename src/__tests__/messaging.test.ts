/**
 * Unit tests for messaging constraints
 * Requirements: 8.5, 14.5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    messageThread: {
      findUnique: vi.fn(),
    },
    message: {
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    headhuntOutreach: {
      findUnique: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    messageThread: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/socketio", () => ({
  emitToUser: vi.fn(),
  getSocketIO: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/requireVerifiedRecruiter", () => ({
  requireVerifiedRecruiter: vi.fn().mockResolvedValue(null),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { POST as messagesPost } from "@/app/api/messages/route";
import { POST as headhuntPost } from "@/app/api/headhunt/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockThreadFindUnique = prisma.messageThread.findUnique as ReturnType<typeof vi.fn>;
const mockMessageCount = prisma.message.count as ReturnType<typeof vi.fn>;
const mockMessageCreate = prisma.message.create as ReturnType<typeof vi.fn>;
const mockMessageUpdate = prisma.message.update as ReturnType<typeof vi.fn>;
const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockOutreachFindUnique = prisma.headhuntOutreach.findUnique as ReturnType<typeof vi.fn>;
const mockOutreachCount = prisma.headhuntOutreach.count as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const APPLICANT_SESSION = {
  user: { id: "applicant-1", role: "APPLICANT" as const },
  expires: "",
};

const RECRUITER_SESSION = {
  user: { id: "recruiter-1", role: "RECRUITER" as const },
  expires: "",
};

const NORMAL_THREAD = {
  id: "thread-1",
  applicantId: "applicant-1",
  recruiterId: "recruiter-1",
  isHeadhunt: false,
  applicantAccepted: null,
};

const HEADHUNT_THREAD_PENDING = {
  id: "thread-2",
  applicantId: "applicant-1",
  recruiterId: "recruiter-1",
  isHeadhunt: true,
  applicantAccepted: null,
};

const HEADHUNT_THREAD_ACCEPTED = {
  id: "thread-3",
  applicantId: "applicant-1",
  recruiterId: "recruiter-1",
  isHeadhunt: true,
  applicantAccepted: true,
};

const HEADHUNT_THREAD_DECLINED = {
  id: "thread-4",
  applicantId: "applicant-1",
  recruiterId: "recruiter-1",
  isHeadhunt: true,
  applicantAccepted: false,
};

const CREATED_MESSAGE = {
  id: "msg-1",
  threadId: "thread-1",
  senderId: "applicant-1",
  content: "Hello",
  sentAt: new Date(),
  deliveredAt: null,
  readAt: null,
};

function makeMessagesPostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeHeadhuntPostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/headhunt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// POST /api/messages — non-participant access blocked (Requirement 8.5)
// ---------------------------------------------------------------------------

describe("POST /api/messages — non-participant access blocked (Req 8.5)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sender is neither applicant nor recruiter of the thread → 403", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "outsider-99", role: "APPLICANT" as const },
      expires: "",
    });
    mockThreadFindUnique.mockResolvedValue(NORMAL_THREAD);

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-1", content: "Hello" })
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/forbidden/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/messages — headhunt thread restrictions (Requirement 8.5)
// ---------------------------------------------------------------------------

describe("POST /api/messages — headhunt thread restrictions (Req 8.5)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("headhunt thread, applicantAccepted=null, recruiter is sender, existingCount=0 → 201 (initial outreach allowed)", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockThreadFindUnique.mockResolvedValue(HEADHUNT_THREAD_PENDING);
    mockMessageCount.mockResolvedValue(0);
    mockMessageCreate.mockResolvedValue(CREATED_MESSAGE);

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-2", content: "Hi, interested in you!" })
    );

    expect(res.status).toBe(201);
  });

  it("headhunt thread, applicantAccepted=null, recruiter is sender, existingCount=1 → 403 (blocked until accepted)", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockThreadFindUnique.mockResolvedValue(HEADHUNT_THREAD_PENDING);
    mockMessageCount.mockResolvedValue(1);

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-2", content: "Following up..." })
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/not yet accepted/i);
  });

  it("headhunt thread, applicantAccepted=false (declined) → 403", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockThreadFindUnique.mockResolvedValue(HEADHUNT_THREAD_DECLINED);
    mockMessageCount.mockResolvedValue(1);

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-4", content: "Please reconsider" })
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/declined/i);
  });

  it("headhunt thread, applicantAccepted=true → 201 (conversation allowed)", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockThreadFindUnique.mockResolvedValue(HEADHUNT_THREAD_ACCEPTED);
    mockMessageCreate.mockResolvedValue({ ...CREATED_MESSAGE, threadId: "thread-3" });

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-3", content: "Great, let's talk!" })
    );

    expect(res.status).toBe(201);
  });

  it("normal thread (isHeadhunt=false) → 201 (no headhunt restrictions apply)", async () => {
    mockAuth.mockResolvedValue(APPLICANT_SESSION);
    mockThreadFindUnique.mockResolvedValue(NORMAL_THREAD);
    mockMessageCreate.mockResolvedValue(CREATED_MESSAGE);

    const res = await messagesPost(
      makeMessagesPostRequest({ threadId: "thread-1", content: "Hello recruiter!" })
    );

    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// POST /api/headhunt — 30-day cooldown after decline (Requirement 14.5)
// ---------------------------------------------------------------------------

describe("POST /api/headhunt — 30-day cooldown after decline (Req 14.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockUserFindUnique.mockResolvedValue({ id: "applicant-1", role: "APPLICANT" });
    mockOutreachCount.mockResolvedValue(0);
  });

  it("declinedAt within last 30 days → 429 (cooldown active)", async () => {
    const recentDecline = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    mockOutreachFindUnique.mockResolvedValue({ declinedAt: recentDecline });

    const res = await headhuntPost(
      makeHeadhuntPostRequest({ applicantId: "applicant-1", message: "Hi there!" })
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/30 days/i);
  });

  it("declinedAt more than 30 days ago → 201 (cooldown expired, outreach allowed)", async () => {
    const oldDecline = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
    mockOutreachFindUnique.mockResolvedValue({ declinedAt: oldDecline });
    mockTransaction.mockResolvedValue({
      thread: { id: "thread-new" },
      msg: { id: "msg-new" },
    });

    const res = await headhuntPost(
      makeHeadhuntPostRequest({ applicantId: "applicant-1", message: "Hi again!" })
    );

    expect(res.status).toBe(201);
  });

  it("no prior outreach record → 201 (first contact allowed)", async () => {
    mockOutreachFindUnique.mockResolvedValue(null);
    mockTransaction.mockResolvedValue({
      thread: { id: "thread-new" },
      msg: { id: "msg-new" },
    });

    const res = await headhuntPost(
      makeHeadhuntPostRequest({ applicantId: "applicant-1", message: "Hello!" })
    );

    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// POST /api/headhunt — 24-hour rate limit (Requirement 14.4)
// ---------------------------------------------------------------------------

describe("POST /api/headhunt — 24-hour rate limit (Req 14.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockUserFindUnique.mockResolvedValue({ id: "applicant-1", role: "APPLICANT" });
    mockOutreachFindUnique.mockResolvedValue(null);
  });

  it("20 or more outreach messages in last 24h → 429 (rate limit exceeded)", async () => {
    mockOutreachCount.mockResolvedValue(20);

    const res = await headhuntPost(
      makeHeadhuntPostRequest({ applicantId: "applicant-1", message: "Hi!" })
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/i);
  });

  it("fewer than 20 outreach messages in last 24h → 201 (within limit)", async () => {
    mockOutreachCount.mockResolvedValue(19);
    mockTransaction.mockResolvedValue({
      thread: { id: "thread-new" },
      msg: { id: "msg-new" },
    });

    const res = await headhuntPost(
      makeHeadhuntPostRequest({ applicantId: "applicant-1", message: "Hi!" })
    );

    expect(res.status).toBe(201);
  });
});
