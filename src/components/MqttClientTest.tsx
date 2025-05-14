import { useState } from "react";

/* Hooks */
import { useMqtt } from "../hooks/useMqtt";

export const MqttClientTest = () => {
  // Configure the MQTT hook with a public test broker
  const mqtt = useMqtt({
    brokerUrl: "ws://broker.emqx.io:8083/mqtt", // Using EMQX public broker
    initialTopics: ["test/topic"], // Subscribe to a test topic
  });

  // Form state
  const [testMessage, setTestMessage] = useState("");
  const [testTopic, setTestTopic] = useState("test/topic");

  // Send test message
  const sendMessage = () => {
    if (testMessage && testTopic) {
      mqtt.publish(testTopic, testMessage);
      setTestMessage("");
    }
  };

  // Clear messages
  const clearMessages = () => {
    console.log("Messages deleted: ", mqtt.messages);
    mqtt.clearMessages();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>MQTT Hook Test</h1>

      {/* Connection status */}
      <div
        style={{
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: mqtt.isConnected ? "#d4edda" : "#f8d7da",
          border: `1px solid ${mqtt.isConnected ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "4px",
        }}
      >
        <strong>Status:</strong>{" "}
        {mqtt.isConnected ? "Connected" : "Disconnected"}
        {mqtt.connectionError && (
          <div style={{ color: "red", marginTop: "5px" }}>
            {mqtt.connectionError}
          </div>
        )}
      </div>

      {/* Message sender */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <h3>Send Test Message</h3>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Topic:
          </label>
          <input
            type="text"
            value={testTopic}
            onChange={(e) => setTestTopic(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Message:
          </label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            style={{ width: "100%", padding: "8px", height: "100px" }}
            placeholder="Type your test message here"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!mqtt.isConnected || !testMessage || !testTopic}
          style={{
            padding: "8px 16px",
            backgroundColor: mqtt.isConnected ? "#007bff" : "#cccccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: mqtt.isConnected ? "pointer" : "not-allowed",
          }}
        >
          Send Message
        </button>
      </div>

      {/* Message viewer */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>Received Messages</h3>
          <button
            onClick={clearMessages}
            disabled={mqtt.messages.length === 0}
            style={{
              padding: "4px 8px",
              backgroundColor: mqtt.messages.length > 0 ? "#6c757d" : "#cccccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Clear
          </button>
        </div>

        {mqtt.messages.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No messages received yet
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Time
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Topic
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {mqtt.messages.map((msg, index) => (
                <tr key={index}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {msg.topic}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {msg.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Subscriptions manager */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <h3>Manage Subscriptions</h3>
        <div style={{ marginBottom: "10px", display: "flex" }}>
          <input
            type="text"
            placeholder="Enter a topic to subscribe"
            id="subscription-input"
            style={{ flex: 1, padding: "8px", marginRight: "10px" }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const input = document.getElementById(
                  "subscription-input"
                ) as HTMLInputElement;
                if (input.value) {
                  mqtt.subscribe(input.value);
                  input.value = "";
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                "subscription-input"
              ) as HTMLInputElement;
              if (input.value) {
                mqtt.subscribe(input.value);
                input.value = "";
              }
            }}
            disabled={!mqtt.isConnected}
            style={{
              padding: "8px 16px",
              backgroundColor: mqtt.isConnected ? "#28a745" : "#cccccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Subscribe
          </button>
        </div>
        <div>
          <h4>Current Subscriptions:</h4>
          {mqtt.subscriptions.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No active subscriptions
            </p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {mqtt.subscriptions.map((topic, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => mqtt.unsubscribe(topic)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Unsubscribe
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
