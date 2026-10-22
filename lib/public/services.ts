export const services = [
  {
    slug: 'strength-and-conditioning', kind: 'strength',
    photo: '/services/strength.jpg', photoAlt: 'Rows of dumbbells and strength equipment on a gym floor',
    title: 'Strength & conditioning',
    summary: 'Build strength. Find your stamina. Training that moves you forward.',
    prompt: 'Explore the training', headline: 'Stronger with every session.',
    description: 'Build a foundation that lasts. Combine resistance training and conditioning in a plan that meets you where you are and grows with you.',
    includes: [
      { title: 'Strength that carries over', description: 'Build muscle and confidence with free weights, machines, and purposeful movement.' },
      { title: 'Conditioning at your pace', description: 'Improve stamina with cardio and circuits tailored to your starting point.' },
      { title: 'Room to progress', description: 'Keep moving forward with a balanced routine and clear training goals.' },
    ],
  },
  {
    slug: 'personal-training', kind: 'coaching',
    photo: '/services/personal-training.jpg', photoAlt: 'An athlete working on core strength in a bright training studio',
    title: 'Personal training',
    summary: 'Your goals, a clear plan, and an expert in your corner. Every rep.',
    prompt: 'Find your direction', headline: 'Your goals. Our full attention.',
    description: 'Take the guesswork out of training. Work one-to-one with an expert trainer on a routine built around your goals, experience, and everyday life.',
    includes: [
      { title: 'A plan that fits you', description: 'Start with your goals and build a practical path to reach them.' },
      { title: 'Guidance in every session', description: 'Get hands-on support with technique, exercise selection, and progression.' },
      { title: 'Support as you grow', description: 'Adjust your training as your confidence, strength, and priorities change.' },
    ],
  },
  {
    slug: 'mobility-and-recovery', kind: 'recovery',
    photo: '/services/recovery.jpg', photoAlt: 'A woman stretching into a deep lunge at sunset',
    title: 'Mobility & recovery',
    summary: 'Move freely, recharge, and feel ready for whatever comes next.',
    prompt: 'Make room to reset', headline: 'Move well. Come back ready.',
    description: 'Give your body the time and attention it needs between harder sessions. Make mobility, flexibility, and recovery part of your training routine.',
    includes: [
      { title: 'Move with more freedom', description: 'Explore controlled mobility work to support your everyday range of motion.' },
      { title: 'Build a recovery routine', description: 'Make space for gentle movement and stretching between training sessions.' },
      { title: 'Find your balance', description: 'Learn to balance effort and rest so your routine feels sustainable.' },
    ],
  },
] as const;

export type Service = (typeof services)[number];
