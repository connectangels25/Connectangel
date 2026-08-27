import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  FolderLock,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  CheckCircle2,
  DollarSign,
  Clock,
  Info,
  Phone,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Filter,
  FileText,
  MessageSquare
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock Data for Charts
const portfolioGrowthData = [
  { year: "2021", value: 0.5, barVal: 1 },
  { year: "2022", value: 2.2, barVal: 2 },
  { year: "2023", value: 4.1, barVal: 3.5 },
  { year: "2024", value: 6.5, barVal: 5.5 },
  { year: "2025", value: 9.8, barVal: 8.2 },
];

const sectorData = [
  { name: "Technical", value: 35, color: "#0D5C46" },
  { name: "Seed", value: 25, color: "#10B981" },
  { name: "Healthcare", value: 20, color: "#34D399" },
  { name: "Alets", value: 10, color: "#F59E0B" },
  { name: "Other", value: 10, color: "#D97706" },
];

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const recommendedDeals = [
    {
      id: 1,
      name: "NeuralFlow AI",
      category: "Company",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "AI analysis highlights available",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: 2,
      name: "TechAI",
      category: "Company",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "AI analysis highlights available",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: 3,
      name: "MedAI",
      category: "Company",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "AI analysis highlights available",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  const portfolioList = [
    {
      id: 1,
      company: "NeuralFlow AI",
      sector: "AI Said Technology",
      investment: "$1MN",
      ownership: "100%",
      status: "Growth",
      statusColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 2,
      company: "TechAI",
      sector: "AI SaaS Technology",
      investment: "$150M",
      ownership: "100%",
      status: "Promote",
      statusColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    },
    {
      id: 3,
      company: "MedAI",
      sector: "AI SaaS Technology",
      investment: "$100M",
      ownership: "100%",
      status: "Promote",
      statusColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    },
    {
      id: 4,
      company: "MedAI",
      sector: "Economery",
      investment: "$15M",
      ownership: "100%",
      status: "Growth",
      statusColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ];

  const dueDiligenceList = [
    { id: 1, company: "NeuralFlow AI", match: "92% Match" },
    { id: 2, company: "NeuralFlow AI", match: "92% Match" },
    { id: 3, company: "MedAI", match: "92% Match" },
    { id: 4, company: "MedAI", match: "92% Match" },
  ];

  const filteredPortfolio = portfolioList.filter((item) =>
    item.company.toLowerCase().includes(tableSearch.toLowerCase()) ||
    item.sector.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090F15] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="h-16 bg-[#0E1620] border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-50">
        {/* Brand & Search */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ConnectAngels" className="h-8 w-auto" />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              ConnectAngels
            </span>
          </Link>

          {/* Search Input */}
          <div className="relative hidden md:block w-72 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Global startup Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131F2C] border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Right Section: Notifications & User Profile */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-[#131F2C] border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <button className="p-2 rounded-lg bg-[#131F2C] border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors">
            <Mail className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* User Badge */}
          <div className="flex items-center gap-3 pl-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="John Smith"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-100">John Smith</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-[10px] text-slate-400">Verified Angel Investor</p>
              <p className="text-[9px] text-emerald-400/80 font-mono tracking-tight">AI | SaaS | FinTech | $25K-$100K</p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER WITH SIDEBAR ================= */}
      <div className="flex flex-1">
        
        {/* LEFT VERTICAL SIDEBAR */}
        <aside className="w-16 bg-[#0E1620] border-r border-slate-800/80 flex flex-col items-center py-5 justify-between shrink-0">
          <div className="flex flex-col items-center gap-6 w-full">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "discover", icon: Compass, label: "Discover" },
              { id: "analytics", icon: TrendingUp, label: "Analytics" },
              { id: "vault", icon: FolderLock, label: "Data Room" },
              { id: "syndicates", icon: Users, label: "Syndicates" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-[#152331]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          <button
            title="Logout"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-[#152331] transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
          
          {/* TOP ROW: KPI CARDS & UPCOMING CALLS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            
            {/* KPI OVERVIEW CARDS (8 Cols) */}
            <div className="xl:col-span-8 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Investor KPI Overview Cards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* Total Capital Invested */}
                <div className="bg-[#101A24] border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-300">Total Capital Invested</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">$150,000</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">6 Startups</div>
                </div>

                {/* Portfolio Valuation */}
                <div className="bg-[#101A24] border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-300">Portfolio Valuation</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">$750,000</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">5x MOIC</div>
                </div>

                {/* Active Deal Flow */}
                <div className="bg-[#101A24] border border-slate-700/60 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-300">Active Deal Flow</span>
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-base font-extrabold text-white tracking-tight">24 New Deals</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Pending Review</div>
                </div>

                {/* Committed Capital */}
                <div className="bg-[#171612] border border-amber-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-amber-200/90">Committed Capital</span>
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-amber-100 tracking-tight">$50,000</div>
                  <div className="text-[10px] text-amber-400/80 font-medium mt-0.5">Pending Transfer</div>
                </div>

                {/* Upcoming Calls */}
                <div className="bg-[#121824] border border-indigo-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-indigo-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-300">Upcoming Calls</span>
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">3 Today</div>
                  <div className="text-[10px] text-indigo-300 font-medium mt-0.5">2 Founder Calls</div>
                </div>

              </div>
            </div>

            {/* UPCOMING CALLS CALENDAR WIDGET (4 Cols) */}
            <div className="xl:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Upcoming Calls Calendar
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-[11px] bg-[#14202B] border border-slate-700/60 text-slate-300 rounded-lg flex items-center gap-1 hover:text-white transition-colors">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Show Today 13
                  </button>
                  <button className="px-2 py-1 text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    + Founder
                  </button>
                </div>
              </div>

              <div className="bg-[#101A24] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between hover:border-emerald-500/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    Today, 2 Founder Calls
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>

          </div>

          {/* SECOND ROW: AI RECOMMENDED DEALS & PORTFOLIO GROWTH & UPDATES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* AI RECOMMENDED DEALS (6 Cols) */}
            <div className="lg:col-span-6 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-100">AI Recommended Deals</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dynamic startup quick cards for connect companies</p>
                </div>
                <button className="px-2.5 py-1 text-[11px] bg-[#162432] border border-slate-700/60 rounded-lg text-slate-300 flex items-center gap-1 hover:border-slate-500">
                  <TrendingUp className="w-3 h-3" />
                  Portfolio charts
                </button>
              </div>

              {/* Startup Deal Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-[#14212D] border border-slate-700/50 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-500/50 transition-all space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {deal.name[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{deal.name}</h4>
                            <span className="text-[9px] text-slate-400">{deal.category}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${deal.badgeColor}`}>
                          {deal.match}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-300 font-mono mb-2">
                        <span className="bg-[#1B2B3B] px-1.5 py-0.5 rounded text-slate-300">{deal.stage}</span>
                        <span className="bg-[#1B2B3B] px-1.5 py-0.5 rounded text-slate-300">{deal.raise}</span>
                        <span className="bg-[#1B2B3B] px-1.5 py-0.5 rounded text-slate-300">{deal.minInvest}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>AI analysis highlights</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button className="flex-1 py-1 text-[10px] font-medium bg-[#1B2B3B] text-slate-300 hover:text-white rounded border border-slate-700/60">
                        Pass
                      </button>
                      <button className="flex-1 py-1 text-[10px] font-medium bg-[#1B2B3B] text-slate-300 hover:text-white rounded border border-slate-700/60">
                        Save
                      </button>
                      <button className="flex-[2] py-1 text-[10px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded shadow-md transition-colors truncate px-1">
                        Request Data/Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PORTFOLIO GROWTH CHART (3 Cols) */}
            <div className="lg:col-span-3 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Portfolio Growth</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioGrowthData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0E1620", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                      itemStyle={{ color: "#10B981" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FOUNDER UPDATE FEED (3 Cols) */}
            <div className="lg:col-span-3 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">Founder Update Feed</h3>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-[#14212D] border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      F
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Founder Update</div>
                      <div className="text-[10px] text-slate-400">1 hours ago</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    NeuralFlow AI co-founders completed product release and metrics surpass expectations for MedAI.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#14212D] border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Aohn Updates</div>
                        <div className="text-[10px] text-slate-400">Recent update ago</div>
                      </div>
                    </div>
                    <button className="text-[10px] text-emerald-400 hover:underline">View All</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-[#1B2B3B] p-1.5 rounded">
                      <div className="font-bold text-slate-200">TechAI</div>
                      <div className="text-slate-400">Tom Raise +$1M</div>
                      <div className="text-emerald-400 font-semibold">Pending Trans +57%</div>
                    </div>
                    <div className="bg-[#1B2B3B] p-1.5 rounded">
                      <div className="font-bold text-slate-200">MedAI</div>
                      <div className="text-slate-400">$1M Raise</div>
                      <div className="text-emerald-400 font-semibold">$259K Valuation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* THIRD ROW: PORTFOLIO MANAGEMENT & SECTOR ALLOCATION & CIRCLES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* PORTFOLIO MANAGEMENT TABLE (6 Cols) */}
            <div className="lg:col-span-6 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-100">Portfolio Management</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="bg-[#14212D] border border-slate-700/60 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <button className="p-1.5 bg-[#14212D] border border-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2 px-3 w-8">
                        <input type="checkbox" className="rounded bg-slate-900 border-slate-700" />
                      </th>
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3">Sector</th>
                      <th className="py-2 px-3">Investments</th>
                      <th className="py-2 px-3">Ownership</th>
                      <th className="py-2 px-3 text-right">Growth Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPortfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-[#14212D]/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <input type="checkbox" className="rounded bg-slate-900 border-slate-700" />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                            {item.company[0]}
                          </div>
                          {item.company}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{item.sector}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-200">{item.investment}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{item.ownership}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTOR ALLOCATION PIE CHART (3 Cols) */}
            <div className="lg:col-span-3 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Sector Allocation</h3>
              <div className="flex items-center justify-between">
                <div className="w-32 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {sectorData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-300">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-center text-slate-400 pt-2 border-t border-slate-800">
                Portfolio Growth • Sector Allocation
              </div>
            </div>

            {/* CONNECTANGELS CIRCLES (INVESTOR NETWORK) (3 Cols) */}
            <div className="lg:col-span-3 bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">ConnectAngels Circles</h3>
                <p className="text-[10px] text-slate-400">Syndicate opportunities Investor network</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#14212D] border border-slate-700/50 rounded-xl p-2.5 space-y-2 hover:border-emerald-500/40 transition-colors">
                  <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 leading-tight">AI Healthcare Syndicate</h4>
                  <p className="text-[9px] text-slate-400">An syndicate opportunity to AI Healthcare syndicate.</p>
                  <button className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline pt-1">
                    Community &rarr;
                  </button>
                </div>

                <div className="bg-[#14212D] border border-slate-700/50 rounded-xl p-2.5 space-y-2 hover:border-emerald-500/40 transition-colors">
                  <div className="h-16 rounded-lg bg-gradient-to-br from-teal-900 to-slate-900 flex items-center justify-center text-teal-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 leading-tight">Community Q&A</h4>
                  <p className="text-[9px] text-slate-400">Community Q&A to discuss community Q&A and trends...</p>
                  <button className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline pt-1">
                    36 community &rarr;
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* FOURTH ROW: DUE DILIGENCE CENTER */}
          <div className="bg-[#101A24] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Due Diligence Center</h3>
                <p className="text-[11px] text-slate-400">Secure data room access for specific deals</p>
              </div>
              <button className="px-3 py-1.5 bg-[#14212D] border border-slate-700/60 text-slate-200 rounded-lg text-xs font-semibold hover:border-emerald-500/50 transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Secure Data Room
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dueDiligenceList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#14212D] border border-slate-700/50 rounded-xl p-3 flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {item.company[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{item.company}</h4>
                      <span className="text-[10px] text-emerald-400 font-medium">{item.match}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button className="px-2 py-1 bg-[#1B2B3B] text-[10px] text-slate-300 rounded border border-slate-700/60 hover:text-white">
                      Data Room
                    </button>
                    <button className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold rounded transition-colors">
                      Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
