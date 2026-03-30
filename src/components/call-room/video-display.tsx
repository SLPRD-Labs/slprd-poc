import { useParticipants, useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantTile } from "./participant-tile";
import type { TrackReference, TrackReferenceOrPlaceholder } from "@livekit/components-react";

export const VideoDisplay = () => {
    const participants = useParticipants();

    const cameraTracksRaw = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);

    const cameraTracks = cameraTracksRaw.filter(isTrackReference);

    const screenTracksRaw = useTracks([
        { source: Track.Source.ScreenShare, withPlaceholder: false }
    ]);

    const screenTracks = screenTracksRaw.filter(isTrackReference);

    const activeScreen: TrackReference | undefined =
        screenTracks.find(t => t.participant.isSpeaking) ?? screenTracks[0];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeScreen) {
        return (
            <div className="flex h-full w-full">
                <div className="relative flex-1 bg-black">
                    <VideoTrack
                        trackRef={activeScreen}
                        className="absolute inset-0 h-full w-full object-contain"
                    />
                </div>

                <div className="hidden w-64 flex-col gap-2 overflow-y-auto p-2 lg:flex">
                    {participants.map(p => (
                        <ParticipantTile
                            key={p.identity}
                            participant={p}
                            variant="sidebar"
                            cameraTracks={cameraTracks}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const gridCols = getGridCols(participants.length);

    return (
        <div className={`grid h-full min-h-0 w-full flex-1 auto-rows-fr gap-2 p-2 ${gridCols}`}>
            {participants.map(p => (
                <ParticipantTile key={p.identity} participant={p} cameraTracks={cameraTracks} />
            ))}
        </div>
    );
};

const getGridCols = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
};

function isTrackReference(track: TrackReferenceOrPlaceholder): track is TrackReference {
    return track.publication !== undefined;
}
