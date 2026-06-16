export const serviceIconOptions = [
  { value: 'pi pi-video', label: 'Video' },
  { value: 'pi pi-youtube', label: 'YouTube' },
  { value: 'pi pi-headphones', label: 'Music' },
  { value: 'pi pi-apple', label: 'Apple' },
  { value: 'pi pi-amazon', label: 'Amazon' },
  { value: 'pi pi-google', label: 'Google' },
  { value: 'pi pi-microsoft', label: 'Microsoft' },
  { value: 'pi pi-github', label: 'GitHub' },
  { value: 'pi pi-cloud', label: 'Cloud' },
  { value: 'pi pi-palette', label: 'Creative' },
  { value: 'pi pi-lock', label: 'Security' },
  { value: 'pi pi-shopping-bag', label: 'Shopping' },
  { value: 'pi pi-wallet', label: 'Finance' },
  { value: 'pi pi-building', label: 'Housing' },
  { value: 'pi pi-car', label: 'Transport' },
  { value: 'pi pi-heart', label: 'Wellness' },
  { value: 'pi pi-box', label: 'Other' }
]

export const knownServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    url: 'https://netflix.com',
    category: 'Subscriptions',
    icon: 'pi pi-video',
    aliases: ['netflix']
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    url: 'https://spotify.com',
    category: 'Subscriptions',
    icon: 'pi pi-headphones',
    aliases: ['spotify']
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    url: 'https://youtube.com/premium',
    category: 'Subscriptions',
    icon: 'pi pi-youtube',
    aliases: ['youtube']
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    url: 'https://music.apple.com',
    category: 'Subscriptions',
    icon: 'pi pi-apple',
    aliases: ['apple music']
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    url: 'https://apple.com/icloud',
    category: 'Subscriptions',
    icon: 'pi pi-apple',
    aliases: ['icloud', 'icloud+']
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    url: 'https://amazon.com/prime',
    category: 'Subscriptions',
    icon: 'pi pi-amazon',
    aliases: ['amazon prime', 'prime']
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    url: 'https://microsoft.com/microsoft-365',
    category: 'Subscriptions',
    icon: 'pi pi-microsoft',
    aliases: ['microsoft 365', 'office 365']
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    url: 'https://adobe.com/creativecloud',
    category: 'Subscriptions',
    icon: 'pi pi-palette',
    aliases: ['adobe', 'creative cloud']
  },
  {
    id: 'figma',
    name: 'Figma Pro',
    url: 'https://figma.com',
    category: 'Subscriptions',
    icon: 'pi pi-palette',
    aliases: ['figma']
  },
  {
    id: 'notion',
    name: 'Notion Plus',
    url: 'https://notion.so',
    category: 'Subscriptions',
    icon: 'pi pi-box',
    aliases: ['notion']
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    category: 'Subscriptions',
    icon: 'pi pi-github',
    aliases: ['github copilot', 'copilot']
  },
  {
    id: 'dropbox',
    name: 'Dropbox Plus',
    url: 'https://dropbox.com',
    category: 'Subscriptions',
    icon: 'pi pi-cloud',
    aliases: ['dropbox']
  },
  {
    id: 'google-one',
    name: 'Google One',
    url: 'https://one.google.com',
    category: 'Subscriptions',
    icon: 'pi pi-google',
    aliases: ['google one']
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    url: 'https://max.com',
    category: 'Entertainment',
    icon: 'pi pi-video',
    aliases: ['hbo', 'max']
  },
  {
    id: '1password',
    name: '1Password Families',
    url: 'https://1password.com',
    category: 'Subscriptions',
    icon: 'pi pi-lock',
    aliases: ['1password']
  }
]

const normalize = (value) => String(value || '').toLowerCase().trim()

const categoryIconMap = {
  subscriptions: 'pi pi-wallet',
  entertainment: 'pi pi-video',
  utilities: 'pi pi-bolt',
  groceries: 'pi pi-shopping-bag',
  housing: 'pi pi-building',
  wellness: 'pi pi-heart',
  transportation: 'pi pi-car',
  transport: 'pi pi-car',
  insurance: 'pi pi-shield',
  security: 'pi pi-lock',
  finance: 'pi pi-chart-line',
  education: 'pi pi-book',
  cloud: 'pi pi-cloud'
}

export const findKnownService = (nameOrUrl) => {
  const source = normalize(nameOrUrl)
  if (!source) return null

  return knownServices.find((service) =>
    normalize(service.name) === source ||
    normalize(service.url) === source ||
    service.aliases.some((alias) => source.includes(normalize(alias)))
  ) || null
}

export const getExpenseIcon = (expense) =>
  expense?.icon || findKnownService(expense?.name)?.icon || 'pi pi-wallet'

export const getCategoryIcon = (category) =>
  categoryIconMap[normalize(category)] || 'pi pi-folder'
