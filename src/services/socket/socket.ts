import { useRoleBasedSchoolId } from "@/hooks/role-based-ids/use-rolebased-school-id";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationList, useUnReadNotificationList } from "../notification/notification.hook";

const SOCKET_SERVER_URLS = [
  "http://110.238.75.177:5008/",
  "http://203.123.87.191:5009/",
];

type SocketsMap = Record<string, Socket | null>;

export const useSockets = () => {
  const socketsRef = useRef<SocketsMap>({});
  const [activeServerUrl, setActiveServerUrl] = useState<string | null>(null);
  const unReadNotification = useUnReadNotificationList({});
  const notificationQuery = useNotificationList({});
  const school_id = useRoleBasedSchoolId();

  // Connect to socket servers
  const connectSockets = useCallback(() => {
    SOCKET_SERVER_URLS.forEach((url) => {
      if (!socketsRef.current[url]) {
        const socket = io(url, { transports: ["websocket"] });

        socket.on("connect", () => {
          console.log(`Socket Connected to: ${url}`);
        });

        socket.on("notification_test", (data: any) => {
          if (data?.school_id == school_id) {
            unReadNotification.refetch();
            notificationQuery.refetch();
          }
          if (!activeServerUrl) {
            setActiveServerUrl(url);
            // console.log(`Setting active server: ${url}`);
          }
        });

        socket.on("disconnect", () => {
          console.log(`Disconnected from: ${url}`);
        });

        socketsRef.current[url] = socket;
      }
    });
  }, [activeServerUrl]);

  // Disconnect inactive sockets
  const disconnectInactiveSockets = useCallback(() => {
    Object.keys(socketsRef.current).forEach((url) => {
      if (url !== activeServerUrl) {
        socketsRef.current[url]?.disconnect();
        socketsRef.current[url] = null;
        // console.log(`Disconnected from inactive server: ${url}`);
      }
    });
  }, [activeServerUrl]);

  // Disconnect all sockets
  const disconnectSockets = useCallback(() => {
    Object.values(socketsRef.current).forEach((socket) => socket?.disconnect());
    socketsRef.current = {};
    setActiveServerUrl(null);
  }, []);

  // Emit event on active server
  const emitEvent = useCallback(
    (eventName: string, data?: any) => {
      if (activeServerUrl) {
        socketsRef.current[activeServerUrl]?.emit(eventName, data);
      }
    },
    [activeServerUrl]
  );

  // Subscribe to events on active server
  const subscribeToEvent = useCallback(
    (eventName: string, callback: (data: any) => void) => {
      if (activeServerUrl) {
        socketsRef.current[activeServerUrl]?.on(eventName, callback);
      }
    },
    [activeServerUrl]
  );

  useEffect(() => {
    connectSockets();

    return () => {
      disconnectSockets();
    };
  }, [connectSockets, disconnectSockets]);

  return {
    activeServerUrl,
    emitEvent,
    subscribeToEvent,
    disconnectSockets,
    disconnectInactiveSockets,
  };
};


