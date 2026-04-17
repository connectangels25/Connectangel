import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconColor: string;
}

export const AdminStatCard = ({ title, value, change, isPositive, icon: Icon, iconColor }: AdminStatCardProps) => {
  return (
    <div className="bg-card rounded-3xl p-6 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-0 text-muted-foreground`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
          {isPositive ? '↗' : '↘'} {change}
        </div>
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-foreground text-3xl font-bold tracking-tight">{value}</h3>
        <p className="text-muted-foreground/60 text-xs mt-2">{isPositive ? '+' : '-'}{change} from last month</p>
      </div>
    </div>
  );
};
