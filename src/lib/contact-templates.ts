export interface ContactTemplate {
  id: string;
  label: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  defaultSubject: string;
  defaultPriority: "low" | "medium" | "high" | "urgent";
  description: string;
  templateBody: string;
}

export const CONTACT_TEMPLATES: ContactTemplate[] = [
  {
    id: "bug-report",
    label: "🐛 Bug Report",
    shortName: "Bug Report",
    badge: "Bug",
    badgeColor: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
    defaultSubject: "[Bug] Report an issue or unexpected behavior in Retzlo",
    defaultPriority: "high",
    description: "Report an error, UI glitch, or broken function",
    templateBody: `[Problem Description]
- What happened: 
- Expected behavior: 

[Steps to Reproduce]
1. Navigate to: 
2. Perform action / click: 
3. Encountered error: 

[Environment Info]
- Browser (Chrome / Safari / Edge / Firefox): 
- Device (PC / Mac / Mobile): 
- Additional notes: `,
  },
  {
    id: "feature-request",
    label: "💡 Feature Request",
    shortName: "Feature Request",
    badge: "Idea",
    badgeColor: "border-amber-300 bg-amber-50 text-amber-700 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber",
    defaultSubject: "[Feature Request] Proposal for Retzlo",
    defaultPriority: "medium",
    description: "Suggest new ideas to improve your daily workflows in Retzlo",
    templateBody: `[Feature Proposal]
- Feature name or concept: 
- Desired workflow: 

[Current Problem / Limitation]
- Challenge in current workflow: 

[Expected Benefits]
- How this feature will save time or improve productivity: `,
  },
  {
    id: "general-inquiry",
    label: "💬 General Inquiry",
    shortName: "General",
    badge: "Inquiry",
    badgeColor: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender",
    defaultSubject: "[Inquiry] Questions about Retzlo features",
    defaultPriority: "medium",
    description: "Questions regarding Kanban boards, tables, calendar, or AI Assistant",
    templateBody: `[Topic of Inquiry]
- Relevant feature (e.g. Board, Table, Calendar, AI Assistant, Settings): 

[Your Question]
- 

[What you have tried so far (if applicable)]
- `,
  },
  {
    id: "partnership-feedback",
    label: "🤝 Partnership & Feedback",
    shortName: "Partnership",
    badge: "Partner",
    badgeColor: "border-teal-300 bg-teal-50 text-teal-700 dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10 dark:text-dusk-cyan",
    defaultSubject: "[Partnership] Inquiry for collaboration or product feedback",
    defaultPriority: "low",
    description: "Contact our team for business collaboration or feedback",
    templateBody: `[Organization / Team / Contact Person]
- 

[Proposal or Feedback]
- 

[Preferred Contact Method]
- Email / Phone: `,
  },
  {
    id: "gamification-rewards",
    label: "☕ Gamification & Rewards",
    shortName: "Rewards",
    badge: "Rewards",
    badgeColor: "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-400",
    defaultSubject: "[Rewards] Feedback regarding Coffee Cheers & Rewards Store",
    defaultPriority: "low",
    description: "Suggest new reward store items, coffee cheers rules, or coin dynamics",
    templateBody: `[Reward Store & Coin Feedback]
- Proposed rewards or activities: 
- Feedback on coin amounts or cheering rules: 

[Expected Positive Impact on Team Atmosphere]
- `,
  },
  {
    id: "security-privacy",
    label: "🔒 Security & Privacy",
    shortName: "Security",
    badge: "Security",
    badgeColor: "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
    defaultSubject: "[Security] Inquiry regarding data security and privacy",
    defaultPriority: "urgent",
    description: "Security concerns, data management, or access permissions",
    templateBody: `[Security & Privacy Concern]
- (e.g. permission controls, data backups, account deletion, or vulnerability report)

[Details & Observations]
- `,
  },
  {
    id: "custom",
    label: "✏️ Custom Freeform",
    shortName: "Custom",
    badge: "Freeform",
    badgeColor: "border-stone-200 bg-stone-50 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400",
    defaultSubject: "",
    defaultPriority: "medium",
    description: "Compose your own custom subject and message freely",
    templateBody: "",
  },
];
