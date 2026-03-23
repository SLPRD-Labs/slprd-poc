import { Circle } from "lucide-react";

export const WrittingAnimation = () => {
    return (
        <span className="flex flex-row gap-1">
            <Circle className="animate-pulse" size={6} fill="gray" style={{ animationDelay: "0s" }} />
            <Circle className="animate-pulse" size={6} fill="gray" style={{ animationDelay: "0.2s" }} />
            <Circle className="animate-pulse" size={6} fill="gray" style={{ animationDelay: "0.4s" }} />
        </span>
    );
};
