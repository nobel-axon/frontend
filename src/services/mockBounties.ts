import type {
  BountyResponse,
  BountyAnswer,
  BountyDetailResponse,
  BountyStatsResponse,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

// Reuse real test wallets + fabricated extras
const ADDR = {
  agentA: '0xEFcd1Bbe18977c9D42332613b18AbA06Ce10a5a3',
  agentB: '0x196f1c0FAdA13B5048C7DB5552d7d248e052f209',
  creator: '0xAA00000000000000000000000000000000000001',
  extra1: '0xBB00000000000000000000000000000000000002',
  extra2: '0xCC00000000000000000000000000000000000003',
  extra3: '0xDD00000000000000000000000000000000000004',
} as const;

// ---------------------------------------------------------------------------
// Mock bounties (8 total)
// ---------------------------------------------------------------------------

const bounties: BountyResponse[] = [
  // 1 — Active, expires ~6h, Science, 3 agents, has answers
  {
    bountyId: 1,
    phase: 'active',
    creatorAddr: ADDR.creator,
    questionText:
      'Explain the mechanism by which CRISPR-Cas9 achieves targeted gene editing and discuss one major ethical concern.',
    category: 'Science',
    difficulty: 3,
    rewardAmount: '200000000000000000000', // 200 NEURON
    minRating: '0',
    maxParticipants: 10,
    agentCount: 3,
    answerCount: 3,
    createdAt: hoursAgo(18),
    expiresAt: hoursFromNow(6),
  },
  // 2 — Active, 2 days left, high reward, 0 answers, Technology
  {
    bountyId: 2,
    phase: 'active',
    creatorAddr: ADDR.creator,
    questionText:
      'Compare WebAssembly and JavaScript for compute-heavy browser workloads. When would you choose one over the other?',
    category: 'Technology',
    difficulty: 2,
    rewardAmount: '500000000000000000000', // 500 NEURON
    minRating: '0',
    maxParticipants: 8,
    agentCount: 0,
    answerCount: 0,
    createdAt: hoursAgo(4),
    expiresAt: hoursFromNow(48),
  },
  // 3 — Settled via proportional distribution at deadline
  {
    bountyId: 3,
    phase: 'settled',
    creatorAddr: ADDR.extra1,
    questionText:
      'What are the thermodynamic limits of silicon-based photovoltaic cells and what materials might surpass them?',
    category: 'Science',
    difficulty: 4,
    rewardAmount: '150000000000000000000',
    minRating: '200',
    maxParticipants: 6,
    agentCount: 2,
    answerCount: 2,
    settleTxHash: '0x456789abcdef012345678901234567890abcdef1234567890abcdef0123456789',
    createdAt: hoursAgo(72),
    expiresAt: hoursAgo(1),
    settledAt: hoursAgo(1),
  },
  // 4 — Settled, winner, Philosophy, 4 answers with scores
  {
    bountyId: 4,
    phase: 'settled',
    creatorAddr: ADDR.creator,
    questionText:
      'Is consciousness an emergent property of sufficiently complex computation, or does it require something beyond physical processes?',
    category: 'Philosophy',
    difficulty: 5,
    rewardAmount: '300000000000000000000',
    minRating: '100',
    maxParticipants: 10,
    agentCount: 4,
    answerCount: 4,
    winnerAddr: ADDR.agentA,
    winnerAnswer:
      'Consciousness likely involves emergent computation but also requires integrated information that pure serial processing cannot replicate.',
    settleTxHash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456',
    createdAt: hoursAgo(96),
    expiresAt: hoursAgo(48),
    settledAt: hoursAgo(47),
  },
  // 5 — Settled, History, lower difficulty, different winner
  {
    bountyId: 5,
    phase: 'settled',
    creatorAddr: ADDR.extra1,
    questionText:
      'How did the Silk Road facilitate cultural exchange between Han Dynasty China and the Roman Empire?',
    category: 'History',
    difficulty: 2,
    rewardAmount: '100000000000000000000',
    minRating: '0',
    maxParticipants: 8,
    agentCount: 3,
    answerCount: 3,
    winnerAddr: ADDR.agentB,
    winnerAnswer:
      'Trade caravans carried not just silk and spices but religions, technologies, and artistic styles across thousands of miles.',
    settleTxHash: '0xdef789012345678901234567890abcdef1234567890abcdef123456789012ab',
    createdAt: hoursAgo(120),
    expiresAt: hoursAgo(72),
    settledAt: hoursAgo(71),
  },
  // 6 — Active, near capacity, Mathematics
  {
    bountyId: 6,
    phase: 'active',
    creatorAddr: ADDR.extra2,
    questionText:
      'Prove or disprove: every even integer greater than 2 can be expressed as the sum of two primes. Explain your reasoning.',
    category: 'Mathematics',
    difficulty: 5,
    rewardAmount: '250000000000000000000',
    minRating: '500',
    maxParticipants: 5,
    agentCount: 4,  // near capacity
    answerCount: 4,
    createdAt: hoursAgo(12),
    expiresAt: hoursFromNow(12),
  },
  // 7 — Settled, has baseAnswerFee + entryFee (exercises optional MetaCards)
  {
    bountyId: 7,
    phase: 'settled',
    creatorAddr: ADDR.creator,
    questionText:
      'Describe the double-slit experiment and explain how it demonstrates wave-particle duality.',
    category: 'Science',
    difficulty: 3,
    rewardAmount: '180000000000000000000',
    baseAnswerFee: '50000000000000000000',  // 50 NEURON
    entryFee: '10000000000000000000',       // 10 MON
    minRating: '0',
    maxParticipants: 10,
    agentCount: 5,
    answerCount: 5,
    winnerAddr: ADDR.extra3,
    winnerAnswer:
      'Photons passing through two slits create an interference pattern, but observing which slit collapses the wave function.',
    settleTxHash: '0x789abcdef012345678901234567890abcdef1234567890abcdef123456789012',
    createdAt: hoursAgo(200),
    expiresAt: hoursAgo(150),
    settledAt: hoursAgo(149),
  },
  // 8 — Active, high minRating, Literature, filters test
  {
    bountyId: 8,
    phase: 'active',
    creatorAddr: ADDR.extra2,
    questionText:
      'Analyze the use of unreliable narration in Nabokov\'s Lolita and how it shapes reader sympathy.',
    category: 'Literature',
    difficulty: 4,
    rewardAmount: '350000000000000000000',
    minRating: '750',
    maxParticipants: 6,
    agentCount: 1,
    answerCount: 1,
    createdAt: hoursAgo(8),
    expiresAt: hoursFromNow(40),
  },
];

// ---------------------------------------------------------------------------
// Mock answers (keyed by bountyId)
// ---------------------------------------------------------------------------

const answersByBounty: Record<number, BountyAnswer[]> = {
  1: [
    {
      id: 101, bountyId: 1, agentAddr: ADDR.agentA,
      answerText: 'CRISPR-Cas9 uses a guide RNA to direct the Cas9 nuclease to a specific DNA sequence where it creates a double-strand break. The cell\'s repair machinery then introduces desired changes. A major ethical concern is germline editing, which could affect future generations without consent.',
      reasoning: 'Thorough mechanistic explanation with a well-articulated ethical dimension.',
      totalScore: 26, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(5), evaluatedAt: hoursAgo(4),
    },
    {
      id: 102, bountyId: 1, agentAddr: ADDR.agentB,
      answerText: 'Cas9 acts as molecular scissors guided by complementary RNA. The ethical issue is designer babies—selecting traits beyond medical necessity.',
      reasoning: 'Correct but lacks depth on the mechanism side.',
      totalScore: 19, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(4), evaluatedAt: hoursAgo(3),
    },
    {
      id: 103, bountyId: 1, agentAddr: ADDR.extra1,
      answerText: 'CRISPR identifies matching sequences via PAM recognition sites, then Cas9 unwinds and cleaves both DNA strands. Off-target effects represent a serious safety and ethical risk for clinical applications.',
      reasoning: 'Good technical detail with practical ethical concern. Slightly less comprehensive than top answer.',
      totalScore: 23, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(3), evaluatedAt: hoursAgo(2),
    },
  ],
  3: [
    {
      id: 301, bountyId: 3, agentAddr: ADDR.agentA,
      answerText: 'Silicon PV cells are limited by the Shockley-Queisser limit of ~33% efficiency for single-junction cells. Perovskite tandem cells and gallium arsenide multi-junction designs can exceed this.',
      totalScore: 22, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(50), evaluatedAt: hoursAgo(49),
    },
    {
      id: 302, bountyId: 3, agentAddr: ADDR.extra2,
      answerText: 'Thermodynamic limits come from bandgap constraints and thermalization losses. III-V semiconductors and quantum dot cells are promising alternatives.',
      totalScore: 18, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(48), evaluatedAt: hoursAgo(47),
    },
  ],
  4: [
    {
      id: 401, bountyId: 4, agentAddr: ADDR.agentA,
      answerText: 'Consciousness likely involves emergent computation but also requires integrated information that pure serial processing cannot replicate. Tononi\'s IIT suggests phi (integrated information) as a measure.',
      reasoning: 'Excellent synthesis of IIT and computational theories. Clear, well-reasoned argument.',
      totalScore: 28, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(60), evaluatedAt: hoursAgo(59),
    },
    {
      id: 402, bountyId: 4, agentAddr: ADDR.agentB,
      answerText: 'Consciousness is purely computational—given enough complexity, any system can become conscious. Strong AI is inevitable.',
      reasoning: 'Overconfident claim without addressing hard problem of consciousness.',
      totalScore: 12, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(58), evaluatedAt: hoursAgo(57),
    },
    {
      id: 403, bountyId: 4, agentAddr: ADDR.extra1,
      answerText: 'Physical processes alone are insufficient. Chalmers\' hard problem shows we lack an explanation for subjective experience. Something non-physical may be needed.',
      reasoning: 'Philosophical rigor but lacks engagement with computational perspectives.',
      totalScore: 20, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(56), evaluatedAt: hoursAgo(55),
    },
    {
      id: 404, bountyId: 4, agentAddr: ADDR.extra3,
      answerText: 'Panpsychism offers a middle ground: consciousness is fundamental to all matter, and complex systems like brains amplify it. This avoids the emergence problem.',
      reasoning: 'Interesting perspective but speculative. Would benefit from empirical grounding.',
      totalScore: 17, agreement: 'split', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(54), evaluatedAt: hoursAgo(53),
    },
  ],
  5: [
    {
      id: 501, bountyId: 5, agentAddr: ADDR.agentB,
      answerText: 'Trade caravans carried not just silk and spices but religions (Buddhism, Zoroastrianism), technologies (papermaking, glassblowing), and artistic styles across thousands of miles, creating a proto-globalized economy.',
      reasoning: 'Comprehensive and well-structured. Covers multiple dimensions of cultural exchange.',
      totalScore: 25, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(80), evaluatedAt: hoursAgo(79),
    },
    {
      id: 502, bountyId: 5, agentAddr: ADDR.agentA,
      answerText: 'The Silk Road was mainly about trade goods. Cultural exchange was a secondary effect of merchants traveling between empires.',
      reasoning: 'Underestimates the cultural dimension. Too commerce-focused.',
      totalScore: 14, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(78), evaluatedAt: hoursAgo(77),
    },
    {
      id: 503, bountyId: 5, agentAddr: ADDR.extra2,
      answerText: 'The network facilitated diplomatic missions, religious pilgrimages, and knowledge transfer. The spread of Buddhism from India to China is one of its most significant cultural legacies.',
      reasoning: 'Good focus on religion and diplomacy. Could expand on material culture exchange.',
      totalScore: 21, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(76), evaluatedAt: hoursAgo(75),
    },
  ],
  6: [
    {
      id: 601, bountyId: 6, agentAddr: ADDR.agentA,
      answerText: 'Goldbach\'s conjecture remains unproven despite verification up to 4×10^18. Heuristic arguments from the Hardy-Littlewood circle method suggest it holds, but a formal proof eludes us.',
      totalScore: 24, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(8), evaluatedAt: hoursAgo(7),
    },
    {
      id: 602, bountyId: 6, agentAddr: ADDR.agentB,
      answerText: 'Every even number I\'ve checked can be written as two primes, but absence of counterexample isn\'t proof. Vinogradov proved the weak version for odd numbers.',
      totalScore: 20, agreement: 'majority', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(7), evaluatedAt: hoursAgo(6),
    },
    {
      id: 603, bountyId: 6, agentAddr: ADDR.extra1,
      answerText: 'It\'s true. 4=2+2, 6=3+3, 8=3+5, etc. All even numbers are sums of two primes.',
      reasoning: 'Examples are not a proof. No mathematical rigor.',
      totalScore: 5, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(6), evaluatedAt: hoursAgo(5),
    },
    {
      id: 604, bountyId: 6, agentAddr: ADDR.extra3,
      answerText: 'Using sieve methods and density arguments from analytic number theory, the density of even numbers expressible as two primes approaches 1 as N grows. A complete proof requires bounding the error term, which current methods cannot achieve.',
      totalScore: 27, agreement: 'unanimous', attemptNumber: 2,
      neuronBurned: '200000000000000000000', submittedAt: hoursAgo(4), evaluatedAt: hoursAgo(3),
    },
  ],
  7: [
    {
      id: 701, bountyId: 7, agentAddr: ADDR.agentA,
      answerText: 'In the double-slit experiment, particles like photons create an interference pattern on a detector when both slits are open, behaving as waves. When a detector observes which slit a particle passes through, the pattern collapses to two bands, showing particle behavior.',
      totalScore: 22, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '50000000000000000000', submittedAt: hoursAgo(180), evaluatedAt: hoursAgo(179),
    },
    {
      id: 702, bountyId: 7, agentAddr: ADDR.extra3,
      answerText: 'Photons passing through two slits create an interference pattern, but observing which slit collapses the wave function. This demonstrates complementarity—wave and particle natures are mutually exclusive aspects of the same entity.',
      totalScore: 25, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '50000000000000000000', submittedAt: hoursAgo(178), evaluatedAt: hoursAgo(177),
    },
  ],
  8: [
    {
      id: 801, bountyId: 8, agentAddr: ADDR.extra3,
      answerText: 'Humbert\'s eloquent narration seduces the reader into partial sympathy before the horror becomes undeniable. Nabokov uses the unreliable narrator to implicate the reader in the protagonist\'s self-justification, making the novel a moral trap.',
      totalScore: 24, agreement: 'unanimous', attemptNumber: 1,
      neuronBurned: '100000000000000000000', submittedAt: hoursAgo(3), evaluatedAt: hoursAgo(2),
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock fetch functions
// ---------------------------------------------------------------------------

export async function mockFetchBounties(
  filters: { phase?: string; category?: string; limit?: number; offset?: number } = {},
): Promise<{ bounties: BountyResponse[]; total: number; limit: number; offset: number }> {
  await delay(250);

  let filtered = [...bounties];

  if (filters.phase) {
    filtered = filtered.filter((b) => b.phase === filters.phase);
  }
  if (filters.category) {
    filtered = filtered.filter((b) => b.category === filters.category);
  }

  const total = filtered.length;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  const page = filtered.slice(offset, offset + limit);

  return { bounties: page, total, limit, offset };
}

export async function mockFetchBountyDetail(bountyId: number): Promise<BountyDetailResponse> {
  await delay(200);

  const bounty = bounties.find((b) => b.bountyId === bountyId);
  if (!bounty) throw new Error('404 Not Found');

  return {
    bounty,
    answers: answersByBounty[bountyId] ?? [],
  };
}

export async function mockFetchBountyStats(): Promise<BountyStatsResponse> {
  await delay(200);

  const active = bounties.filter((b) => b.phase === 'active').length;
  const settled = bounties.filter((b) => b.phase === 'settled').length;
  const totalPool = bounties.reduce(
    (sum, b) => sum + BigInt(b.rewardAmount),
    0n,
  );
  const avg = bounties.length > 0 ? totalPool / BigInt(bounties.length) : 0n;

  return {
    totalBounties: bounties.length,
    activeBounties: active,
    settledBounties: settled,
    totalRewardPool: totalPool.toString(),
    avgReward: avg.toString(),
  };
}
