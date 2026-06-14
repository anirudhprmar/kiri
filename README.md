# kiri

peer-to-peer terminal-based chat. connect directly to other terminals, no server needed.

## features

- direct p2p messaging over tcp
- slash commands (`/help`, `/connect`, `/peers`, `/topology`, `/clear`, `/exit`)
- styled cli output with colored text, boxes, and spinners
- network topology visualization
- auto peer registration on connect


## tech stack

| layer | technology |
|---|---|
| runtime | [bun](https://bun.sh) |
| monorepo | [turborepo](https://turbo.build) |
| language | typescript 5.9 |
| cli styling | chalk, boxen, ora |
| landing page | next.js 16, react 19, tailwind css v4, shadcn/ui |

## project structure

```
kiri/
├── apps/
│   └── web/                  # landing page (next.js)
├── packages/
│   ├── cli/                  # command parser + styled output utilities
│   ├── network/              # p2p networking layer (tcp sockets)
│   ├── protocol/             # protocol type definitions
│   ├── eslint-config/        # shared eslint configs
│   └── typescript-config/    # shared tsconfig presets
├── package.json
├── turbo.json
└── bun.lock
```

## getting started

### prerequisites

- [bun](https://bun.sh) >= 1.3

### installation

```bash
git clone https://github.com/anirudhprmar/kiri.git
cd kiri
bun install
```

### running the cli

open as many terminals as you want, in network/node directory and run the cli in each:

```bash
# terminal 1
bun run network-node.ts

# terminal 2
bun run network-node.ts
```

you'll be prompted for a username, port, and port to connect to.

### running the landing page

```bash
bun run dev
```

opens at [http://localhost:3000](http://localhost:3000).

## commands

| command | description |
|---|---|
| `/help` | show available commands |
| `/connect <port>` | connect to a peer on the given port |
| `/peers` | list all connected peers |
| `/topology` | show network topology |
| `/clear` | clear the terminal |
| `/exit` | disconnect and exit |

## development

```bash
# type check all packages
bun run check-types

# lint
bun run lint

# format
bun run format
```

## packages

### @chat/cli

command parser and cli utilities. exports `CommandParser`, `logger`, `makeBox`, and `spinner`.

### @chat/network

p2p networking layer built on bun's tcp sockets. handles peer discovery, message routing, and the command interface.

### @chat/protocol

typescript type definitions for the p2p chat protocol (`HELLO`, `MESSAGE`, `PEER` packets).

## license

mit
