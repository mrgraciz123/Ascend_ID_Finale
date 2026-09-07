<p align="center">
  <img src="./public/assets/logo.png" width="140" alt="AscendID Logo" />
</p>

<h1 align="center">AscendID</h1>

<h3 align="center">
Verified Potential • Trusted Opportunities
</h3>

<p align="center">
Building India's Talent Verification Infrastructure
</p>

<p align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" />

<img src="https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react" />

<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />

<img src="https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase" />

<img src="https://img.shields.io/badge/Cloudinary-Media-blue?style=for-the-badge&logo=cloudinary" />

<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />

<img src="https://img.shields.io/badge/Hackathon-Project-success?style=for-the-badge" />

</p>

---

<p align="center">
  <img src="./public/assets/Banner.png" width="100%" alt="AscendID Banner" />
</p>

---

## 🌍 The Vision

> UPI unified payments.
>
> DigiLocker unified documents.
>
> **AscendID unifies talent.**

AscendID is a next-generation verification infrastructure platform that combines academic identity, achievements, credentials, and opportunities into a unified digital passport.

Instead of repeatedly uploading documents and filling profiles across multiple portals, students create a single trusted identity layer.

Recruiters gain access to verified talent profiles, reducing hiring friction and improving trust.

---

## ⚡ Why AscendID?

<table>
<tr>
<td width="33%">

### 🎓 Students

* One Identity
* One Profile
* One Verification Layer
* Better Discoverability
* Reduced Application Fatigue

</td>

<td width="33%">

### 🏢 Recruiters

* Verified Candidates
* Reduced BGV Costs
* Faster Hiring
* Better Signal Quality
* Structured Profiles

</td>

<td width="33%">

### 🏛️ Institutions

* Trusted Credentials
* Centralized Records
* Verification Layer
* Better Transparency
* Digital Infrastructure

</td>
</tr>
</table>

---

## 🏗️ Platform Architecture

```mermaid
flowchart TD

A[Student]
--> B[Firebase Authentication]

B
--> C[Digital Passport]

C
--> D[Firestore Database]

D
--> E[Verification Engine]

E
--> F[Opportunity Engine]

F
--> G[JSearch API]

E
--> H[Recruiter Dashboard]

D
--> I[Cloudinary Storage]
```

---

## 🚀 Core Features

| Feature                | Description                      |
| ---------------------- | -------------------------------- |
| 🔐 Authentication      | Google & Email Authentication    |
| 🎓 Academic Identity   | Academic Records Management      |
| 🪪 Digital Passport    | Unified Student Identity         |
| 📂 Proof Vault         | Secure Credential Storage        |
| 📊 Verification Index  | Verification & Readiness Layer   |
| 💼 Opportunity Engine  | Real Job & Internship Discovery  |
| 🏢 Recruiter Dashboard | Candidate Verification Interface |
| ☁️ Cloudinary Uploads  | Secure Document Upload System    |

---

## ⚙️ Technology Stack

<p align="center">

<img src="https://skillicons.dev/icons?i=nextjs,react,typescript,firebase,tailwind,vercel,git,github" />

</p>

---
## 📁 Repository Structure

```text
codebase/
├── contracts/               # Solidity Smart Contracts (Registry & Whitelists)
├── scripts/                 # Database seed scripts (National mock candidate dataset)
├── src/
│   ├── app/                 # Next.js App Router (Views, API Routes, Portals)
│   │   ├── api/             # Secure REST endpoints (Anchoring, Trust engine, Recommendations)
│   │   ├── gov/             # Government telemetry & leaderboards dashboard
│   │   ├── issuer/          # University issuance console & analytics charts
│   │   ├── recruiter/       # Candidate ranking, heatmaps, and AI fraud dashboard
│   │   ├── student/         # Digital Passport, Proof Graph, & Opportunities recommendation
│   │   └── verify/          # Public W3C QR Checkpoint verification portal
│   ├── components/          # Reusable client components (Proof Graphs, QR scanners)
│   ├── context/             # React states (Firebase Authentication Context)
│   ├── lib/                 # Core utilities (Firebase Admin, Isomorphic Providers)
│   └── services/            # Database hooks (Credential, Trust Engine, Students)
├── firestore.rules          # Security rules for Firestore read/write isolation
└── package.json             # Core dependency manifest
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Ensure you have Node.js 22+ installed:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Firebase Client Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# AscendChain Sovereign Blockchain Configuration (Devnet Chain ID: 13370)
USE_ASCENDCHAIN=true
ASCENDCHAIN_RPC_URL=http://127.0.0.1:8545
ASCENDCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ASCENDCHAIN_PRIVATE_KEY=your-ascendchain-signing-key
ASCENDCHAIN_ISSUER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# AI Auditing Key
GEMINI_API_KEY=your-google-gemini-api-key
```
*Note: If no blockchain keys are configured, the app will fail clearly in production or use unit test sandbox when explicitly enabled.*

### 3. Seed Database
Populate Firestore with a realistic National Dataset (20 Universities, 15 Companies, 100 Students, 1200 Credentials, 50 Tampered Items):
```bash
$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
npm run seed
```

### 4. Run AscendChain Node & Deploy Contract
Start the local AscendChain Devnet node and deploy the CredentialRegistry:
```bash
npm run ascendchain:node
npm run ascendchain:deploy
```

### 5. Launch Development Server
Start the local server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎯 Presentation & Hackathon Simulation

For presentation pitches and live judging reviews, we have implemented an **Auto-Presentation Simulator**. It runs the entire end-to-end system sequence with zero manual inputs:

1. Navigate to **[http://localhost:3000/demo](http://localhost:3000/demo)**.
2. Click **Start Auto-Simulation**.
3. Watch the system perform live tasks:
   - IIT Bombay issues degree (triggers `/api/credentials/anchor`).
   - Student passport receives a push alert.
   - Cryptographic audit verifies secp256k1 signature hashes.
   - AscendChain Devnet confirms block heights and immutable receipt.
   - Student's Trust Score needle recalculates live to `785` (Exceptional).
   - Recruiter searches candidate, reviews verification lock, shortlists applicant.
   - Student receives an automated placement offer from Google India!
4. Presenters can **Pause / Resume** the simulation or adjust step pacing speeds dynamically during the pitch.


## 🔄 User Journey

```text
Google Login
      │
      ▼
Create Profile
      │
      ▼
Import Academic Identity
      │
      ▼
Upload Proofs
      │
      ▼
Generate Verification Index
      │
      ▼
Opportunity Discovery
      │
      ▼
Recruiter Verification
```

---

## 📸 Product Showcase

### Landing Page

![Landing](public/assets/Landing.png)

### Student Dashboard

![Dashboard](public/assets/Dashboard.png)

### Proof Vault

![Proof Vault](public/assets/ProofVault.png)

### Opportunity Engine

![Opportunities](public/assets/Opportunities.png)

### Recruiter Dashboard

![Recruiter](public/assets/Recruiter.png)

---

## 🏆  Confluence 2.0 · Hackathon

**Team Name:** Tech_Lababdar

**Project:** AscendID

**Tagline:** Verified Potential. Trusted Opportunities.

Building the trust layer for India's next generation of talent.


