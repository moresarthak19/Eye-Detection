/**
 * WebSocket hook for real-time communication with Python backend
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { WEBSOCKET_CONFIG } from '../config/constants';

const useWebSocket = () => {
  const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef(null);
  const isIntentionalDisconnectRef = useRef(false);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    setStatus('connecting');
    setError(null);
    isIntentionalDisconnectRef.current = false;

    // Attempt to reconnect with exponential backoff
    const attemptReconnect = () => {
      if (reconnectAttemptsRef.current >= WEBSOCKET_CONFIG.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        setError('Failed to connect after multiple attempts');
        return;
      }

      reconnectAttemptsRef.current += 1;
      const delay = WEBSOCKET_CONFIG.reconnectInterval * reconnectAttemptsRef.current;
      
      console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${WEBSOCKET_CONFIG.maxReconnectAttempts})...`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    try {
      console.log(`Connecting to ${WEBSOCKET_CONFIG.url}...`);
      const ws = new WebSocket(WEBSOCKET_CONFIG.url);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, WEBSOCKET_CONFIG.pingInterval);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'metrics') {
            setLatestMetrics(message);
          } else if (message.type === 'pong') {
            // Heartbeat response
            console.log('Pong received');
          } else if (message.type === 'error') {
            console.error('Backend error:', message.message);
            setError(message.message);
          } else if (message.type === 'reset_confirmed') {
            console.log('Metrics reset confirmed');
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setStatus('disconnected');
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt reconnection if not intentional disconnect
        if (!isIntentionalDisconnectRef.current) {
          attemptReconnect();
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(err.message);
      setStatus('error');
      attemptReconnect();
    }
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Send frame to backend
  const sendFrame = useCallback((base64Image, timestamp) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'frame',
        data: base64Image,
        timestamp: timestamp || Date.now(),
      };
      
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('Error sending frame:', err);
        return false;
      }
    } else {
      console.warn('WebSocket not connected, cannot send frame');
      return false;
    }
  }, []);

  // Reset metrics on backend
  const resetMetrics = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
      setLatestMetrics(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isIntentionalDisconnectRef.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    status,
    error,
    latestMetrics,
    connect,
    disconnect,
    sendFrame,
    resetMetrics,
    isConnected: status === 'connected',
  };
};

export default useWebSocket;
