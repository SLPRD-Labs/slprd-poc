## SLPRD POC

This project is a Proof of Concept (POC) designed to demonstrate a self-hosted, secure communication stack integrating **Matrix** for messaging and **LiveKit** for real-time video/audio capabilities. It leverages **MatrixRTC** (MSC4143) to provide a modern, scalable conferencing experience within the Matrix ecosystem.

---

## 🛠 Technologies & Services

The infrastructure is orchestrated using Docker and consists of the following interconnected services:

| Service           | Technology                                                     | Description                                                                                 |
|:------------------|:---------------------------------------------------------------|:--------------------------------------------------------------------------------------------|
| **Homeserver**    | [Synapse](https://github.com/element-hq/synapse)               | The Matrix homeserver implementation that manages user accounts, messaging, and federation. |
| **Database**      | [PostgreSQL](https://www.postgresql.org)                       | Relational database used by Synapse for persistent storage.                                 |
| **SFU**           | [LiveKit](https://livekit.io)                                  | A high-performance Selective Forwarding Unit (SFU) for real-time video and audio tracks.    |
| **Auth Service**  | [lk-jwt-service](https://github.com/element-hq/lk-jwt-service) | Generates JSON Web Tokens (JWT) to authorize Matrix users to join LiveKit sessions.         |
| **Reverse Proxy** | [NGINX](https://www.nginx.com)                                 | Handles SSL termination and routes traffic to the appropriate internal services.            |
| **STUN/TURN**     | [Coturn](https://github.com/coturn/coturn)                     | Facilitates NAT traversal for media streams when direct peer-to-peer connections fail.      |

---

## 🚀 Installation

### 1. Start the Infrastructure

```bash
docker compose up -d
```

### 2. Register a User

Create a local account on your private homeserver:
```bash
docker exec -it slprd-poc-synapse register_new_matrix_user -u <USERNAME> -p <PASSWORD> -c /data/cfg/homeserver.yaml
```

### 3. Run the Client

Install dependencies and start the development frontend:
```bash
npm install
npm run dev
```

> [!IMPORTANT]  
> **Trust the Certificates:** Because this environment uses local development certificates, you must manually trust them in your browser to allow the client to communicate with the backend services.  
> You can either import the generated certificates (`.docker/nginx/dev_tls_m.localhost.crt`) into your system's trusted certificate store or, for testing purposes, accept the browser warnings when accessing the services directly :
> * Visit: `https://synapse.m.localhost`
> * Visit: `https://matrix-rtc.m.localhost`
> * Accept the "Advanced -> Proceed" warning on both.

> [!NOTE]  
> If you are just testing and do not need to make any modifications to the client code, you can use the pre-built image:
> ```bash
> docker compose -f docker-compose.prd.yml up -d
> docker exec -it slprd-poc-prd-synapse register_new_matrix_user -u <USERNAME> -p <PASSWORD> -c /data/cfg/homeserver.yaml
> ```

---

## 🚧 Missing Features & Known Bugs

### Missing Features

* **User Registration UI:** Currently, users must register via the command line.

### Known Bugs

* **LiveKit Connection Issues:** Some users may experience difficulties connecting to LiveKit due to its deployment being heavily platform-dependent. The main `docker-compose.yml` is configured for Windows. The `docker-compose.linux.yml` is available for Linux users. We recommend using Google Chrome for the best compatibility.
