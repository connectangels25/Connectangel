import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import Navbar from "@/components/Navbar";
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
  Menu,
  CheckCircle2,
  DollarSign,
  Clock,
  Info,
  Phone,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Filter,
  MoreVertical,
  FileText,
  X,
  Download,
  Loader2,
  Bookmark,
  CalendarDays
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

// Mock Data for Charts
const portfolioGrowthData = [
  { year: "2021", value: 0.5 },
  { year: "2022", value: 2.2 },
  { year: "2023", value: 4.1 },
  { year: "2024", value: 6.5 },
  { year: "2025", value: 9.8 },
];

const sectorData = [
  { name: "Technical", value: 35, color: "#8C3CDD" },
  { name: "Seed", value: 25, color: "#34C4A4" },
  { name: "Healthcare", value: 20, color: "#A55EF0" },
  { name: "Alets", value: 10, color: "#D4A84B" },
  { name: "Other", value: 10, color: "#5B84C4" },
];

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  
  // PDF Request Modal state
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // Document generation & download states per document title
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [readyPdfs, setReadyPdfs] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const recommendedDeals = [
    {
      id: 1,
      name: "NeuralFlow AI",
      category: "AI & DeepTech",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "High TAM • 4.2x Growth Rate",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: 2,
      name: "TechAI",
      category: "Enterprise SaaS",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "Strong Moat • Proprietary LLM",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: 3,
      name: "MedAI",
      category: "HealthTech AI",
      match: "92% Match",
      stage: "Seed",
      raise: "$1M Raise",
      minInvest: "$25K Min",
      aiHighlights: "FDA Cleared • Top Founders",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
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
      statusColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
    {
      id: 2,
      company: "TechAI",
      sector: "AI SaaS Technology",
      investment: "$150M",
      ownership: "100%",
      status: "Promote",
      statusColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: 3,
      company: "MedAI",
      sector: "AI SaaS Technology",
      investment: "$100M",
      ownership: "100%",
      status: "Promote",
      statusColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: 4,
      company: "MedAI",
      sector: "Economery",
      investment: "$15M",
      ownership: "100%",
      status: "Growth",
      statusColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
  ];

  const filteredPortfolio = portfolioList.filter((item) =>
    item.company.toLowerCase().includes(tableSearch.toLowerCase()) ||
    item.sector.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const pdfOptions = [
    { id: "summary", title: "Portfolio Investment Summary PDF", desc: "Overview of capital, valuation & MOIC returns" },
    { id: "safe", title: "Signed SAFE Agreement PDF", desc: "Legal investment contract & note terms" },
    { id: "deck", title: "Pitch Deck & Financials PDF", desc: "Company slide deck & financial projections" },
    { id: "tax", title: "Tax & Investment Receipt PDF", desc: "Official K-1 form & payment receipt" },
  ];

  const handleActionPdf = (pdfId: string, pdfTitle: string) => {
    if (readyPdfs[pdfId]) {
      toast.success(`Downloading ${pdfTitle} for ${selectedCompany}...`);
    } else {
      setGeneratingPdf(pdfId);
      toast.info(`Generating ${pdfTitle}...`);
      setTimeout(() => {
        setGeneratingPdf(null);
        setReadyPdfs((prev) => ({ ...prev, [pdfId]: true }));
        toast.success(`${pdfTitle} generated! Click download to save.`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#17141F] text-[#E4DFF0] flex flex-col font-sans selection:bg-[#8C3CDD]/40 selection:text-white">
      
      {/* WEBSITE MAIN NAVBAR */}
      <Navbar />

      {/* MAIN CONTAINER WITH SIDEBAR */}
      <div className="flex flex-1 relative">
        
        {/* LEFT EXPANDABLE SIDEBAR */}
        <aside
          className={`${
            isSidebarOpen ? "w-56" : "w-16"
          } bg-[#17141F] border-r border-purple-900/30 flex flex-col justify-between py-5 transition-all duration-300 shrink-0 z-40`}
        >
          <div className="flex flex-col gap-4 w-full px-3">
            {/* Sidebar Header Title & Toggle */}
            <div className="flex items-center justify-between p-1.5">
              {isSidebarOpen ? (
                <span className="text-sm font-extrabold bg-gradient-to-r from-purple-300 via-purple-200 to-teal-300 bg-clip-text text-transparent truncate px-1">
                  Investor Portal
                </span>
              ) : (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 rounded-lg text-purple-300 hover:bg-[#26212F] mx-auto hover:text-white transition-colors"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-[#9B92AD] hover:text-white hover:bg-[#26212F] transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="h-px bg-purple-900/30 my-1" />

            {/* Nav Menu Items */}
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "discover", icon: Compass, label: "Discover Deals" },
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
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#8C3CDD] text-white shadow-lg shadow-purple-900/50 font-semibold"
                      : "text-[#9B92AD] hover:text-white hover:bg-[#26212F]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="text-xs truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="px-3">
            <button
              title="Logout"
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[#9B92AD] hover:text-rose-400 hover:bg-[#26212F] transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-xs truncate font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
          
          {/* TOP ROW: KPI CARDS & UPCOMING CALLS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B92AD]">
                Investor KPI Overview Cards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-[#26212F] border border-teal-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-teal-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-[#E4DFF0]">Total Capital Invested</span>
                    <div className="w-6 h-6 rounded-md bg-teal-500/15 text-[#34C4A4] flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">$150,000</div>
                  <div className="text-[10px] text-[#34C4A4] font-medium mt-0.5">6 Startups</div>
                </div>

                <div className="bg-[#26212F] border border-purple-500/40 rounded-xl p-3.5 relative overflow-hidden group hover:border-purple-500/70 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-[#E4DFF0]">Portfolio Valuation</span>
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">$750,000</div>
                  <div className="text-[10px] text-purple-300 font-medium mt-0.5">5x MOIC</div>
                </div>

                <div className="bg-[#26212F] border border-purple-900/40 rounded-xl p-3.5 relative overflow-hidden group hover:border-purple-600 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-[#E4DFF0]">Active Deal Flow</span>
                    <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-base font-extrabold text-white tracking-tight">24 New Deals</div>
                  <div className="text-[10px] text-[#9B92AD] font-medium mt-0.5">Pending Review</div>
                </div>

                <div className="bg-[#26212F] border border-amber-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-amber-200">Committed Capital</span>
                    <div className="w-6 h-6 rounded-md bg-amber-500/15 text-[#D4A84B] flex items-center justify-center">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-amber-100 tracking-tight">$50,000</div>
                  <div className="text-[10px] text-[#D4A84B] font-medium mt-0.5">Pending Transfer</div>
                </div>

                <div className="bg-[#26212F] border border-indigo-500/30 rounded-xl p-3.5 relative overflow-hidden group hover:border-indigo-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-[#E4DFF0]">Upcoming Calls</span>
                    <div className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-tight">3 Today</div>
                  <div className="text-[10px] text-indigo-300 font-medium mt-0.5">2 Founder Calls</div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B92AD]">
                  Upcoming Calls Calendar
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-[11px] bg-[#26212F] border border-purple-900/40 text-[#E4DFF0] rounded-lg flex items-center gap-1 hover:border-[#8C3CDD] transition-colors">
                    <Calendar className="w-3 h-3 text-[#9B92AD]" />
                    Show Today 13
                  </button>
                  <button className="px-2 py-1 text-[11px] bg-[#8C3CDD]/15 border border-[#8C3CDD]/40 text-purple-300 rounded-lg hover:bg-[#8C3CDD]/30 transition-colors">
                    + Founder
                  </button>
                </div>
              </div>

              <div className="bg-[#26212F] border border-purple-900/40 rounded-xl p-3 flex items-center justify-between hover:border-[#8C3CDD] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34C4A4] animate-pulse" />
                  <span className="text-xs font-semibold text-[#E4DFF0] group-hover:text-purple-300 transition-colors">
                    Today, 2 Founder Calls
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9B92AD] group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
          </div>

          {/* SECOND ROW: AI RECOMMENDED DEALS & PORTFOLIO GROWTH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-[#26212F] border border-purple-900/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A55EF0]" />
                    <h3 className="text-sm font-bold text-white">AI Recommended Deals</h3>
                  </div>
                  <p className="text-[11px] text-[#9B92AD] mt-0.5">Dynamic startup quick cards for connect companies</p>
                </div>
                <button className="px-2.5 py-1 text-[11px] bg-[#2D2838] border border-purple-900/40 rounded-lg text-[#E4DFF0] flex items-center gap-1 hover:border-[#8C3CDD]">
                  <TrendingUp className="w-3 h-3 text-purple-300" />
                  Portfolio charts
                </button>
              </div>

              {/* Startup Deal Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-[#2D2838] border border-purple-900/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#8C3CDD] transition-all space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#8C3CDD]/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                            {deal.name[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">{deal.name}</h4>
                            <span className="text-[10px] text-[#9B92AD]">{deal.category}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${deal.badgeColor}`}>
                          {deal.match}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap text-[10px] text-[#E4DFF0] font-mono">
                        <span className="bg-[#1F1B28] px-1.5 py-0.5 rounded border border-purple-900/40">{deal.stage}</span>
                        <span className="bg-[#1F1B28] px-1.5 py-0.5 rounded border border-purple-900/40">{deal.raise}</span>
                        <span className="bg-[#1F1B28] px-1.5 py-0.5 rounded border border-purple-900/40">{deal.minInvest}</span>
                      </div>

                      {/* AI Analysis Highlights Box */}
                      <div className="p-2 rounded-lg bg-[#1F1B28]/80 border border-purple-900/40 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#A55EF0] shrink-0" />
                        <span className="text-[10px] font-semibold text-purple-200 truncate">
                          {deal.aiHighlights}
                        </span>
                      </div>
                    </div>

                    {/* Properly Cleaned Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => toast.info(`Passed ${deal.name}`)}
                        className="px-2 py-1.5 text-[11px] font-medium bg-[#1F1B28] text-[#9B92AD] hover:text-white rounded-lg border border-purple-900/40 transition-colors"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => toast.success(`Saved ${deal.name}`)}
                        className="px-2 py-1.5 text-[11px] font-medium bg-[#1F1B28] text-[#9B92AD] hover:text-white rounded-lg border border-purple-900/40 transition-colors flex items-center gap-1"
                      >
                        <Bookmark className="w-3 h-3 text-purple-300" />
                        Save
                      </button>
                      <button
                        onClick={() => toast.success(`Requested pitch meeting for ${deal.name}`)}
                        className="flex-1 py-1.5 px-2 text-[11px] font-bold bg-gradient-to-r from-[#8C3CDD] to-[#A55EF0] hover:from-[#7A32C4] hover:to-[#934DE0] text-white rounded-lg shadow-sm transition-all text-center whitespace-nowrap truncate"
                      >
                        Request Data
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#26212F] border border-purple-900/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">Portfolio Growth</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioGrowthData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8C3CDD" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#8C3CDD" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#9B92AD" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9B92AD" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#17141F", borderColor: "#8C3CDD", borderRadius: "8px", fontSize: "11px", color: "#E4DFF0" }}
                      itemStyle={{ color: "#A55EF0" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#A55EF0" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* THIRD ROW: PORTFOLIO MANAGEMENT & SECTOR ALLOCATION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* PORTFOLIO MANAGEMENT TABLE (7 Cols) */}
            <div className="lg:col-span-7 bg-[#26212F] border border-purple-900/30 rounded-xl p-4 space-y-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">Portfolio Management</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B92AD]" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="bg-[#2D2838] border border-purple-900/40 rounded-lg pl-8 pr-3 py-1 text-[11px] text-[#E4DFF0] placeholder-[#9B92AD] focus:outline-none focus:border-[#8C3CDD]"
                    />
                  </div>
                  <button className="p-1.5 bg-[#2D2838] border border-purple-900/40 rounded-lg text-[#9B92AD] hover:text-white">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-purple-900/40 text-[#9B92AD] font-semibold text-[11px]">
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3">Sector</th>
                      <th className="py-2 px-3">Investments</th>
                      <th className="py-2 px-3">Ownership</th>
                      <th className="py-2 px-3">Growth Status</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {filteredPortfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-[#2D2838]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-[#8C3CDD]/20 text-purple-300 flex items-center justify-center text-[10px]">
                            {item.company[0]}
                          </div>
                          {item.company}
                        </td>
                        <td className="py-2.5 px-3 text-[#E4DFF0]">{item.sector}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-white">{item.investment}</td>
                        <td className="py-2.5 px-3 font-mono text-[#E4DFF0]">{item.ownership}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="p-1 rounded bg-[#1F1B28] hover:bg-[#8C3CDD]/30 border border-purple-900/40 text-purple-300 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popover Dropdown Menu */}
                          {openMenuId === item.id && (
                            <div className="absolute right-3 top-10 w-44 bg-[#1F1B28] border border-purple-900/80 rounded-xl shadow-2xl p-1.5 z-30 text-left space-y-1">
                              <button
                                onClick={() => {
                                  setSelectedCompany(item.company);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-purple-200 hover:bg-[#8C3CDD]/30 rounded-lg transition-colors font-medium"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#34C4A4]" />
                                Request PDF
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTOR ALLOCATION PIE CHART (5 Cols) */}
            <div className="lg:col-span-5 bg-[#26212F] border border-purple-900/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">Sector Allocation</h3>
              <div className="flex items-center justify-around py-2">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
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

                <div className="space-y-2 text-xs">
                  {sectorData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[#E4DFF0] font-medium">{s.name} ({s.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-center text-[#9B92AD] pt-2 border-t border-purple-900/30">
                Portfolio Growth • Sector Allocation
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* ================= REQUEST PDF MODAL DIALOG ================= */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#211D2A] border border-purple-900/80 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#34C4A4]" />
                <h3 className="text-sm font-bold text-white">Select PDF for {selectedCompany}</h3>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-lg text-[#9B92AD] hover:text-white hover:bg-purple-900/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9B92AD]">
              Choose the document type you want to generate or download:
            </p>

            <div className="space-y-2">
              {pdfOptions.map((pdf) => {
                const isReady = readyPdfs[pdf.id];
                const isGenerating = generatingPdf === pdf.id;

                return (
                  <div
                    key={pdf.id}
                    className="p-3 rounded-xl bg-[#17141F] border border-purple-900/40 flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {pdf.title}
                        {isReady && <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-[#34C4A4]">Ready</span>}
                      </h4>
                      <p className="text-[10px] text-[#9B92AD]">{pdf.desc}</p>
                    </div>

                    <button
                      onClick={() => handleActionPdf(pdf.id, pdf.title)}
                      disabled={isGenerating}
                      className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
                        isReady
                          ? "bg-teal-500/20 border border-teal-500/40 text-[#34C4A4] hover:bg-teal-500/30"
                          : isGenerating
                          ? "bg-purple-900/30 text-purple-400 border border-purple-900/40 cursor-not-allowed"
                          : "bg-[#26212F] text-slate-500 border border-purple-900/30 hover:text-purple-300 hover:border-purple-600"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span className="text-[10px]">Generating...</span>
                        </>
                      ) : isReady ? (
                        <>
                          <Download className="w-4 h-4 text-[#34C4A4]" />
                          <span className="text-[10px]">Download</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-slate-500" />
                          <span className="text-[10px]">Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
