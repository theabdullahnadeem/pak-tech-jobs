/* eslint-disable @typescript-eslint/no-explicit-any */
let io: any = null;

export function setSocketIO(instance: any): void {
  io = instance;
}

export function getSocketIO(): any {
  return io;
}

/** Emit an event to a specific user's private room */
export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/** Broadcast an event to all connected clients */
export function broadcast(event: string, data: unknown): void {
  if (!io) return;
  io.emit(event, data);
}
