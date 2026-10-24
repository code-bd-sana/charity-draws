import { StatItem } from "../../types/homepage.types";
import { Draw } from "../../types/draw.types";

export interface HeroData {
  badgeText: string;
  headingText: string;
  paragraphText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  stats: StatItem[];
  featuredDraw: Draw;
}

export const heroData: HeroData = {
  badgeText: "CHARITY PRIZE COMPETITIONS",
  headingText: "Win Premium Charity Prizes For Less",
  paragraphText: "Enter transparent prize competitions to win incredible prizes and cash rewards while supporting great causes. 100% fair, verified, and secure.",
  primaryCtaLabel: "Browse Live Draws",
  primaryCtaHref: "#live-draws",
  secondaryCtaLabel: "How It Works",
  secondaryCtaHref: "#how-it-works",
  stats: [
    {
      id: "hero-stat-1",
      value: "0",
      label: "Draws Completed",
    },
    {
      id: "hero-stat-2",
      value: "0",
      label: "Verified Charities",
    },
    {
      id: "hero-stat-3",
      value: "£0",
      label: "Won in prizes!",
    },
  ],
  featuredDraw: {
    id: "hero-feat-1",
    title: "Luxury Tech & Cash Bundle",
    description: "Worth £2,500. Includes Apple iPhone 16 Pro Max, MacBook Air M3, and £1,000 Tax-Free Cash.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
    ticketPrice: 2.50,
    totalTickets: 1000,
    soldTickets: 0,
    endDate: "Launching Soon",
    status: "live",
    category: "tech-gadgets",
    worthPrice: 2500,
    isFeatured: true,
  },
};
