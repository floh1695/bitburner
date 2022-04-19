# bitburner server

Server that's used for downloading scripts into bitburner

## Setup

1. Setup types with `./setup.ps1`
1. Build and start server with `npm run buildStart`
1. Run `wget http://localhost:8088/ orchestrator.js` from bitburner to download the orchestrator
1. Run `run orchestrator.js` from within bitburner to run the orchestrator
1. Run `run refresh.js` to refresh the orchestrator and have it reran
