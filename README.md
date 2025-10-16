# Election System Core

This workspace contains three servers and a shared helper module.

## Architecture Diagram

```mermaid
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

## Sequence Diagram

```mermaid
sequenceDiagram
  participant VD as Voter Device
  participant ES as Eligibilty Server
  participant EDB as Election Database
  participant BBS as Ballot Box Server
  participant BDB as Ballot Token Database
  participant PBB as Ballot Storage
  participant TA as Tallying Server

  autonumber
  VD ->> VD: 1. Generate token & blind_token
  Note right of VD: Voter holds VoterPrivateKey
  VD ->> ES: 2. Request token({NIC, blind_token}, signature)
  Note over VD, ES: Signed with VoterPrivateKey
  ES ->> EDB: 3. Fetch VoterPublicKey for NIC
  ES -->> ES: 4. Verify request signature
  alt Voter is eligible
    ES ->> EDB: 5. Check if token already issued for NIC
    Note right of EDB: is_token_issued == false
    ES ->> EDB: 6. Mark voter as 'token-issued'
    ES -->> ES: 7. Sign blinded_token
    Note left of ES: Signed with ESPrivateKey
    ES -->> VD: 8. Return blind_signature
  else Voter not eligible or already claimed
    ES -->> VD: 9. Return error
  end
  VD ->> VD: 10. Unblind signature to get (token, valid_signature)
  VD ->> VD: 11. Encrypt ballot
  Note right of VD: Encrypt with TAPublicKey
  VD ->> BBS: 12. Submit {EncryptedBallot, (token, valid_signature)}
  BBS -->> BBS: 13. Verify token signature
  Note left of BBS: Verify with ESPublicKey
  BBS ->> BDB: 14. Check if token has been spent
  alt Token is not spent
    BBS ->> BDB: 15. Add token to 'spent tokens' list
    BBS ->> PBB: 16. Store EncryptedBallot on PBB
    BBS -->> VD: 17. Return Receipt with BallotID
  else Token already spent
    BBS -->> VD: 18. Return error (double vote attempt)
  end
  Note over PBB, TA: After voting period ends...
  TA ->> PBB: 19. Read all EncryptedBallots
  loop for each ballot
    TA -->> TA: 20. Generate partial decryptions
    Note right of TA: Each uses their private key share
  end
  TA -->> TA: 21. Combine 't' of 'n' shares to decrypt votes
  TA ->> PBB: 22. Publish final tally with the signature and Election Database
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
