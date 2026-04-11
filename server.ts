import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { setSocketIO } from "@/lib/socketio";
import { createRedisClient } from "@/lib/redis";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  });

  // Redis pub/sub clients for Socket.io adapter
  const pubClient = createRedisClient();
  const subClient = createRedisClient();

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      pubClient.on("ready", resolve);
      pubClient.on("error", reject);
    }),
    new Promise<void>((resolve, reject) => {
      subClient.on("ready", resolve);
      subClient.on("error", reject);
    }),
  ]);

  console.log("[Redis] Connected — Socket.io adapter ready");

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
  });

  setSocketIO(io);

  // Authenticate socket connections via NextAuth JWT session
  io.use(async (socket, next) => {
    // Auth is optional — unauthenticated sockets can still receive public events
    // User-specific events are scoped to rooms joined after connection
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const { decode } = await import("next-auth/jwt");
        const decoded = await decode({
          token,
          secret: process.env.NEXTAUTH_SECRET!,
          salt:
            process.env.NODE_ENV === "production"
              ? "__Secure-authjs.session-token"
              : "authjs.session-token",
        });
        if (decoded?.sub) {
          socket.data.userId = decoded.sub;
          socket.data.role = decoded.role as string;
        }
      } catch {
        // Invalid token — allow connection but without userId
      }
    }
    next();
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (!userId) {
      // Unauthenticated connection — only receives public broadcasts
      return;
    }
    socket.join(`user:${userId}`);
    console.log(`[Socket.io] User ${userId} connected`);

    // Deliver unread notifications on reconnect
    try {
      const { prisma } = await import("./src/lib/prisma");
      const unreadNotifications = await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: "asc" },
      });
      for (const notification of unreadNotifications) {
        socket.emit("notification:new", notification);
      }
    } catch (err) {
      console.error(`[Socket.io] Failed to deliver queued notifications:`, err);
    }

    socket.on("disconnect", () => {
      console.log(`[Socket.io] User ${userId} disconnected`);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
