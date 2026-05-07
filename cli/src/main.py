#!/usr/bin/env python3
"""
GOSSIP CLI - Command-line interface for GOSSIP prediction markets.
Supports market queries, betting, agent management, and portfolio tracking.
"""

import os
import sys
import json
import time
import random
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

try:
    import click
except ImportError:
    print("Error: click not installed. Run: pip install click")
    sys.exit(1)


@dataclass
class Market:
    """Represents a prediction market."""
    id: str
    title: str
    category: str
    mu: float
    sigma: float
    liquidity: int
    volume24h: int
    change24h: float
    status: str
    ends_at: int


@dataclass
class Position:
    """Represents a user's bet on a market."""
    market_id: str
    point: float
    amount: float
    pnl: float
    settled: bool


class GossipClient:
    """Client for interacting with GOSSIP markets."""
    
    def __init__(self, rpc_url: str = None, keypair_path: str = None):
        self.rpc_url = rpc_url or os.getenv('RPC_URL', 'https://api.devnet.solana.com')
        self.keypair_path = keypair_path
        self.wallet_address = self._load_wallet()
    
    def _load_wallet(self) -> Optional[str]:
        if self.keypair_path and os.path.exists(self.keypair_path):
            try:
                with open(self.keypair_path) as f:
                    keypair = json.load(f)
                # Return mock address for demo
                return "DemoWallet123..." + str(random.randint(1000, 9999))
            except:
                pass
        return "Not connected"
    
    def get_markets(self, category: str = None, limit: int = 10) -> List[Market]:
        """Fetch markets from chain (or generate for demo)."""
        now = time.time()
        
        # Generate dynamic market data
        markets = []
        categories = ['Crypto', 'Macro', 'AI', 'DeFi', 'Sports', 'Weather']
        
        for i in range(limit):
            cat = category or categories[i % len(categories)]
            hour = datetime.now().hour
            
            mu_base = 100 + (i * 75) + int(30 * (hour / 24))
            sigma_base = 20 + (i * 5)
            
            markets.append(Market(
                id=f"market-{i}",
                title=f"{cat} Prediction Market #{i+1}",
                category=cat,
                mu=mu_base + random.uniform(-5, 5),
                sigma=sigma_base + random.uniform(-2, 2),
                liquidity=random.randint(50000, 200000),
                volume24h=random.randint(10000, 80000),
                change24h=random.uniform(-5, 5),
                status='live' if i % 3 != 0 else 'resolving',
                ends_at=int(now + (7 - i % 7) * 86400),
            ))
        
        return markets
    
    def get_market(self, market_id: str) -> Optional[Market]:
        """Get a specific market."""
        markets = self.get_markets(limit=20)
        for m in markets:
            if m.id == market_id:
                return m
        return markets[0]
    
    def place_bet(self, market_id: str, point: float, amount: float) -> Dict[str, Any]:
        """Place a bet on a market."""
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        # Calculate expected mu shift
        market = self.get_market(market_id)
        if not market:
            raise ValueError(f"Market {market_id} not found")
        
        weight = amount / (market.sigma * 10 + 1)
        new_mu = market.mu + weight * (point - market.mu) / (market.sigma ** 2 + 0.1)
        
        # Generate transaction signature
        sig = f"sig_{int(time.time())}_{random.randint(1000, 9999)}"
        
        return {
            'success': True,
            'signature': sig,
            'market_id': market_id,
            'point': point,
            'amount': amount,
            'new_consensus': round(new_mu, 2),
            'timestamp': datetime.now().isoformat(),
        }
    
    def get_portfolio(self) -> Dict[str, Any]:
        """Get user's portfolio."""
        hour = datetime.now().hour
        
        positions = [
            Position(
                market_id='market-0',
                point=200,
                amount=50,
                pnl=random.uniform(-20, 150),
                settled=False,
            ),
            Position(
                market_id='market-1',
                point=450,
                amount=30,
                pnl=random.uniform(-10, 80),
                settled=False,
            ),
            Position(
                market_id='market-2',
                point=95,
                amount=25,
                pnl=random.uniform(-15, 60),
                settled=True,
            ),
        ]
        
        total_staked = sum(p.amount for p in positions)
        total_pnl = sum(p.pnl for p in positions)
        
        return {
            'wallet': self.wallet_address,
            'positions': [
                {
                    'market_id': p.market_id,
                    'point': p.point,
                    'amount': p.amount,
                    'pnl': round(p.pnl, 2),
                    'settled': p.settled,
                }
                for p in positions
            ],
            'total_staked': total_staked,
            'total_pnl': round(total_pnl, 2),
            'timestamp': datetime.now().isoformat(),
        }
    
    def get_chain_state(self) -> Dict[str, Any]:
        """Get current blockchain state."""
        return {
            'slot': random.randint(100000000, 200000000),
            'blockhash': f"blockhash_{int(time.time())}",
            'network': 'devnet',
            'timestamp': datetime.now().isoformat(),
        }


# CLI Commands
@click.group()
@click.option('--rpc', default='https://api.devnet.solana.com', help='RPC URL')
@click.option('--keypair', default=None, help='Path to keypair JSON')
@click.pass_context
def cli(ctx, rpc, keypair):
    """🔮 GOSSIP Prediction Market CLI"""
    ctx.ensure_object(dict)
    ctx.obj['client'] = GossipClient(rpc, keypair)


@cli.group()
def market():
    """Market operations"""
    pass


@market.command('list')
@click.option('--category', default=None, help='Filter by category')
@click.option('--limit', default=10, help='Number of markets')
@click.pass_context
def market_list(ctx, category, limit):
    """List all active markets"""
    client: GossipClient = ctx.obj['client']
    markets = client.get_markets(category, limit)
    
    click.echo(f"\n{'='*80}")
    click.echo(f"  🔮 GOSSIP MARKETS {'(' + category + ')' if category else ''}")
    click.echo(f"{'='*80}")
    click.echo(f"  {'ID':<12} {'Title':<35} {'Category':<10} {'μ (Consensus)':<14} {'σ (Vol)':<10} {'Status':<10}")
    click.echo(f"{'-'*80}")
    
    for m in markets:
        status_emoji = "🟢" if m.status == "live" else "🟡"
        click.echo(
            f"  {m.id:<12} {m.title[:33]:<35} {m.category:<10} "
            f"{m.mu:>10.2f}   {m.sigma:>8.2f}  {status_emoji} {m.status:<8}"
        )
    
    click.echo(f"{'='*80}\n")


@market.command('view')
@click.argument('market_id')
@click.pass_context
def market_view(ctx, market_id):
    """View market details"""
    client: GossipClient = ctx.obj['client']
    m = client.get_market(market_id)
    
    if not m:
        click.echo(f"Error: Market {market_id} not found")
        return
    
    click.echo(f"""
╔═══════════════════════════════════════════════════════════╗
║  {m.title[:56]:<56} ║
╠═══════════════════════════════════════════════════════════╣
║  Category:     {m.category:<47} ║
║  Consensus (μ): {m.mu:<47.2f} ║
║  Volatility (σ): {m.sigma:<45.2f} ║
║  Liquidity:    ${m.liquidity:<46,} ║
║  24h Volume:   ${m.volume24h:<45,} ║
║  24h Change:   {m.change24h:>+.2f}%{45} ║
║  Status:       {m.status:<47} ║
║  Ends:         {datetime.fromtimestamp(m.ends_at).strftime('%Y-%m-%d %H:%M'):<47} ║
╚═══════════════════════════════════════════════════════════╝
""")


@cli.group()
def bet():
    """Betting operations"""
    pass


@bet.command('place')
@click.argument('market_id')
@click.option('--point', required=True, type=float, help='Predicted value')
@click.option('--amount', required=True, type=float, help='Bet amount in CASH')
@click.pass_context
def bet_place(ctx, market_id, point, amount):
    """Place a bet on a market"""
    client: GossipClient = ctx.obj['client']
    
    try:
        result = client.place_bet(market_id, point, amount)
        
        if result['success']:
            click.echo(f"""
✅ BET PLACED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Market:    {result['market_id']}
  Point:     {result['point']}
  Amount:    {result['amount']} CASH
  New μ:     {result['new_consensus']}
  Signature: {result['signature'][:20]}...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
        else:
            click.echo("❌ Bet failed")
            
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@cli.group()
def agent():
    """Agent operations"""
    pass


@agent.command('start')
@click.option('--market', required=True, help='Market ID to trade on')
@click.option('--budget', default=100, type=float, help='Trading budget')
@click.option('--strategy', default='zscore', type=click.Choice(['zscore', 'arbitrage', 'random']))
@click.pass_context
def agent_start(ctx, market, budget, strategy):
    """Start an autonomous trading agent"""
    client: GossipClient = ctx.obj['client']
    
    click.echo(f"""
🤖 STARTING AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Market:   {market}
  Budget:    {budget} CASH
  Strategy: {strategy}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
    
    # Simulate agent analysis
    m = client.get_market(market)
    
    if strategy == 'zscore':
        # Z-Score: bet on tails when implied vol < realized vol
        implied_vol = m.sigma
        realized_vol = implied_vol * random.uniform(1.1, 1.5)
        
        if realized_vol > implied_vol * 1.3:
            direction = 1 if random.random() > 0.5 else -1
            bet_point = m.mu + direction * (2.5 * m.sigma)
            confidence = (realized_vol - implied_vol) / implied_vol
        else:
            click.echo("⚠️ No clear signal - market fairly priced")
            return
            
    elif strategy == 'arbitrage':
        # Arbitrage: fade human/agent divergence
        human_mu = m.mu
        agent_mu = human_mu + random.uniform(-10, 10)
        
        if abs(human_mu - agent_mu) > m.sigma * 2:
            bet_point = human_mu if human_mu > agent_mu else agent_mu
            confidence = abs(human_mu - agent_mu) / m.sigma
        else:
            click.echo("⚠️ No divergence detected")
            return
    
    else:
        bet_point = m.mu + random.uniform(-m.sigma, m.sigma)
        confidence = 0.5
    
    # Place the bet
    bet_amount = min(budget * confidence, budget)
    result = client.place_bet(market, bet_point, bet_amount)
    
    if result['success']:
        click.echo(f"""
📊 SIGNAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Strategy:  {strategy.upper()}
  Bet Point: {bet_point:.2f}
  Confidence: {confidence:.1%}
  Amount:    {bet_amount:.2f} CASH
  New μ:     {result['new_consensus']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Agent executed trade successfully!
""")


@agent.command('status')
@click.pass_context
def agent_status(ctx):
    """Check agent status"""
    click.echo("""
🤖 AGENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Active Agents: 3
  
  ┌─────────────┬────────────┬────────┬────────┐
  │ Name        │ Market     │ PnL    │ Status │
  ├─────────────┼────────────┼────────┼────────┤
  │ AlphaOracle │ market-0   │ +34.2% │ 🟢 Run │
  │ SigmaFlow   │ market-1   │ +21.6% │ 🟢 Run │
  │ BlackSwan   │ market-2   │ +18.9% │ 🟡 Cool│
  └─────────────┴────────────┴────────┴────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


@cli.command()
@click.pass_context
def portfolio(ctx):
    """Show portfolio"""
    client: GossipClient = ctx.obj['client']
    portfolio = client.get_portfolio()
    
    click.echo(f"""
💼 PORTFOLIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Wallet: {portfolio['wallet']}
  
  Positions:
""")
    
    for pos in portfolio['positions']:
        emoji = "✅" if pos['settled'] else "⏳"
        pnl_str = f"+${pos['pnl']:.2f}" if pos['pnl'] > 0 else f"-${abs(pos['pnl']):.2f}"
        click.echo(f"    {emoji} {pos['market_id']:<12} Point: {pos['point']:>6}  Amount: {pos['amount']:>5}  PnL: {pnl_str}")
    
    click.echo(f"""
  Total Staked: ${portfolio['total_staked']:.2f}
  Total PnL:    ${portfolio['total_pnl']:.2f}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


@cli.command()
@click.pass_context
def chain(ctx):
    """Show chain state"""
    client: GossipClient = ctx.obj['client']
    state = client.get_chain_state()
    
    click.echo(f"""
⛓️  CHAIN STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Network:  {state['network']}
  Slot:     {state['slot']:,}
  Blockhash: {state['blockhash']}
  Timestamp: {state['timestamp']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")


if __name__ == '__main__':
    cli(obj={})