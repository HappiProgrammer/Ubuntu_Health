export type Language = 'en' | 'fr'

export type HomeCopy = {
  announcement: string
  nav: {
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
  }
  metrics: Array<{
    value: string
    label: string
  }>
  features: {
    title: string
    subtitle: string
    items: Array<{
      title: string
      description: string
    }>
  }
  howItWorks: {
    title: string
    steps: Array<{
      title: string
      description: string
    }>
  }
  testimonials: {
    title: string
    items: Array<{
      quote: string
      name: string
      role: string
    }>
  }
  cta: {
    title: string
    description: string
    primary: string
    secondary: string
  }
  footer: {
    description: string
    columns: Array<{
      title: string
      links: string[]
    }>
  }
}

export const homeContent: Record<Language, HomeCopy> = {
  en: {
    announcement: 'Human-centered healthcare matching for families across Cameroon',
    nav: { login: 'Login', register: 'Register' },
    hero: {
      eyebrow: 'Reliable care, beautifully connected',
      title: 'Find trusted caregivers and nurses without the stress.',
      subtitle:
        'BridgeCare helps families discover verified professionals, book support quickly, and stay confident from first search to final visit.',
      rolePrompt: 'Choose how you want to start',
      nurseLabel: 'I am a caregiver',
      clientLabel: 'I need care',
      primaryCta: 'Create account',
      secondaryCta: 'Explore dashboard',
      trustBadges: ['Verified professionals', 'Fast local matching', 'Private communication'],
    },
    metrics: [
      { value: '500+', label: 'Caregivers onboarded' },
      { value: '2,000+', label: 'Families supported' },
      { value: '4.9/5', label: 'Average satisfaction' },
    ],
    features: {
      title: 'Built for calm, clarity, and trust',
      subtitle:
        'Every part of the experience is designed to help families feel informed and caregivers feel respected.',
      items: [
        {
          title: 'Verified caregiver profiles',
          description: 'Licensing, experience, and availability are presented clearly so decisions feel safer.',
        },
        {
          title: 'Location-aware discovery',
          description: 'Find professionals closer to the patient for faster response times and smoother scheduling.',
        },
        {
          title: 'Secure communication',
          description: 'Messaging and appointment coordination stay organized in one place instead of scattered chats.',
        },
        {
          title: 'Care journey visibility',
          description: 'Track requests, bookings, and status updates with less confusion and fewer missed steps.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        {
          title: 'Tell us what care you need',
          description: 'Choose a role, share your location, and describe the support required.',
        },
        {
          title: 'Review strong matches',
          description: 'See trustworthy profiles with availability, specialties, and fit signals.',
        },
        {
          title: 'Book and coordinate',
          description: 'Confirm appointments and communicate without leaving the platform.',
        },
      ],
    },
    testimonials: {
      title: 'What people feel after using it',
      items: [
        {
          quote: 'The interface feels reassuring. I could find help for my mother quickly and without confusion.',
          name: 'Mireille T.',
          role: 'Family caregiver',
        },
        {
          quote: 'It presents my skills professionally and makes client conversations much easier to manage.',
          name: 'Samuel N.',
          role: 'Registered nurse',
        },
      ],
    },
    cta: {
      title: 'Start with confidence',
      description: 'Whether you are offering care or searching for it, the first step should feel simple and trustworthy.',
      primary: 'Register now',
      secondary: 'Sign in',
    },
    footer: {
      description: 'BridgeCare connects caregivers and families through a calmer, more trustworthy healthcare experience.',
      columns: [
        { title: 'Services', links: ['Home Care', 'Elder Support', 'Medical Assistance'] },
        { title: 'Platform', links: ['How It Works', 'Safety', 'Support'] },
        { title: 'Company', links: ['About', 'Community', 'Contact'] },
      ],
    },
  },
  fr: {
    announcement: 'Une mise en relation humaine et fiable pour les familles au Cameroun',
    nav: { login: 'Connexion', register: "S'inscrire" },
    hero: {
      eyebrow: 'Des soins fiables, connectés avec élégance',
      title: 'Trouvez des soignants et infirmiers de confiance sans stress.',
      subtitle:
        'BridgeCare aide les familles à découvrir des professionnels vérifiés, réserver rapidement et rester sereines du premier contact à la visite.',
      rolePrompt: 'Choisissez votre point de départ',
      nurseLabel: 'Je suis soignant',
      clientLabel: "J'ai besoin de soins",
      primaryCta: 'Créer un compte',
      secondaryCta: 'Voir le tableau de bord',
      trustBadges: ['Professionnels vérifiés', 'Mise en relation locale rapide', 'Communication privée'],
    },
    metrics: [
      { value: '500+', label: 'Soignants inscrits' },
      { value: '2 000+', label: 'Familles accompagnées' },
      { value: '4,9/5', label: 'Satisfaction moyenne' },
    ],
    features: {
      title: 'Pensé pour la sérénité, la clarté et la confiance',
      subtitle:
        "Chaque partie de l'expérience aide les familles à se sentir rassurées et les soignants à se sentir valorisés.",
      items: [
        {
          title: 'Profils vérifiés',
          description: "Les licences, l'expérience et la disponibilité sont claires pour faciliter une décision sûre.",
        },
        {
          title: 'Recherche proche de vous',
          description: 'Trouvez des professionnels proches du patient pour un accompagnement plus rapide.',
        },
        {
          title: 'Communication sécurisée',
          description: 'Les échanges et la coordination restent centralisés au lieu de se perdre dans plusieurs discussions.',
        },
        {
          title: 'Suivi du parcours de soins',
          description: 'Suivez les demandes, rendez-vous et statuts avec moins de confusion.',
        },
      ],
    },
    howItWorks: {
      title: 'Comment ça marche',
      steps: [
        {
          title: 'Décrivez le besoin',
          description: 'Choisissez votre rôle, votre zone et le type de soutien recherché.',
        },
        {
          title: 'Consultez les meilleurs profils',
          description: 'Voyez les spécialisations, la disponibilité et les signaux de confiance.',
        },
        {
          title: 'Réservez et coordonnez',
          description: 'Confirmez les rendez-vous et échangez directement sur la plateforme.',
        },
      ],
    },
    testimonials: {
      title: 'Le ressenti après utilisation',
      items: [
        {
          quote: "L'interface met en confiance. J'ai trouvé de l'aide pour ma mère rapidement et sans hésitation.",
          name: 'Mireille T.',
          role: 'Aidante familiale',
        },
        {
          quote: 'Mes compétences sont mieux présentées et les échanges avec les clients sont beaucoup plus simples.',
          name: 'Samuel N.',
          role: 'Infirmier diplômé',
        },
      ],
    },
    cta: {
      title: 'Commencez avec confiance',
      description: "Que vous proposiez des soins ou que vous en cherchiez, le premier pas doit être simple et rassurant.",
      primary: "S'inscrire",
      secondary: 'Se connecter',
    },
    footer: {
      description: 'BridgeCare relie soignants et familles grâce à une expérience de santé plus claire et plus digne de confiance.',
      columns: [
        { title: 'Services', links: ['Soins à domicile', 'Aide aux aînés', 'Assistance médicale'] },
        { title: 'Plateforme', links: ['Fonctionnement', 'Sécurité', 'Support'] },
        { title: 'Entreprise', links: ['À propos', 'Communauté', 'Contact'] },
      ],
    },
  },
}
