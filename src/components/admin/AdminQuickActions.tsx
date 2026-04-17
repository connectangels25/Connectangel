import React from "react";
import { Shield, FileText, MessageSquareWarning, LayoutDashboard, BellRing } from "lucide-react";

export const AdminQuickActions = () => {
  const actions = [
    {
      id: 1,
      title: "Security Audit",
      description: "Run a full scan of system logs and access permissions.",
      icon: Shield,
    },
    {
      id: 2,
      title: "Payout Review",
      description: "Approve pending withdrawal requests from organizers.",
      icon: FileText,
    },
    {
      id: 3,
      title: "Reported Chat",
      description: "Review 12 pending reports from the community chat.",
      icon: MessageSquareWarning,
    },
    {
      id: 4,
      title: "Landing Editor",
      description: "Modify content and assets on the public-facing site.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="mb-2">
        <h3 className="text-foreground text-lg font-semibold">Quick System Actions</h3>
        <p className="text-muted-foreground text-xs mt-1">Commonly used administrative tools</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {actions.map((action) => (
          <div key={action.id} className="bg-card rounded-3xl p-6 border border-border hover:bg-secondary/40 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-4 border border-border">
              <action.icon className="w-6 h-6" />
            </div>
            <h4 className="text-foreground text-sm font-semibold mb-2">{action.title}</h4>
            <p className="text-muted-foreground text-xs px-2 leading-relaxed">{action.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-card rounded-3xl p-5 border border-border relative">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Admin Notification</h4>
            <p className="text-xs text-muted-foreground mb-3">Just now</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              A new high-tier investment event was created by <span className="text-foreground font-semibold">Marcus Thorne</span>. Needs manual verification before publishing.
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2 bg-primary hover:opacity-90 rounded-lg text-primary-foreground text-xs font-semibold transition-colors flex-1">
                Review Now
              </button>
              <button className="px-5 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-xs font-semibold transition-colors flex-1 border border-border">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
