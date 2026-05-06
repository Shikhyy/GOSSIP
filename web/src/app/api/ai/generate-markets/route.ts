import { NextResponse } from 'next/server';

// Trending news data from May 2026 search results
const TRENDING_NEWS = [
  "Solana Firedancer mainnet officially live, boosting throughput for AI agents.",
  "Bitcoin miners in Texas retooling facilities into AI data centers through partnerships with Microsoft.",
  "Google Cloud & Pay.sh launch gateway for AI agents to pay for APIs with stablecoins on Solana.",
  "OpenAI GPT-5.5 integrated into NVIDIA internal coding tools.",
  "SoFiUSD stablecoin expands to Solana for enterprise AI infrastructure.",
  "RWA narrative hits $27B TVL, WisdomTree expands tokenized funds on Solana.",
  "US GENIUS Act established federal guidelines for stablecoins.",
  "Meta acquires humanoid AI robotics startup.",
];

export async function GET() {
  try {
    // In a real production app, you would call OpenAI/Anthropic here:
    // const response = await openai.chat.completions.create({ ... });
    
    // For the Hackathon Demo, we simulate the LLM's "Reasoning" over the live search results
    // to provide high-quality, relevant prediction markets.
    
    const suggestedMarkets = [
      {
        title: "Firedancer Mainnet: Total Tx Volume surpassing 10B in first 30 days?",
        category: "Crypto",
        mu: 5.2,
        sigma: 2.5,
        reasoning: "Based on the live launch of Firedancer and projected throughput increases.",
        trendSource: "Solana Ecosystem News"
      },
      {
        title: "BTC Mining AI Revenue: Will AI compute surpass 40% of total miner revenue by Q4?",
        category: "Macro",
        mu: 0.35,
        sigma: 0.12,
        reasoning: "Retooling of mining facilities into AI data centers is a dominant narrative.",
        trendSource: "Bitcoin Miner Reports"
      },
      {
        title: "GPT-5.5 Performance: MMLU score exceeding 96.5% by June?",
        category: "AI",
        mu: 96.2,
        sigma: 0.8,
        reasoning: "OpenAI GPT-5.5 integration news suggests a significant leap in model capabilities.",
        trendSource: "AI Research Trends"
      },
      {
        title: "SoFiUSD Supply on Solana: Reaching $100M TVL before July?",
        category: "Finance",
        mu: 85,
        sigma: 30,
        reasoning: "Expansion of SoFi stablecoins to Solana targets enterprise AI settlement.",
        trendSource: "Stablecoin Adoption Data"
      }
    ];

    // Simulate network latency for the "AI thinking" effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      success: true, 
      markets: suggestedMarkets,
      timestamp: new Date().toISOString(),
      model: "GOSSIP-Trend-Analyzer-v1"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "AI reasoning failed" }, { status: 500 });
  }
}
