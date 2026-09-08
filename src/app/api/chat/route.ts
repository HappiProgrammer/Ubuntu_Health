export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const SERVICES = [
  'Post-Surgery Home Care', 'Elderly Care', 'Pediatric Nursing',
  'Physiotherapy', 'Wound Dressing', 'Medication Management',
  'IV Therapy', 'Mental Health Support', 'Palliative Care',
];

const CITIES = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Limbe',
];

type Intent =
  | 'greeting' | 'services' | 'booking' | 'payment' | 'emergency'
  | 'nurses' | 'pricing' | 'cities' | 'about' | 'contact'
  | 'faq_registration' | 'faq_verification' | 'faq_languages'
  | 'faq_hours' | 'faq_cancellation' | 'symptoms_advice'
  | 'farewell' | 'thanks' | 'unknown';

function detectIntent(message: string): Intent {
  const m = message.toLowerCase();
  if (/^(hi|hello|hey|bonjour|salut|good\s*(morning|afternoon|evening))/i.test(m.trim())) return 'greeting';
  if (/merci|thank(s| you)|bien merci/i.test(m)) return 'thanks';
  if (/bye|au revoir|goodbye|à bientôt/i.test(m)) return 'farewell';
  if (/book|appoint|schedule|reserve|hire|get.*nurse|need.*nurse|find.*nurse/i.test(m)) return 'booking';
  if (/pay|payment|momo|mtn|orange money|fcfa|xaf|transfer/i.test(m)) return 'payment';
  if (/emerg|urgent|critical|accident|secours|sos|danger|ambulance/i.test(m)) return 'emergency';
  if (/nurse|caregiv|infirmi|professional/i.test(m)) return 'nurses';
  if (/price|cost|tarif|rate|fee|how much|combien/i.test(m)) return 'pricing';
  if (/city|cities|location|where|yaoundé|douala|bamenda/i.test(m)) return 'cities';
  if (/service|care|soins|physiotherap|wound|elderly|pediatr|palliati/i.test(m)) return 'services';
  if (/about|what is|platform|bridgecare|ubuntu health/i.test(m)) return 'about';
  if (/contact|phone|email|reach|call|whatsapp/i.test(m)) return 'contact';
  if (/register|sign up|create account|join/i.test(m)) return 'faq_registration';
  if (/verif|certif|trusted|background|license/i.test(m)) return 'faq_verification';
  if (/language|french|english/i.test(m)) return 'faq_languages';
  if (/hour|24|available|disponible|time/i.test(m)) return 'faq_hours';
  if (/cancel|refund|rembourse|annul/i.test(m)) return 'faq_cancellation';
  if (/fever|pain|sick|illness|symptom|headache|cough/i.test(m)) return 'symptoms_advice';
  return 'unknown';
}

interface ChatAction { label: string; url: string; type: 'primary' | 'secondary' | 'danger'; }
interface ChatResponse { message: string; quickReplies?: string[]; actions?: ChatAction[]; }

function generateResponse(intent: Intent): ChatResponse {
  switch (intent) {
    case 'greeting':
      return {
        message: `👋 **Welcome to BridgeCare!**\n\nI'm **Amara**, your AI healthcare assistant for Cameroon. I can help you:\n\n• 🏥 Find the right care services\n• 👩‍⚕️ Book a verified nurse or caregiver\n• 💳 Understand MTN MoMo & Orange Money payments\n• 🚨 Get emergency guidance\n\nHow can I assist you today?`,
        quickReplies: ['Find a nurse', 'View services', 'How to book?', 'Emergency help'],
        actions: [{ label: '📋 Book Care Now', url: '/checkout', type: 'primary' }],
      };

    case 'services':
      return {
        message: `🏥 **BridgeCare Services**\n\nWe offer **${SERVICES.length} certified home healthcare services** across Cameroon:\n\n${SERVICES.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nAll services are delivered by **verified, licensed professionals**. Which type of care are you looking for?`,
        quickReplies: ['Post-Surgery Care', 'Elderly Care', 'Pediatric Nursing', 'Physiotherapy'],
        actions: [{ label: '📋 Book a Service', url: '/checkout', type: 'primary' }],
      };

    case 'booking':
      return {
        message: `📋 **How to Book Care in 3 Steps**\n\n**Step 1 — Select Your Care Type**\nChoose from 9 home healthcare services.\n\n**Step 2 — Choose Location & Dates**\nWe serve ${CITIES.length} major cities including Yaoundé, Douala, and Bafoussam.\n\n**Step 3 — Pay Securely via MoMo**\nFunds held safely until care begins.\n\n⏱️ Most bookings confirmed within **2–4 hours**. Same-day urgent care available.`,
        quickReplies: ['Check pricing', 'Payment methods', 'Emergency booking', 'Our locations'],
        actions: [
          { label: '🚀 Book Now', url: '/checkout', type: 'primary' },
          { label: '📍 Our Locations', url: '/#services', type: 'secondary' },
        ],
      };

    case 'payment':
      return {
        message: `💳 **Payment Methods — BridgeCare**\n\n**MTN Mobile Money (MTN MoMo)**\n• Dial *126# to confirm payment\n• Funds sent to: **671 159 461** (BridgeCare Official)\n\n**Orange Money**\n• Dial #150*50# to confirm payment\n• Funds sent to: **671 159 461** (BridgeCare Official)\n\n🔒 **Secure & Transparent**\n• No hidden charges\n• 1% platform fee (shown at checkout)\n• Official receipt issued after every transaction`,
        quickReplies: ['Payment failed?', 'Request refund', 'Book now'],
        actions: [
          { label: '💳 Go to Checkout', url: '/checkout', type: 'primary' },
          { label: '📞 Call Support', url: 'tel:+237671159461', type: 'secondary' },
        ],
      };

    case 'emergency':
      return {
        message: `🚨 **EMERGENCY — IMMEDIATE HELP**\n\n**Life-threatening emergency? Call SAMU immediately:**\n📞 **15 (SAMU Cameroon)**\n📞 **17 (Police)**\n\n**Urgent BridgeCare care (non-life-threatening):**\n• Call our 24/7 hotline: **+237 671 159 461**\n• We dispatch verified nurses within **30–60 minutes** in Yaoundé & Douala\n\n⚠️ Do NOT delay calling official emergency services if life is at risk.`,
        quickReplies: ['Book urgent care', 'Call hotline'],
        actions: [
          { label: '🚨 Call +237 671 159 461', url: 'tel:+237671159461', type: 'danger' },
          { label: '💬 WhatsApp Now', url: 'https://wa.me/237671159461?text=URGENT%20-%20I%20need%20immediate%20care', type: 'primary' },
        ],
      };

    case 'nurses':
      return {
        message: `👩‍⚕️ **Our Verified Caregivers**\n\nEvery BridgeCare caregiver passes a **5-step verification:**\n\n✅ License verification (state-registered)\n✅ Criminal background check\n✅ Skills assessment exam\n✅ Reference validation (3+ references)\n✅ Ongoing patient feedback monitoring\n\n🌟 **500+ verified professionals** | **4.8/5 ⭐ average rating** | **10 cities**`,
        quickReplies: ['Find a nurse near me', 'Book a nurse', 'Nurse specializations'],
        actions: [{ label: '👩‍⚕️ Browse Caregivers', url: '/checkout', type: 'primary' }],
      };

    case 'pricing':
      return {
        message: `💰 **BridgeCare Pricing (XAF)**\n\n| Service | Rate |\n|---|---|\n| General Nursing Visit | 15,000 – 35,000 |\n| Post-Surgery Care | 25,000 – 60,000 |\n| Physiotherapy | 20,000 – 45,000 |\n| Elderly Daily Care | 30,000 – 70,000 |\n| Pediatric Nursing | 20,000 – 40,000 |\n| Wound Dressing | 10,000 – 25,000 |\n\n📌 Rates vary by location, duration & experience.\n🔒 **1% platform fee** shown transparently at checkout.`,
        quickReplies: ['Book now', 'Payment options', 'Discounts?'],
        actions: [{ label: '📋 Get a Quote', url: '/checkout', type: 'primary' }],
      };

    case 'cities':
      return {
        message: `📍 **Where We Operate**\n\nBridgeCare serves **${CITIES.length} major cities** in Cameroon:\n\n${CITIES.map(c => `📌 ${c}`).join('\n')}\n\n⚡ **Fastest response:** Yaoundé & Douala (same-day care available)\n\n🚀 Expanding rapidly — contact us if your city isn't listed!`,
        quickReplies: ['Book in Yaoundé', 'Book in Douala', 'Other city'],
        actions: [
          { label: '🗺️ Find Care Near Me', url: '/checkout', type: 'primary' },
          { label: '📞 Ask About Your City', url: 'tel:+237671159461', type: 'secondary' },
        ],
      };

    case 'about':
      return {
        message: `🏥 **About BridgeCare / Ubuntu Health**\n\nCameroon's leading digital platform connecting families with **verified home healthcare professionals**.\n\n**Why BridgeCare?**\n• 🇨🇲 Built for Cameroon's healthcare landscape\n• 🔒 Strict 5-step caregiver vetting\n• 💳 Local mobile money payments (MTN & Orange)\n• 🌍 Bilingual support (French & English)\n• ⭐ 4.8/5 rating from 1,000+ families\n• 🏆 500+ professionals across 10 cities`,
        quickReplies: ['View services', 'How it works', 'Find a nurse'],
        actions: [{ label: '🚀 Get Started', url: '/', type: 'primary' }],
      };

    case 'contact':
      return {
        message: `📞 **Contact BridgeCare**\n\n**24/7 Hotline:** +237 671 159 461\n**WhatsApp:** wa.me/237671159461\n**Email:** support@bridgecare.cm\n\n**Business Hours (Non-Emergency):**\nMon–Fri: 7:00 AM – 8:00 PM\nSat–Sun: 8:00 AM – 5:00 PM\n\n⚡ Emergency team available **24/7**`,
        quickReplies: ['Call now', 'WhatsApp', 'Book online'],
        actions: [
          { label: '📞 Call +237 671 159 461', url: 'tel:+237671159461', type: 'primary' },
          { label: '💬 WhatsApp Us', url: 'https://wa.me/237671159461', type: 'secondary' },
        ],
      };

    case 'faq_registration':
      return {
        message: `📝 **How to Register on BridgeCare**\n\n**For Clients/Families:**\n1. Click "Register" on the homepage\n2. Choose "I need care for my family"\n3. Fill in your details & verify via SMS\n4. Start booking immediately! ✅\n\n**For Nurses/Caregivers:**\n1. Register as "Healthcare Professional"\n2. Upload license & complete assessment\n3. Background check (24–48 hours)\n4. Start accepting requests! ✅\n\n**Registration is completely FREE.**`,
        quickReplies: ['Register as client', 'Register as nurse', 'Login help'],
        actions: [
          { label: '✅ Register Now', url: '/auth/register', type: 'primary' },
          { label: '🔑 Sign In', url: '/auth/login', type: 'secondary' },
        ],
      };

    case 'faq_verification':
      return {
        message: `🔒 **How We Verify Caregivers**\n\n**5-Step Verification Protocol:**\n\n1️⃣ License check with nursing boards\n2️⃣ National ID / passport verification\n3️⃣ Criminal background check\n4️⃣ Practical skills examination\n5️⃣ 3+ professional references validated\n\n🔄 Re-evaluated every **6 months** and after every negative review.\n⭐ We accept only the **top 15%** of applicants.`,
        quickReplies: ['Find verified nurse', 'How ratings work', 'Book now'],
      };

    case 'faq_languages':
      return {
        message: `🌍 **Language Support**\n\nBridgeCare is fully **bilingual** — French and English.\n\n• 🇫🇷 French — Complete platform support\n• 🇬🇧 English — Complete platform support\n• Toggle with the 🌐 button in the top navigation\n\nIn Anglophone regions (Northwest, Southwest), English-speaking nurses are prioritized.`,
        quickReplies: ['View services', 'Find English nurse', 'Contact us'],
      };

    case 'faq_hours':
      return {
        message: `🕐 **BridgeCare Availability**\n\n**Platform & Chat:** 24/7 ⚡\n\n**Emergency Dispatch:**\n🚨 24/7 — Yaoundé & Douala\n⏰ 6 AM–10 PM — Other cities\n\n**Scheduled Care:** 7 days/week, 6 AM–9 PM\n\n**Response Times:**\n• Emergency: 30–60 min (Yaoundé/Douala)\n• Same-day: 2–4 hours\n• Planned: Next-day guaranteed`,
        quickReplies: ['Book emergency care', 'Schedule for tomorrow', 'Contact support'],
      };

    case 'faq_cancellation':
      return {
        message: `↩️ **Cancellations & Refunds**\n\n• Cancel **24+ hours before** → Full refund ✅\n• Cancel **4–24 hours before** → 50% refund\n• Cancel **<4 hours before** → No refund\n\n**How to Cancel:**\nDashboard → My Appointments → Cancel Booking\n\n**Refund Processing:** 24–48 hours via MoMo\n\nUrgent cancellation? Call **+237 671 159 461**`,
        quickReplies: ['Cancel a booking', 'Request refund', 'Contact support'],
        actions: [
          { label: '📋 My Bookings', url: '/dashboard', type: 'primary' },
          { label: '📞 Call Support', url: 'tel:+237671159461', type: 'secondary' },
        ],
      };

    case 'symptoms_advice':
      return {
        message: `⚠️ **Health Advice — Important Notice**\n\nI'm an AI assistant and **cannot provide medical diagnoses**.\n\n🚨 **Life-threatening emergency?**\n→ Call **15 (SAMU)** or **17 (Police)** immediately\n\n🏥 **Need professional assessment at home?**\nBook a BridgeCare nurse for a home visit. Our nurses can take vitals, assess symptoms, and coordinate with doctors.\n\n💡 **General Tip:** Seek professional care for symptoms lasting **48+ hours**.`,
        quickReplies: ['Book a nurse visit', 'Emergency help', 'Call hotline'],
        actions: [
          { label: '🚨 Emergency: Call 15', url: 'tel:15', type: 'danger' },
          { label: '👩‍⚕️ Book a Nurse', url: '/checkout', type: 'primary' },
        ],
      };

    case 'thanks':
      return {
        message: `😊 You're welcome! It's my pleasure to help.\n\nIf you have any other questions about BridgeCare services, booking, or payments — I'm here 24/7!\n\n**Anything else I can help you with?**`,
        quickReplies: ['Find a nurse', 'View services', 'Contact team'],
      };

    case 'farewell':
      return {
        message: `👋 **Goodbye and take care!**\n\nThank you for choosing BridgeCare. We're always here whenever you need professional home healthcare in Cameroon.\n\n🏥 Stay healthy!\n\n*— Amara, BridgeCare AI Assistant*`,
        actions: [{ label: '🏠 Back to Homepage', url: '/', type: 'secondary' }],
      };

    default:
      return {
        message: `🤔 I'm not quite sure I understood that. I'm **Amara**, BridgeCare's AI assistant, and I can help with:\n\n• 🏥 **Services** — what we offer\n• 📋 **Booking** — how to hire a nurse\n• 💳 **Payments** — MTN MoMo & Orange Money\n• 🚨 **Emergencies** — urgent care guidance\n• 📍 **Locations** — cities we serve\n• ❓ **FAQs** — registration, pricing, cancellation\n\nCould you rephrase, or choose a topic below?`,
        quickReplies: ['Services', 'How to book', 'Pricing', 'Emergency', 'Contact us'],
      };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const intent = detectIntent(message.trim());
    const response = generateResponse(intent);
    return NextResponse.json({ success: true, intent, ...response });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
