export interface EventAgendaItem {
  time: string;
  title: string;
  lead: string;
}

export interface EventFAQ {
  question: string;
  answer: string;
}

export interface EventResource {
  name: string;
  description: string;
}

export interface EventData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  organizer: string;
  organizerLabel: string;
  image: string;
  badge: string;
  speakers: number;
  applicants: number;
  ticketPrice: string;
  deadline: string;
  teamSize: string;
  prizes: string;
  supportEmail: string;
  agenda: EventAgendaItem[];
  eligibility: string[];
  faqs: EventFAQ[];
  resources: EventResource[];
  trustedPartners: string[];
}

export const EVENTS: EventData[] = [
  {
    id: "algorithm-x",
    title: "Algorithm X:",
    subtitle: "Sustainable Tech Summit 2026",
    description:
      "Algorithm X is the flagship annual summit organized by Boutique Startups, dedicated to uncovering technological breakthroughs that directly address climate change. This year, we are focusing on \"Innovation for a Sustainable Future,\" bringing together 500+ tech leaders, climate scientists, and venture capitalists.",
    date: "Mar 12, 2026",
    time: "10:00 AM IST",
    location: "Mumbai, India",
    type: "Hybrid Event",
    organizer: "Boutique Startups",
    organizerLabel: "ORGANIZED BY BOUTIQUE STARTUPS",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    badge: "Active",
    speakers: 24,
    applicants: 450,
    ticketPrice: "Free Registration",
    deadline: "Feb 28, 2026",
    teamSize: "1 - 4 Members",
    prizes: "$25,000 Total",
    supportEmail: "events@bx.com",
    agenda: [
      { time: "10:00 AM", title: "Opening Ceremony & Keynote Speech", lead: "Lead by: Dr. Sarah Chen, CTO EcoStar" },
      { time: "11:30 AM", title: "Panel: The Future of Renewable Storage", lead: "Lead by: Elon Tusk & Team Power" },
      { time: "01:00 PM", title: "Networking Lunch & Startup Showcase", lead: "Lead by: Curated by ConnectAngels" },
      { time: "02:30 PM", title: "Workshop: Carbon Credits 2.0 on Blockchain", lead: "Lead by: Marcus Vane, GreenChain" },
      { time: "04:00 PM", title: "Closing Remarks & Seed Funding Awards", lead: "Lead by: Rahul Sharma, CEO Boutique Startups" },
    ],
    eligibility: [
      "Open to all tech professionals and university students worldwide.",
      "Early bird registrations end by Feb 20th, 2026.",
      "Registration is mandatory for both physical and virtual attendance.",
      "All attendees will receive a digital certificate of participation.",
    ],
    faqs: [
      { question: "How do I access the virtual stream?", answer: "Once registered as a virtual attendee, you will receive a unique streaming link via email 48 hours before the event starts." },
      { question: "Is there an entry fee for startups?", answer: "No, startup participation is completely free for early-stage companies." },
      { question: "Will the sessions be recorded?", answer: "Yes, all sessions will be recorded and available for registered attendees." },
    ],
    resources: [
      { name: "Event Prospectus.pdf", description: "Detailed schedule & guidelines" },
      { name: "Speaker Profile Deck.pdf", description: "Expert biographies" },
    ],
    trustedPartners: ["TechCorp", "EcoVentures", "GreenFund"],
  },
  {
    id: "mumbai-business-network",
    title: "Mumbai Business",
    subtitle: "Network 2026",
    description:
      "Mumbai Business Network is a premier networking event connecting entrepreneurs, investors, and industry leaders across Maharashtra. Featuring keynotes, pitch sessions, and collaborative workshops designed to foster meaningful business relationships.",
    date: "Apr 12, 2026",
    time: "9:00 AM IST",
    location: "Mumbai, India",
    type: "In-Person",
    organizer: "MBN Foundation",
    organizerLabel: "ORGANIZED BY MBN FOUNDATION",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    badge: "Active",
    speakers: 18,
    applicants: 320,
    ticketPrice: "₹500",
    deadline: "Mar 30, 2026",
    teamSize: "Individual",
    prizes: "N/A",
    supportEmail: "info@mbn.org",
    agenda: [
      { time: "9:00 AM", title: "Registration & Welcome Coffee", lead: "Lead by: MBN Team" },
      { time: "10:00 AM", title: "Keynote: Building India's Startup Ecosystem", lead: "Lead by: Priya Mehta, Founder MBN" },
      { time: "11:30 AM", title: "Speed Networking Sessions", lead: "Lead by: MBN Moderators" },
      { time: "1:00 PM", title: "Lunch & Exhibition Walk", lead: "Lead by: MBN Team" },
      { time: "3:00 PM", title: "Panel: Funding Landscape in India", lead: "Lead by: Angel Investors Panel" },
    ],
    eligibility: [
      "Open to all entrepreneurs and business professionals.",
      "Registration closes March 30, 2026.",
      "Bring your business cards for networking.",
      "ID verification required at entry.",
    ],
    faqs: [
      { question: "Is parking available?", answer: "Yes, complimentary parking is available at the venue." },
      { question: "Can I bring a colleague?", answer: "Yes, each registration allows one additional guest." },
      { question: "Will food be provided?", answer: "Yes, lunch and refreshments are included." },
    ],
    resources: [
      { name: "Attendee Guide.pdf", description: "Venue map & schedule" },
      { name: "Sponsor Deck.pdf", description: "Partnership opportunities" },
    ],
    trustedPartners: ["IndiaVC", "MumbaiHub", "StartupIndia"],
  },
  {
    id: "venture-capital-world-summit",
    title: "Venture Capital",
    subtitle: "World Summit 2026",
    description:
      "The Venture Capital World Summit brings together the global VC community for two days of insights, deal flow, and connections. Meet fund managers, LPs, and founders shaping the next decade of innovation.",
    date: "Apr 05, 2026",
    time: "10:00 AM GMT",
    location: "London, UK",
    type: "Hybrid Event",
    organizer: "VC Global",
    organizerLabel: "ORGANIZED BY VC GLOBAL",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    badge: "Upcoming",
    speakers: 35,
    applicants: 800,
    ticketPrice: "$299",
    deadline: "Mar 20, 2026",
    teamSize: "Individual",
    prizes: "N/A",
    supportEmail: "hello@vcworldsummit.com",
    agenda: [
      { time: "10:00 AM", title: "Opening Keynote: The State of VC", lead: "Lead by: James Carter, GP at Sequoia" },
      { time: "11:30 AM", title: "Fireside Chat: AI & The Future", lead: "Lead by: Lisa Wang, Partner at a16z" },
      { time: "1:00 PM", title: "Networking Lunch", lead: "Lead by: Summit Team" },
      { time: "2:30 PM", title: "Pitch Competition Finals", lead: "Lead by: Judge Panel" },
      { time: "4:00 PM", title: "Closing & Awards", lead: "Lead by: VC Global Team" },
    ],
    eligibility: [
      "Open to VCs, angel investors, and founders.",
      "Early bird deadline: March 1, 2026.",
      "Virtual pass available for remote attendees.",
      "NDA required for deal room access.",
    ],
    faqs: [
      { question: "What is included in the ticket?", answer: "Full access to all sessions, networking events, and lunch." },
      { question: "Is the event recorded?", answer: "Yes, virtual pass holders get access to recordings." },
      { question: "Can I schedule 1-on-1 meetings?", answer: "Yes, through our matchmaking platform." },
    ],
    resources: [
      { name: "Investor Directory.pdf", description: "Attending VC firms" },
      { name: "Pitch Guidelines.pdf", description: "Competition format & rules" },
    ],
    trustedPartners: ["Sequoia", "a16z", "TechStars"],
  },
  {
    id: "global-startups-club-meet",
    title: "Global Startups",
    subtitle: "Club Meet 2026",
    description:
      "A vibrant community gathering for startup founders from around the world. Share experiences, find co-founders, and learn from those who've built successful companies from scratch.",
    date: "May 20, 2026",
    time: "6:00 PM EST",
    location: "Online",
    type: "Virtual",
    organizer: "GSC Community",
    organizerLabel: "ORGANIZED BY GSC COMMUNITY",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    badge: "Upcoming",
    speakers: 12,
    applicants: 200,
    ticketPrice: "Free",
    deadline: "May 15, 2026",
    teamSize: "Individual",
    prizes: "N/A",
    supportEmail: "hello@globalstartupsclub.com",
    agenda: [
      { time: "6:00 PM", title: "Welcome & Icebreakers", lead: "Lead by: GSC Host Team" },
      { time: "6:30 PM", title: "Founder Stories: 0 to 1 Journey", lead: "Lead by: Featured Founders" },
      { time: "7:30 PM", title: "Breakout Rooms: Find Your Co-Founder", lead: "Lead by: GSC Moderators" },
      { time: "8:30 PM", title: "Open Mic & Q&A", lead: "Lead by: Community" },
    ],
    eligibility: [
      "Open to all aspiring and current startup founders.",
      "No experience required.",
      "Webcam and mic recommended for breakout rooms.",
      "Free registration – limited to 200 spots.",
    ],
    faqs: [
      { question: "Do I need a startup to attend?", answer: "No, aspiring founders are welcome." },
      { question: "What platform is used?", answer: "Zoom with breakout room support." },
      { question: "Can I present my startup?", answer: "Yes, during the Open Mic session." },
    ],
    resources: [
      { name: "Zoom Setup Guide.pdf", description: "How to join the event" },
    ],
    trustedPartners: ["StartupGrind", "Founders Network"],
  },
  {
    id: "clean-energy-hackathon",
    title: "Clean Energy",
    subtitle: "Hackathon 2026",
    description:
      "A 48-hour hackathon focused on building innovative solutions for clean energy challenges. Teams will compete to develop prototypes addressing solar efficiency, grid storage, and carbon capture.",
    date: "Jun 15, 2026",
    time: "9:00 AM SGT",
    location: "Singapore",
    type: "In-Person",
    organizer: "GreenTech Asia",
    organizerLabel: "ORGANIZED BY GREENTECH ASIA",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    badge: "Upcoming",
    speakers: 8,
    applicants: 150,
    ticketPrice: "Free",
    deadline: "Jun 01, 2026",
    teamSize: "2 - 5 Members",
    prizes: "$50,000 Total",
    supportEmail: "hack@greentech.asia",
    agenda: [
      { time: "9:00 AM", title: "Kickoff & Problem Statements", lead: "Lead by: GreenTech Team" },
      { time: "10:00 AM", title: "Hacking Begins", lead: "Lead by: Participants" },
      { time: "12:00 PM", title: "Mentor Office Hours", lead: "Lead by: Industry Mentors" },
      { time: "Day 2 - 3:00 PM", title: "Final Presentations", lead: "Lead by: Judge Panel" },
      { time: "Day 2 - 5:00 PM", title: "Awards Ceremony", lead: "Lead by: GreenTech Asia CEO" },
    ],
    eligibility: [
      "Open to developers, designers, and energy enthusiasts.",
      "Teams of 2-5 members required.",
      "Participants must bring their own laptops.",
      "All IP created during the hackathon belongs to the teams.",
    ],
    faqs: [
      { question: "Is accommodation provided?", answer: "Yes, sleeping pods and showers are available at the venue." },
      { question: "What tech stack should we use?", answer: "Any stack is acceptable. Hardware kits also available." },
      { question: "Can I participate solo?", answer: "We encourage teams but can help match solo participants." },
    ],
    resources: [
      { name: "Problem Statements.pdf", description: "Challenge tracks & rules" },
      { name: "API Documentation.pdf", description: "Available energy data APIs" },
    ],
    trustedPartners: ["SolarEdge", "Tesla Energy", "CleanTech Hub"],
  },
  {
    id: "imaginext-2026",
    title: "ImagiNext",
    subtitle: "2026",
    description:
      "ImagiNext is a future-forward innovation conference exploring the intersection of imagination, technology, and entrepreneurship. Featuring immersive experiences, AI demos, and visionary keynotes.",
    date: "Mar 25, 2026",
    time: "10:00 AM IST",
    location: "Mumbai, India",
    type: "Hybrid Event",
    organizer: "ImagiNext Labs",
    organizerLabel: "ORGANIZED BY IMAGINEXT LABS",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    badge: "Active",
    speakers: 30,
    applicants: 600,
    ticketPrice: "₹999",
    deadline: "Mar 15, 2026",
    teamSize: "Individual",
    prizes: "₹5,00,000 Total",
    supportEmail: "hello@imaginext.in",
    agenda: [
      { time: "10:00 AM", title: "Grand Opening & Vision Talk", lead: "Lead by: Ananya Rao, CEO ImagiNext" },
      { time: "11:00 AM", title: "AI in Creativity: Live Demo", lead: "Lead by: Tech Team" },
      { time: "1:00 PM", title: "Lunch & Innovation Gallery", lead: "Lead by: ImagiNext Team" },
      { time: "2:30 PM", title: "Workshop: Building with Generative AI", lead: "Lead by: Guest Faculty" },
      { time: "4:30 PM", title: "Closing Keynote & Awards", lead: "Lead by: Chief Guest" },
    ],
    eligibility: [
      "Open to all innovators, students, and professionals.",
      "Early bird pricing available until March 5.",
      "Student discount with valid ID.",
      "Virtual pass available for remote attendees.",
    ],
    faqs: [
      { question: "Is there a student discount?", answer: "Yes, 50% off with a valid student ID." },
      { question: "Can I exhibit my project?", answer: "Yes, exhibition spots are available on request." },
      { question: "Will there be live streaming?", answer: "Yes, for virtual pass holders." },
    ],
    resources: [
      { name: "Event Brochure.pdf", description: "Full schedule & speaker list" },
      { name: "Innovation Gallery Info.pdf", description: "Exhibition details" },
    ],
    trustedPartners: ["GoogleAI", "NVIDIA", "MicrosoftForStartups"],
  },
];

export function getEventById(id: string): EventData | undefined {
  return EVENTS.find((e) => e.id === id);
}
