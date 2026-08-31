"use client";

import { useMemo, useState } from "react";
import {
  Activity, BarChart3, Bell, Calculator, CandlestickChart, ChevronRight,
  CircleDollarSign, LayoutDashboard, Menu, Search, Settings, ShieldCheck,
  Star, Target, TrendingDown, TrendingUp, Wallet, X
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

type Trade = {
  symbol: string; side: "BUY" | "SELL"; entry: number; exit: number;
  qty: number; pnl: number; date: string;
};

const chart = [
  { t: "09:15", v: 24210 }, { t: "10:00", v: 24285 }, { t: "11:00", v: 24245 },
  { t: "12:00", v: 24335 }, { t: "13:00", v: 24305 }, { t: "14:00", v: 24405 },
  { t: "15:00", v: 24462 }
];

const opportunities = [
  { symbol: "RELIANCE", price: 1428.2, change: 2.31, signal: "BUY", score: 88, risk: "Medium" },
  { symbol: "HDFCBANK", price: 1984.4, change: 1.42, signal: "BUY", score: 82, risk: "Low" },
  { symbol: "INFY", price: 1511.8, change: -0.74, signal: "WAIT", score: 64, risk: "Medium" },
  { symbol: "TCS", price: 3342.5, change: -1.18, signal: "SELL", score: 79, risk: "High" }
];

const seedTrades: Trade[] = [
  { symbol: "RELIANCE", side: "BUY", entry: 1402, exit: 1421, qty: 10, pnl: 190, date: "31 Aug 2026" },
  { symbol: "HDFCBANK", side: "BUY", entry: 1960, exit: 1982, qty: 5, pnl: 110, date: "29 Aug 2026" },
  { symbol: "TCS", side: "SELL", entry: 3370, exit: 3348, qty: 3, pnl: 66, date: "28 Aug 2026" }
];

function money(n: number, currency: string) {
  const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  return `${symbols[currency] ?? currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function analyze(symbol: string) {
  const clean = symbol.trim().toUpperCase() || "RELIANCE";
  const seed = clean.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rsi = 42 + (seed % 35);
  const macd = ((seed % 100) / 100 - 0.35).toFixed(2);
  const score = Math.min(95, 55 + (seed % 41));
  const signal = score >= 78 ? "BUY" : score <= 62 ? "SELL" : "WAIT";
  const pattern = seed % 3 === 0 ? "Bullish Engulfing" : seed % 3 === 1 ? "Hammer" : "Morning Star";
  return { clean, rsi, macd, score, signal, pattern, trend: signal === "SELL" ? "Bearish" : "Bullish" };
}

export default function Home() {
  const [section, setSection] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [symbol, setSymbol] = useState("RELIANCE");
  const [currency, setCurrency] = useState("INR");
  const [balance, setBalance] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(1428);
  const [stop, setStop] = useState(1400);
  const [target, setTarget] = useState(1485);
  const [trades, setTrades] = useState<Trade[]>(seedTrades);
  const result = useMemo(() => analyze(symbol), [symbol]);

  const riskAmount = balance * riskPct / 100;
  const riskPerShare = Math.abs(entry - stop) || 1;
  const qty = Math.max(0, Math.floor(riskAmount / riskPerShare));
  const reward = Math.abs(target - entry);
  const rr = (reward / riskPerShare).toFixed(2);
  const pnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length ? Math.round(wins / trades.length * 100) : 0;

  const nav = [
    ["Dashboard", LayoutDashboard], ["Analyzer", CandlestickChart], ["RiskGuard", ShieldCheck],
    ["Opportunities", Star], ["Money Tracker", Wallet], ["Trade History", BarChart3]
  ] as const;

  function addTrade() {
    const fakeExit = result.signal === "SELL" ? entry - reward : entry + reward;
    const tradePnl = (fakeExit - entry) * qty * (result.signal === "SELL" ? -1 : 1);
    setTrades([{ symbol: result.clean, side: result.signal === "SELL" ? "SELL" : "BUY",
      entry, exit: fakeExit, qty, pnl: Math.round(tradePnl), date: new Date().toLocaleDateString("en-IN") }, ...trades]);
    setSection("Trade History");
  }

  return (
    <main className="shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand"><div className="logo">A</div><div><b>AlphaEdge</b><small>MARKET INTELLIGENCE</small></div></div>
        <div className="nav">{nav.map(([name, Icon]) =>
          <button key={name} className={section === name ? "active" : ""} onClick={() => {setSection(name); setMobileOpen(false)}}><Icon size={18}/>{name}</button>
        )}</div>
        <div className="sideBottom"><button><Settings size={18}/> Settings</button><div className="disclaimer">Analysis is educational. No signal guarantees profit.</div></div>
      </aside>

      <section className="content">
        <header>
          <button className="mobileMenu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
          <div><div className="eyebrow">ALPHAEDGE TERMINAL</div><h1>{section}</h1></div>
          <div className="headerActions"><span className="live"><i/> DEMO MARKET</span><button className="iconBtn"><Bell size={18}/></button></div>
        </header>

        {section === "Dashboard" && <Dashboard pnl={pnl} winRate={winRate} currency={currency} balance={balance} opportunities={opportunities} setSection={setSection}/>}
        {section === "Analyzer" && <Analyzer symbol={symbol} setSymbol={setSymbol} result={result} addTrade={addTrade}/>}
        {section === "RiskGuard" && <RiskGuard currency={currency} setCurrency={setCurrency} balance={balance} setBalance={setBalance} riskPct={riskPct} setRiskPct={setRiskPct} entry={entry} setEntry={setEntry} stop={stop} setStop={setStop} target={target} setTarget={setTarget} riskAmount={riskAmount} qty={qty} rr={rr}/>}
        {section === "Opportunities" && <Opportunities setSymbol={setSymbol} setSection={setSection}/>}
        {section === "Money Tracker" && <MoneyTracker balance={balance} setBalance={setBalance} pnl={pnl} currency={currency}/>}
        {section === "Trade History" && <History trades={trades}/>}
      </section>
    </main>
  );
}

function Dashboard({pnl, winRate, currency, balance, opportunities, setSection}: any) {
  return <div className="page">
    <div className="hero"><div><span className="pill">● SYSTEM ONLINE</span><h2>Trade smarter. <em>Protect capital.</em></h2><p>One workspace for market analysis, setups and disciplined risk management.</p></div><button className="primary" onClick={() => setSection("Analyzer")}>Open Analyzer <ChevronRight size={18}/></button></div>
    <div className="stats">
      <Stat title="Account Balance" value={money(balance, currency)} icon={<CircleDollarSign/>} sub="Demo portfolio"/>
      <Stat title="Net P&L" value={money(pnl, currency)} icon={pnl >= 0 ? <TrendingUp/> : <TrendingDown/>} sub="Tracked trades"/>
      <Stat title="Win Rate" value={`${winRate}%`} icon={<Target/>} sub="Closed trades"/>
      <Stat title="Risk / Trade" value="1.0%" icon={<ShieldCheck/>} sub="RiskGuard default"/>
    </div>
    <div className="grid2">
      <Card title="Market Pulse" action="NIFTY 50">
        <div className="chartTop"><b>24,462.10</b><span className="positive">+1.08%</span></div>
        <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity=".35"/><stop offset="100%" stopColor="#7c5cff" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="#202536" vertical={false}/><XAxis dataKey="t" stroke="#697386" tickLine={false}/><YAxis hide domain={["dataMin - 100", "dataMax + 100"]}/><Tooltip contentStyle={{background:"#10131c",border:"1px solid #2b3142"}}/><Area type="monotone" dataKey="v" stroke="#8f7aff" fill="url(#g)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
      </Card>
      <Card title="Top Opportunities" action="View all" onAction={() => setSection("Opportunities")}>
        {opportunities.map(o => <div className="op" key={o.symbol}><div><b>{o.symbol}</b><small>{o.risk} risk</small></div><div className="opmid"><span className={o.change > 0 ? "positive" : "negative"}>{o.change > 0 ? "+" : ""}{o.change}%</span><strong>{o.score}/100</strong></div><span className={`signal ${o.signal.toLowerCase()}`}>{o.signal}</span></div>)}
      </Card>
    </div>
    <div className="grid2">
      <Card title="RiskGuard Snapshot"><div className="riskBox"><ShieldCheck/><div><b>Capital protection active</b><p>Default max risk is 1% per trade. Use the calculator before entering a position.</p></div></div></Card>
      <Card title="Quick Actions"><div className="quick"><button onClick={() => setSection("Analyzer")}><Search/> Analyze a stock</button><button onClick={() => setSection("RiskGuard")}><Calculator/> Calculate position</button><button onClick={() => setSection("Money Tracker")}><Wallet/> Update P&L</button></div></Card>
    </div>
  </div>
}

function Stat({title,value,icon,sub}: any) { return <div className="stat"><div className="statIcon">{icon}</div><small>{title}</small><b>{value}</b><span>{sub}</span></div> }
function Card({title, action, onAction, children}: any) { return <section className="card"><div className="cardHead"><h3>{title}</h3>{action && <button onClick={onAction}>{action}</button>}</div>{children}</section> }

function Analyzer({symbol,setSymbol,result,addTrade}: any) {
  return <div className="page"><div className="analyzerTop"><div className="searchbox"><Search size={18}/><input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="Enter NSE symbol, e.g. RELIANCE"/></div><select defaultValue="15m"><option>5m</option><option>15m</option><option>1H</option><option>4H</option><option>1D</option></select></div>
    <div className="signalHero"><div><span className="eyebrow">ALPHAEDGE SIGNAL ENGINE · DEMO</span><h2>{result.clean} <span className={`signal big ${result.signal.toLowerCase()}`}>{result.signal}</span></h2><p>Trend: <b>{result.trend}</b> · Pattern: <b>{result.pattern}</b></p></div><div className="score"><strong>{result.score}</strong><span>/100 confidence</span></div></div>
    <div className="indicatorGrid"><Indicator name="RSI" value={result.rsi} note={result.rsi > 70 ? "Overbought" : result.rsi < 30 ? "Oversold" : "Neutral"}/><Indicator name="MACD" value={result.macd} note="Momentum"/><Indicator name="Trend" value={result.trend} note="Moving averages"/><Indicator name="Pattern" value={result.pattern} note="Candlestick scan"/></div>
    <Card title="Trade Setup"><div className="setup"><div><span>Suggested bias</span><b>{result.signal}</b></div><div><span>Risk</span><b>Defined by RiskGuard</b></div><div><span>Confirmation</span><b>Wait for price action</b></div><button className="primary" onClick={addTrade}>Log Demo Trade</button></div></Card>
    <p className="notice">Demo analyzer only. Connect a verified market-data API before using live prices. Technical signals are not financial advice and can be wrong.</p>
  </div>
}
function Indicator({name,value,note}: any){return <div className="indicator"><span>{name}</span><b>{value}</b><small>{note}</small></div>}

function RiskGuard({currency,setCurrency,balance,setBalance,riskPct,setRiskPct,entry,setEntry,stop,setStop,target,setTarget,riskAmount,qty,rr}: any) {
  return <div className="page"><div className="riskLayout"><Card title="Position Calculator"><div className="formGrid">
    <label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>
    <label>Account balance<input type="number" value={balance} onChange={e=>setBalance(+e.target.value)}/></label>
    <label>Risk per trade (%)<input type="number" step=".1" min=".1" max="10" value={riskPct} onChange={e=>setRiskPct(+e.target.value)}/></label>
    <label>Entry price<input type="number" value={entry} onChange={e=>setEntry(+e.target.value)}/></label>
    <label>Stop loss<input type="number" value={stop} onChange={e=>setStop(+e.target.value)}/></label>
    <label>Target<input type="number" value={target} onChange={e=>setTarget(+e.target.value)}/></label>
  </div></Card><div className="riskResult"><div className="ring"><ShieldCheck size={28}/><b>{riskPct}%</b><small>risk</small></div><div className="resultRows"><div><span>Max risk</span><b>{money(riskAmount,currency)}</b></div><div><span>Position quantity</span><b>{qty}</b></div><div><span>Risk / share</span><b>{money(Math.abs(entry-stop),currency)}</b></div><div><span>Risk / Reward</span><b>1 : {rr}</b></div></div></div></div><p className="notice">RiskGuard is a calculator, not a guarantee. Position size should also account for liquidity, slippage, fees and contract specifications.</p></div>
}
function Opportunities({setSymbol,setSection}: any){return <div className="page"><Card title="Market Scanner" action="Demo universe"><div className="table">{opportunities.map(o=><div className="tr" key={o.symbol}><b>{o.symbol}</b><span>{o.price.toFixed(2)}</span><span className={o.change>0?"positive":"negative"}>{o.change>0?"+":""}{o.change}%</span><strong>{o.score}</strong><span className={`signal ${o.signal.toLowerCase()}`}>{o.signal}</span><button onClick={()=>{setSymbol(o.symbol);setSection("Analyzer")}}>Analyze</button></div>)}</div></Card></div>}
function MoneyTracker({balance,setBalance,pnl,currency}: any){return <div className="page"><div className="stats"><Stat title="Starting Balance" value={money(balance,currency)} icon={<Wallet/>} sub="Editable"/><Stat title="Net P&L" value={money(pnl,currency)} icon={<Activity/>} sub="Trade history"/><Stat title="Return" value={`${balance ? ((pnl/balance)*100).toFixed(2):"0.00"}%`} icon={<TrendingUp/>} sub="Demo return"/></div><Card title="Portfolio Settings"><div className="formSingle"><label>Account balance<input type="number" value={balance} onChange={e=>setBalance(+e.target.value)}/></label><p>Currency is controlled in RiskGuard. Your data is stored locally in this browser.</p></div></Card></div>}
function History({trades}: {trades: Trade[]}){return <div className="page"><Card title="Trade History"><div className="table history"><div className="tr head"><b>Symbol</b><b>Side</b><b>Entry</b><b>Exit</b><b>Qty</b><b>P&L</b></div>{trades.map((t,i)=><div className="tr" key={i}><b>{t.symbol}</b><span className={t.side==="BUY"?"positive":"negative"}>{t.side}</span><span>{t.entry}</span><span>{t.exit}</span><span>{t.qty}</span><strong className={t.pnl>=0?"positive":"negative"}>{t.pnl>=0?"+":""}{t.pnl}</strong></div>)}</div></Card></div>}
