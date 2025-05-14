import { useState, useEffect, useCallback } from "react";
import mqtt, { MqttClient } from "mqtt";
import type { IClientOptions, IClientPublishOptions } from "mqtt";

// Define QoS (Quality of service) type as MQTT uses it (0, 1, or 2)
type QoS = 0 | 1 | 2;

// Interface for MQTT message
export interface MqttMessage {
  topic: string;
  message: string;
  timestamp: Date;
}

// Hook configuration options
export interface UseMqttOptions {
  brokerUrl: string;
  clientId?: string;
  username?: string;
  password?: string;
  initialTopics?: string[];
}

// Hook return values
export interface UseMqttReturn {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Messages
  messages: MqttMessage[];
  clearMessages: () => void;

  // Subscriptions
  subscriptions: string[];
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;

  // Publishing
  publish: (topic: string, message: string, options?: any) => void;

  // MQTT client
  client: MqttClient | null;
}

/**
 * A custom React hook for MQTT connectivity
 *
 * @param {UseMqttOptions} options - Configuration options for the MQTT connection
 * @returns {UseMqttReturn} - MQTT connection state, messages, and control functions
 */
export const useMqtt = ({
  brokerUrl,
  clientId,
  username,
  password,
  initialTopics = [],
}: UseMqttOptions): UseMqttReturn => {
  // State for the MQTT client
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // State for messages and subscriptions
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>(initialTopics);

  // Initialize the MQTT client and set up event handlers
  useEffect(() => {
    // Connection options
    const options: IClientOptions = {
      clientId,
      clean: true,
      reconnectPeriod: 5000,
    };

    // Add credentials if provided
    if (username && password) {
      options.username = username;
      options.password = password;
    }

    // Connect to the broker
    console.log(`Connecting to MQTT broker at ${brokerUrl}`);
    const mqttClient = mqtt.connect(brokerUrl, options);
    setClient(mqttClient);

    // Event handlers
    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);
      setConnectionError(null);

      // Subscribe to initial topics
      initialTopics.forEach((topic) => {
        mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error(`Error subscribing to ${topic}:`, err);
          } else {
            console.log(`Subscribed to ${topic}`);
          }
        });
      });
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err);
      setConnectionError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    mqttClient.on("offline", () => {
      console.log("MQTT client is offline");
      setIsConnected(false);
    });

    mqttClient.on("message", (topic, payload) => {
      const message = payload.toString();

      console.log(`Received message on ${topic}: ${message}`);

      setMessages((prev) => [
        {
          topic,
          message,
          timestamp: new Date(),
        },
        ...prev.slice(0, 99), // Limit to last 100 messages
      ]);
    });

    // Cleanup on component unmount
    return () => {
      if (mqttClient) {
        mqttClient.end();
        console.log("MQTT connection closed");
      }
    };
  }, [brokerUrl, clientId, username, password, JSON.stringify(initialTopics)]);

  /**
   * Publish a message to a topic
   *
   * @param {string} topic - The topic to publish to
   * @param {string} message - The message to publish
   * @param {IClientPublishOptions} options - Optional MQTT publish options
   */
  const publish = useCallback(
    (
      topic: string,
      message: string,
      options: IClientPublishOptions = { qos: 0 as QoS, retain: false }
    ) => {
      if (client && isConnected && topic && message) {
        client.publish(topic, message, options, (error) => {
          if (error) {
            console.error("Error publishing message:", error);
          } else {
            console.log(`Message published to ${topic}`);
          }
        });
      } else {
        console.warn(
          "Cannot publish: client not connected or topic/message empty"
        );
      }
    },
    [client, isConnected]
  );

  /**
   * Subscribe to a new topic
   *
   * @param {string} topic - The topic to subscribe to
   */
  const subscribe = useCallback(
    (topic: string) => {
      if (!topic) return console.warn("Cannot subscribe to empty topic");

      if (client && isConnected && !subscriptions.includes(topic)) {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Error subscribing to ${topic}:`, err);
          } else {
            console.log(`Subscribed to ${topic}`);
            setSubscriptions((prev) => [...prev, topic]);
          }
        });
      } else if (subscriptions.includes(topic)) {
        console.warn(`Already subscribed to ${topic}`);
      } else {
        console.warn("Cannot subscribe: client not connected");
      }
    },
    [client, isConnected, subscriptions]
  );

  /**
   * Unsubscribe from a topic
   *
   * @param {string} topic - The topic to unsubscribe from
   */
  const unsubscribe = useCallback(
    (topic: string) => {
      if (client && isConnected && subscriptions.includes(topic)) {
        client.unsubscribe(topic, (err) => {
          if (err) {
            console.error(`Error unsubscribing from ${topic}:`, err);
          } else {
            console.log(`Unsubscribed from ${topic}`);
            setSubscriptions((prev) => prev.filter((t) => t !== topic));
          }
        });
      }
    },
    [client, isConnected, subscriptions]
  );

  /**
   * Clear the messages history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    connectionError,
    messages,
    clearMessages,
    subscriptions,
    subscribe,
    unsubscribe,
    publish,
    client,
  };
};
