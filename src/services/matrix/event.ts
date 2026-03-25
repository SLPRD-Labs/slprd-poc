import type { MatrixClient, MatrixEvent } from "matrix-js-sdk";

class EventService {
    public async getEventById(
        client: MatrixClient,
        roomId: string,
        eventId: string
    ): Promise<MatrixEvent | null> {
        const local = client.getRoom(roomId)?.findEventById(eventId) ?? null;
        if (local) return local;

        try {
            const raw = await client.fetchRoomEvent(roomId, eventId);
            return client.getEventMapper()(raw);
        } catch {
            return null;
        }
    }
}

export const eventService = new EventService();