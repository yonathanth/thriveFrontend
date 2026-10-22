export const offerings = [
  {
    slug: 'strength-and-conditioning', title: 'Gym training',
    photo: '/services/strength.jpg', alt: 'Dumbbells and equipment across a fully equipped strength training floor',
    summary: 'Free weights, machines, and cardio. Everything you need to make your workout your own.',
    details: ['Strength & conditioning', 'Free weights & resistance machines', 'Cardio equipment in abundance'],
    prompt: 'See membership prices', href: '/pricing#memberships',
  },
  {
    slug: 'personal-training', title: 'Personal training',
    photo: '/tour-thumbnail.jpg', alt: 'A trainer guiding a member through strength training in the gym',
    summary: 'Your goals, a clear direction, and expert guidance. Train with someone in your corner.',
    details: ['One-to-one expert guidance', 'Technique & progression', 'Training around your goals'],
    prompt: 'See coaching prices', href: '/pricing#personal-training',
  },
  {
    slug: 'muay-thai', title: 'Muay Thai',
    photo: '/services/muay-thai.jpg', alt: 'Boxing gloves resting on the floor of a martial arts gym',
    summary: 'Build skill, focus, and confidence through Muay Thai classes led by Duressa.',
    details: ['Classes with Duressa', 'Technique, discipline & conditioning', 'Call for schedules and class details'],
    prompt: 'See Muay Thai prices', href: '/pricing#muay-thai',
  },
  {
    slug: 'kids-karate', title: 'Karate for kids',
    photo: '/services/karate.jpg', alt: 'A martial artist practicing a stance outdoors at sunset',
    summary: 'A place for young people to build confidence, practice discipline, and learn new skills.',
    details: ['Karate classes for children', 'Movement, focus & confidence', 'Call for ages, schedules, and enrolment'],
    prompt: 'See karate prices', href: '/pricing#kids-karate',
  },
  {
    slug: 'kickboxing', title: 'Kickboxing',
    photo: '/services/muay-thai.jpg', alt: 'Boxing gloves ready for a combat sports training session',
    summary: 'Bring energy to your training with kickboxing classes focused on technique and conditioning.',
    details: ['Kickboxing classes', 'Technique, movement & conditioning', 'Call for schedules and enrolment'],
    prompt: 'See kickboxing prices', href: '/pricing#kickboxing',
  },
] as const;
