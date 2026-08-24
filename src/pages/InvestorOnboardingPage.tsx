import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import logo from "@/assets/logo.png";
import {
  Upload,
  Building,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Sparkles,
  CheckCircle2,
  User,
  Twitter,
  Instagram,
  Github,
  Plus,
  X,
  ArrowRight,
  ArrowUp
} from "lucide-react";

interface FormData {
  // Step 1
  investorName: string;
  organizationName: string;
  profilePhoto: string | null;
  investorType: string;
  country: string;
  state: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  preferredContact: "Email" | "Phone" | "both";

  // Step 2
  currency: string;
  minInvestment: string;
  maxInvestment: string;
  totalInvestedTillNow: string;
  domains: string[];
  geography: string[];
  fundingTypes: string[];
  equityPreference: string;
  previousInvestments: string;
  startupRequirements: string;
  founderRequirements: string;
  dealPreferences: string;

  // Step 3
  industryExpertise: string[];
  portfolioCompanies: string;
  mentorshipAvailable: boolean;
  successfulExits: string;
  shortBio: string;
  proofDocument: string | null;
  emailVerified: boolean;
  previewCode: string;
  termsAgreed: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  // Step 1
  investorName: "",
  organizationName: "",
  profilePhoto: null,
  investorType: "Angel Investor",
  country: "",
  state: "",
  city: "",
  email: "",
  phone: "",
  website: "",
  linkedin: "",
  preferredContact: "Email",

  // Step 2
  currency: "USD ($)",
  minInvestment: "",
  maxInvestment: "",
  totalInvestedTillNow: "",
  domains: [],
  geography: [],
  fundingTypes: [],
  equityPreference: "",
  previousInvestments: "",
  startupRequirements: "",
  founderRequirements: "",
  dealPreferences: "",

  // Step 3
  industryExpertise: [],
  portfolioCompanies: "",
  mentorshipAvailable: false,
  successfulExits: "",
  shortBio: "",
  proofDocument: null,
  emailVerified: false,
  previewCode: "",
  termsAgreed: false,
};

const ALL_DOMAINS = [
  "AI & Machine Learning",
  "SaaS",
  "FinTech",
  "HealthCare",
  "EdTech",
  "E-commerce",
  "Cybersecurity",
  "Web3 / Crypto",
  "CleanTech",
  "DeepTech",
  "Consumer Brands"
];

const GEOGRAPHY_OPTIONS = ["India", "Asia", "Global", "North America", "Europe"];
const FUNDING_OPTIONS = ["Equity", "Debt", "Grant"];

export default function InvestorOnboardingPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [newTag, setNewTag] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      updateField("profilePhoto", file.name);
      toast.success("Profile photo uploaded successfully");
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setDocName(file.name);
      updateField("proofDocument", file.name);
      toast.success("Credential document uploaded");
    }
  };

  const toggleDomain = (domain: string) => {
    setFormData((prev) => {
      const exists = prev.domains.includes(domain);
      return {
        ...prev,
        domains: exists
          ? prev.domains.filter((d) => d !== domain)
          : [...prev.domains, domain],
      };
    });
  };

  const toggleGeo = (geo: string) => {
    setFormData((prev) => {
      const exists = prev.geography.includes(geo);
      return {
        ...prev,
        geography: exists
          ? prev.geography.filter((g) => g !== geo)
          : [...prev.geography, geo],
      };
    });
  };

  const toggleFunding = (funding: string) => {
    setFormData((prev) => {
      const exists = prev.fundingTypes.includes(funding);
      return {
        ...prev,
        fundingTypes: exists
          ? prev.fundingTypes.filter((f) => f !== funding)
          : [...prev.fundingTypes, funding],
      };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.industryExpertise.includes(newTag.trim())) {
      updateField("industryExpertise", [...formData.industryExpertise, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    updateField(
      "industryExpertise",
      formData.industryExpertise.filter((t) => t !== tag)
    );
  };

  const calculateProgress = () => {
    let score = 0;
    // Step 1 fields
    if (formData.investorName) score += 10;
    if (formData.organizationName) score += 10;
    if (formData.email) score += 10;
    if (photoPreview) score += 10;
    
    // Step 2 fields
    if (formData.domains.length > 0) score += 15;
    if (formData.minInvestment && formData.maxInvestment) score += 15;
    if (formData.fundingTypes.length > 0) score += 10;

    // Step 3 fields
    if (formData.industryExpertise.length > 0) score += 10;
    if (formData.shortBio) score += 5;
    if (formData.emailVerified) score += 5;

    return Math.min(score, activeStep === 1 ? 35 : activeStep === 2 ? 65 : 95);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
  };

  const handleSendVerification = () => {
    updateField("emailVerified", true);
    toast.success(`Verification link sent to ${formData.email || "your email"}`);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!formData.investorName.trim()) {
        toast.error("Please enter your Investor Name");
        return;
      }
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeStep === 2) {
      setActiveStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeStep === 3) {
      if (!formData.termsAgreed) {
        toast.error("Please agree to the LaunchPad Terms of Service");
        return;
      }
      toast.success("Investor Profile Published Successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progressPercent = calculateProgress();

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* WEBSITE NAVBAR */}
      <Navbar />

      {/* STEPPER NAVIGATION BAR */}
      <div className="bg-[#0C0D14] border-b border-slate-800/60 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-medium">
          {/* Step 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2.5 cursor-pointer transition-colors ${
              activeStep === 1
                ? "text-purple-400 font-semibold"
                : activeStep > 1
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                activeStep === 1
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/40 ring-2 ring-purple-400/50"
                  : activeStep > 1
                  ? "bg-purple-950 border border-purple-500 text-purple-400"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {activeStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            <span>Investor Identity & Contact</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-800 mx-3 sm:mx-6" />

          {/* Step 2 */}
          <div
            onClick={() => activeStep >= 2 && setActiveStep(2)}
            className={`flex items-center gap-2.5 ${
              activeStep >= 2 ? "cursor-pointer" : "cursor-not-allowed"
            } transition-colors ${
              activeStep === 2
                ? "text-purple-400 font-semibold"
                : activeStep > 2
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                activeStep === 2
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/40 ring-2 ring-purple-400/50"
                  : activeStep > 2
                  ? "bg-purple-950 border border-purple-500 text-purple-400"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {activeStep > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
            </div>
            <span>Investment Profile</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-800 mx-3 sm:mx-6" />

          {/* Step 3 */}
          <div
            onClick={() => activeStep >= 3 && setActiveStep(3)}
            className={`flex items-center gap-2.5 ${
              activeStep >= 3 ? "cursor-pointer" : "cursor-not-allowed"
            } transition-colors ${
              activeStep === 3
                ? "text-purple-400 font-semibold"
                : "text-slate-500"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                activeStep === 3
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/40 ring-2 ring-purple-400/50"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              3
            </div>
            <span>Experience & Publish</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* FORM AREA (Left Column - 8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Titles per Step */}
            <div>
              <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
                {activeStep === 1 && "STEP 1: IDENTITY & CONTACT"}
                {activeStep === 2 && "STEP 2: THESIS & CAPACITY"}
                {activeStep === 3 && "STEP 3: EXPERIENCES & PUBLISH"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                {activeStep === 1 && (
                  <>
                    <span className="text-purple-400">Investor</span> Identity & Contact
                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <span className="text-purple-400">Investment</span> Profile
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    <span className="text-purple-400">Experience</span> & Publish
                  </>
                )}
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                {activeStep === 1 &&
                  "Define your investor persona and primary contact details for network matching and communications. High-quality profiles receive 3x more deal flow opportunities."}
                {activeStep === 2 &&
                  "Specify your cheque sizes, preferred domains, and regional focus to receive high-fit startup proposals."}
                {activeStep === 3 &&
                  "CREDENTIALS & FINAL REVIEW. Define your expertise, add credentials, and perform identity verification before your profile goes live."}
              </p>
            </div>

            {/* STEP 1 CONTENT */}
            {activeStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                {/* Investor Identity Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Investor Identity</h2>
                    <span className="text-xs text-slate-400 font-normal">(Mandatory)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Investor Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Investor Name <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.investorName}
                        onChange={(e) => updateField("investorName", e.target.value)}
                        placeholder="e.g. Alex Chen"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                      />
                    </div>

                    {/* Photo Upload Area */}
                    <div className="row-span-2 space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Profile Photo / Logo
                      </label>
                      <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl p-5 text-center flex flex-col items-center justify-center bg-[#141722]/50 hover:bg-[#141722] transition-all group cursor-pointer h-[155px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        {photoPreview ? (
                          <div className="flex items-center gap-4 text-left">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/50 shadow-md"
                            />
                            <div>
                              <p className="text-xs font-semibold text-white">Photo Uploaded</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Click or drag to replace</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 group-hover:bg-purple-950 group-hover:text-purple-400 transition-colors">
                              <Upload className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                            </div>
                            <p className="text-xs font-semibold text-slate-300">Upload Photo/Logo</p>
                            <p className="text-[10px] text-slate-500 mt-1">Max 5MB • PNG, JPG</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Organization Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Organization Name <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => updateField("organizationName", e.target.value)}
                        placeholder="e.g. Apex Capital"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Investor Type & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Investor Type</label>
                      <select
                        value={formData.investorType}
                        onChange={(e) => updateField("investorType", e.target.value)}
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="Angel Investor">Angel Investor</option>
                        <option value="Venture Capital (VC)">Venture Capital (VC)</option>
                        <option value="Syndicate Lead">Syndicate Lead</option>
                        <option value="Limited Partner (LP)">Limited Partner (LP)</option>
                        <option value="Family Office">Family Office</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Country <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="e.g. USA"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="e.g. CA"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-3 md:col-span-1">
                      <label className="text-xs font-semibold text-slate-300">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g. San Francisco"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Contact Details</h2>
                    <span className="text-xs text-slate-400 font-normal">(Mandatory & Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Email <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="e.g. alex.chen@apex.com"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Phone Number <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="e.g. +1 555-123-4567"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Website</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          placeholder="Website URL"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">LinkedIn Profile</label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => updateField("linkedin", e.target.value)}
                          placeholder="LinkedIn Profile URL"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Preferred Contact Method
                    </label>
                    <div className="flex items-center gap-6">
                      {(["Email", "Phone", "both"] as const).map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="contactMethod"
                            checked={formData.preferredContact === method}
                            onChange={() => updateField("preferredContact", method)}
                            className="w-4 h-4 text-purple-600 bg-slate-900 border-slate-700 focus:ring-purple-500"
                          />
                          {method === "both" ? "both" : method}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 CONTENT */}
            {activeStep === 2 && (
              <div className="space-y-8 animate-fadeIn">
                {/* Investment Preferences Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Investment Preferences</h2>
                    <span className="text-xs text-slate-400 font-normal">(Mandatory)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Investment Range */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Investment Range <span className="text-purple-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.currency}
                          onChange={(e) => updateField("currency", e.target.value)}
                          className="bg-[#141722] border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-3 py-3 outline-none"
                        >
                          <option value="USD ($)">USD ($)</option>
                          <option value="EUR (€)">EUR (€)</option>
                          <option value="GBP (£)">GBP (£)</option>
                          <option value="INR (₹)">INR (₹)</option>
                        </select>
                        <input
                          type="text"
                          value={formData.minInvestment}
                          onChange={(e) => updateField("minInvestment", e.target.value)}
                          placeholder="Min"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 outline-none"
                        />
                        <input
                          type="text"
                          value={formData.maxInvestment}
                          onChange={(e) => updateField("maxInvestment", e.target.value)}
                          placeholder="Max"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* Total Capital Invested Till Now */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Total Capital Invested Till Now
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#141722] border border-slate-800 text-xs font-medium text-purple-400 rounded-xl px-3 py-3 select-none">
                          {formData.currency || "USD ($)"}
                        </div>
                        <input
                          type="text"
                          value={formData.totalInvestedTillNow}
                          onChange={(e) => updateField("totalInvestedTillNow", e.target.value)}
                          placeholder="e.g. 500,000 or 2M+"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Preferred Geography */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Preferred Geography</label>
                      <div className="flex flex-wrap gap-4 pt-2">
                        {GEOGRAPHY_OPTIONS.map((geo) => (
                          <label key={geo} className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.geography.includes(geo)}
                              onChange={() => toggleGeo(geo)}
                              className="w-4 h-4 rounded border-slate-700 text-purple-600 bg-slate-900 focus:ring-purple-500"
                            />
                            {geo}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Startup Domains Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Preferred Startup Domains <span className="text-purple-400">*</span>
                    </label>
                    <div className="bg-[#141722] border border-slate-800 rounded-xl p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {ALL_DOMAINS.map((domain) => {
                        const isSelected = formData.domains.includes(domain);
                        return (
                          <div
                            key={domain}
                            onClick={() => toggleDomain(domain)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "bg-purple-950/60 border border-purple-500/40 text-purple-300"
                                : "hover:bg-slate-800/50 text-slate-300"
                            }`}
                          >
                            <span className="text-xs font-medium">{domain}</span>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isSelected
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Preferences Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Additional Preferences</h2>
                    <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Funding Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Funding Type *</label>
                      <div className="flex items-center gap-4 pt-2">
                        {FUNDING_OPTIONS.map((type) => (
                          <label key={type} className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.fundingTypes.includes(type)}
                              onChange={() => toggleFunding(type)}
                              className="w-4 h-4 rounded border-slate-700 text-purple-600 bg-slate-900 focus:ring-purple-500"
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Equity Preference */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Equity Preference *</label>
                      <input
                        type="text"
                        value={formData.equityPreference}
                        onChange={(e) => updateField("equityPreference", e.target.value)}
                        placeholder="e.g. % range"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Text Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Previous Investments</label>
                      <textarea
                        rows={3}
                        value={formData.previousInvestments}
                        onChange={(e) => updateField("previousInvestments", e.target.value)}
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-slate-100 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Startup Requirements</label>
                      <textarea
                        rows={3}
                        value={formData.startupRequirements}
                        onChange={(e) => updateField("startupRequirements", e.target.value)}
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-slate-100 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Founder Requirements</label>
                      <textarea
                        rows={3}
                        value={formData.founderRequirements}
                        onChange={(e) => updateField("founderRequirements", e.target.value)}
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-slate-100 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 CONTENT */}
            {activeStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                {/* Optional Information Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Optional Information</h2>
                    <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Industries Expertise (Tag Input) */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Industries Expertise <span className="text-purple-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="Multi tag input, e.g. SaaS, FinTech"
                          className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.industryExpertise.map((tag) => (
                          <span
                            key={tag}
                            className="bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                          >
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-white"
                              onClick={() => removeTag(tag)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Companies */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Portfolio Companies <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.portfolioCompanies}
                        onChange={(e) => updateField("portfolioCompanies", e.target.value)}
                        placeholder="Add names/links"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>

                    {/* Mentorship Availability (Toggle Switch) */}
                    <div className="space-y-2 flex flex-col justify-center">
                      <label className="text-xs font-semibold text-slate-300">
                        Mentorship Availability <span className="text-purple-400">*</span>
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => updateField("mentorshipAvailable", !formData.mentorshipAvailable)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
                            formData.mentorshipAvailable ? "bg-purple-600 justify-end" : "bg-slate-800 justify-start"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                        <span className="text-xs text-slate-300 font-medium">
                          {formData.mentorshipAvailable ? "Available to Mentor Startups" : "Not Available"}
                        </span>
                      </div>
                    </div>

                    {/* Successful Exits */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Successful Exits <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.successfulExits}
                        onChange={(e) => updateField("successfulExits", e.target.value)}
                        placeholder="e.g. 2 IPOs, 3 Acquisitions"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Short Bio */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      About Investor / Short Bio <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.shortBio}
                      onChange={(e) => updateField("shortBio", e.target.value)}
                      placeholder="About Bio..."
                      className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl p-4 text-sm text-slate-100 outline-none resize-none placeholder-slate-500"
                    />
                  </div>

                  {/* Document Upload Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Upload Proof / Documents
                    </label>
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-xl p-6 text-center bg-[#141722]/50 hover:bg-[#141722] transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleDocUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-950 group-hover:text-purple-400 transition-colors">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-200">
                        {docName ? `Uploaded: ${docName}` : "Upload Credentials/Fund Decks"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">(PDF/Doc, Max 10MB)</p>
                    </div>
                  </div>
                </div>

                {/* Mandatory Finalization Section */}
                <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white">Mandatory Finalization</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    {/* Verify Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Verify Email <span className="text-purple-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          formData.emailVerified
                            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                            : "bg-[#141722] border-slate-800 text-slate-200 hover:border-purple-500"
                        }`}
                      >
                        {formData.emailVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Verification Link Sent!
                          </>
                        ) : (
                          "Send Verification Link"
                        )}
                      </button>
                    </div>

                    {/* Profile Preview (Optional Code) */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Profile Preview (optional) <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.previewCode}
                        onChange={(e) => updateField("previewCode", e.target.value)}
                        placeholder="Code"
                        className="w-full bg-[#141722] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAgreed}
                        onChange={(e) => updateField("termsAgreed", e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-purple-600 bg-slate-900 focus:ring-purple-500 mt-0.5"
                      />
                      <span className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-200">Terms of Service & Publish Agreement</strong>
                        <br />
                        I agree to the LaunchPad Terms of Service and data usage policy.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM NAVIGATION ACTIONS */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeStep === 1
                    ? "opacity-40 border-slate-800 text-slate-600 cursor-not-allowed"
                    : "border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-200"
                >
                  {activeStep === 3 ? "Publish Investor Profile" : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR PREVIEW & TIPS (Right Column - 4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* LIVE PROFILE CARD PREVIEW */}
            <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b border-slate-800/60 bg-[#12141F]">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Live Profile Card Preview
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5 text-center">
                {/* Header Banner */}
                <div className="h-20 -mx-6 -mt-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                </div>

                {/* Avatar Overlap */}
                <div className="relative -mt-14 inline-block">
                  <div className="w-20 h-20 rounded-full bg-slate-900 ring-4 ring-[#0E1017] overflow-hidden shadow-xl mx-auto flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-purple-600 rounded-full border-2 border-[#0E1017] flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">
                    {formData.investorName || "Your Name"}
                  </h4>
                  <p className="text-xs font-medium text-slate-400">
                    {formData.investorType || "Angel Investor"}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60 text-left text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formData.organizationName || "Organization Name"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formData.city || formData.state || formData.country ? (
                        <>
                          {formData.city}
                          {formData.state ? `${formData.city ? ", " : ""}${formData.state}` : ""}
                          {formData.country ? `${formData.city || formData.state ? ", " : ""}${formData.country}` : ""}
                        </>
                      ) : (
                        "Location"
                      )}
                    </span>
                  </div>
                </div>

                {/* Profile Completion Bar */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400 uppercase tracking-wider">PROFILE COMPLETED</span>
                    <span className="text-purple-400 font-bold">{progressPercent}% COMPLETED</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ELITE CURATOR TIP */}
            <div className="bg-[#12101F] border border-purple-900/40 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    ELITE CURATOR TIP
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A complete profile with a profile photo and logo builds trust. Verified profiles see{" "}
                    <strong className="text-white font-semibold">85% higher network engagement</strong> from top-tier founders.
                  </p>
                </div>
              </div>
              <a
                href="#verification"
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold pt-1"
              >
                Learn about profile verification <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* NEED HELP ONBOARDING? */}
            <div className="bg-[#0E1017] border border-slate-800/80 rounded-2xl p-5 text-center space-y-2">
              <p className="text-xs font-bold text-white">Need help onboarding?</p>
              <p className="text-[11px] text-slate-400">
                Our support team is available 24/7 for white-glove setup.
              </p>
              <button
                type="button"
                onClick={() => toast.info("Support team notified. We will reach out shortly.")}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline pt-1 block mx-auto"
              >
                Contact Onboarding Support
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* CONNECTANGELS WEBSITE FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#07080D] mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800/60">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="ConnectAngels" className="h-10 sm:h-12 w-auto" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                ConnectAngels connects founders, incubators, and investors across regions to drive innovation, capital access, and sustainable growth.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {[
                  { name: "Twitter", icon: Twitter, href: "#" },
                  { name: "LinkedIn", icon: Linkedin, href: "#" },
                  { name: "Instagram", icon: Instagram, href: "#" },
                  { name: "GitHub", icon: Github, href: "#" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/40 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/events" className="hover:text-purple-400 transition-colors">Events</Link></li>
                <li><Link to="/potential" className="hover:text-purple-400 transition-colors">Potential Startups</Link></li>
                <li><Link to="/chat" className="hover:text-purple-400 transition-colors">Network Chat</Link></li>
                <li><Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing Plans</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                <li><a href="#about" className="hover:text-purple-400 transition-colors">About Us</a></li>
                <li><a href="#careers" className="hover:text-purple-400 transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Contact Us</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>connectangels25@gmail.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>+91 84220 60195</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-500 gap-4">
            <p>© 2026 ConnectAngels Global. All rights reserved.</p>
            <div className="flex items-center gap-6 text-slate-400">
              <a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a>
              <a href="#cookies" className="hover:text-slate-200 transition-colors">Cookie Policy</a>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              Back to Top
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
