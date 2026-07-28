import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import logo from '@/assets/logo.png';
import { 
  Shield, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  FileText, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Plus, 
  Trash2,
  Sparkles,
  Zap,
  Award,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  // Step 1
  incubatorName: string;
  location: string;
  shortDescription: string;
  contactEmail: string;
  logo: string | null;
  banner: string | null;

  // Step 2
  aboutIncubator: string;
  missionStatement: string;
  vision: string;
  history: string;

  // Step 3
  startupStage: string;
  industryFocus: string;
  teamSize: string;
  geographicFocus: string;
  businessModel: string;

  // Step 4
  mentorshipSupport: string;
  benefitsProvided: string;
  fundingSupport: string;
  workspaceSupport: string;
  technicalSupport: string;
  trainingProgram: string;

  // Step 5
  eligibilityCriteria: string;
  applicationRequirements: string;
  teamRequirements: string;
  requiredDocs: { id: string; name: string; size: string }[];
}

const CircularProgress = ({ value }: { value: number }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * value) / 100;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          className="text-secondary"
          fill="transparent"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-sm font-extrabold text-foreground tracking-tight">
        {value}%
      </span>
    </div>
  );
};

const DraftItem = ({ label, value }: { label: string; value: string }) => {
  const isFilled = Boolean(value && value.trim().length > 0);
  return (
    <div className={`p-3 rounded-xl border text-xs transition-all ${
      isFilled 
        ? 'bg-primary/5 border-primary/30 text-foreground shadow-sm' 
        : 'bg-background/40 border-border/70 text-muted-foreground'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/90">{label}</span>
        {isFilled ? (
          <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Filled
          </span>
        ) : (
          <span className="text-[9px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded border border-border font-medium">
            Empty
          </span>
        )}
      </div>
      <p className={`text-xs break-words leading-relaxed ${isFilled ? 'text-foreground font-medium' : 'text-muted-foreground/60 italic'}`}>
        {isFilled ? value : 'Not provided yet...'}
      </p>
    </div>
  );
};

export default function TestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeDraftTab, setActiveDraftTab] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    incubatorName: '',
    location: '',
    shortDescription: '',
    contactEmail: '',
    logo: null,
    banner: null,

    aboutIncubator: '',
    missionStatement: '',
    vision: '',
    history: '',

    startupStage: '',
    industryFocus: '',
    teamSize: '',
    geographicFocus: '',
    businessModel: '',

    mentorshipSupport: '',
    benefitsProvided: '',
    fundingSupport: '',
    workspaceSupport: '',
    technicalSupport: '',
    trainingProgram: '',

    eligibilityCriteria: '',
    applicationRequirements: '',
    teamRequirements: '',
    requiredDocs: []
  });

  const steps = [
    { id: 1, name: 'Incubator Identity', badge: 'RECRUITMENT INTEGRITY' },
    { id: 2, name: 'About Incubator', badge: 'CORE NARRATIVE' },
    { id: 3, name: 'Startup Focus', badge: 'INVESTMENT THESIS' },
    { id: 4, name: 'Support & Benefits', badge: 'VALUE PROPOSITION' },
    { id: 5, name: 'Eligibility criteria', badge: 'REQUIREMENTS' }
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange(field, event.target?.result as string);
        toast.success(`${field === 'logo' ? 'Logo' : 'Cover Banner'} uploaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (field: 'logo' | 'banner') => {
    handleInputChange(field, null);
    toast.info(`${field === 'logo' ? 'Logo' : 'Cover Banner'} removed.`);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveDraftTab(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.success('LaunchPad Incubator Profile Published Successfully!', {
        description: 'Your cohort recruitment page is live.'
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveDraftTab(prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setActiveDraftTab(stepId);
  };

  const handleSaveDraft = () => {
    toast.info('Draft Saved', {
      description: 'Your progress has been saved to cloud storage.'
    });
  };

  const addDocument = () => {
    const newDoc = {
      id: Date.now().toString(),
      name: `Requirement_Doc_${formData.requiredDocs.length + 1}.pdf`,
      size: '1.8 MB'
    };
    setFormData(prev => ({ ...prev, requiredDocs: [...prev.requiredDocs, newDoc] }));
    toast.success('Document requirement added');
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requiredDocs: prev.requiredDocs.filter(d => d.id !== id)
    }));
  };

  // Dynamic percentage calculation based on filled fields
  const trackableFields = [
    formData.incubatorName,
    formData.location,
    formData.shortDescription,
    formData.contactEmail,
    formData.aboutIncubator,
    formData.missionStatement,
    formData.vision,
    formData.history,
    formData.startupStage,
    formData.industryFocus,
    formData.teamSize,
    formData.geographicFocus,
    formData.businessModel,
    formData.mentorshipSupport,
    formData.benefitsProvided,
    formData.fundingSupport,
    formData.workspaceSupport,
    formData.technicalSupport,
    formData.trainingProgram,
    formData.eligibilityCriteria,
    formData.applicationRequirements,
    formData.teamRequirements,
  ];

  const totalTrackableItems = trackableFields.length + 3; // +1 for requiredDocs, +2 for logo/banner
  const filledCount = trackableFields.filter(val => val && val.trim().length > 0).length 
    + (formData.requiredDocs.length > 0 ? 1 : 0)
    + (formData.logo ? 1 : 0)
    + (formData.banner ? 1 : 0);
  const progressPercent = Math.min(100, Math.round((filledCount / totalTrackableItems) * 100));

  const draftTabToShow = activeDraftTab ?? currentStep;

  const filledCountInStep = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return [formData.incubatorName, formData.location, formData.shortDescription, formData.contactEmail].filter(v => v.trim()).length
          + (formData.logo ? 1 : 0)
          + (formData.banner ? 1 : 0);
      case 2:
        return [formData.aboutIncubator, formData.missionStatement, formData.vision, formData.history].filter(v => v.trim()).length;
      case 3:
        return [formData.startupStage, formData.industryFocus, formData.teamSize, formData.geographicFocus, formData.businessModel].filter(v => v.trim()).length;
      case 4:
        return [formData.mentorshipSupport, formData.benefitsProvided, formData.fundingSupport, formData.workspaceSupport, formData.technicalSupport, formData.trainingProgram].filter(v => v.trim()).length;
      case 5:
        return [formData.eligibilityCriteria, formData.applicationRequirements, formData.teamRequirements].filter(v => v.trim()).length + (formData.requiredDocs.length > 0 ? 1 : 0);
      default:
        return 0;
    }
  };

  const totalFieldsInStep = (stepNum: number) => {
    switch (stepNum) {
      case 1: return 6;
      case 2: return 4;
      case 3: return 5;
      case 4: return 6;
      case 5: return 4;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Official App Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Step Indicator Bar */}
        <div className="mb-10 overflow-x-auto pb-4 pt-2">
          <div className="flex items-center space-x-3 min-w-max">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/40'
                        : isCompleted
                        ? 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                        : 'bg-card text-muted-foreground border border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isActive
                          ? 'bg-primary-foreground text-primary'
                          : isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                    </span>
                    <span>{step.name}</span>
                  </button>
                  {step.id < 5 && <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main Form Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step Header */}
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-wider text-primary uppercase mb-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>STEP {currentStep}: {steps[currentStep - 1].badge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {currentStep === 1 && 'Incubator Identity'}
                {currentStep === 2 && 'About Your Incubator'}
                {currentStep === 3 && 'Define Your Ideal Startup'}
                {currentStep === 4 && 'Ecosystem Support & Benefits'}
                {currentStep === 5 && 'Eligibility & Requirements'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {currentStep === 1 && 'Define the foundational details of your incubator to set the stage for elite founder recruitment.'}
                {currentStep === 2 && 'Define the soul of your organization. Founders look for mission-alignment and long-term vision.'}
                {currentStep === 3 && 'Founders need to know if they fit your specific investment and mentorship profile.'}
                {currentStep === 4 && 'Detail the specialized leverage you provide to founders.'}
                {currentStep === 5 && 'Filter for high-conviction founders and define specific bars for entry.'}
              </p>
            </div>

            {/* FORM STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-card-foreground">Incubator Criteria</h3>
                      <p className="text-xs text-muted-foreground">Essential parameters for incubator branding.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Incubator Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.incubatorName}
                        onChange={(e) => handleInputChange('incubatorName', e.target.value)}
                        placeholder="e.g. Nexus Venture Labs"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Location <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g. Singapore & Remote"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Short Description <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      placeholder="e.g. A high-octane hyper-acceleration program for Web3 and AI founders."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Upload Grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Logo Upload */}
                    <div className="border border-dashed border-border rounded-xl p-4 text-center bg-background/50 hover:border-primary/60 transition-all relative overflow-hidden group">
                      {formData.logo ? (
                        <div className="flex flex-col items-center space-y-2">
                          <img src={formData.logo} alt="Logo Preview" className="w-16 h-16 object-contain rounded-xl border border-border bg-card p-1 shadow-sm" />
                          <div className="flex items-center space-x-2">
                            <label className="text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                              Change Logo
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange('logo', e)} />
                            </label>
                            <span className="text-muted-foreground text-xs">•</span>
                            <button type="button" onClick={() => handleRemoveImage('logo')} className="text-[11px] text-destructive font-semibold hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange('logo', e)} />
                          <div className="w-10 h-10 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 mb-2 transition-all">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">Logo Upload</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Upload PNG/SVG (Max 2MB)</p>
                        </label>
                      )}
                    </div>

                    {/* Cover Banner Upload */}
                    <div className="border border-dashed border-border rounded-xl p-4 text-center bg-background/50 hover:border-primary/60 transition-all relative overflow-hidden group">
                      {formData.banner ? (
                        <div className="flex flex-col items-center space-y-2">
                          <img src={formData.banner} alt="Banner Preview" className="w-full h-16 object-cover rounded-lg border border-border shadow-sm" />
                          <div className="flex items-center space-x-2">
                            <label className="text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                              Change Banner
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange('banner', e)} />
                            </label>
                            <span className="text-muted-foreground text-xs">•</span>
                            <button type="button" onClick={() => handleRemoveImage('banner')} className="text-[11px] text-destructive font-semibold hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange('banner', e)} />
                          <div className="w-10 h-10 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 mb-2 transition-all">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">Cover Banner Image</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Recommended 1920×400px</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Contact Email <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="e.g. contact@incubator.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-card-foreground">Step 2: Core Narrative</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      About Incubator <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.aboutIncubator}
                      onChange={(e) => handleInputChange('aboutIncubator', e.target.value)}
                      placeholder="Tell the story of your incubator... what makes you unique in the global ecosystem?"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Mission Statement <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.missionStatement}
                      onChange={(e) => handleInputChange('missionStatement', e.target.value)}
                      placeholder="Our mission is to empower visionaries to build..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Vision <span className="text-xs text-muted-foreground font-normal">(OPTIONAL)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.vision}
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                      placeholder="Where do you see the future of innovation heading under your guidance?"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      History <span className="text-xs text-muted-foreground font-normal">(OPTIONAL)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.history}
                      onChange={(e) => handleInputChange('history', e.target.value)}
                      placeholder="Brief background on how this incubator was founded and your major milestones..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-card-foreground">Mandatory Alignment</h3>
                        <p className="text-xs text-muted-foreground">Core filters used by the LaunchPad discovery engine.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Startup Stage Supported <span className="text-primary">*</span>
                        </label>
                        <select
                          value={formData.startupStage}
                          onChange={(e) => handleInputChange('startupStage', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select startup stage...</option>
                          <option value="Pre-Seed">Pre-Seed</option>
                          <option value="Seed to Series A">Seed to Series A</option>
                          <option value="Series A+">Series A+</option>
                          <option value="All Stages">All Stages</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Industry Focus <span className="text-primary">*</span>
                        </label>
                        <select
                          value={formData.industryFocus}
                          onChange={(e) => handleInputChange('industryFocus', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select industry focus...</option>
                          <option value="Fintech & Web3">Fintech & Web3</option>
                          <option value="AI & DeepTech">AI & DeepTech</option>
                          <option value="B2B SaaS">B2B SaaS</option>
                          <option value="Climate Tech">Climate Tech</option>
                          <option value="BioTech & Health">BioTech & Health</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-card-foreground">Operational Preferences</h3>
                        <p className="text-xs text-muted-foreground">Optional qualifiers to find the perfect cohort match.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Preferred Team Size <span className="text-xs text-muted-foreground font-normal">(OPTIONAL)</span>
                        </label>
                        <select
                          value={formData.teamSize}
                          onChange={(e) => handleInputChange('teamSize', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select team size...</option>
                          <option value="Solo Founders">Solo Founders</option>
                          <option value="Small Teams (2-10)">Small Teams (2-10)</option>
                          <option value="Mid-Scale (10-25)">Mid-Scale (10-25)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Geographic Focus <span className="text-xs text-muted-foreground font-normal">(OPTIONAL)</span>
                        </label>
                        <select
                          value={formData.geographicFocus}
                          onChange={(e) => handleInputChange('geographicFocus', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select geographic focus...</option>
                          <option value="Global (Remote-First)">Global (Remote-First)</option>
                          <option value="North America">North America</option>
                          <option value="Europe">Europe</option>
                          <option value="Asia Pacific">Asia Pacific</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Business Model Preference <span className="text-xs text-muted-foreground font-normal">(OPTIONAL)</span>
                      </label>
                      <select
                        value={formData.businessModel}
                        onChange={(e) => handleInputChange('businessModel', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select business model...</option>
                        <option value="B2B SaaS / Infrastructure">B2B SaaS / Infrastructure</option>
                        <option value="B2C Consumer">B2C Consumer</option>
                        <option value="Marketplace">Marketplace</option>
                        <option value="Hardware & Robotics">Hardware & Robotics</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM STEP 4 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-card-foreground">Mandatory Support Package</h3>
                      <p className="text-xs text-muted-foreground">Define the core pillars of your acceleration protocol.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Mentorship Support <span className="text-primary text-xs font-normal">(HIGHLY RECOMMENDED)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.mentorshipSupport}
                      onChange={(e) => handleInputChange('mentorshipSupport', e.target.value)}
                      placeholder="e.g. 1-on-1 sessions with founders and technical leads..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Benefits Provided <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.benefitsProvided}
                      onChange={(e) => handleInputChange('benefitsProvided', e.target.value)}
                      placeholder="e.g. Direct $250k investment, infrastructure credits..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-primary mb-3 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Strategic Acceleration (Optional)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background/60 border border-border hover:border-primary/50 transition-all">
                        <span className="text-xs font-semibold text-foreground">Funding Support</span>
                        <textarea
                          rows={2}
                          value={formData.fundingSupport}
                          onChange={(e) => handleInputChange('fundingSupport', e.target.value)}
                          placeholder="e.g. Access to private bridge fund..."
                          className="mt-1.5 w-full bg-transparent text-xs text-foreground focus:outline-none border-t border-border pt-2 placeholder:text-muted-foreground/60"
                        />
                      </div>
                      <div className="p-4 rounded-xl bg-background/60 border border-border hover:border-primary/50 transition-all">
                        <span className="text-xs font-semibold text-foreground">Workspace Support</span>
                        <textarea
                          rows={2}
                          value={formData.workspaceSupport}
                          onChange={(e) => handleInputChange('workspaceSupport', e.target.value)}
                          placeholder="e.g. Physical hub and 24/7 virtual infrastructure..."
                          className="mt-1.5 w-full bg-transparent text-xs text-foreground focus:outline-none border-t border-border pt-2 placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM STEP 5 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-card-foreground">Eligibility Criteria</h3>
                      <p className="text-xs text-muted-foreground">Essential parameters for startup filtering.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Eligibility Criteria <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.eligibilityCriteria}
                      onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
                      placeholder="e.g. Open to seed-stage technology startups with a functional MVP..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Application Requirements <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.applicationRequirements}
                      onChange={(e) => handleInputChange('applicationRequirements', e.target.value)}
                      placeholder="e.g. Submit pitch deck, team intro video, and current metrics..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Team Requirements <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.teamRequirements}
                      onChange={(e) => handleInputChange('teamRequirements', e.target.value)}
                      placeholder="e.g. Minimum of 2 co-founders with technical background..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Required Documents List
                    </label>
                    <div className="space-y-2 mb-3">
                      {formData.requiredDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs font-medium text-foreground">{doc.name}</p>
                              <p className="text-[10px] text-muted-foreground">{doc.size} • Uploaded</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addDocument}
                      className="w-full py-2.5 rounded-xl border border-dashed border-primary/50 hover:border-primary text-primary text-xs font-semibold flex items-center justify-center space-x-2 bg-primary/5 hover:bg-primary/10 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Document Requirement</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStep === 1
                    ? 'bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-50'
                    : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-secondary-foreground bg-secondary border border-border hover:bg-secondary/80 transition-all"
                >
                  Save Draft
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>
                    {currentStep === 1 && 'Next Step'}
                    {currentStep === 2 && 'Continue to Program Details'}
                    {currentStep === 3 && 'Finalize & Preview'}
                    {currentStep === 4 && 'Continue to Preview'}
                    {currentStep === 5 && 'Review & Publish'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Live Sidebar Column */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-2xl bg-card border border-border p-5 shadow-2xl space-y-5 relative overflow-hidden">
              
              {/* Primary Ambient Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              {/* Sidebar Header Badge with Circular Progress */}
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span>STEP {currentStep} / 5</span>
                </span>

                <CircularProgress value={progressPercent} />

                <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                  DRAFT MODE
                </span>
              </div>

              {/* Dynamic Preview & Draft Card */}
              <div className="p-4 rounded-xl bg-background/80 border border-border space-y-4">
                
                {/* Dynamic Step Tabs in Draft Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold text-foreground flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>STEP {draftTabToShow} DRAFT BOX</span>
                    </span>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {filledCountInStep(draftTabToShow)} / {totalFieldsInStep(draftTabToShow)} Filled
                    </span>
                  </div>

                  {/* Step Selector Pills */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((stepNum) => {
                      const isTabActive = draftTabToShow === stepNum;
                      const count = filledCountInStep(stepNum);
                      return (
                        <button
                          key={stepNum}
                          onClick={() => setActiveDraftTab(stepNum)}
                          className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                            isTabActive
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                              : count > 0
                              ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                              : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                          }`}
                        >
                          Step {stepNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Draft Content Items for draftTabToShow */}
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {draftTabToShow === 1 && (
                    <div className="space-y-2.5">
                      <div className="rounded-xl border border-border bg-card/60 overflow-hidden shadow-sm transition-all mb-2">
                        {/* Cover Banner */}
                        <div className="relative w-full h-20 bg-muted overflow-hidden">
                          {formData.banner ? (
                            <img src={formData.banner} alt="Cover Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5 flex items-center justify-center text-[10px] text-muted-foreground italic">
                              No Cover Banner Uploaded
                            </div>
                          )}
                        </div>

                        {/* Profile Header & Logo */}
                        <div className="p-3 pt-0 relative space-y-2">
                          <div className="flex items-end justify-between -mt-7">
                            <div className="w-14 h-14 rounded-xl border-2 border-background bg-card p-1 shadow-md flex items-center justify-center font-bold text-primary text-xl overflow-hidden">
                              {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                              ) : (
                                <span>{formData.incubatorName ? formData.incubatorName.charAt(0).toUpperCase() : 'N'}</span>
                              )}
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                              formData.incubatorName && formData.location 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-muted/50 text-muted-foreground border-border'
                            }`}>
                              {formData.incubatorName && formData.location ? 'Profile Active' : 'Drafting Profile'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-foreground leading-snug">
                              {formData.incubatorName || <span className="text-muted-foreground/50 italic">Incubator Name</span>}
                            </h4>
                            <p className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                              <span>{formData.location || <span className="italic opacity-60">Location not set</span>}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <DraftItem label="Incubator Name" value={formData.incubatorName} />
                      <DraftItem label="Location" value={formData.location} />
                      <DraftItem label="Short Description" value={formData.shortDescription} />
                      <DraftItem label="Contact Email" value={formData.contactEmail} />
                    </div>
                  )}
                  {draftTabToShow === 2 && (
                    <>
                      <DraftItem label="About Incubator" value={formData.aboutIncubator} />
                      <DraftItem label="Mission Statement" value={formData.missionStatement} />
                      <DraftItem label="Vision" value={formData.vision} />
                      <DraftItem label="History" value={formData.history} />
                    </>
                  )}
                  {draftTabToShow === 3 && (
                    <>
                      <DraftItem label="Startup Stage" value={formData.startupStage} />
                      <DraftItem label="Industry Focus" value={formData.industryFocus} />
                      <DraftItem label="Preferred Team Size" value={formData.teamSize} />
                      <DraftItem label="Geographic Focus" value={formData.geographicFocus} />
                      <DraftItem label="Business Model" value={formData.businessModel} />
                    </>
                  )}
                  {draftTabToShow === 4 && (
                    <>
                      <DraftItem label="Mentorship Support" value={formData.mentorshipSupport} />
                      <DraftItem label="Benefits Provided" value={formData.benefitsProvided} />
                      <DraftItem label="Funding Support" value={formData.fundingSupport} />
                      <DraftItem label="Workspace Support" value={formData.workspaceSupport} />
                      <DraftItem label="Technical Support" value={formData.technicalSupport} />
                      <DraftItem label="Training Program" value={formData.trainingProgram} />
                    </>
                  )}
                  {draftTabToShow === 5 && (
                    <>
                      <DraftItem label="Eligibility Criteria" value={formData.eligibilityCriteria} />
                      <DraftItem label="Application Requirements" value={formData.applicationRequirements} />
                      <DraftItem label="Team Requirements" value={formData.teamRequirements} />
                      <DraftItem 
                        label="Required Documents" 
                        value={formData.requiredDocs.length > 0 ? `${formData.requiredDocs.length} requirement document(s) added` : ''} 
                      />
                    </>
                  )}
                </div>

                <p className="text-[9px] text-muted-foreground text-center uppercase tracking-widest pt-1">
                  SECURE CLOUD SESSION • ID: IDEN-2026-X
                </p>
              </div>

              {/* Elite Curator Tip Box */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-primary">Elite Curator Tip</h5>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {currentStep === 1 && 'A strong Incubator Identity attracts high-conviction founders. Fill out clear descriptions.'}
                    {currentStep === 2 && 'Founders care deeply about long-term mission alignment. Highlight your unique thesis to stand out.'}
                    {currentStep === 3 && 'Startups in Seed to Series A look for clear stage expectations and domain-specific mentorship.'}
                    {currentStep === 4 && 'Founders value technical support and direct investor access over generic co-working space.'}
                    {currentStep === 5 && 'Requiring clear application documents significantly improves applicant quality and intent.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Modern Ecosystem Footer */}
      <footer className="bg-card border-t border-border pt-16 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <img src={logo} alt="ConnectAngels" className="h-10 sm:h-12 w-auto" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                The leading global ecosystem for startups, investors, and incubators. 
                Bridging the gap between innovation and capital.
              </p>
              <div className="flex gap-3">
                {["Twitter", "LinkedIn", "Instagram", "Discord"].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-3.5 h-3.5 bg-current rounded-sm opacity-80" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Platform</h5>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="/events" className="hover:text-primary transition-colors">Events</a></li>
                <li><a href="/potential" className="hover:text-primary transition-colors">Potential</a></li>
                <li><a href="/chat" className="hover:text-primary transition-colors">Chat</a></li>
                <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Resources</h5>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Contact</h5>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>123 Innovation Dr, Tech City</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>hello@connectangels.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>+1 (555) 012-3456</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 ConnectAngels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
