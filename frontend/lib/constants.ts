import { NavLink, SocialLink } from "../types/common.types";

export const BRAND_NAME = "Charity Draws";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Competitions", href: "/live-raffles" },
  { label: "Winners", href: "/winners" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Verified Charities", href: "/verified-hosts" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "Facebook", href: "https://www.facebook.com/share/18zThK3JPJ/?mibextid=wwXIfr", iconName: "facebook" },
  { platform: "Instagram", href: "https://instagram.com/charitydraws", iconName: "instagram" },
];

export const FOOTER_SECTIONS = [
  {
    title: "Competitions",
    links: [
      { label: "All Live Draws", href: "/live-raffles" },
      { label: "Cash Prizes", href: "/live-raffles?category=cash-prizes" },
      { label: "Tech & Gadgets", href: "/live-raffles?category=tech-gadgets" },
      { label: "Luxury Watches", href: "/live-raffles?category=luxury-watches" },
      { label: "Holidays & Travel", href: "/live-raffles?category=holidays-travel" },
    ],
  },
  {
    title: "Host A Draw",
    links: [
      { label: "Start Hosting (Charity / Promoter)", href: "/host/register" },
      { label: "Pricing & Fees", href: "/pricing" },
      { label: "Verified Charities", href: "/verified-hosts" },
      { label: "Host Rules & Guidelines", href: "/host-rules" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Support", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Free Entry Method", href: "/terms#free-entry" },
    ],
  },
];
