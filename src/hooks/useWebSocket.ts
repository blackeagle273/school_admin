import { useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket';

export function useWebSocket(onMessage?: (message: any) => void) {
  useEffect(() => {
    websocketService.connect();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (onMessage) {
      websocketService.addMessageHandler(onMessage);
      return () => {
        websocketService.removeMessageHandler(onMessage);
      };
    }
  }, [onMessage]);

  const sendMessage = useCallback((message: any) => {
    websocketService.sendMessage(message);
  }, []);

  return { sendMessage };
} 