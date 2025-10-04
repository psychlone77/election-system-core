# Election System Core

This workspace contains three servers and a shared helper module.

## Architecture Diagram

```mermaid
---
config:
  theme: base
---
flowchart TB
 subgraph VoterManagement["Voter Management & Support"]
        VR["Voter Registry Database"]
        Hotline["Election Hotline System"]
  end
 subgraph ElectionSystem["Core Election System"]
        Gateway(["Secure Voting Gateway"])
        ES["Eligibility Server"]
        BBS["Ballot Box Server"]
        D["Encrypted Ballot Storage"]
        ST["Spent Token Database"]
        E["Tallying Server Cluster"]
  end
 subgraph Keys["Threshold Tallying Keys"]
        PK["Combined Public Key"]
        PrivKeys["Private Key Shares (t of n)"]
  end
 subgraph Public["Public Side"]
        F["Results Publishing Portal"]
  end
    ElectionSystem --> SystemLogs["System Logs"]
    Gateway <--> ES & BBS
    ES <--> VR
    Hotline -- Updates Lost/Stolen Device Status --> VR
    App["Voter Mobile App"] <--> Gateway
    BBS -- Verifies Token & Checks for Reuse --> ST
    BBS -- Stores Verified Ballot --> D
    D -- Reads All Ballots --> E
    PrivKeys -- Provides Shares for Decryption --> E
    E -- Publishes Final Tally --> F
    PK -- Use Public Key for encryption --> App
    VR@{ shape: cyl}
    D@{ shape: cyl}
    ST@{ shape: cyl}
    PK@{ shape: card}
    PrivKeys@{ shape: card}
    SystemLogs@{ shape: cyl}
```

Start individual servers from the repository root:

```powershell
# eligibility
npm --workspace servers/eligibility-server run start

# ballot box
npm --workspace servers/ballot-box-server run start

# tallying
npm --workspace servers/tallying-server run start

# or start all concurrently (root script)
npm run start:all
```

Notes:

- These servers are minimal scaffolds for local development and demo only.
- They use `shared/index.js` for basic config loading and logging.
