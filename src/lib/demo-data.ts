/**
 * AscendID Demo Mode Configuration
 *
 * SIMULATION DATA ONLY — NOT PRODUCTION DATA
 * This file is consumed exclusively by the /demo simulation page and by the
 * issuer/dashboard page's static demo credential display.
 *
 * blockchain.chainId = 13370 (AscendChain Devnet) and AscendChain contract addresses
 * in this file align with AscendChainProvider (Chain 13370).
 * All production credential anchoring uses AscendChainProvider (Chain 13370).
 *
 * DO NOT ADD real credentials or real transaction hashes to this file.
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_EMAILS = [
  "student.demo@ascendid.ai",
  "recruiter.demo@ascendid.ai",
  "issuer.demo@ascendid.ai",
  "gov.demo@ascendid.ai"
];

export const DEMO_IDS = [
  "demo-student-001",
  "demo-recruiter-001",
  "demo-issuer-001",
  "demo-gov-001"
];

export const isDemoUser = (identifier?: string | null) => {
  if (!identifier) return false;
  const lower = identifier.toLowerCase();
  return (DEMO_EMAILS.includes(lower) || DEMO_IDS.includes(lower)) && DEMO_MODE;
};

export const DEMO_STUDENT = {
  id: "demo-student-001",
  uid: "demo-student-001",
  name: "Aarav Sharma",
  fullName: "Aarav Sharma",
  email: "student@university.edu",
  institution: "IIT Bombay",
  degree: "B.Tech in Computer Science & Engineering",
  graduationYear: "2026",
  avatar: "https://i.pravatar.cc/150?u=aarav-sharma-iitb",
  trustScore: 812,
  isDigiLockerConnected: true,
  profileCompletion: 92,
  skills: ["React", "TypeScript", "Node.js", "Python", "Machine Learning", "System Design"],
  bio: "Passionate engineer building AI products. SIH 2024 Winner. Google STEP alumnus.",
  location: "Mumbai, India",
  linkedIn: "https://linkedin.com/in/aarav-sharma",
  github: "https://github.com/aaravsharma",
  credentials: [],
  achievements: [],
  education: [],
  projects: [],
  certifications: [],
  timeline: [],
  history: [],
  proofs: [],
  verifications: [],
  interests: ["AI/ML", "Full-Stack Development", "Web3"],
  academicRecords: []
};

export const DEMO_ACADEMIC_RECORDS = [
  {
    id: "acad-demo-1",
    type: "Class 10 Marksheet",
    board: "CBSE",
    year: "2020",
    score: "96.4%",
    verifiedBy: "DigiLocker",
    studentId: "demo-student-001"
  },
  {
    id: "acad-demo-2",
    type: "Class 12 Marksheet",
    board: "CBSE",
    year: "2022",
    score: "95.8%",
    verifiedBy: "DigiLocker",
    studentId: "demo-student-001"
  },
  {
    id: "acad-demo-3",
    type: "B.Tech Transcript (Sem 1-6)",
    board: "IIT Bombay",
    year: "2025",
    score: "8.9 CPI",
    verifiedBy: "DigiLocker",
    studentId: "demo-student-001"
  }
];

export const DEMO_ACHIEVEMENTS = [
  {
    id: "ach-demo-1",
    title: "Google Developer Student Club Lead",
    type: "Leadership",
    category: "Leadership",
    issuer: "Google Developers",
    date: "2024-06-15",
    verified: true,
    impact: "Led a community of 500+ students, organized 12 tech workshops reaching 2000+ attendees.",
    proofUrl: "https://developers.google.com/community/gdsc"
  },
  {
    id: "ach-demo-2",
    title: "Smart India Hackathon Winner — Grand Finale",
    type: "Hackathon",
    category: "Hackathon",
    issuer: "Ministry of Education, Govt. of India",
    date: "2024-09-30",
    verified: true,
    impact: "Built AI-powered disaster response system — secured 1st place nationally.",
    proofUrl: "https://sih.gov.in/sih2024"
  },
  {
    id: "ach-demo-3",
    title: "Software Engineering Intern",
    type: "Internship",
    category: "Internship",
    issuer: "Google",
    date: "2025-08-30",
    verified: true,
    impact: "Optimized search ranking pipeline reducing latency by 18% across 1B daily queries.",
    proofUrl: "https://google.com"
  },
  {
    id: "ach-demo-4",
    title: "AWS Certified Solutions Architect – Associate",
    type: "Certificate",
    category: "Certificate",
    issuer: "Amazon Web Services",
    date: "2025-10-12",
    verified: true,
    impact: "Demonstrates cloud architecture expertise across multi-region deployments.",
    proofUrl: "https://aws.amazon.com/certification"
  },
  {
    id: "ach-demo-5",
    title: "Research Publication — NeurIPS Workshop",
    type: "Research",
    category: "Research",
    issuer: "NeurIPS",
    date: "2025-12-01",
    verified: true,
    impact: "Co-authored 'Efficient Attention Mechanisms for Low-Resource NLP' — 48 citations.",
    proofUrl: "https://neurips.cc"
  }
];

export const DEMO_OPPORTUNITIES = [
  {
    id: "opp-demo-1",
    title: "Google STEP Internship 2026",
    company: "Google",
    type: "Internship",
    matchScore: 96,
    tags: ["C++", "Python", "Algorithms"],
    logo: "https://logo.clearbit.com/google.com",
    location: "Bangalore, India",
    matchReason: "High Trust Score + Google GDSC Leadership + previous Google internship perfectly aligns with STEP criteria."
  },
  {
    id: "opp-demo-2",
    title: "Microsoft Explore Program",
    company: "Microsoft",
    type: "Internship",
    matchScore: 92,
    tags: ["Software Engineering", "Program Management"],
    logo: "https://logo.clearbit.com/microsoft.com",
    location: "Hyderabad, India",
    matchReason: "SIH Grand Finale win demonstrates exceptional cross-functional problem-solving required for Explore."
  },
  {
    id: "opp-demo-3",
    title: "Prime Minister Research Fellowship",
    company: "Govt. of India",
    type: "Scholarship",
    matchScore: 98,
    tags: ["Research", "AI", "Merit"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg",
    location: "All India",
    matchReason: "NeurIPS publication + IIT Bombay enrollment + 8.9 CPI automatically qualifies for PMRF shortlist."
  },
  {
    id: "opp-demo-4",
    title: "Stripe Infrastructure Engineer (New Grad)",
    company: "Stripe",
    type: "Full-time",
    matchScore: 89,
    tags: ["TypeScript", "Systems", "Distributed Systems"],
    logo: "https://logo.clearbit.com/stripe.com",
    location: "Remote / Bangalore",
    matchReason: "Verified AWS architecture + TypeScript expertise + systems thinking from hackathon projects."
  }
];

export const DEMO_TRUST_SCORE = {
  total: 812,
  explanation: "Your trust score places you in the top 3% of verified candidates on AscendID. Driven by blockchain-anchored credentials, NeurIPS research publication, and DigiLocker-verified academic excellence.",
  factors: {
    issuerReputation: 92,
    credentialFreshness: 88,
    credentialImportance: 95,
    fraudProbability: 97,
    skillConsistency: 84,
    experienceGrowth: 91,
    peerValidation: 72,
    verificationConfidence: 96,
    openSourceActivity: 75,
    researchActivity: 88,
    hackathonPerformance: 100,
    internshipQuality: 93
  },
  lastUpdated: new Date().toISOString(),
  history: [
    { id: "h1", score: 350, timestamp: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString(), explanation: "Account created." },
    { id: "h2", score: 480, timestamp: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), explanation: "DigiLocker connected. Class 10/12 verified." },
    { id: "h3", score: 610, timestamp: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString(), explanation: "GDSC Lead credential anchored on-chain." },
    { id: "h4", score: 720, timestamp: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(), explanation: "SIH Grand Finale win verified." },
    { id: "h5", score: 780, timestamp: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(), explanation: "Google internship anchored on AscendChain Devnet." },
    { id: "h6", score: 812, timestamp: new Date().toISOString(), explanation: "NeurIPS research publication verified." }
  ],
  contributingFactors: [
    { label: "Verified Degree (IIT Bombay)", change: "+120 pts", description: "Official B.Tech enrollment anchored cryptographically on AscendChain Devnet.", type: "positive" },
    { label: "Google Internship Verified", change: "+85 pts", description: "Verified software engineering internship at Google — on-chain record confirmed.", type: "positive" },
    { label: "SIH National Winner", change: "+70 pts", description: "Ministry of Education-verified Grand Finale win.", type: "positive" },
    { label: "DigiLocker Connected", change: "+55 pts", description: "Class 10 & 12 marksheets verified through DigiLocker integration.", type: "positive" },
    { label: "NeurIPS Publication", change: "+60 pts", description: "Peer-reviewed research paper — co-authored at NeurIPS 2025 Workshop.", type: "positive" },
    { label: "AWS Solutions Architect", change: "+40 pts", description: "Professional certification from AWS — active and verified.", type: "positive" }
  ],
  breakdown: {
    projects: 18,
    internships: 23,
    certificates: 10,
    hackathons: 15,
    recommendations: 7,
    profile: 5
  }
};

export const DEMO_CREDENTIALS = [
  {
    id: "cred-demo-iitb-btech",
    issuerId: "demo-issuer-001",
    issuerName: "IIT Bombay",
    issuerType: "university",
    studentName: "Aarav Sharma",
    studentEmail: "student@university.edu",
    studentId: "demo-student-001",
    title: "Bachelor of Technology — Computer Science & Engineering",
    description: "B.Tech in Computer Science & Engineering with specialization in Artificial Intelligence and Data Science.",
    credentialType: "degree",
    issueDate: "2026-05-15",
    expiryDate: "Never",
    verificationStatus: "issued",
    digitalSignature: "0x4a7b9c2d...server-signed",
    blockchainHash: "0x7f3a91bc2e4d56f8a0123456789abcdef01234567890abcdef0123456789abcd",
    metadataHash: "0x7f3a91bc2e4d56f8a0123456789abcdef01234567890abcdef0123456789abcd",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://ascendid.app/verify/cred-demo-iitb-btech",
    blockchain: {
      chainId: 13370,
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      transactionHash: "0x89e13b29ceee72df292a8fc2e87b901a4c2d8f56e3197b45a298cd71e4f3082a",
      blockNumber: 2546,
      issuerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      verificationStatus: "anchored",
      anchoredAt: "2026-05-15T10:30:00Z"
    },
    w3cData: {
      "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org"],
      id: "urn:uuid:cred-demo-iitb-btech",
      type: ["VerifiableCredential", "DegreeCredential"],
      issuer: { id: "did:ascendid:demo-issuer-001", name: "IIT Bombay", type: "university" },
      issuanceDate: "2026-05-15T00:00:00Z",
      credentialSubject: {
        id: "did:ascendid:demo-student-001",
        name: "Aarav Sharma",
        achievement: { title: "Bachelor of Technology — Computer Science & Engineering", type: "degree" }
      }
    },
    auditTrail: [
      { status: "issued", timestamp: "2026-05-15T10:30:00Z", transactionHash: "0x89e13b29ceee72df292a8fc2e87b901a4c2d8f56e3197b45a298cd71e4f3082a", details: "Credential anchored by IIT Bombay on AscendChain Devnet." }
    ],
    createdAt: { seconds: 1747299000, nanoseconds: 0 },
    updatedAt: { seconds: 1747299000, nanoseconds: 0 }
  },
  {
    id: "cred-demo-google-intern",
    issuerId: "demo-issuer-google",
    issuerName: "Google LLC",
    issuerType: "company",
    studentName: "Aarav Sharma",
    studentEmail: "student@university.edu",
    studentId: "demo-student-001",
    title: "Software Engineering Intern — Google Search Infrastructure",
    description: "Summer internship on the Search Infrastructure team. Improved ranking pipeline latency by 18%.",
    credentialType: "internship",
    issueDate: "2025-08-30",
    expiryDate: "Never",
    verificationStatus: "issued",
    digitalSignature: "0x8c2a15f7...server-signed",
    blockchainHash: "0x2f8d4e1a9b7c63e50987654321fedcba98765432109876543210fedcba987654",
    metadataHash: "0x2f8d4e1a9b7c63e50987654321fedcba98765432109876543210fedcba987654",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://ascendid.app/verify/cred-demo-google-intern",
    blockchain: {
      chainId: 13370,
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      blockNumber: 2548,
      issuerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      verificationStatus: "anchored",
      anchoredAt: "2025-08-30T18:00:00Z"
    },
    auditTrail: [
      { status: "issued", timestamp: "2025-08-30T18:00:00Z", transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890", details: "Credential anchored by Google LLC on AscendChain Devnet." }
    ],
    createdAt: { seconds: 1725026400, nanoseconds: 0 },
    updatedAt: { seconds: 1725026400, nanoseconds: 0 }
  }
];

export const DEMO_RECRUITER_CANDIDATES = [
  {
    id: "demo-student-001",
    name: "Aarav Sharma",
    avatar: "https://i.pravatar.cc/150?u=aarav-sharma-iitb",
    university: "IIT Bombay",
    degree: "B.Tech — Computer Science & Engineering",
    graduationYear: "2026",
    trustScore: 820,
    trustClass: "Exceptional",
    riskLevel: "Low",
    riskScore: 4,
    jobFit: 96,
    skills: {
      verified: ["React", "TypeScript", "Python", "System Design", "Machine Learning"],
      unverified: ["Kubernetes"],
      missing: ["Go", "Rust"]
    },
    factors: {
      issuerReputation: 92,
      credentialFreshness: 88,
      credentialImportance: 95,
      fraudProbability: 97,
      skillConsistency: 84,
      experienceGrowth: 91,
      peerValidation: 72,
      verificationConfidence: 96
    },
    timeline: [
      { year: "2022", title: "Class 12 Marksheet", issuer: "CBSE via DigiLocker", type: "academic", status: "verified" },
      { year: "2024", title: "GDSC Lead Certificate", issuer: "Google Developers", type: "leadership", status: "verified" },
      { year: "2024", title: "SIH Grand Finale Winner", issuer: "Ministry of Education", type: "hackathon", status: "verified" },
      { year: "2025", title: "Google STEP Intern", issuer: "Google LLC", type: "internship", status: "verified" },
      { year: "2025", title: "AWS Solutions Architect", issuer: "Amazon Web Services", type: "certificate", status: "verified" },
      { year: "2025", title: "NeurIPS Publication", issuer: "NeurIPS 2025 Workshop", type: "research", status: "verified" }
    ]
  },
  {
    id: "demo-student-002",
    name: "Priya Menon",
    avatar: "https://i.pravatar.cc/150?u=priya-menon-nit",
    university: "NIT Trichy",
    degree: "B.Tech — Electronics & Communication",
    graduationYear: "2026",
    trustScore: 745,
    trustClass: "Very Good",
    riskLevel: "Low",
    riskScore: 12,
    jobFit: 87,
    skills: {
      verified: ["Python", "TensorFlow", "Signal Processing", "VLSI"],
      unverified: ["PyTorch", "CUDA"],
      missing: ["Cloud", "Docker"]
    },
    factors: {
      issuerReputation: 82,
      credentialFreshness: 79,
      credentialImportance: 88,
      fraudProbability: 94,
      skillConsistency: 76,
      experienceGrowth: 80,
      peerValidation: 65,
      verificationConfidence: 88
    },
    timeline: [
      { year: "2022", title: "Class 12 Marksheet", issuer: "State Board via DigiLocker", type: "academic", status: "verified" },
      { year: "2024", title: "Research Intern", issuer: "DRDO", type: "internship", status: "verified" },
      { year: "2025", title: "IEEE Paper Published", issuer: "IEEE", type: "research", status: "verified" }
    ]
  },
  {
    id: "demo-student-003",
    name: "Rohan Varma",
    avatar: "https://i.pravatar.cc/150?u=rohan-varma-bits",
    university: "BITS Pilani",
    degree: "B.E. — Electronics & Communication",
    graduationYear: "2025",
    trustScore: 680,
    trustClass: "Good",
    riskLevel: "Medium",
    riskScore: 38,
    jobFit: 71,
    skills: {
      verified: ["React", "Python"],
      unverified: ["Machine Learning", "C++"],
      missing: ["TypeScript", "Node.js", "Cloud"]
    },
    factors: {
      issuerReputation: 70,
      credentialFreshness: 60,
      credentialImportance: 72,
      fraudProbability: 75,
      skillConsistency: 55,
      experienceGrowth: 60,
      peerValidation: 45,
      verificationConfidence: 65
    },
    timeline: [
      { year: "2021", title: "BITS Enrollment", issuer: "BITS Pilani", type: "academic", status: "verified" },
      { year: "2023", title: "ML Intern", issuer: "Self-Claimed", type: "internship", status: "unverified" },
      { year: "2024", title: "AWS Cloud Practitioner", issuer: "AWS (Expired)", type: "certificate", status: "expired" }
    ]
  },
  {
    id: "demo-student-004",
    name: "Karan Malhotra",
    avatar: "https://i.pravatar.cc/150?u=karan-malhotra-du",
    university: "Delhi University",
    degree: "B.Com — Business Administration",
    graduationYear: "2024",
    trustScore: 590,
    trustClass: "Fair",
    riskLevel: "High",
    riskScore: 87,
    jobFit: 38,
    skills: {
      verified: ["Project Management"],
      unverified: ["React", "Node.js"],
      missing: ["TypeScript", "Python", "Cloud"]
    },
    factors: {
      issuerReputation: 42,
      credentialFreshness: 48,
      credentialImportance: 45,
      fraudProbability: 18,
      skillConsistency: 28,
      experienceGrowth: 35,
      peerValidation: 25,
      verificationConfidence: 30
    },
    timeline: [
      { year: "2022", title: "B.Com Enrollment", issuer: "Delhi University", type: "academic", status: "verified" },
      { year: "2023", title: "Project Manager Cert", issuer: "PMP", type: "certificate", status: "verified" },
      { year: "2024", title: "React Developer Certificate", issuer: "Revoked — Signature Mismatch", type: "certificate", status: "revoked" }
    ]
  }
];
