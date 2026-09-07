# ASCENDID Phase 5.1 Final Visual Acceptance + Product Claims Audit

Audit date: 2026-09-06  
Runtime: local Next.js dev server at `http://localhost:3000`  
Evidence rule: no evidence = UNKNOWN. No application code was changed.

## Final Verdict

# PARTIALLY VERIFIED

The build succeeds and the AscendChain provider/API wiring is present, but the requested visual acceptance cannot pass: the supplied real-looking credential URL renders `Credential Record Not Found`, authenticated target pages redirect to login without a shared authenticated browser session, `/student/proof-graph` is a real 404, and several product claims are stronger than the implementation evidence supports.

## Evidence Set

Screenshots captured from the running browser:

- [verify desktop](verify-desktop.png)
- [verify mobile](verify-mobile.png)
- [passport route desktop result](passport-desktop.png)
- [proof vault route desktop result](vault-desktop.png)
- [proof graph desktop result](graph-desktop.png)
- [trust engine route desktop result](trust-desktop.png)
- [student dashboard route desktop result](dashboard-desktop.png)
- [issuer issue route desktop result](issue-desktop.png)
- [login checkpoint desktop](proof-vault-shell-desktop.png)
- [proof vault mobile route result](vault-mobile.png)

The captured route URLs and headings were:

| Requested route | Browser result | Status |
|---|---|---|
| `/verify/cred-demo-iitb-btech` | `Credential Record Not Found` | VERIFIED BROKEN |
| `/student/passport` | Redirected to `/auth/login` | UNKNOWN |
| `/student/proof-vault` | Redirected to `/auth/login`; unauthenticated render previously showed upload UI plus auth-required document state | PARTIALLY VERIFIED |
| `/student/proof-graph` | Next 404 page | VERIFIED BROKEN |
| `/student/trust-engine` | Redirected to `/auth/login` | UNKNOWN |
| `/student/dashboard` | Redirected to `/auth/login` | UNKNOWN |
| `/issuer/issue` | Redirected to `/auth/login` | UNKNOWN |

## Part 1-2: Visual Acceptance

The browser rendered a restrained black/copper login checkpoint with clear headings and focusable controls. That is evidence for the authentication surface only, not for the protected pages requested by the audit.

| Route | Generic AI dashboard | Excessive card grids | Excessive glassmorphism | Crypto trading look | Communicates credential infrastructure | 3-second hierarchy | Primary action obvious | Clutter | Copper + Black appropriate | Premium/restrained |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Verify | NO | NO | NO | NO | NO | YES | YES | NO | YES | NO |
| Passport | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Proof Vault | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Proof Graph | YES | NO | NO | NO | NO | NO | NO | NO | NO | NO |
| Trust Engine | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Student Dashboard | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Issuer Issue | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

`UNKNOWN` is used for protected pages because the browser did not reach the target UI. The verify page did not show a credential, so its positive visual criteria are not met.

## Verify Page

The requested ID `cred-demo-iitb-btech` was tested. The first usable viewport displayed only:

> Credential Record Not Found

> The requested credential identifier cred-demo-iitb-btech does not exist in the AscendID registry index.

The browser recorded `FirebaseError: Missing or insufficient permissions`. Therefore the page did not visually communicate VERIFIED, REVOKED, or UNKNOWN for a credential, nor recipient, issuer, type, issue date, proof hash, block, transaction, revocation state, or technical disclosure. Progressive technical disclosure could not be evaluated. This is a critical visual/runtime failure.

The client verification path directly calls Firestore in [src/app/verify/[id]/page.tsx](src/app/verify/%5Bid%5D/page.tsx), while [firestore.rules](firestore.rules) requires authentication for credential reads. The documented server verification route exists, but this page did not use it to retrieve the credential metadata successfully.

## Digital Passport

Status: UNKNOWN at runtime. The source contains passport-like document treatment, identity hierarchy, DID text, credential sections, and a verification link in [src/app/student/passport/page.tsx](src/app/student/passport/page.tsx). No authenticated browser evidence was available, so the acceptance conclusion remains UNKNOWN rather than PASS.

## Proof Vault

Status: PARTIALLY VERIFIED. The unauthenticated page render showed a `New Vault Entry` upload form, file type guidance, a verification workflow, and `Secured Vault Documents` with an explicit `Authentication Required` empty state. That is honest for the unauthenticated state, but it is primarily an upload UI and no real evidence repository contents could be verified. Authenticated evidence was unavailable.

The implementation loads user-specific documents through [src/app/student/proof-vault/page.tsx](src/app/student/proof-vault/page.tsx) and the rules make proof documents private in [firestore.rules](firestore.rules). No fabricated evidence was introduced.

## Proof Graph

Status: VERIFIED BROKEN. There is no `src/app/student/proof-graph` page in the route tree and the browser returned the Next 404 page. The reusable [src/components/ProofGraph.tsx](src/components/ProofGraph.tsx) maps academic records, achievements, and institutional credentials into nodes and edges, but no requested route exposes it. Consequently, the required Evidence -> Achievement -> Credential -> Identity flow was not browser-verifiable.

## Trust Engine and Product Claims

The browser could not reach the protected Trust Engine page. Source evidence shows the score is internally calculated from credentials, achievements, academic records, skills, and profile data in [src/app/api/student/trust-score/route.ts](src/app/api/student/trust-score/route.ts), with Firestore/demo fallbacks in [src/services/trust-score.ts](src/services/trust-score.ts). No FICO or external biometric provider integration was found.

| Term / claim | Status | What the implementation actually supports |
|---|---|---|
| W3C Sovereign DIDs | PARTIAL | W3C credential context strings and `did:ascendid:` identifiers are generated in UI/seed payloads. No DID method resolver, registry, key lifecycle, or external W3C DID integration was evidenced. |
| Biometric links | UNKNOWN | The code uses biometric terminology, including `BIOMETRIC AUDIT: VERIFIED` and DigiLocker-related text, but no biometric capture, liveness, matching, or external biometric verification system was found. |
| FICO trust engine score | PARTIAL | The product labels internally computed trust values as `FICO`; the score engine derives factors from application data. No FICO integration, licensed model, or external FICO service was evidenced. This is a potentially misleading product claim. |
| FICO / FICO score / FICO trust | PARTIAL | Terminology appears throughout trust, dashboard, demo, and credential presentation UI. It is product terminology over an internal score, not proof of FICO integration. |
| biometric / biometric verification | UNKNOWN | Terminology appears in passport/trust guidance and demo data; implementation evidence for actual verification is absent. |
| sovereign DID / W3C DID / `did:ascendid` | PARTIAL | Identifiers are string templates and serialized credential fields. They are not evidence of a standards-compliant public DID method. |

## Mobile

At 390px wide, the verify route had no horizontal overflow (`scrollWidth` equaled the viewport width), but it rendered the broken not-found state. The login/auth redirect also had no horizontal overflow and keyboard focus advanced through the logo, demo checkpoint buttons, and inputs. Hashes, transaction IDs, tables, graph layout, and credential layout could not be tested because the target credential and protected pages were unavailable. The prior claim that hashes truncate below 360px is therefore UNKNOWN, not accepted.

## Accessibility

Lightweight browser checks found:

- Keyboard Tab navigation reached the login logo link, all four demo checkpoint buttons, and the email/password inputs.
- Login controls had accessible visible text or input labels in the browser snapshot.
- The verify failure was communicated as visible text and a semantic heading, but no credential status indicator was available to test for color independence.
- Contrast, focus treatment, semantic headings, button labels, status communication, and tables/graph controls on protected target pages remain UNKNOWN because those pages were not reached.

Accessibility status: PARTIALLY VERIFIED.

## Technical Regression

`npm run build`: PASS. The production build compiled successfully, completed TypeScript, and listed the expected routes except `/student/proof-graph`.

Blockchain/API checks:

- `/api/blockchain/verify?uuid=cred-demo-iitb-btech` returned HTTP 200, `chainId: 13370`, `chainName: AscendChain Devnet`, and the configured contract address.
- The returned record was all-zero/unanchored: zero hash, zero issuer wallet, `isRevoked: false`, and `blockTimestamp: 0`.
- `/api/blockchain/mock-state?uuid=cred-demo-iitb-btech` returned an empty all-zero record.
- [src/lib/blockchain.ts](src/lib/blockchain.ts) routes to `AscendChainProvider` by default and only opts into `MockBlockchainProvider` with `USE_MOCK_BLOCKCHAIN=true`; the mock provider is nevertheless present and the mock-state API is reachable.

Therefore AscendChain provider wiring is VERIFIED, real credential state for this ID is VERIFIED BROKEN/UNPROVEN, revoked-state behavior was not testable without a real accessible revoked credential, demo isolation was not fully testable, and authentication redirect behavior was VERIFIED at the route boundary.

## Ground Truth Table

| Claim | Evidence | Status |
|---|---|---|
| UI is visually transformed | Browser screenshots; protected pages mostly redirected | PARTIALLY VERIFIED |
| Verify page is premium | Broken not-found screenshot only | VERIFIED BROKEN |
| Digital Passport is a passport-like identity object | Source suggests document treatment; browser access blocked | UNKNOWN |
| Proof Vault is an evidence repository | Upload UI and honest auth-empty state; no real documents visible | PARTIALLY VERIFIED |
| Proof Graph represents provenance | Component maps real-shaped inputs, but route is 404 | VERIFIED BROKEN |
| Trust Engine is explainable | Internal factor calculation is present; protected UI inaccessible | PARTIALLY VERIFIED |
| Copper + Black implemented | Rendered login and source styles show copper/black palette | VERIFIED |
| Mobile works | 390px route checks had no overflow on reachable states | PARTIALLY VERIFIED |
| Accessibility acceptable | Login keyboard flow verified; protected pages unavailable | PARTIALLY VERIFIED |
| AscendChain preserved | Build and API returned AscendChain Devnet metadata | VERIFIED |
| No production mock data | Source contains demo data and a mock provider; runtime API returned empty state | UNKNOWN |
| W3C DID claim supported | `did:ascendid` strings and W3C context only | PARTIAL |
| Biometric claim supported | Terminology found; no biometric implementation found | UNKNOWN |
| FICO claim supported | Internal score labeled FICO; no FICO integration found | PARTIAL |

## Audit Stop

No redesign, feature work, backend change, blockchain mutation, or Phase 6 work was performed.