import { Room } from "@/pages/room";
import { Route } from "@/routes/_mainLayout/dm/$roomId";

export function DmRoom() {
    const { roomId } = Route.useParams();
    return <Room roomId={roomId} isDm />;
}
