import type { MatrixEvent } from "matrix-js-sdk";

export const getThreadRootId = (event: MatrixEvent): string | null => {
    const relatesTo = event.getContent()["m.relates_to"];
    if (relatesTo?.rel_type === "m.thread" && typeof relatesTo.event_id === "string") {
        return relatesTo.event_id;
    }
    return null;
};

export const getReplyToEventId = (event: MatrixEvent): string | null => {
    const relatesTo = event.getContent()["m.relates_to"] as
        | { "m.in_reply_to"?: { event_id?: string } }
        | undefined;

    return relatesTo?.["m.in_reply_to"]?.event_id ?? null;
};

export const buildEventsById = (events: MatrixEvent[]) => {
    const map = new Map<string, MatrixEvent>();
    for (const ev of events) {
        const id = ev.getId();
        if (id) map.set(id, ev);
    }
    return map;
};

export const buildThreadRepliesCount = (events: MatrixEvent[]) => {
    const countByRoot: Record<string, number> = {};
    for (const ev of events) {
        if (ev.getType() !== "m.room.message") continue;
        const rootId = getThreadRootId(ev);
        if (rootId) countByRoot[rootId] = (countByRoot[rootId] ?? 0) + 1;
    }
    return countByRoot;
};
