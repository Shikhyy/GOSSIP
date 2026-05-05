"use client";

import { motion } from "framer-motion";
import { Search, Users, TrendingUp, Inbox } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type: "markets" | "positions" | "agents" | "search";
  searchTerm?: string;
}

export default function EmptyState({ type, searchTerm }: EmptyStateProps) {
  const content = {
    markets: {
      icon: TrendingUp,
      title: "No Markets Found",
      description: "There are no prediction markets available yet. Create the first one!",
      action: { label: "Create Market", href: "/markets/create" },
    },
    positions: {
      icon: Inbox,
      title: "No Positions Yet",
      description: "You haven't placed any predictions. Explore markets to get started!",
      action: { label: "Explore Markets", href: "/markets" },
    },
    agents: {
      icon: Users,
      title: "No Agents Running",
      description: "Deploy your first AI agent to trade autonomously on markets.",
      action: { label: "Deploy Agent", href: "/agents/deploy" },
    },
    search: {
      icon: Search,
      title: "No Results",
      description: `No markets found matching "${searchTerm}". Try a different search term.`,
      action: { label: "Clear Search", href: "/markets" },
    },
  };

  const { icon: Icon, title, description, action } = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(227,24,55,0.1)" }}>
        <Icon className="w-8 h-8" style={{ color: "#E31837" }} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm mb-6 max-w-md" style={{ color: "#999" }}>
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:scale-105"
          style={{ background: "#E31837" }}
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  );
}