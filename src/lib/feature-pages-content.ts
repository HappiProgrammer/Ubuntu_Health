export interface FeatureDetailData {
  slug: string;
  category: 'services' | 'platform' | 'company';
  title: string;
  subtitle: string;
  eyebrow: string;
  badge: string;
  icon: string;
  heroDescription: string;
  keyFeatures: Array<{
    title: string;
    description: string;
    iconName: string;
    badge?: string;
  }>;
  benefits: string[];
  ctaTitle: string;
  ctaDescription: string;
  checkoutServiceId?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export const featurePagesData: Record<string, FeatureDetailData> = {
  // SERVICES
  'home-care': {
    slug: 'home-care',
    category: 'services',
    title: 'Professional In-Home Care Services',
    subtitle: 'Warm, respectful assistance with daily living, personal care, and wellness routines in the comfort of your home.',
    eyebrow: 'Comprehensive Home Health',
    badge: 'Most Requested',
    icon: '🏠',
    heroDescription: 'Our certified home caregivers assist elderly parents, recovering patients, and individuals needing daily assistance with personal hygiene, meal preparation, medication reminders, and warm companionship across Douala, Yaoundé, and Buea.',
    keyFeatures: [
      {
        title: 'Personal Hygiene & Bathing Assistance',
        description: 'Dignified, gentle assistance with daily grooming, bathing, dressing, and skin care maintained to hospital sanitary standards.',
        iconName: 'HeartHandshake',
        badge: 'Dignified Care'
      },
      {
        title: 'Medication Schedules & Vitals Log',
        description: 'Timely administration of prescribed medications, daily blood pressure monitoring, temperature checks, and glucose logs.',
        iconName: 'Stethoscope',
        badge: 'Clinical Tracking'
      },
      {
        title: 'Nutrition & Meal Preparation',
        description: 'Nutritious meal preparation tailored to dietary requirements (low sodium, diabetic-friendly) and gentle feeding assistance.',
        iconName: 'CheckCircle2',
        badge: 'Health Meal Plan'
      },
      {
        title: 'Diaspora Family WhatsApp Daily Log',
        description: 'Daily photo, vitals, and progress reports shared directly with family members living abroad via private WhatsApp groups.',
        iconName: 'Globe2',
        badge: 'Diaspora Live Log'
      }
    ],
    benefits: [
      'Verified state-certified caregivers and nurses',
      'Flexible hourly, daily, or full live-in schedules',
      'Zero hospital transport stress for fragile family members',
      'Pay conveniently via MTN MoMo or Orange Money'
    ],
    ctaTitle: 'Book Certified Home Care Today',
    ctaDescription: 'Schedule a verified home caregiver to visit your loved one within 24 hours.',
    checkoutServiceId: 'senior',
    faq: [
      {
        question: 'How quickly can a caregiver start after booking?',
        answer: 'For urgent requests in Douala, Yaoundé, or Buea, a verified caregiver can be dispatched within 2 to 4 hours. Scheduled care can be booked for any date.'
      },
      {
        question: 'Are the caregivers background-checked?',
        answer: 'Yes. Every caregiver undergoes a 4-step verification audit including official registry license verification, national ID verification, criminal background check, and clinical reference check.'
      }
    ]
  },

  'elder-support': {
    slug: 'elder-support',
    category: 'services',
    title: 'Dedicated Elder & Senior Support',
    subtitle: 'Empowering elderly parents to age with independence, joy, and comprehensive clinical oversight at home.',
    eyebrow: 'Geriatric Care Excellence',
    badge: 'Family Favorite',
    icon: '👵',
    heroDescription: 'Specialized geriatric care designed for aging family members. We focus on mobility support, fall prevention, cognitive stimulation, chronic condition monitoring, and emotional warmth.',
    keyFeatures: [
      {
        title: 'Mobility & Fall Prevention Support',
        description: 'Safe transfer techniques, guided walking, joint range-of-motion exercises, and home hazard assessments.',
        iconName: 'ShieldCheck',
        badge: 'Safety First'
      },
      {
        title: 'Cognitive & Memory Stimulation',
        description: 'Engaging conversations, memory games, storytelling, and structured routines to support mental clarity and combat isolation.',
        iconName: 'Sparkles',
        badge: 'Active Mind'
      },
      {
        title: 'Geriatric Vital Monitoring',
        description: 'Regular blood pressure, pulse oximetry, blood sugar monitoring, and early detection of clinical decline.',
        iconName: 'Activity',
        badge: 'Vitals Log'
      },
      {
        title: 'Companionship & Emotional Wellbeing',
        description: 'Empathetic companions who listen, accompany elders on garden walks, and provide deep emotional support.',
        iconName: 'MessageSquareHeart',
        badge: 'Warm Company'
      }
    ],
    benefits: [
      'Preserve your parents independence and comfort in their own home',
      'Reduce emergency hospital readmissions by 65%',
      'Transparent logs shared daily with children in the Diaspora',
      'Instant Mobile Money payments in FCFA'
    ],
    ctaTitle: 'Ensure Your Parents Receive the Best Care',
    ctaDescription: 'Connect with certified elder care specialists who treat your parents like family.',
    checkoutServiceId: 'senior',
    faq: [
      {
        question: 'Can we request a full-time live-in elder caregiver?',
        answer: 'Yes! We offer 24/7 live-in senior care packages as well as day shift (8-12 hours) and weekly care options.'
      }
    ]
  },

  'medical-assistance': {
    slug: 'medical-assistance',
    category: 'services',
    title: 'Clinical Medical & Nursing Assistance',
    subtitle: 'State-registered nurses delivering clinical procedures, sterile wound dressings, and IV therapies at your doorstep.',
    eyebrow: 'Clinical Home Nursing',
    badge: 'Licensed Nurses',
    icon: '🩺',
    heroDescription: 'Avoid exhausting hospital queues and transportation risks. Our licensed state registered nurses perform surgical wound dressings, injections, IV catheter maintenance, and acute recovery care at home.',
    keyFeatures: [
      {
        title: 'Sterile Surgical Wound Dressing',
        description: 'Advanced wound management for post-operative incisions, diabetic ulcers, and pressure sores using hospital-grade sterile protocols.',
        iconName: 'Stethoscope',
        badge: 'Sterile Protocol'
      },
      {
        title: 'Injections, IV Drips & Catheters',
        description: 'Professional administration of prescribed intravenous fluids, intramuscular injections, urinary catheter insertion, and monitoring.',
        iconName: 'CheckCircle2',
        badge: 'Licensed Injection'
      },
      {
        title: 'Post-Operative Recovery Milestones',
        description: 'Surgical drain management, pain tracking, vital sign stabilization, and surgeon progress reporting.',
        iconName: 'Activity',
        badge: 'Post-Op Care'
      },
      {
        title: 'Chronic Disease Triage & BP Control',
        description: 'Hypertension management, insulin dose administration, diabetic foot checks, and emergency physician alerts.',
        iconName: 'ShieldAlert',
        badge: 'Triage Specialist'
      }
    ],
    benefits: [
      'Performed strictly by state-registered licensed nurses in Cameroon',
      'Sterile equipment and hospital-grade single-use supplies',
      'Immediate physician communication for abnormal vital readings',
      'Pay securely using MTN MoMo or Orange Money'
    ],
    ctaTitle: 'Request a Licensed Clinical Nurse Now',
    ctaDescription: 'Get a state-registered nurse to your home for sterile dressings, injections, or recovery management.',
    checkoutServiceId: 'post_op',
    faq: [
      {
        question: 'Are the nurses qualified to administer IV fluids?',
        answer: 'Yes. All our clinical nurses hold valid Cameroonian State Nursing Licenses (IDE/SRN) and are certified in IV therapy and emergency triage.'
      }
    ]
  },

  // PLATFORM
  'how-it-works': {
    slug: 'how-it-works',
    category: 'platform',
    title: 'How BridgeCare Platform Operates',
    subtitle: 'A seamless 3-step matching engine connecting Cameroonian families with verified caregivers in minutes.',
    eyebrow: 'Seamless Process',
    badge: 'Simple & Transparent',
    icon: '⚡',
    heroDescription: 'We designed BridgeCare to be fast, transparent, and accessible to everyone in Cameroon and the Diaspora. Here is how you get started in three effortless steps.',
    keyFeatures: [
      {
        title: 'Step 1: Choose Care & Location',
        description: 'Select the care type (Senior Care, Nursing, Post-Op), specify your city (Douala, Yaoundé, Buea), and set your urgency.',
        iconName: 'MapPin',
        badge: 'Step 01'
      },
      {
        title: 'Step 2: Instant Verified Match',
        description: 'Our matching algorithm pairs your family with top-rated nearby certified nurses whose background and credentials have been audited.',
        iconName: 'Sparkles',
        badge: 'Step 02'
      },
      {
        title: 'Step 3: Pay via MoMo & Track Live',
        description: 'Pay safely using MTN MoMo or Orange Money. Receive daily WhatsApp vitals reports and photo logs directly on your phone.',
        iconName: 'Smartphone',
        badge: 'Step 03'
      }
    ],
    benefits: [
      'No complex contracts or hidden fees',
      '100% verified state-registered professionals',
      'Live WhatsApp care logs for family members abroad',
      'Instant Mobile Money payment in FCFA'
    ],
    ctaTitle: 'Try Quick Care Match Now',
    ctaDescription: 'Find certified healthcare professionals in your neighborhood in less than 2 minutes.',
    checkoutServiceId: 'quick_care'
  },

  'safety': {
    slug: 'safety',
    category: 'platform',
    title: 'Our Trust & Safety Commitment',
    subtitle: 'Uncompromising verification, clinical standards, and security for every family in Cameroon.',
    eyebrow: 'Safety & Ethics Guarantee',
    badge: '100% Verified',
    icon: '🛡️',
    heroDescription: 'Your family’s safety and health are sacred. BridgeCare enforces strict 4-step background checks, credential verification, and continuous clinical oversight for every listed professional.',
    keyFeatures: [
      {
        title: 'Official Nursing License Audit',
        description: 'Verification of state nursing diplomas (IDE/SRN) with official ministry and council databases in Cameroon.',
        iconName: 'ShieldCheck',
        badge: 'License Audited'
      },
      {
        title: 'National Identity & Address Check',
        description: 'Biometric CNI verification, neighborhood residential verification, and criminal background clearance.',
        iconName: 'UserCheck',
        badge: 'ID Verified'
      },
      {
        title: 'Reference & Hospital Work Audit',
        description: 'Contacting previous hospital supervisors and clinical references to verify bedside ethics and punctuality.',
        iconName: 'CheckCircle2',
        badge: 'Reference Audited'
      },
      {
        title: '256-Bit Encrypted Payments',
        description: 'Bank-grade encrypted Mobile Money payments with instant automated official receipts and full refund protection.',
        iconName: 'Lock',
        badge: 'Secure Payouts'
      }
    ],
    benefits: [
      'Zero unverified or anonymous caregivers allowed on the network',
      'Satisfaction guarantee: free replacement if clinical standards are not met',
      '24/7 CareLine hotline for family emergencies',
      'Transparent Mobile Money receipts'
    ],
    ctaTitle: 'Book Care with 100% Peace of Mind',
    ctaDescription: 'Protect your loved ones with verified, compassionate healthcare experts.',
    checkoutServiceId: 'senior'
  },

  'support': {
    slug: 'support',
    category: 'platform',
    title: '24/7 Patient & Family Support',
    subtitle: 'We are always here to answer questions, assist with bookings, or coordinate urgent care dispatches.',
    eyebrow: 'Help Center & CareLine',
    badge: '24/7 Available',
    icon: '💬',
    heroDescription: 'Whether you need help selecting the right care package, setting up Mobile Money payments, or requesting an urgent nurse dispatch, our dedicated support team in Douala and Yaoundé is standing by.',
    keyFeatures: [
      {
        title: '24/7 Emergency CareLine Phone',
        description: 'Call (+237) 671 159 461 anytime day or night for rapid nurse dispatch or medical consultation guidance.',
        iconName: 'PhoneCall',
        badge: 'Immediate Call'
      },
      {
        title: 'Diaspora Family WhatsApp Coordination',
        description: 'Dedicated family WhatsApp group created for every booking to receive live daily updates from the attending nurse.',
        iconName: 'Globe2',
        badge: 'WhatsApp Support'
      },
      {
        title: 'Mobile Money Payment Guidance',
        description: 'Assistance with MTN MoMo (*126#) and Orange Money (#150#) transactions and receipt generation.',
        iconName: 'Smartphone',
        badge: 'MoMo Help'
      }
    ],
    benefits: [
      'Direct human support in English and French',
      'Fast response time under 5 minutes',
      'Free care coordination for complex senior cases',
      'Full guidance for families living abroad'
    ],
    ctaTitle: 'Speak with a Care Coordinator Now',
    ctaDescription: 'Call (+237) 671 159 461 or start an instant booking online.',
    checkoutServiceId: 'quick_care'
  },

  // COMPANY
  'about': {
    slug: 'about',
    category: 'company',
    title: 'About BridgeCare (CAMIHN)',
    subtitle: 'Pioneering compassionate, tech-enabled home healthcare across Cameroon.',
    eyebrow: 'Our Mission & Story',
    badge: 'Cameroon Health Leader',
    icon: '❤️',
    heroDescription: 'BridgeCare is powered by the Cameroon Innovative Health Network (CAMIHN). We were founded with a singular purpose: to bridge the gap between families needing quality healthcare and verified nurses searching for meaningful opportunities.',
    keyFeatures: [
      {
        title: 'Dignity in Home Care',
        description: 'We believe elderly parents and vulnerable patients deserve dignified, warm care in the familiar comfort of home.',
        iconName: 'HeartHandshake',
        badge: 'Core Value'
      },
      {
        title: 'Empowering Cameroonian Nurses',
        description: 'Providing fair compensation, digital tools, and career growth for dedicated State Registered Nurses across Cameroon.',
        iconName: 'Award',
        badge: 'Nurse Empowerment'
      },
      {
        title: 'Diaspora Peace of Mind',
        description: 'Enabling Cameroonian sons and daughters living abroad to care for their aging parents back home with full transparency.',
        iconName: 'Globe2',
        badge: 'Global Bridge'
      }
    ],
    benefits: [
      'Operating across Douala, Yaoundé, Buea, Limbe, Bafoussam & Kribi',
      'Over 2,400+ families served with 4.95/5 satisfaction rating',
      'Official collaboration with licensed healthcare practitioners',
      'Built with pride for Cameroon'
    ],
    ctaTitle: 'Join the BridgeCare Health Movement',
    ctaDescription: 'Discover how we are building a healthier, more compassionate Cameroon.',
    checkoutServiceId: 'senior'
  },

  'community': {
    slug: 'community',
    category: 'company',
    title: 'BridgeCare Family & Nurse Community',
    subtitle: 'Real stories, community health initiatives, and impact across Cameroonian homes.',
    eyebrow: 'Stories & Impact',
    badge: '2,400+ Families',
    icon: '👥',
    heroDescription: 'Our community unites thousands of families, elders, dedicated nurses, and diaspora members sharing a common vision of healthcare rooted in empathy, respect, and clinical excellence.',
    keyFeatures: [
      {
        title: 'Family Testimonials',
        description: 'Hear how BridgeCare provided peace of mind for families managing senior care and post-stroke rehabilitation at home.',
        iconName: 'MessageSquareHeart',
        badge: 'Family Stories'
      },
      {
        title: 'Nurse Excellence Awards',
        description: 'Recognizing top-performing state-registered nurses based on family reviews, punctuality, and clinical bedside care.',
        iconName: 'Star',
        badge: 'Nurse Spotlight'
      },
      {
        title: 'Community Health Workshops',
        description: 'Free public health sessions on hypertension control, diabetic foot care, and senior fall prevention.',
        iconName: 'Sparkles',
        badge: 'Health Outreach'
      }
    ],
    benefits: [
      'Verified family ratings and reviews',
      'Continuous clinical education for listed caregivers',
      'Empowering local healthcare workers',
      'Transparent community standards'
    ],
    ctaTitle: 'Become Part of Our Care Community',
    ctaDescription: 'Book care for your family or join as a certified healthcare professional.',
    checkoutServiceId: 'senior'
  },

  'contact': {
    slug: 'contact',
    category: 'company',
    title: 'Contact BridgeCare Cameroon',
    subtitle: 'Get in touch with our care coordination team in Douala, Yaoundé, or Buea.',
    eyebrow: 'Get in Touch',
    badge: 'Direct Connect',
    icon: '📞',
    heroDescription: 'Have a question about our home care services, nurse verification, or Mobile Money billing? Reach out via phone, email, or visit our regional care hubs.',
    keyFeatures: [
      {
        title: 'Phone & 24/7 Hotline',
        description: 'Call (+237) 671 159 461 for immediate care consultations and nurse booking assistance.',
        iconName: 'PhoneCall',
        badge: 'Direct Call'
      },
      {
        title: 'Regional Care Hubs',
        description: 'Douala (Akwa / Bonapriso), Yaoundé (Bastos), and Buea (Molyko Care Center).',
        iconName: 'MapPin',
        badge: 'Office Hubs'
      },
      {
        title: 'Email & WhatsApp Inquiries',
        description: 'Email contact@camihn.org or chat directly with a care coordinator on WhatsApp.',
        iconName: 'Globe2',
        badge: 'Online Chat'
      }
    ],
    benefits: [
      'Immediate phone assistance in English and French',
      'Free consultation to assess your family care needs',
      'Instant Mobile Money booking support',
      'Friendly Cameroonian support staff'
    ],
    ctaTitle: 'Start Your Home Care Consultation Today',
    ctaDescription: 'Book a service online or call (+237) 671 159 461 right now.',
    checkoutServiceId: 'senior'
  }
};
