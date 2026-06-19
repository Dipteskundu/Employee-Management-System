"use client";

import { useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { showNotification } from "@/lib/notifications";
import { queryClient } from "@/lib/query-client";

export interface AttendanceEvent {
  type: "IN" | "OUT";
  userId: string;
  username: string;
  department: string;
  timestamp: string;
  status: string;
}

export function useSocketEvents() {
  const [latestEvent, setLatestEvent] = useState<AttendanceEvent | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (connectedRef.current) return;
    connectedRef.current = true;

    const socket = connectSocket();

    socket.on("attendance:update", (event: AttendanceEvent) => {
      setLatestEvent(event);
      showNotification("Attendance Update", {
        body: `${event.username} clocked ${event.type === "IN" ? "in" : "out"} (${event.status})`,
      });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["team-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    });

    return () => {
      connectedRef.current = false;
      socket.off("attendance:update");
    };
  }, []);

  const clearLatestEvent = () => setLatestEvent(null);

  return { latestEvent, clearLatestEvent };
}
