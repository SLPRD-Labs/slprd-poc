import { getMyMembership } from "@/libs/utils/matrix/room";
import { getChildOrder, partitionSpacesAndRooms, sanitizeOrder } from "@/libs/utils/matrix/space";
import type { MatrixClient, Room } from "matrix-js-sdk";
import { EventTimeline, EventType, KnownMembership, MatrixEvent } from "matrix-js-sdk";

class MessageService {
    public getUpdateForEditedMessage(originalEvent: MatrixEvent, newContent: string): MatrixEvent {
        const newEvent = new MatrixEvent({
            ...originalEvent.event,
            content: {
                ...originalEvent.getContent(),
                body: newContent,
                "m.new_content": {
                    ...originalEvent.getContent(),
                    body: newContent
                }
            }
        }); 
        return newEvent;
    }
}

export const messageService = new MessageService();
