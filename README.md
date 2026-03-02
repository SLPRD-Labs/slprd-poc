# SLPRD POC

## Installation

```bash
docker compose up -d
docker exec -it slprd-poc-synapse register_new_matrix_user -u <USERNAME> -p <PASSWORD> -c /data/cfg/homeserver.yaml

npm install
npm run dev
```

> Don't forget to trust the certificate of the Synapse and LiveKit server in your browser, otherwise the client won't be able to connect to it.  
  You can do this by going to `https://synapse.m.localhost` and `https://matrix-rtc.m.localhost`, and accepting the warning.
