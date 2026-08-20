export type Language = 'en' | 'fr'

export type HomeCopy = {
  announcement: string
  emergencyBanner: {
    badge: string
    text: string
    callText: string
    phoneNumber: string
  }
  accessibility: {
    textSize: string
    contrast: string
    normal: string
    large: string
    extraLarge: string
  }
  nav: {
    services: string
    howItWorks: string
    safety: string
    faq: string
    login: string
    register: string
  }
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    rolePrompt: string
    nurseLabel: string
    clientLabel: string
    primaryCta: string
    secondaryCta: string
    trustBadges: string[]
    quickFinder: {
      title: string
      subtitle: string
      step1Label: string
      careTypes: Array<{ id: string; label: string; icon: string }>
      step2Label: string
      cities: string[]
      step3Label: string
      durations: Array<{ id: string; label: string }>
      cta: string
    }
  }
  metrics: Array<{
    value: string
    label: string
    subtext: string
  }>
  servicesSection: {
    title: string
    subtitle: string
    services: Array<{
      id: string
      title: string
      description: string
      badge: string
      features: string[]
      icon: string
    }>
  }
  features: {
    title: string
    subtitle: string
    items: Array<{
      title: string
      description: string
      highlight: string
    }>
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: Array<{
      title: string
      description: string
      tip: string
    }>
  }
  diasporaSection: {
    badge: string
    title: string
    description: string
    benefits: string[]
    cta: string
  }
  trustSafety: {
    title: string
    subtitle: string
    points: Array<{
      title: string
      description: string
    }>
  }
  faq: {
    title: string
    subtitle: string
    items: Array<{
      question: string
      answer: string
    }>
  }
  testimonials: {
    title: string
    subtitle: string
    items: Array<{
      quote: string
      name: string
      role: string
      location: string
      rating: number
    }>
  }
  cta: {
    title: string
    description: string
    primary: string
    secondary: string
    callSupport: string
  }
  footer: {
    description: string
    emergencyNotice: string
    columns: Array<{
      title: string
      links: string[]
    }>
  }
}

export const homeContent: Record<Language, HomeCopy> = {
  en: {
    announcement: '❤️ Compassionate, certified home nursing & senior care across Cameroon',
    emergencyBanner: {
      badge: '24/7 SUPPORT',
      text: 'Need immediate nurse assistance or urgent care advice?',
      callText: 'Call CareLine (+237) 671 159 461',
      phoneNumber: '+237671159461',
    },
    accessibility: {
      textSize: 'Text Size',
      contrast: 'High Contrast',
      normal: 'A',
      large: 'A+',
      extraLarge: 'A++',
    },
    nav: {
      services: 'Services',
      howItWorks: 'How it Works',
      safety: 'Safety & Trust',
      faq: 'FAQ',
      login: 'Sign In',
      register: 'Join / Book Care',
    },
    hero: {
      eyebrow: 'Healthcare That Feels Like Family',
      title: 'Loving, verified home care for parents, recovery & infants.',
      subtitle:
        'BridgeCare connects families in Cameroon and in the diaspora with certified nurses, compassionate caregivers, and home health professionals you can trust.',
      rolePrompt: 'How can we help you today?',
      nurseLabel: 'I am a Certified Nurse / Caregiver',
      clientLabel: 'I am looking for Care for my Family',
      primaryCta: 'Find a Caregiver',
      secondaryCta: 'Register as Nurse',
      trustBadges: [
        '🩺 100% Verified Medical Credentials',
        '🔒 Safe MTN & Orange Money Escrow',
        '📍 Available in 10+ Major Cities',
        '🌍 Diaspora-Friendly Family Booking',
      ],
      quickFinder: {
        title: 'Quick Care Match',
        subtitle: 'Find trusted professionals near you in 3 easy clicks',
        step1Label: '1. Who needs care?',
        careTypes: [
          { id: 'senior', label: 'Elderly & Senior Care', icon: '👵' },
          { id: 'nursing', label: 'Home Clinical Nursing', icon: '🩹' },
          { id: 'postop', label: 'Post-Surgery Recovery', icon: '🏥' },
          { id: 'maternal', label: 'Mother & Infant Care', icon: '👶' },
        ],
        step2Label: '2. Select your city',
        cities: ['Douala', 'Yaoundé', 'Buea', 'Limbe', 'Bafoussam', 'Bamenda', 'Kribi'],
        step3Label: '3. When do you need care?',
        durations: [
          { id: 'today', label: 'Urgent (Today)' },
          { id: 'scheduled', label: 'This Week' },
          { id: 'livein', label: 'Long-term / Live-in' },
        ],
        cta: 'Find Certified Caregivers Nearby →',
      },
    },
    metrics: [
      { value: '500+', label: 'Verified Caregivers', subtext: 'Background & license checked' },
      { value: '2,400+', label: 'Families Supported', subtext: 'Across Douala, Yaoundé & Buea' },
      { value: '4.95 / 5', label: 'Family Trust Rating', subtext: 'Based on verified reviews' },
    ],
    servicesSection: {
      title: 'Care Tailored with Warmth and Dignity',
      subtitle: 'From gentle daily companionship to specialized clinical treatments at your doorstep.',
      services: [
        {
          id: 'elderly',
          title: 'Elderly & Senior Support',
          description: 'Help your elderly parents age with dignity in the comfort of their home with assistance in daily routines, mobility, and companionship.',
          badge: 'Most Requested',
          features: ['Medication schedules & vital tracking', 'Bathing & gentle mobility assistance', 'Nutrition support & warm companionship'],
          icon: '👵',
        },
        {
          id: 'nursing',
          title: 'Clinical Home Nursing',
          description: 'Certified state registered nurses delivering essential medical procedures safely without exhausting hospital trips.',
          badge: 'Certified Medical',
          features: ['Wound dressing & surgical drain care', 'Injections, IV drips & catheter care', 'Blood pressure & diabetes monitoring'],
          icon: '🩺',
        },
        {
          id: 'maternal',
          title: 'Postpartum & Newborn Care',
          description: 'Specialized assistance for new mothers and babies during the crucial early weeks of recovery and infant care.',
          badge: 'Gentle Care',
          features: ['C-section recovery support', 'Newborn feeding guidance & sleep care', 'Maternal wellness monitoring'],
          icon: '👶',
        },
        {
          id: 'rehab',
          title: 'Stroke & Physical Rehabilitation',
          description: 'Structured therapy assistance and daily exercises to help loved ones regain strength and independence after stroke or trauma.',
          badge: 'Specialized Recovery',
          features: ['Guided mobility exercises', 'Speech & motor skills practice', 'Fall prevention & safe transfers'],
          icon: '💪',
        },
      ],
    },
    features: {
      title: 'Why Families Across Cameroon Trust Us',
      subtitle: 'We eliminate the worry and uncertainty of finding reliable health support.',
      items: [
        {
          title: 'Rigorous 4-Step Nurse Verification',
          description: 'Every professional undergoes credential verification with official registries, ID background checks, and reference audits.',
          highlight: 'Certified Credentials',
        },
        {
          title: 'Location-Based Nearby Dispatch',
          description: 'Match with caregivers who live within your neighborhood for fast response times and dependable daily punctuality.',
          highlight: 'Neighborhood Proximity',
        },
        {
          title: 'Protected Mobile Money Escrow',
          description: 'Pay securely using MTN MoMo or Orange Money. Your payment is held safely and only released when care is completed to your satisfaction.',
          highlight: '100% Safe Payments',
        },
        {
          title: 'Real-Time Family Visit Logs',
          description: 'Receive detailed daily updates on vitals, meals, and care notes directly on your phone, even if you are living in the diaspora.',
          highlight: 'Full Transparency',
        },
      ],
    },
    howItWorks: {
      title: 'Simple, Reassuring Steps to Quality Care',
      subtitle: 'Getting help should never be complicated. Here is how easy it is:',
      steps: [
        {
          title: '1. Tell Us What Your Loved One Needs',
          description: 'Select the care type, patient location, and preferred visiting schedule in under 2 minutes.',
          tip: 'No medical jargon needed — just tell us what support you want.',
        },
        {
          title: '2. Review Profiles of Verified Caregivers',
          description: 'Compare qualifications, reviews from other local families, photos, and hourly/daily rates.',
          tip: 'You can message or call the caregiver before confirming.',
        },
        {
          title: '3. Book & Relax with Peace of Mind',
          description: 'Confirm the appointment, pay securely via Mobile Money, and track the caregiver’s check-in.',
          tip: 'Dedicated 24/7 support line always available to help.',
        },
      ],
    },
    diasporaSection: {
      badge: 'FOR CAMEROONIANS ABROAD',
      title: 'Taking Care of Parents Back Home Just Got Easier',
      description:
        'Living in the US, Europe, or across Africa? BridgeCare lets you book certified home care for your parents in Cameroon, pay with international cards or MoMo, and receive daily photo & vitals reports.',
      benefits: [
        'Direct booking with English & French speaking coordinators',
        'Daily health summaries & medication compliance tracking',
        'Direct payment with no third-party friction or hidden fees',
        'Emergency response dispatch to your family’s doorstep',
      ],
      cta: 'Set Up Care for Parents Back Home →',
    },
    trustSafety: {
      title: 'Your Family’s Safety Is Our Sacred Duty',
      subtitle: 'Standards built to give you total confidence in who enters your home.',
      points: [
        {
          title: 'Verified Medical Licenses',
          description: 'Nurses must provide verified diplomas from accredited Cameroon nursing schools (e.g., HND, IDE, State Registered Nurse).',
        },
        {
          title: 'Zero Prepayment Risk',
          description: 'Money is protected in escrow. If a caregiver cancels or fails to meet standards, you receive an immediate replacement or full refund.',
        },
        {
          title: 'Continuous Review System',
          description: 'Every visit is rated by families. Caregivers must maintain a 4.5+ star rating to remain active on the platform.',
        },
        {
          title: 'Patient Privacy & Respect',
          description: 'All medical records and home addresses are encrypted and strictly confidential under healthcare data protection standards.',
        },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Clear answers to help you make informed decisions for your family.',
      items: [
        {
          question: 'How do you verify the nurses and caregivers?',
          answer:
            'Every caregiver must submit their National ID card, accredited Nursing diploma (IDE, SRN, or Nursing Assistant certification), police clearance record, and two professional references. Our clinical team verifies each document directly with the issuing institution.',
        },
        {
          question: 'Can I book care for my family in Cameroon if I live abroad?',
          answer:
            'Yes! Over 40% of our families are based in the diaspora (USA, UK, Canada, France, Germany, UAE). You can book, schedule visits, pay easily, and receive digital health updates on your phone after every shift.',
        },
        {
          question: 'How does payment work with MTN Mobile Money & Orange Money?',
          answer:
            'When you confirm a booking, your payment is placed in a secure escrow hold. The caregiver is only paid after the care session is completed and you confirm satisfactory service. If anything goes wrong, you are 100% protected.',
        },
        {
          question: 'What if we need care urgently today?',
          answer:
            'Our Quick Care network has on-call registered nurses in Douala, Yaoundé, and Buea who can arrive at your doorstep within 60 to 90 minutes for urgent wound dressing, injections, or patient stabilization.',
        },
        {
          question: 'How much does home care cost?',
          answer:
            'Prices are transparent and set clearly per hour, shift (8h / 12h), or monthly live-in arrangements. Rates typically start from 5,000 XAF to 15,000 XAF per visit depending on whether clinical nursing or senior companionship is needed.',
        },
      ],
    },
    testimonials: {
      title: 'Real Stories from Families & Caregivers',
      subtitle: 'Hear from real families who found comfort and reliable support.',
      items: [
        {
          quote:
            'I live in Maryland (USA) and was always worried about my 78-year-old mother in Douala with hypertension. BridgeCare matched us with Nurse Mireille, who visits every morning. The peace of mind is priceless.',
          name: 'Collette Mbi',
          role: 'Daughter in Diaspora',
          location: 'Douala / USA',
          rating: 5,
        },
        {
          quote:
            'After my father’s hip surgery, we needed professional dressing and catheter care. Nurse Samuel was punctual, gentle, and highly competent. My father recovered much faster at home.',
          name: 'Patrick Nkem',
          role: 'Family Member',
          location: 'Yaoundé, Bastos',
          rating: 5,
        },
        {
          quote:
            'As a State Registered Nurse, this platform allows me to find respectful families who value my healthcare skills, with guaranteed timely payment via MTN MoMo.',
          name: 'Nurse Clarisse T.',
          role: 'State Registered Nurse',
          location: 'Buea, SW Region',
          rating: 5,
        },
      ],
    },
    cta: {
      title: 'Give Your Family the Care and Dignity They Deserve',
      description: 'Find a certified, compassionate nurse or caregiver in your neighborhood today in less than 3 minutes.',
      primary: 'Book a Caregiver Now',
      secondary: 'Call Support (+237 671 159 461)',
      callSupport: 'Need help choosing? Speak with our Care Coordinator',
    },
    footer: {
      description:
        'BridgeCare is Cameroon’s premier home healthcare and eldercare matching platform. Connecting families with certified, verified nurses and compassionate caregivers with transparency and dignity.',
      emergencyNotice: '⚠️ In case of life-threatening emergencies, please immediately contact your nearest hospital or SAMU (15 / 119).',
      columns: [
        {
          title: 'Care Services',
          links: ['Elderly Senior Care', 'Clinical Home Nursing', 'Post-Surgery Recovery', 'Maternal & Newborn Care', 'Stroke Rehabilitation'],
        },
        {
          title: 'Coverage Areas',
          links: ['Douala (Akwa, Bonapriso, Bonamoussadi)', 'Yaoundé (Bastos, Omnisports, Biyem-Assi)', 'Buea & Limbe', 'Bafoussam & West Region', 'Bamenda & NW Region'],
        },
        {
          title: 'Trust & Support',
          links: ['Nurse Verification Process', 'Diaspora Family Guide', 'MTN & Orange Money Escrow', 'Terms & Patient Privacy', 'Contact Support'],
        },
      ],
    },
  },
  fr: {
    announcement: '❤️ Des soins à domicile bienveillants et certifiés pour les aînés et les familles au Cameroun',
    emergencyBanner: {
      badge: 'SUPPORT 24H/7',
      text: 'Besoin immédiat d’une assistance infirmière ou de conseils médicaux ?',
      callText: 'Appelez CareLine (+237) 671 159 461',
      phoneNumber: '+237671159461',
    },
    accessibility: {
      textSize: 'Taille du texte',
      contrast: 'Contraste élevé',
      normal: 'A',
      large: 'A+',
      extraLarge: 'A++',
    },
    nav: {
      services: 'Services',
      howItWorks: 'Comment ça marche',
      safety: 'Sécurité & Confiance',
      faq: 'FAQ',
      login: 'Connexion',
      register: 'Réserver un soin',
    },
    hero: {
      eyebrow: 'Des Soins Humains et Rapprochés',
      title: 'Des soins bienveillants à domicile pour vos parents et vos proches.',
      subtitle:
        'BridgeCare met en relation les familles au Cameroun et dans la diaspora avec des infirmiers diplômés d’État et des aides-soignants vérifiés et dignes de confiance.',
      rolePrompt: 'Comment pouvons-nous vous aider aujourd’hui ?',
      nurseLabel: 'Je suis Infirmier(e) / Soignant(e) Diplômé(e)',
      clientLabel: 'Je cherche des Soins pour ma Famille',
      primaryCta: 'Trouver un Soignant',
      secondaryCta: 'Devenir Soignant Partenaire',
      trustBadges: [
        '🩺 Diplômes et Références 100% Vérifiés',
        '🔒 Paiement Sécurisé MTN & Orange Money',
        '📍 Disponible dans 10+ Grandes Villes',
        '🌍 Idéal pour la Diaspora et les Familles',
      ],
      quickFinder: {
        title: 'Recherche Rapide de Soins',
        subtitle: 'Trouvez un professionnel vérifié près de chez vous en 3 clics',
        step1Label: '1. Qui a besoin de soins ?',
        careTypes: [
          { id: 'senior', label: 'Aide aux Aînés / Personnes Âgées', icon: '👵' },
          { id: 'nursing', label: 'Soins Infirmiers à Domicile', icon: '🩹' },
          { id: 'postop', label: 'Convalescence Post-Opératoire', icon: '🏥' },
          { id: 'maternal', label: 'Maman & Nouveau-Né', icon: '👶' },
        ],
        step2Label: '2. Choisissez votre ville',
        cities: ['Douala', 'Yaoundé', 'Buea', 'Limbe', 'Bafoussam', 'Bamenda', 'Kribi'],
        step3Label: '3. Quand souhaitez-vous le soin ?',
        durations: [
          { id: 'today', label: 'Urgent (Aujourd’hui)' },
          { id: 'scheduled', label: 'Cette semaine' },
          { id: 'livein', label: 'Garde continue / Longue durée' },
        ],
        cta: 'Trouver des Soignants Disponibles →',
      },
    },
    metrics: [
      { value: '500+', label: 'Soignants Certifiés', subtext: 'Diplômes et casiers vérifiés' },
      { value: '2 400+', label: 'Familles Accompagnées', subtext: 'À Douala, Yaoundé et Buea' },
      { value: '4,95 / 5', label: 'Indice de Confiance', subtext: 'Avis vérifiés des familles' },
    ],
    servicesSection: {
      title: 'Des Soins Adaptés avec Chaleur et Dignité',
      subtitle: 'De l’aide douce au quotidien aux soins infirmiers spécialisés sur le pas de votre porte.',
      services: [
        {
          id: 'elderly',
          title: 'Accompagnement des Aînés',
          description: 'Aidez vos parents âgés à vieillir en toute sérénité à domicile avec une aide bienveillante au quotidien, aux repas et à la mobilité.',
          badge: 'Le Plus Demandé',
          features: ['Prise des médicaments et suivi des constantes', 'Aide à la toilette et à la marche', 'Présence chaleureuse et stimulation'],
          icon: '👵',
        },
        {
          id: 'nursing',
          title: 'Soins Infirmiers à Domicile',
          description: 'Infirmiers diplômés d’État pour effectuer les actes médicaux essentiels sans fatigue des déplacements à l’hôpital.',
          badge: 'Personnel Médical',
          features: ['Pansements et soins de plaies chirurgicales', 'Injections, perfusions et sondes', 'Suivi de la tension et de la glycémie'],
          icon: '🩺',
        },
        {
          id: 'maternal',
          title: 'Post-Partum et Nouveau-Né',
          description: 'Accompagnement attentif des jeunes mamans et des nourrissons pendant les premières semaines clés.',
          badge: 'Douceur & Écoute',
          features: ['Suivi après accouchement et césarienne', 'Conseils d’allaitement et sommeil de bébé', 'Aide aux premiers soins du nourrisson'],
          icon: '👶',
        },
        {
          id: 'rehab',
          title: 'Rééducation et Suite d’AVC',
          description: 'Exercices structurés et soutien quotidien pour aider vos proches à retrouver leur autonomie après un accident de santé.',
          badge: 'Récupération Active',
          features: ['Aide à la marche et mobilisation douce', 'Exercices de motricité', 'Prévention des chutes à domicile'],
          icon: '💪',
        },
      ],
    },
    features: {
      title: 'Pourquoi les Familles Camerounaises Nous Font Confiance',
      subtitle: 'Nous éliminons le stress et l’incertitude dans la recherche de soins fiables.',
      items: [
        {
          title: 'Vérification Stricte en 4 Étapes',
          description: 'Chaque soignant est vérifié auprès des ordres professionnels, avec contrôle d’identité, casier judiciaire et références.',
          highlight: 'Diplômes Authentifiés',
        },
        {
          title: 'Proximité Géographique Immédiate',
          description: 'Trouvez des soignants résidant dans votre quartier pour une ponctualité exemplaire et des interventions d’urgence rapides.',
          highlight: 'Dans Votre Quartier',
        },
        {
          title: 'Paiement Séquestre MTN & Orange Money',
          description: 'Payez en toute sécurité. Vos fonds sont bloqués et ne sont versés au soignant qu’après confirmation de votre satisfaction.',
          highlight: '100% Sécurisé',
        },
        {
          title: 'Rapports Quotidiens pour la Diaspora',
          description: 'Recevez un compte-rendu clair des constantes, repas et observations directement sur votre téléphone depuis l’étranger.',
          highlight: 'Transparence Totale',
        },
      ],
    },
    howItWorks: {
      title: 'Des Étapes Claires et Rassurantes',
      subtitle: 'Obtenir de l’aide pour un parent n’a jamais été aussi simple :',
      steps: [
        {
          title: '1. Décrivez le besoin de votre proche',
          description: 'Précisez le type de soin, la ville et le quartier ainsi que le rythme souhaité en moins de 2 minutes.',
          tip: 'Aucun terme médical complexe nécessaire, décrivez simplement votre besoin.',
        },
        {
          title: '2. Consultez les profils des soignants vérifiés',
          description: 'Comparez les diplômes, les avis des familles camerounaises, les photos et les tarifs.',
          tip: 'Échangez par messagerie ou téléphone avant de confirmer.',
        },
        {
          title: '3. Réservez et restez serein',
          description: 'Confirmez la visite, réglez en toute sécurité via Mobile Money et suivez le déroulement du soin.',
          tip: 'Notre ligne d’assistance est disponible 24h/7 pour vous épauler.',
        },
      ],
    },
    diasporaSection: {
      badge: 'POUR LA DIASPORA CAMEROUNAISE',
      title: 'Prendre Soin de Vos Parents au Pays Devient Serein',
      description:
        'Vous vivez en France, aux USA, au Canada ou en Europe ? BridgeCare vous permet de réserver des soins à domicile certifiés pour vos parents au Cameroun, de régler par carte ou MoMo, et de recevoir des bilans de santé réguliers.',
      benefits: [
        'Réservation facile avec coordinateurs bilingues',
        'Comptes-rendus réguliers des constantes et de l’état général',
        'Paiements directs sans intermédiaire informel',
        'Intervention rapide au domicile familial',
      ],
      cta: 'Planifier des Soins pour mes Parents au Pays →',
    },
    trustSafety: {
      title: 'La Sécurité de Votre Famille Est Notre Priorité Absolue',
      subtitle: 'Des exigences élevées pour que vous sachiez exactement qui entre chez vous.',
      points: [
        {
          title: 'Diplômes d’État Vérifiés',
          description: 'Les soignants justifient de diplômes reconnus au Cameroun (IDE, SRN, Aide-Soignant certifié).',
        },
        {
          title: 'Zéro Risque de Perte Financière',
          description: 'Vos fonds sont protégés. En cas d’empêchement du soignant, un remplacement ou un remboursement est effectué.',
        },
        {
          title: 'Évaluations Systématiques',
          description: 'Chaque intervention est notée par les familles. Les soignants doivent maintenir une moyenne supérieure à 4.5/5.',
        },
        {
          title: 'Confidentialité et Respect Médical',
          description: 'Les données médicales et coordonnées du domicile sont chiffrées et strictement protégées.',
        },
      ],
    },
    faq: {
      title: 'Questions Fréquemment Posées',
      subtitle: 'Des réponses claires pour vous guider en toute confiance.',
      items: [
        {
          question: 'Comment vérifiez-vous les soignants et infirmiers ?',
          answer:
            'Chaque soignant fournit sa CNI, son diplôme d’infirmier ou d’aide-soignant, son extrait de casier judiciaire et deux contacts de référence. Notre équipe médicale valide chaque document avant toute mise en ligne.',
        },
        {
          question: 'Puis-je réserver pour mes parents si je vis à l’étranger ?',
          answer:
            'Absolument ! Plus de 40% des familles qui nous font confiance résident dans la diaspora (France, États-Unis, Canada, Belgique, etc.). Vous pouvez gérer la réservation et recevoir les bilans de santé sur WhatsApp ou sur la plateforme.',
        },
        {
          question: 'Comment fonctionne le paiement via MTN MoMo et Orange Money ?',
          answer:
            'Le paiement est placé sous séquestre sécurisé au moment de la réservation. Le soignant n’est rémunéré qu’une fois la visite achevée et validée par vos soins. Vous êtes protégé à 100%.',
        },
        {
          question: 'Que faire en cas de besoin urgent dans la journée ?',
          answer:
            'Nos infirmiers de garde à Douala, Yaoundé et Buea peuvent intervenir à domicile dans un délai de 60 à 90 minutes pour les pansements urgents, injections ou contrôles de constantes.',
        },
        {
          question: 'Quels sont les tarifs habituels ?',
          answer:
            'Les tarifs sont transparents et fixés à la visite, à la garde (8h/12h) ou au mois. Ils débutent généralement entre 5 000 FCFA et 15 000 FCFA par visite selon la nature des soins requis.',
        },
      ],
    },
    testimonials: {
      title: 'Témoignages de Familles et Soignants',
      subtitle: 'Ce que disent ceux qui utilisent la plateforme au quotidien.',
      items: [
        {
          quote:
            'Vivant à Paris, j’étais toujours inquiète pour ma mère hypertendue à Douala. Avec BridgeCare, une infirmière passe chaque matin. C’est un soulagement immense pour toute la famille.',
          name: 'Sandrine N.',
          role: 'Fille résidant dans la Diaspora',
          location: 'Douala / Paris',
          rating: 5,
        },
        {
          quote:
            'Après l’opération de mon père, nous avions besoin de pansements quotidiens. L’infirmier Samuel a été doux, ponctuel et très professionnel. Mon père a pu récupérer chez lui en toute quiétude.',
          name: 'Alain Fotso',
          role: 'Fils de patient',
          location: 'Yaoundé, Bastos',
          rating: 5,
        },
        {
          quote:
            'En tant qu’infirmière diplômée d’État, cette plateforme me permet d’aider des familles respectueuses et de recevoir mes honoraires sans retard via Orange Money.',
          name: 'Infirmière Mireille K.',
          role: 'Infirmière Diplômée d’État',
          location: 'Buea',
          rating: 5,
        },
      ],
    },
    cta: {
      title: 'Offrez à Votre Famille des Soins Dignifiés et Chaleureux',
      description: 'Trouvez un infirmier ou un soignant certifié dans votre quartier en moins de 3 minutes.',
      primary: 'Réserver un Soignant Maintenant',
      secondary: 'Appeler l’Assistance (+237 671 159 461)',
      callSupport: 'Besoin d’aide pour choisir ? Échangez avec notre coordinateur de soins',
    },
    footer: {
      description:
        'BridgeCare est la première plateforme de soins et de garde à domicile au Cameroun. Nous relions familles et soignants certifiés dans le respect, la sécurité et la dignité.',
      emergencyNotice: '⚠️ En cas d’urgence vitale immédiate, contactez directement l’hôpital le plus proche ou le SAMU (15 / 119).',
      columns: [
        {
          title: 'Services de Soins',
          links: ['Aide aux Personnes Âgées', 'Soins Infirmiers à Domicile', 'Suite d’Opération', 'Soins Post-Partum & Bébé', 'Rééducation AVC'],
        },
        {
          title: 'Villes Couvertes',
          links: ['Douala (Akwa, Bonapriso, Bonamoussadi)', 'Yaoundé (Bastos, Omnisports, Biyem-Assi)', 'Buea & Limbe', 'Bafoussam & Ouest', 'Bamenda & Nord-Ouest'],
        },
        {
          title: 'Confiance & Support',
          links: ['Processus de Vérification', 'Guide Spécial Diaspora', 'Sécurité MTN & Orange Money', 'Confidentialité Médicale', 'Contactez-nous'],
        },
      ],
    },
  },
}
