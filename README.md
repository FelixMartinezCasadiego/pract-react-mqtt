# MQTT Client with React

![MQTT Protocol](https://img.shields.io/badge/Protocol-MQTT-brightgreen)
![React](https://img.shields.io/badge/Framework-React-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)

An MQTT client implemented with React hooks and TypeScript, designed to simplify MQTT communication in React applications.

## Features

- 📡 Connect to any MQTT broker (supports WebSocket and TCP)
- 🔔 Subscribe to multiple topics
- 📤 Publish messages with configurable QoS levels
- 📥 Receive and display incoming messages
- 🔄 Automatic reconnection
- 🛡️ Optional authentication support
- 📊 Real-time connection status monitoring
- 🧹 Message history management

## Public Test Brokers

You can test the client with these public MQTT brokers:

EMQX Public Broker: ws://broker.emqx.io:8083/mqtt

Mosquitto Test Server: ws://test.mosquitto.org:8080

## Development

To modify or extend this implementation:

1. Clone the repository
2. Install dependencies
3. The hook is written in TypeScript for better type safety
