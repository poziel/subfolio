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
  { value: 'pi pi-home', label: 'Home' },
  { value: 'pi pi-shield', label: 'Insurance' },
  { value: 'pi pi-car', label: 'Transport' },
  { value: 'pi pi-heart', label: 'Wellness' },
  { value: 'pi pi-bolt', label: 'Utilities' },
  { value: 'pi pi-percentage', label: 'Tax' },
  { value: 'pi pi-box', label: 'Other' }
]

export const presetCatalogCategories = [
  { id: 'streaming', label: 'Streaming and media' },
  { id: 'software', label: 'Software and cloud' },
  { id: 'housing', label: 'Housing' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'taxes', label: 'Taxes' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'finance', label: 'Finance' },
  { id: 'transportation', label: 'Transportation' }
]

export const knownServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    url: 'https://netflix.com',
    category: 'Subscriptions',
    catalogCategory: 'streaming',
    icon: 'pi pi-video',
    aliases: ['netflix']
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    url: 'https://spotify.com',
    category: 'Subscriptions',
    catalogCategory: 'streaming',
    icon: 'pi pi-headphones',
    aliases: ['spotify']
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    url: 'https://youtube.com/premium',
    category: 'Subscriptions',
    catalogCategory: 'streaming',
    icon: 'pi pi-youtube',
    aliases: ['youtube', 'youtube premium']
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    url: 'https://music.apple.com',
    category: 'Subscriptions',
    catalogCategory: 'streaming',
    icon: 'pi pi-apple',
    aliases: ['apple music']
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    url: 'https://disneyplus.com',
    category: 'Entertainment',
    catalogCategory: 'streaming',
    icon: 'pi pi-video',
    aliases: ['disney', 'disney plus']
  },
  {
    id: 'hulu',
    name: 'Hulu',
    url: 'https://hulu.com',
    category: 'Entertainment',
    catalogCategory: 'streaming',
    icon: 'pi pi-video',
    aliases: ['hulu']
  },
  {
    id: 'max',
    name: 'Max',
    url: 'https://max.com',
    category: 'Entertainment',
    catalogCategory: 'streaming',
    icon: 'pi pi-video',
    aliases: ['hbo', 'hbo max', 'max']
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    url: 'https://amazon.com/prime',
    category: 'Subscriptions',
    catalogCategory: 'streaming',
    icon: 'pi pi-amazon',
    aliases: ['amazon prime', 'prime']
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    url: 'https://apple.com/icloud',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-apple',
    aliases: ['icloud', 'icloud+']
  },
  {
    id: 'google-one',
    name: 'Google One',
    url: 'https://one.google.com',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-google',
    aliases: ['google one']
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    url: 'https://microsoft.com/microsoft-365',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-microsoft',
    aliases: ['microsoft 365', 'office 365']
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    url: 'https://adobe.com/creativecloud',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-palette',
    aliases: ['adobe', 'creative cloud']
  },
  {
    id: 'figma',
    name: 'Figma Pro',
    url: 'https://figma.com',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-palette',
    aliases: ['figma']
  },
  {
    id: 'notion',
    name: 'Notion Plus',
    url: 'https://notion.so',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-box',
    aliases: ['notion']
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-github',
    aliases: ['github copilot', 'copilot']
  },
  {
    id: 'dropbox',
    name: 'Dropbox Plus',
    url: 'https://dropbox.com',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-cloud',
    aliases: ['dropbox']
  },
  {
    id: '1password',
    name: '1Password Families',
    url: 'https://1password.com',
    category: 'Subscriptions',
    catalogCategory: 'software',
    icon: 'pi pi-lock',
    aliases: ['1password', 'one password']
  },
  {
    id: 'mortgage',
    name: 'Mortgage payment',
    url: '',
    category: 'Housing',
    catalogCategory: 'housing',
    icon: 'pi pi-home',
    aliases: ['mortgage', 'home loan', 'house payment']
  },
  {
    id: 'rent',
    name: 'Rent payment',
    url: '',
    category: 'Housing',
    catalogCategory: 'housing',
    icon: 'pi pi-building',
    aliases: ['rent', 'lease']
  },
  {
    id: 'hoa-fees',
    name: 'HOA or condo fees',
    url: '',
    category: 'Housing',
    catalogCategory: 'housing',
    icon: 'pi pi-building',
    aliases: ['hoa', 'condo fees', 'strata fees']
  },
  {
    id: 'home-insurance',
    name: 'Home insurance',
    url: '',
    category: 'Insurance',
    catalogCategory: 'insurance',
    icon: 'pi pi-shield',
    aliases: ['home insurance', 'house insurance', 'property insurance']
  },
  {
    id: 'renters-insurance',
    name: 'Renters insurance',
    url: '',
    category: 'Insurance',
    catalogCategory: 'insurance',
    icon: 'pi pi-shield',
    aliases: ['renters insurance', 'tenant insurance']
  },
  {
    id: 'car-insurance',
    name: 'Car insurance',
    url: '',
    category: 'Insurance',
    catalogCategory: 'insurance',
    icon: 'pi pi-car',
    aliases: ['car insurance', 'auto insurance', 'vehicle insurance']
  },
  {
    id: 'life-insurance',
    name: 'Life insurance',
    url: '',
    category: 'Insurance',
    catalogCategory: 'insurance',
    icon: 'pi pi-shield',
    aliases: ['life insurance']
  },
  {
    id: 'health-insurance',
    name: 'Health insurance',
    url: '',
    category: 'Insurance',
    catalogCategory: 'insurance',
    icon: 'pi pi-heart',
    aliases: ['health insurance', 'medical insurance']
  },
  {
    id: 'property-taxes',
    name: 'Property taxes',
    url: '',
    category: 'Taxes',
    catalogCategory: 'taxes',
    icon: 'pi pi-percentage',
    aliases: ['property tax', 'property taxes', 'municipal taxes']
  },
  {
    id: 'income-tax-installments',
    name: 'Income tax installments',
    url: '',
    category: 'Taxes',
    catalogCategory: 'taxes',
    icon: 'pi pi-percentage',
    aliases: ['income tax', 'tax installments', 'estimated taxes']
  },
  {
    id: 'electricity',
    name: 'Electricity bill',
    url: '',
    category: 'Utilities',
    catalogCategory: 'utilities',
    icon: 'pi pi-bolt',
    aliases: ['electricity', 'power bill', 'hydro']
  },
  {
    id: 'water',
    name: 'Water bill',
    url: '',
    category: 'Utilities',
    catalogCategory: 'utilities',
    icon: 'pi pi-box',
    aliases: ['water', 'water bill']
  },
  {
    id: 'internet',
    name: 'Internet service',
    url: '',
    category: 'Utilities',
    catalogCategory: 'utilities',
    icon: 'pi pi-cloud',
    aliases: ['internet', 'broadband', 'wifi']
  },
  {
    id: 'mobile-phone',
    name: 'Mobile phone plan',
    url: '',
    category: 'Utilities',
    catalogCategory: 'utilities',
    icon: 'pi pi-mobile',
    aliases: ['mobile phone', 'cell phone', 'phone plan']
  },
  {
    id: 'loan-payment',
    name: 'Loan payment',
    url: '',
    category: 'Finance',
    catalogCategory: 'finance',
    icon: 'pi pi-wallet',
    aliases: ['loan', 'loan payment']
  },
  {
    id: 'credit-card-fee',
    name: 'Credit card annual fee',
    url: '',
    category: 'Finance',
    catalogCategory: 'finance',
    icon: 'pi pi-credit-card',
    aliases: ['credit card fee', 'annual fee']
  },
  {
    id: 'vehicle-payment',
    name: 'Vehicle payment',
    url: '',
    category: 'Transportation',
    catalogCategory: 'transportation',
    icon: 'pi pi-car',
    aliases: ['car payment', 'auto loan', 'vehicle payment']
  },
  {
    id: 'transit-pass',
    name: 'Transit pass',
    url: '',
    category: 'Transportation',
    catalogCategory: 'transportation',
    icon: 'pi pi-car',
    aliases: ['transit pass', 'bus pass', 'metro pass']
  }
]

const normalize = (value) => String(value || '').toLowerCase().trim()

const categoryIconMap = {
  subscriptions: 'pi pi-wallet',
  entertainment: 'pi pi-video',
  utilities: 'pi pi-bolt',
  groceries: 'pi pi-shopping-bag',
  housing: 'pi pi-building',
  home: 'pi pi-home',
  wellness: 'pi pi-heart',
  transportation: 'pi pi-car',
  transport: 'pi pi-car',
  insurance: 'pi pi-shield',
  taxes: 'pi pi-percentage',
  tax: 'pi pi-percentage',
  security: 'pi pi-lock',
  finance: 'pi pi-chart-line',
  education: 'pi pi-book',
  cloud: 'pi pi-cloud'
}

export const findKnownServiceById = (id) => {
  const source = normalize(id)
  if (!source) return null
  return knownServices.find((service) => normalize(service.id) === source) || null
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

export const searchKnownServices = (query) => {
  const source = normalize(query)
  if (!source) return knownServices

  return knownServices.filter((service) => {
    const category = presetCatalogCategories.find((item) => item.id === service.catalogCategory)
    const haystack = [
      service.name,
      service.url,
      service.category,
      category?.label,
      ...service.aliases
    ].map(normalize)

    return haystack.some((value) => value.includes(source))
  })
}

export const groupedKnownServices = (services = knownServices) =>
  presetCatalogCategories
    .map((category) => ({
      ...category,
      items: services.filter((service) => service.catalogCategory === category.id)
    }))
    .filter((category) => category.items.length)

export const getExpenseIcon = (expense) =>
  expense?.icon ||
  findKnownServiceById(expense?.presetId)?.icon ||
  findKnownService(expense?.name)?.icon ||
  'pi pi-wallet'

export const getCategoryIcon = (category) =>
  categoryIconMap[normalize(category)] || 'pi pi-folder'
