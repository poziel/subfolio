import { computed, ref } from 'vue'

const storageKey = 'subfolio-language'
const supportedLocales = ['en', 'fr']

const browserLocale = () => {
  if (typeof navigator === 'undefined') return 'en'
  const language = navigator.language?.toLowerCase() || 'en'
  return language.startsWith('fr') ? 'fr' : 'en'
}

const loadLocale = () => {
  if (typeof localStorage === 'undefined') return browserLocale()
  const stored = localStorage.getItem(storageKey)
  return supportedLocales.includes(stored) ? stored : browserLocale()
}

const locale = ref(loadLocale())

const messages = {
  en: {
    common: {
      appName: 'Subfolio',
      openApp: 'Open App',
      githubRepo: 'Open Subfolio repository',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      english: 'English',
      french: 'French'
    },
    nav: {
      overview: 'Overview',
      features: 'Features',
      about: 'About',
      byodb: 'BYODB',
      pricing: 'Pricing',
      openSource: 'Open Source',
      changelog: 'Changelog',
      product: 'Product',
      legal: 'Legal',
      github: 'GitHub',
      sourceCode: 'Source Code',
      roadmapArchitecture: 'Roadmap / Architecture',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      refund: 'Refund Policy',
      license: 'License'
    },
    appNav: {
      home: 'Home',
      expenses: 'Expenses',
      categories: 'Categories',
      recurrences: 'Recurrences',
      settings: 'Settings',
      add: 'Add',
      addExpense: 'Add Expense',
      disconnect: 'Disconnect'
    },
    landing: {
      heroTitle: 'See every recurring payment before it surprises you.',
      heroBody: 'Subfolio tracks subscriptions and predictable obligations, then projects what they mean for future months, paychecks, and long-term cash flow.',
      exploreFeatures: 'Explore features',
      marchForecast: 'March forecast',
      forecastSubtitle: 'Preview of recurring obligations',
      monthEndBalance: 'Month-end balance',
      projectedAfterBills: 'Projected after bills',
      subscriptions: 'Subscriptions',
      utilities: 'Utilities',
      wellness: 'Wellness',
      housing: 'Housing',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      activeRecurringItems: 'Active recurring items',
      balanceMessage: 'Balance stays above your comfort floor all month.',
      trackTitle: 'Track recurring commitments',
      trackDetail: 'Keep subscriptions, bills, renewals, and annual payments in one view.',
      forecastTitle: 'Forecast cash flow',
      forecastDetail: 'Translate yearly commitments into monthly and pay-period pressure.',
      byodbTitle: 'Bring your own database',
      byodbDetail: 'Connect Subfolio to a Firebase or PocketBase instance that you control.',
      portableTitle: 'Stay portable',
      portableDetail: 'The frontend is a shell over your connection instead of a hosted backend.',
      formTitle: 'Add a recurring expense',
      formSubtitle: 'PrimeVue form preview',
      expenseName: 'Expense name',
      category: 'Category',
      amount: 'Amount',
      frequency: 'Frequency',
      nextDue: 'Next due',
      previewExpense: 'Preview expense',
      obligationsTitle: 'Upcoming obligations',
      obligationsSubtitle: 'How recurring items appear in the app shell',
      expense: 'Expense',
      useConnectionTitle: 'Use a connection you control.',
      useConnectionBody: 'Subfolio can start with Firebase or PocketBase and grow toward more realtime providers without requiring a hosted Subfolio backend.'
    },
    home: {
      title: 'Welcome to Subfolio',
      intro: 'Track recurring commitments, understand your average monthly load, and keep the subscription view connected to your own database.',
      activeExpenses: 'Active expenses',
      activeExpensesDetail: 'Recurring items currently counted',
      monthlyTotal: 'Monthly total',
      monthlyTotalDetail: 'Average monthly obligation',
      yearlyTotal: 'Yearly total',
      yearlyTotalDetail: 'Projected annual spend',
      quickActions: 'Quick actions',
      quickActionsSubtitle: 'Jump into the main workflows.',
      viewExpenses: 'View expenses',
      viewExpensesDetail: 'Manage your recurring expense tracker',
      browseCategories: 'Browse categories',
      browseCategoriesDetail: 'See where subscriptions are grouped',
      reviewRecurrences: 'Review recurrences',
      reviewRecurrencesDetail: 'Compare annual, monthly, and pay-period totals',
      settingsDetail: 'Adjust currencies and connection details',
      openTracker: 'Open tracker'
    },
    metrics: {
      daily: 'Daily',
      weekly: 'Weekly',
      biWeekly: 'Bi-weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      active: 'Active',
      categories: 'Categories',
      activeDetail: '{count} active'
    },
    table: {
      expense: 'Expense',
      category: 'Category',
      frequency: 'Frequency',
      nextDue: 'Next due',
      amount: 'Amount',
      actions: 'Actions',
      monthly: 'Monthly',
      yearly: 'Yearly',
      perPay: 'Per pay',
      openService: 'Open service',
      deactivate: 'Deactivate',
      activate: 'Activate',
      edit: 'Edit',
      delete: 'Delete',
      tax: '+tax'
    },
    frequencies: {
      weekly: 'Weekly',
      'bi-weekly': 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      'semi-annually': 'Semi-annually',
      yearly: 'Yearly',
      custom: 'Custom',
      timesPerYear: '{count}x/year'
    },
    tracker: {
      title: 'Expenses',
      intro: 'Track all recurring payments at a glance.',
      ledgerTitle: 'Expense ledger',
      ledgerSubtitle: 'All recurring expenses',
      searchPlaceholder: 'Search expenses...',
      noSearchMatch: 'No expenses match "{query}". Try a different search term.',
      empty: 'No expenses yet. Use Add Expense to get started.'
    },
    categories: {
      title: 'Categories',
      intro: 'View recurring expenses organized by category.',
      breakdownTitle: 'Category breakdown',
      breakdownSubtitle: 'Toggle categories out of calculations without deleting expenses.',
      empty: 'Add expenses to see them grouped by category.',
      activeOfTotal: '{active} active of {total} expenses',
      included: 'Included',
      excluded: 'Excluded'
    },
    recurrences: {
      title: 'See your annual, monthly, and per-pay obligations.',
      intro: 'Subfolio calculates projected totals across the year and distributes them into month-by-month and paycheck-level views.',
      yearlyLabel: 'Projected yearly',
      yearlyDetail: 'All recurring obligations',
      monthlyLabel: 'Projected monthly',
      monthlyDetail: 'Average per month',
      payLabel: 'Per paycheck',
      payDetail: 'Based on 26 pay periods',
      allTitle: 'All recurrences',
      allSubtitle: 'Projected cost by cadence',
      empty: 'No active recurring expenses yet.'
    },
    settings: {
      title: 'Settings',
      intro: 'Set display preferences and review the active database connection.',
      local: 'Display preferences are saved locally in this browser.',
      databaseTitle: 'Database connection',
      noConnection: 'No database connected',
      changeConnection: 'Change connection',
      currencyTitle: 'Currency display',
      currencySubtitle: 'Control totals, forms, and conversion labels.',
      displayedCurrency: 'Displayed currency',
      displayedCurrencyDetail: 'Totals and tooltips use this as the base currency.',
      currencyPlaceholder: 'Currency',
      availableCurrencies: 'Available currencies',
      availableCurrenciesDetail: 'Control which currencies show up in the add/edit modal.',
      selectCurrencies: 'Select currencies',
      ratesRefreshing: 'Refreshing rates',
      ratesOffline: 'Offline - using cached rates',
      ratesReady: 'Rates up to date',
      orderingTitle: 'Expense ordering',
      orderingSubtitle: 'Choose the default order for recurring expenses.',
      defaultOrdering: 'Default expense ordering',
      defaultOrderingDetail: 'Control how expenses are sorted by default.',
      orderingPlaceholder: 'Ordering',
      manualNotice: 'Manual drag and drop is selected. The list interaction is still planned for a future update.',
      orderingDateAdded: 'Date Added',
      orderingAmountAsc: 'Amount (Low to High)',
      orderingAmountDesc: 'Amount (High to Low)',
      orderingCategory: 'Category',
      orderingManual: 'Manual (Drag & Drop)'
    },
    expenseForm: {
      addTitle: 'Add expense',
      editTitle: 'Edit expense',
      addButton: 'Add expense',
      saveButton: 'Save changes',
      name: 'Expense name',
      namePlaceholder: 'Netflix, Spotify, etc.',
      serviceUrl: 'Service URL',
      optional: '(optional)',
      category: 'Category',
      categoryPlaceholder: 'Subscriptions, Utilities, etc.',
      amount: 'Amount',
      currency: 'Currency',
      taxTreatment: 'Tax treatment',
      addTaxes: 'Add taxes',
      taxesIncluded: 'When off, the amount already includes tax.',
      taxApplied: '{rate}% applied based on currency.',
      frequency: 'Frequency',
      selectFrequency: 'Select frequency',
      timesPerYear: 'Times per year',
      paymentSchedule: 'Payment schedule',
      startDate: 'Start date',
      patternType: 'Pattern type',
      selectPattern: 'Select pattern',
      dayOfMonth: 'Day of month',
      day: 'Day',
      dayOfWeek: 'Day of week',
      weekday: 'Weekday',
      whichWeek: 'Which week',
      week: 'Week',
      month: 'Month',
      everyXDays: 'Every X days',
      cancel: 'Cancel',
      patterns: {
        'day-of-week': 'Day of week',
        'day-of-month': 'Day of month',
        'nth-weekday': 'Nth weekday of month',
        'specific-date': 'Specific dates',
        'day-of-year': 'Day of year',
        'nth-weekday-year': 'Nth weekday of month',
        interval: 'Every X days'
      },
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      ordinals: ['1st', '2nd', '3rd', '4th', 'Last'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    pages: {
      featuresTitle: 'A practical tracker for money that repeats.',
      featuresIntro: 'Subfolio is built around recurring finance instead of one-off transaction capture. It helps you understand what is committed, what is coming next, and what your database-backed app can do without a hosted backend.',
      featuresProposesTitle: 'What it proposes',
      featuresProposesSubtitle: 'A finance shell that respects user-owned data.',
      shellTitle: 'Start with the shell',
      shellSubtitle: 'The free tier is the product base.',
      shellBody: 'The current product is intentionally simple: a frontend application, a connection form, and realtime adapters. The next feature work can build on this foundation without changing the ownership model.',
      learnByodb: 'Learn BYODB',
      aboutTitle: 'From a personal spreadsheet to a shareable app.',
      aboutIntro: 'Subfolio started from a practical problem: recurring expenses need structure, categories, and a dashboard that can evolve without turning into a fragile spreadsheet.',
      whyBuilt: 'Why we built it',
      technologyTitle: 'Technology behind it',
      technologySubtitle: 'A portable frontend shell with realtime adapters.',
      startGithubProject: 'Start on GitHub',
      principles: 'Product principles',
      tryDatabase: 'Try it with your own database.',
      tryDatabaseBody: 'Connect Firebase Realtime Database or PocketBase and use the current app shell freely.',
      byodbTitle: 'Run Subfolio with a database you control.',
      byodbIntro: 'BYODB keeps Subfolio lightweight: the application is a frontend shell, while persistence and realtime updates live in the user’s own database provider.',
      byodbNotice: 'Subfolio does not need a hosted backend for the current tracker experience. Provider costs, permissions, backups, and database rules remain under the user’s control.',
      connectionStores: 'What the connection stores',
      connectionStoresSubtitle: 'Only provider details needed by the browser app.',
      firebaseDetails: 'API key, auth domain, project ID, app ID, database URL, and database path.',
      pocketbaseDetails: 'Instance URL and collection name.',
      openSourceTitle: 'Transparent software for user-owned finance data.',
      openSourceIntro: 'Subfolio is built around a simple philosophy: users should be able to run the application freely, inspect how it works, and keep their recurring finance data in infrastructure they control.',
      contributionTitle: 'How contribution works',
      contributionSubtitle: 'GitHub is the project collaboration surface.',
      openGithub: 'Open GitHub',
      readArchitecture: 'Read architecture',
      noHostedBackend: 'No hosted backend by default',
      pricingTitle: 'Start free with your own database.',
      pricingIntro: 'Subfolio has one tier for now. The app is free to use as a frontend shell, and users bring the database provider they want to operate.',
      free: 'Free',
      currentTier: 'Current tier',
      noHostingFee: 'No Subfolio hosting fee.',
      useShellFreely: 'Use the application shell freely.',
      whatMayChange: 'What may change later',
      refunds: 'Refunds'
    },
    pageData: {
      featureCards: [
        { title: 'Recurring expense ledger', detail: 'Track subscriptions, bills, renewals, annual plans, service URLs, categories, currencies, taxes, and active states in one place.' },
        { title: 'Forward cash-flow planning', detail: 'Turn recurring commitments into monthly, weekly, bi-weekly, and yearly views so upcoming pressure is visible before it lands.' },
        { title: 'Recurrence intelligence', detail: 'Model simple monthly payments, yearly commitments, day-of-week schedules, interval schedules, and custom frequencies.' },
        { title: 'Category clarity', detail: 'Group expenses by the way you think about money, then compare category totals and spot recurring obligations that drift upward.' },
        { title: 'Currency and tax controls', detail: 'Choose display currencies, keep available currencies tidy, and apply tax treatment rules without changing the database model.' },
        { title: 'Portable database connection', detail: 'Connect Firebase Realtime Database or PocketBase today, with the adapter boundary ready for more realtime providers later.' }
      ],
      workflow: [
        { title: 'Connect a realtime database you control.', detail: 'Subfolio starts from a connection instead of an account. Users can run it against their own realtime database.' },
        { title: 'Add recurring obligations and recurrence patterns.', detail: 'Expenses are structured with categories, currencies, schedules, tax behavior, and metadata for future forecasting.' },
        { title: 'Review totals by period, category, and upcoming due dates.', detail: 'The tracker turns saved records into operational views for planning rather than a raw list of transactions.' },
        { title: 'Keep the frontend portable because the app does not depend on a hosted Subfolio backend.', detail: 'Provider adapters keep the application portable and make future database support additive.' }
      ],
      aboutReasons: [
        { title: 'Natural categories matter', detail: 'Internet services, mortgage costs, cars, insurance, and subscriptions should be grouped the way people actually think about their money.' },
        { title: 'Dashboards need clean data', detail: 'When expenses are categorized well, weekly and monthly views can show where money is really going instead of hiding patterns in a spreadsheet.' },
        { title: 'Sharing should start from zero', detail: 'A website lets friends or family begin with a clean app and grow their own setup instead of inheriting someone else’s personalized spreadsheet.' }
      ],
      aboutBody: [
        'A few years ago, the first version of this idea was a spreadsheet for tracking recurring expenses. It worked well at the beginning, but it became messy as more expenses were added, prices changed, frequencies shifted, and extra details needed to be tracked.',
        'The most important missing piece was a natural way to organize expenses. Internet services, mortgage categories, car costs, subscriptions, and other recurring items needed to be grouped clearly so a dashboard could show where money was going each month or each week.',
        'The spreadsheet was useful, but it became harder to personalize and harder to share. Subfolio turns that idea into a website that starts from zero, grows with the user, and can be shared with friends or family without asking them to understand a highly customized spreadsheet.'
      ],
      aboutTechnology: [
        'Vue and Vite power the frontend application shell.',
        'PrimeVue provides the UI layer and interaction patterns.',
        'Firebase Realtime Database and PocketBase are the first BYODB realtime adapters.',
        'The app keeps the hosted Subfolio backend optional by storing records in the database the user chooses.',
        'The code is organized so future realtime providers can be added behind the same adapter boundary.'
      ],
      productPrinciples: [
        'Make recurring obligations visible before they surprise the user.',
        'Make categories and dashboards practical enough for real household planning.',
        'Keep the app portable so people can bring their own database and own their records.'
      ],
      byodbProviders: [
        { title: 'Firebase Realtime Database', detail: 'Use a Firebase project and database path that you control. Subfolio reads and writes recurring expense records through the browser Firebase SDK.' },
        { title: 'PocketBase', detail: 'Point Subfolio at a PocketBase URL and collection name. The frontend subscribes to realtime collection changes and stores records in your instance.' }
      ],
      byodbSteps: [
        { title: 'Create or choose a realtime database', detail: 'Start with Firebase Realtime Database or PocketBase. Future providers can join by implementing the same adapter contract.' },
        { title: 'Paste connection details into Subfolio', detail: 'The connection form stores the selected provider details locally in the browser and uses them to initialize the app.' },
        { title: 'Use Subfolio as a frontend shell', detail: 'Expenses, categories, recurrence data, and updates flow through your database instead of a hosted Subfolio backend.' },
        { title: 'Share a config link when useful', detail: 'A base64 `config` URL parameter can replace the saved database connection on any route, matching the portable connection pattern used in Refinimo.' }
      ],
      openSourcePrinciples: [
        { title: 'Open source by default', detail: 'Subfolio is meant to grow in the open so users can inspect the shell, understand the data model, and contribute improvements.' },
        { title: 'User-owned data', detail: 'Finance records should stay in a database controlled by the user, not hidden behind a hosted Subfolio account.' },
        { title: 'Bring your own database', detail: 'The app starts with Firebase Realtime Database and PocketBase, with an adapter boundary for future realtime providers.' },
        { title: 'Frontend-only shell', detail: 'The current product does not need a hosted Subfolio backend. The browser app connects directly to the selected provider.' }
      ],
      contributionBody: [
        'Product work, bug reports, source code changes, release history, and architecture notes should be traceable through the repository.',
        'Contributions should preserve the BYODB model: keep provider-specific details behind adapters, avoid introducing a hosted Subfolio backend by default, and make user data ownership explicit in new features.'
      ],
      noHostedBackendBody: 'Subfolio’s public app is a browser shell over a realtime connection. That keeps the current product simple and makes database ownership a first-class decision instead of a hidden implementation detail.',
      noHostedBackendNotice: 'The free tier remains intentionally simple: open the app, connect your own database, and run Subfolio without a hosted Subfolio account.',
      pricingFeatures: [
        'Frontend-only Subfolio application shell',
        'Firebase Realtime Database connection',
        'PocketBase connection',
        'Recurring expense tracker',
        'Categories and recurrence overview',
        'Currency display preferences',
        'Config URL support for portable database setup'
      ],
      pricingNotice: 'Database provider usage, limits, billing, security rules, and backups are managed by the user in their chosen provider.',
      pricingFuture: 'Pricing may evolve if Subfolio adds hosted collaboration, managed sync, advanced reporting, or optional hosted database services. The current base product remains focused on BYODB.',
      pricingRefund: 'There is no Subfolio charge on the free tier, so there is no paid subscription to refund. Provider charges are handled by the user’s database provider.'
    },
    legalPages: {
      privacy: {
        title: 'Privacy starts with user-owned data.',
        intro: 'Subfolio is currently a frontend-only application shell. The app stores connection settings in the browser and reads or writes finance data to the database provider selected by the user.',
        notice: 'This policy is a working product policy for the current free BYODB app and should be reviewed before a production launch.',
        sections: [
          { title: 'Data location', body: 'Recurring expense records are stored in the user-selected Firebase Realtime Database or PocketBase instance, not in a hosted Subfolio backend.' },
          { title: 'Browser storage', body: 'Subfolio saves database connection details and display preferences in local browser storage so the app can reconnect between sessions.' },
          { title: 'Provider responsibility', body: 'Users are responsible for their provider configuration, database rules, access controls, backups, and any provider-level analytics or logs.' }
        ]
      },
      terms: {
        title: 'Terms for the free Subfolio shell.',
        intro: 'Subfolio is provided as a frontend application for tracking recurring finance data against a database connection supplied by the user.',
        notice: 'These terms are an initial product draft and should be reviewed before accepting production users.',
        sections: [
          { title: 'Use of the app', body: 'Users may use Subfolio to connect their own supported realtime database and manage recurring finance records through the browser app.' },
          { title: 'No financial advice', body: 'Subfolio organizes user-entered data for planning. It does not provide financial, tax, accounting, or legal advice.' },
          { title: 'User responsibility', body: 'Users are responsible for the accuracy of their records, their database provider account, and any costs or security settings associated with that provider.' }
        ]
      },
      refund: {
        title: 'No Subfolio charges on the free tier.',
        intro: 'Subfolio currently offers a single free tier for the frontend application shell.',
        notice: 'If paid Subfolio services are added later, this policy should be updated before launch.',
        sections: [
          { title: 'Free tier', body: 'There is no Subfolio subscription charge for the current free tier, so there is no Subfolio payment to refund.' },
          { title: 'Provider charges', body: 'Any database provider costs are managed directly between the user and the selected provider, such as Firebase or PocketBase hosting.' },
          { title: 'Future paid services', body: 'If Subfolio adds hosted or paid services later, refund terms should be published before those services are made available.' }
        ]
      },
      license: {
        title: 'Project license status.',
        intro: 'Subfolio is being built as a product and the public license terms are not finalized yet.',
        notice: 'Until a repository license file is published, do not assume open-source reuse rights beyond normal viewing of the repository.',
        sections: [
          { title: 'Application content', body: 'The Subfolio name, interface copy, generated icons, and product assets are part of the Subfolio product identity.' },
          { title: 'Source code', body: 'A formal source license should be added when the project owner decides how the application may be reused, copied, or redistributed.' },
          { title: 'Third-party software', body: 'Subfolio depends on third-party packages such as Vue, Vite, PrimeVue, Firebase, and PocketBase, each under its own license.' }
        ]
      }
    },
    footer: {
      tagline: 'Forward-looking subscription finance that runs on a database you control.'
    },
    connect: {
      tagline: 'Smart subscription finance that runs on the connection you choose.',
      account: 'Account',
      byodb: 'Bring your own database',
      signInTitle: 'Sign in to Subfolio',
      signInBody: 'Use a standard Subfolio account when hosted accounts are available.',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: 'you@example.com',
      signIn: 'Sign in',
      accountUnavailable: 'Account sign-in is not connected yet. Use the BYODB tab to run Subfolio with your own database today.',
      byodbBody: 'Connect Subfolio to a realtime database you control. Connection details stay in this browser.',
      provider: 'Provider',
      chooseProvider: 'Choose a provider',
      databaseUrl: 'Database URL',
      apiKey: 'API key',
      projectId: 'Project ID',
      appId: 'App ID',
      authDomain: 'Auth domain',
      dataPath: 'Data path',
      pocketbaseUrl: 'PocketBase URL',
      collection: 'Collection',
      returnOverview: 'Return to overview',
      connectDatabase: 'Connect database'
    }
  },
  fr: {
    common: {
      appName: 'Subfolio',
      openApp: "Ouvrir l'app",
      githubRepo: 'Ouvrir le dépôt Subfolio',
      theme: 'Thème',
      language: 'Langue',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
      english: 'Anglais',
      french: 'Français'
    },
    nav: {
      overview: 'Aperçu',
      features: 'Fonctions',
      about: 'À propos',
      byodb: 'BYODB',
      pricing: 'Tarifs',
      openSource: 'Open source',
      changelog: 'Journal',
      product: 'Produit',
      legal: 'Légal',
      github: 'GitHub',
      sourceCode: 'Code source',
      roadmapArchitecture: 'Feuille de route / Architecture',
      privacy: 'Politique de confidentialité',
      terms: "Conditions d'utilisation",
      refund: 'Politique de remboursement',
      license: 'Licence'
    },
    appNav: {
      home: 'Accueil',
      expenses: 'Dépenses',
      categories: 'Catégories',
      recurrences: 'Récurrences',
      settings: 'Réglages',
      add: 'Ajouter',
      addExpense: 'Ajouter une dépense',
      disconnect: 'Déconnecter'
    },
    landing: {
      heroTitle: 'Voyez chaque paiement récurrent avant qu’il vous surprenne.',
      heroBody: 'Subfolio suit les abonnements et les obligations prévisibles, puis projette leur impact sur les prochains mois, les paies et le flux de trésorerie à long terme.',
      exploreFeatures: 'Explorer les fonctions',
      marchForecast: 'Prévision de mars',
      forecastSubtitle: 'Aperçu des obligations récurrentes',
      monthEndBalance: 'Solde de fin de mois',
      projectedAfterBills: 'Projeté après factures',
      subscriptions: 'Abonnements',
      utilities: 'Services',
      wellness: 'Bien-être',
      housing: 'Logement',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      activeRecurringItems: 'Éléments récurrents actifs',
      balanceMessage: 'Le solde reste au-dessus de votre seuil de confort tout le mois.',
      trackTitle: 'Suivre les engagements récurrents',
      trackDetail: 'Gardez les abonnements, factures, renouvellements et paiements annuels au même endroit.',
      forecastTitle: 'Prévoir le flux de trésorerie',
      forecastDetail: 'Transformez les engagements annuels en pression mensuelle et par période de paie.',
      byodbTitle: 'Apportez votre propre base de données',
      byodbDetail: 'Connectez Subfolio à une instance Firebase ou PocketBase que vous contrôlez.',
      portableTitle: 'Rester portable',
      portableDetail: 'Le frontend agit comme une coquille sur votre connexion plutôt que comme un backend hébergé.',
      formTitle: 'Ajouter une dépense récurrente',
      formSubtitle: 'Aperçu de formulaire PrimeVue',
      expenseName: 'Nom de la dépense',
      category: 'Catégorie',
      amount: 'Montant',
      frequency: 'Fréquence',
      nextDue: 'Prochaine échéance',
      previewExpense: 'Prévisualiser la dépense',
      obligationsTitle: 'Obligations à venir',
      obligationsSubtitle: "Comment les éléments récurrents s'affichent dans l'app",
      expense: 'Dépense',
      useConnectionTitle: 'Utilisez une connexion que vous contrôlez.',
      useConnectionBody: 'Subfolio peut démarrer avec Firebase ou PocketBase et évoluer vers plus de fournisseurs temps réel sans backend Subfolio hébergé.'
    },
    home: {
      title: 'Bienvenue dans Subfolio',
      intro: 'Suivez les engagements récurrents, comprenez votre charge mensuelle moyenne et gardez la vue des abonnements connectée à votre propre base de données.',
      activeExpenses: 'Dépenses actives',
      activeExpensesDetail: 'Éléments récurrents comptabilisés',
      monthlyTotal: 'Total mensuel',
      monthlyTotalDetail: 'Obligation mensuelle moyenne',
      yearlyTotal: 'Total annuel',
      yearlyTotalDetail: 'Dépense annuelle projetée',
      quickActions: 'Actions rapides',
      quickActionsSubtitle: 'Accédez aux flux principaux.',
      viewExpenses: 'Voir les dépenses',
      viewExpensesDetail: 'Gérer votre suivi de dépenses récurrentes',
      browseCategories: 'Parcourir les catégories',
      browseCategoriesDetail: 'Voir où les abonnements sont regroupés',
      reviewRecurrences: 'Revoir les récurrences',
      reviewRecurrencesDetail: 'Comparer les totaux annuels, mensuels et par paie',
      settingsDetail: 'Ajuster les devises et les détails de connexion',
      openTracker: 'Ouvrir le suivi'
    },
    metrics: {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      biWeekly: 'Aux deux semaines',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      active: 'Actif',
      categories: 'Catégories',
      activeDetail: '{count} actifs'
    },
    table: {
      expense: 'Dépense',
      category: 'Catégorie',
      frequency: 'Fréquence',
      nextDue: 'Prochaine échéance',
      amount: 'Montant',
      actions: 'Actions',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      perPay: 'Par paie',
      openService: 'Ouvrir le service',
      deactivate: 'Désactiver',
      activate: 'Activer',
      edit: 'Modifier',
      delete: 'Supprimer',
      tax: '+taxes'
    },
    frequencies: {
      weekly: 'Hebdomadaire',
      'bi-weekly': 'Aux deux semaines',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      'semi-annually': 'Semestriel',
      yearly: 'Annuel',
      custom: 'Personnalisé',
      timesPerYear: '{count}x/an'
    },
    tracker: {
      title: 'Dépenses',
      intro: 'Suivez tous les paiements récurrents en un coup d’œil.',
      ledgerTitle: 'Registre des dépenses',
      ledgerSubtitle: 'Toutes les dépenses récurrentes',
      searchPlaceholder: 'Rechercher des dépenses...',
      noSearchMatch: 'Aucune dépense ne correspond à « {query} ». Essayez un autre terme.',
      empty: 'Aucune dépense pour le moment. Utilisez Ajouter une dépense pour commencer.'
    },
    categories: {
      title: 'Catégories',
      intro: 'Consultez les dépenses récurrentes organisées par catégorie.',
      breakdownTitle: 'Répartition par catégorie',
      breakdownSubtitle: 'Retirez des catégories des calculs sans supprimer les dépenses.',
      empty: 'Ajoutez des dépenses pour les voir regroupées par catégorie.',
      activeOfTotal: '{active} actives sur {total} dépenses',
      included: 'Incluse',
      excluded: 'Exclue'
    },
    recurrences: {
      title: 'Voyez vos obligations annuelles, mensuelles et par paie.',
      intro: 'Subfolio calcule les totaux projetés sur l’année et les répartit en vues mensuelles et par paie.',
      yearlyLabel: 'Annuel projeté',
      yearlyDetail: 'Toutes les obligations récurrentes',
      monthlyLabel: 'Mensuel projeté',
      monthlyDetail: 'Moyenne par mois',
      payLabel: 'Par paie',
      payDetail: 'Basé sur 26 périodes de paie',
      allTitle: 'Toutes les récurrences',
      allSubtitle: 'Coût projeté par cadence',
      empty: 'Aucune dépense récurrente active pour le moment.'
    },
    settings: {
      title: 'Réglages',
      intro: 'Définissez les préférences d’affichage et vérifiez la connexion active.',
      local: 'Les préférences d’affichage sont enregistrées localement dans ce navigateur.',
      databaseTitle: 'Connexion à la base de données',
      noConnection: 'Aucune base de données connectée',
      changeConnection: 'Changer la connexion',
      currencyTitle: 'Affichage des devises',
      currencySubtitle: 'Contrôlez les totaux, les formulaires et les libellés de conversion.',
      displayedCurrency: 'Devise affichée',
      displayedCurrencyDetail: 'Les totaux et infobulles utilisent cette devise comme base.',
      currencyPlaceholder: 'Devise',
      availableCurrencies: 'Devises disponibles',
      availableCurrenciesDetail: 'Contrôlez les devises disponibles dans la fenêtre d’ajout et de modification.',
      selectCurrencies: 'Sélectionner les devises',
      ratesRefreshing: 'Actualisation des taux',
      ratesOffline: 'Hors ligne - taux en cache',
      ratesReady: 'Taux à jour',
      orderingTitle: 'Ordre des dépenses',
      orderingSubtitle: 'Choisissez l’ordre par défaut des dépenses récurrentes.',
      defaultOrdering: 'Ordre par défaut',
      defaultOrderingDetail: 'Contrôlez comment les dépenses sont triées par défaut.',
      orderingPlaceholder: 'Ordre',
      manualNotice: 'Le glisser-déposer manuel est sélectionné. Cette interaction est encore prévue pour une future mise à jour.',
      orderingDateAdded: 'Date d’ajout',
      orderingAmountAsc: 'Montant (croissant)',
      orderingAmountDesc: 'Montant (décroissant)',
      orderingCategory: 'Catégorie',
      orderingManual: 'Manuel (glisser-déposer)'
    },
    expenseForm: {
      addTitle: 'Ajouter une dépense',
      editTitle: 'Modifier la dépense',
      addButton: 'Ajouter une dépense',
      saveButton: 'Enregistrer',
      name: 'Nom de la dépense',
      namePlaceholder: 'Netflix, Spotify, etc.',
      serviceUrl: 'URL du service',
      optional: '(optionnel)',
      category: 'Catégorie',
      categoryPlaceholder: 'Abonnements, services, etc.',
      amount: 'Montant',
      currency: 'Devise',
      taxTreatment: 'Traitement des taxes',
      addTaxes: 'Ajouter les taxes',
      taxesIncluded: 'Si désactivé, le montant inclut déjà les taxes.',
      taxApplied: '{rate}% appliqué selon la devise.',
      frequency: 'Fréquence',
      selectFrequency: 'Sélectionner une fréquence',
      timesPerYear: 'Fois par an',
      paymentSchedule: 'Calendrier de paiement',
      startDate: 'Date de début',
      patternType: 'Type de modèle',
      selectPattern: 'Sélectionner un modèle',
      dayOfMonth: 'Jour du mois',
      day: 'Jour',
      dayOfWeek: 'Jour de la semaine',
      weekday: 'Jour',
      whichWeek: 'Quelle semaine',
      week: 'Semaine',
      month: 'Mois',
      everyXDays: 'Tous les X jours',
      cancel: 'Annuler',
      patterns: {
        'day-of-week': 'Jour de la semaine',
        'day-of-month': 'Jour du mois',
        'nth-weekday': 'Nième jour de semaine du mois',
        'specific-date': 'Dates précises',
        'day-of-year': 'Jour de l’année',
        'nth-weekday-year': 'Nième jour de semaine du mois',
        interval: 'Tous les X jours'
      },
      weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      ordinals: ['1er', '2e', '3e', '4e', 'Dernier'],
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    },
    pages: {
      featuresTitle: 'Un outil pratique pour l’argent qui revient.',
      featuresIntro: 'Subfolio est conçu autour des finances récurrentes plutôt que de la capture de transactions ponctuelles. Il aide à comprendre ce qui est engagé, ce qui arrive ensuite et ce qu’une app connectée à votre base peut faire sans backend hébergé.',
      featuresProposesTitle: 'Ce que l’app propose',
      featuresProposesSubtitle: 'Une coquille financière qui respecte les données détenues par l’utilisateur.',
      shellTitle: 'Commencer avec la coquille',
      shellSubtitle: 'Le palier gratuit est la base du produit.',
      shellBody: 'Le produit actuel est volontairement simple : une application frontend, un formulaire de connexion et des adaptateurs temps réel. Les prochaines fonctions peuvent s’appuyer sur cette base sans changer le modèle de propriété.',
      learnByodb: 'Découvrir BYODB',
      aboutTitle: 'D’un chiffrier personnel à une app partageable.',
      aboutIntro: 'Subfolio est né d’un problème concret : les dépenses récurrentes ont besoin de structure, de catégories et d’un tableau de bord qui peut évoluer sans devenir un chiffrier fragile.',
      whyBuilt: 'Pourquoi nous l’avons bâti',
      technologyTitle: 'Technologie utilisée',
      technologySubtitle: 'Une coquille frontend portable avec des adaptateurs temps réel.',
      startGithubProject: 'Démarrer sur GitHub',
      principles: 'Principes produit',
      tryDatabase: 'Essayez avec votre propre base.',
      tryDatabaseBody: 'Connectez Firebase Realtime Database ou PocketBase et utilisez librement la coquille actuelle.',
      byodbTitle: 'Exécutez Subfolio avec une base que vous contrôlez.',
      byodbIntro: 'BYODB garde Subfolio léger : l’application est une coquille frontend, tandis que la persistance et les mises à jour temps réel vivent dans le fournisseur choisi par l’utilisateur.',
      byodbNotice: 'Subfolio n’a pas besoin d’un backend hébergé pour l’expérience actuelle. Les coûts, permissions, sauvegardes et règles restent sous le contrôle de l’utilisateur.',
      connectionStores: 'Ce que la connexion stocke',
      connectionStoresSubtitle: 'Uniquement les détails nécessaires à l’app dans le navigateur.',
      firebaseDetails: 'Clé API, domaine d’authentification, ID de projet, ID d’app, URL de base de données et chemin.',
      pocketbaseDetails: 'URL d’instance et nom de collection.',
      openSourceTitle: 'Un logiciel transparent pour des données financières détenues par l’utilisateur.',
      openSourceIntro: 'Subfolio repose sur une philosophie simple : les utilisateurs devraient pouvoir exécuter l’application librement, inspecter son fonctionnement et garder leurs données financières récurrentes dans une infrastructure qu’ils contrôlent.',
      contributionTitle: 'Comment contribuer',
      contributionSubtitle: 'GitHub est l’espace de collaboration du projet.',
      openGithub: 'Ouvrir GitHub',
      readArchitecture: 'Lire l’architecture',
      noHostedBackend: 'Pas de backend hébergé par défaut',
      pricingTitle: 'Commencez gratuitement avec votre propre base.',
      pricingIntro: 'Subfolio a un seul palier pour l’instant. L’app est gratuite comme coquille frontend, et les utilisateurs apportent le fournisseur de base qu’ils veulent exploiter.',
      free: 'Gratuit',
      currentTier: 'Palier actuel',
      noHostingFee: 'Aucuns frais d’hébergement Subfolio.',
      useShellFreely: 'Utilisez librement la coquille applicative.',
      whatMayChange: 'Ce qui pourrait changer plus tard',
      refunds: 'Remboursements'
    },
    pageData: {
      featureCards: [
        { title: 'Registre des dépenses récurrentes', detail: 'Suivez abonnements, factures, renouvellements, forfaits annuels, URLs de service, catégories, devises, taxes et états actifs au même endroit.' },
        { title: 'Planification du flux de trésorerie', detail: 'Transformez les engagements récurrents en vues mensuelles, hebdomadaires, aux deux semaines et annuelles pour voir la pression avant qu’elle arrive.' },
        { title: 'Intelligence de récurrence', detail: 'Modélisez les paiements mensuels simples, les engagements annuels, les horaires par jour de semaine, les intervalles et les fréquences personnalisées.' },
        { title: 'Clarté par catégorie', detail: 'Regroupez les dépenses selon votre façon de penser l’argent, puis comparez les totaux et repérez les obligations qui montent.' },
        { title: 'Contrôles de devise et de taxes', detail: 'Choisissez les devises d’affichage, gardez les devises disponibles propres et appliquez les règles de taxes sans changer le modèle de données.' },
        { title: 'Connexion de base portable', detail: 'Connectez Firebase Realtime Database ou PocketBase aujourd’hui, avec une frontière d’adaptateur prête pour d’autres fournisseurs temps réel.' }
      ],
      workflow: [
        { title: 'Connecter une base temps réel que vous contrôlez.', detail: 'Subfolio part d’une connexion plutôt que d’un compte. Les utilisateurs peuvent l’exécuter avec leur propre base temps réel.' },
        { title: 'Ajouter des obligations récurrentes et des modèles de récurrence.', detail: 'Les dépenses sont structurées avec catégories, devises, horaires, taxes et métadonnées pour les prévisions futures.' },
        { title: 'Réviser les totaux par période, catégorie et échéance.', detail: 'Le suivi transforme les enregistrements en vues opérationnelles de planification plutôt qu’en simple liste de transactions.' },
        { title: 'Garder le frontend portable parce que l’app ne dépend pas d’un backend Subfolio hébergé.', detail: 'Les adaptateurs de fournisseurs gardent l’application portable et rendent le support futur additif.' }
      ],
      aboutReasons: [
        { title: 'Les catégories naturelles comptent', detail: 'Les services internet, l’hypothèque, les voitures, les assurances et les abonnements devraient être regroupés comme les gens pensent réellement à leur argent.' },
        { title: 'Les tableaux de bord exigent des données propres', detail: 'Quand les dépenses sont bien catégorisées, les vues hebdomadaires et mensuelles montrent où va vraiment l’argent au lieu de cacher les tendances dans un chiffrier.' },
        { title: 'Le partage devrait partir de zéro', detail: 'Un site permet aux amis ou à la famille de commencer avec une app propre et de bâtir leur propre configuration plutôt que d’hériter d’un chiffrier déjà très personnalisé.' }
      ],
      aboutBody: [
        'Il y a quelques années, la première version de cette idée était un chiffrier pour suivre les dépenses récurrentes. Il fonctionnait bien au début, mais il est devenu désordonné à mesure que des dépenses s’ajoutaient, que les prix changeaient, que les fréquences bougeaient et que d’autres détails devaient être suivis.',
        'La pièce la plus importante qui manquait était une façon naturelle d’organiser les dépenses. Les services internet, les catégories d’hypothèque, les coûts liés aux voitures, les abonnements et les autres éléments récurrents devaient être regroupés clairement pour qu’un tableau de bord puisse montrer où allait l’argent chaque mois ou chaque semaine.',
        'Le chiffrier était utile, mais il devenait plus difficile à personnaliser et à partager. Subfolio transforme cette idée en site web qui part de zéro, grandit avec l’utilisateur et peut être partagé avec des amis ou la famille sans leur demander de comprendre un chiffrier hautement personnalisé.'
      ],
      aboutTechnology: [
        'Vue et Vite alimentent la coquille applicative frontend.',
        'PrimeVue fournit la couche d’interface et les interactions.',
        'Firebase Realtime Database et PocketBase sont les premiers adaptateurs temps réel BYODB.',
        'L’app garde le backend Subfolio hébergé optionnel en stockant les enregistrements dans la base choisie par l’utilisateur.',
        'Le code est organisé pour que de futurs fournisseurs temps réel puissent être ajoutés derrière la même frontière d’adaptateur.'
      ],
      productPrinciples: [
        'Rendre les obligations récurrentes visibles avant qu’elles surprennent l’utilisateur.',
        'Rendre les catégories et tableaux de bord assez pratiques pour la planification réelle d’un foyer.',
        'Garder l’app portable afin que les gens puissent apporter leur propre base et posséder leurs enregistrements.'
      ],
      byodbProviders: [
        { title: 'Firebase Realtime Database', detail: 'Utilisez un projet Firebase et un chemin de base que vous contrôlez. Subfolio lit et écrit les dépenses récurrentes via le SDK Firebase dans le navigateur.' },
        { title: 'PocketBase', detail: 'Pointez Subfolio vers une URL PocketBase et un nom de collection. Le frontend s’abonne aux changements temps réel et stocke les enregistrements dans votre instance.' }
      ],
      byodbSteps: [
        { title: 'Créer ou choisir une base temps réel', detail: 'Commencez avec Firebase Realtime Database ou PocketBase. De futurs fournisseurs peuvent s’ajouter en respectant le même contrat d’adaptateur.' },
        { title: 'Coller les détails de connexion dans Subfolio', detail: 'Le formulaire stocke localement les détails du fournisseur dans le navigateur et les utilise pour initialiser l’app.' },
        { title: 'Utiliser Subfolio comme coquille frontend', detail: 'Les dépenses, catégories, récurrences et mises à jour passent par votre base plutôt que par un backend Subfolio hébergé.' },
        { title: 'Partager un lien de configuration au besoin', detail: 'Un paramètre URL `config` en base64 peut remplacer la connexion enregistrée sur n’importe quelle route, comme le modèle portable utilisé dans Refinimo.' }
      ],
      openSourcePrinciples: [
        { title: 'Open source par défaut', detail: 'Subfolio est destiné à évoluer ouvertement pour que les utilisateurs puissent inspecter la coquille, comprendre le modèle de données et contribuer.' },
        { title: 'Données détenues par l’utilisateur', detail: 'Les enregistrements financiers devraient rester dans une base contrôlée par l’utilisateur, pas cachés derrière un compte Subfolio hébergé.' },
        { title: 'Apportez votre propre base', detail: 'L’app commence avec Firebase Realtime Database et PocketBase, avec une frontière d’adaptateur pour de futurs fournisseurs temps réel.' },
        { title: 'Coquille frontend seulement', detail: 'Le produit actuel n’a pas besoin d’un backend Subfolio hébergé. L’app navigateur se connecte directement au fournisseur choisi.' }
      ],
      contributionBody: [
        'Le travail produit, les bogues, les changements de code, l’historique de versions et les notes d’architecture devraient rester traçables dans le dépôt.',
        'Les contributions devraient préserver le modèle BYODB : garder les détails par fournisseur derrière des adaptateurs, éviter d’introduire un backend Subfolio hébergé par défaut et rendre la propriété des données explicite.'
      ],
      noHostedBackendBody: 'L’app publique de Subfolio est une coquille navigateur au-dessus d’une connexion temps réel. Cela garde le produit simple et fait de la propriété de la base une décision de premier plan.',
      noHostedBackendNotice: 'Le palier gratuit reste volontairement simple : ouvrez l’app, connectez votre base et utilisez Subfolio sans compte Subfolio hébergé.',
      pricingFeatures: [
        'Coquille applicative frontend Subfolio',
        'Connexion Firebase Realtime Database',
        'Connexion PocketBase',
        'Suivi des dépenses récurrentes',
        'Catégories et aperçu des récurrences',
        'Préférences d’affichage des devises',
        'Support d’URL config pour une configuration portable'
      ],
      pricingNotice: 'L’utilisation, les limites, la facturation, les règles de sécurité et les sauvegardes du fournisseur de base sont gérées par l’utilisateur.',
      pricingFuture: 'Les tarifs pourraient évoluer si Subfolio ajoute de la collaboration hébergée, une synchronisation gérée, des rapports avancés ou des services de base hébergés optionnels. Le produit de base reste centré sur BYODB.',
      pricingRefund: 'Il n’y a aucun frais Subfolio sur le palier gratuit, donc aucun abonnement payé à rembourser. Les frais de fournisseur sont gérés par le fournisseur de base de l’utilisateur.'
    },
    legalPages: {
      privacy: {
        title: 'La confidentialité commence avec les données détenues par l’utilisateur.',
        intro: 'Subfolio est actuellement une coquille applicative frontend. L’app stocke les paramètres de connexion dans le navigateur et lit ou écrit les données financières dans le fournisseur choisi par l’utilisateur.',
        notice: 'Cette politique est une politique produit de travail pour l’app BYODB gratuite actuelle et devrait être révisée avant un lancement en production.',
        sections: [
          { title: 'Emplacement des données', body: 'Les dépenses récurrentes sont stockées dans l’instance Firebase Realtime Database ou PocketBase choisie par l’utilisateur, pas dans un backend Subfolio hébergé.' },
          { title: 'Stockage navigateur', body: 'Subfolio enregistre les détails de connexion et préférences d’affichage dans le stockage local du navigateur pour se reconnecter entre les sessions.' },
          { title: 'Responsabilité du fournisseur', body: 'Les utilisateurs sont responsables de leur configuration, règles de base, contrôles d’accès, sauvegardes et journaux ou analyses du fournisseur.' }
        ]
      },
      terms: {
        title: 'Conditions pour la coquille Subfolio gratuite.',
        intro: 'Subfolio est fourni comme application frontend pour suivre des données financières récurrentes avec une connexion de base fournie par l’utilisateur.',
        notice: 'Ces conditions sont une ébauche initiale et devraient être révisées avant d’accepter des utilisateurs en production.',
        sections: [
          { title: 'Utilisation de l’app', body: 'Les utilisateurs peuvent connecter leur propre base temps réel supportée et gérer les données financières récurrentes dans l’app navigateur.' },
          { title: 'Aucun conseil financier', body: 'Subfolio organise les données saisies par l’utilisateur pour la planification. Il ne fournit pas de conseils financiers, fiscaux, comptables ou juridiques.' },
          { title: 'Responsabilité de l’utilisateur', body: 'Les utilisateurs sont responsables de l’exactitude des enregistrements, de leur compte fournisseur et des coûts ou réglages de sécurité associés.' }
        ]
      },
      refund: {
        title: 'Aucuns frais Subfolio sur le palier gratuit.',
        intro: 'Subfolio offre actuellement un seul palier gratuit pour la coquille applicative frontend.',
        notice: 'Si des services payants Subfolio sont ajoutés plus tard, cette politique devrait être mise à jour avant leur lancement.',
        sections: [
          { title: 'Palier gratuit', body: 'Il n’y a aucun frais d’abonnement Subfolio pour le palier gratuit actuel, donc aucun paiement Subfolio à rembourser.' },
          { title: 'Frais de fournisseur', body: 'Les coûts du fournisseur de base sont gérés directement entre l’utilisateur et le fournisseur choisi, comme Firebase ou l’hébergement PocketBase.' },
          { title: 'Services payants futurs', body: 'Si Subfolio ajoute des services hébergés ou payants plus tard, les conditions de remboursement devraient être publiées avant leur disponibilité.' }
        ]
      },
      license: {
        title: 'Statut de licence du projet.',
        intro: 'Subfolio est bâti comme produit et les conditions de licence publique ne sont pas encore finalisées.',
        notice: 'Tant qu’un fichier de licence n’est pas publié dans le dépôt, ne supposez pas de droits de réutilisation open source au-delà de la consultation normale du dépôt.',
        sections: [
          { title: 'Contenu de l’application', body: 'Le nom Subfolio, les textes d’interface, les icônes générées et les actifs produit font partie de l’identité Subfolio.' },
          { title: 'Code source', body: 'Une licence source formelle devrait être ajoutée lorsque le propriétaire du projet décide comment l’application peut être réutilisée, copiée ou redistribuée.' },
          { title: 'Logiciels tiers', body: 'Subfolio dépend de paquets tiers comme Vue, Vite, PrimeVue, Firebase et PocketBase, chacun sous sa propre licence.' }
        ]
      }
    },
    footer: {
      tagline: 'Finance d’abonnements orientée vers l’avenir, connectée à une base de données que vous contrôlez.'
    },
    connect: {
      tagline: 'Finance d’abonnements intelligente, connectée à la source que vous choisissez.',
      account: 'Compte',
      byodb: 'Apportez votre base de données',
      signInTitle: 'Se connecter à Subfolio',
      signInBody: 'Utilisez un compte Subfolio standard lorsque les comptes hébergés seront disponibles.',
      email: 'Courriel',
      password: 'Mot de passe',
      emailPlaceholder: 'vous@exemple.com',
      signIn: 'Se connecter',
      accountUnavailable: 'La connexion par compte n’est pas encore branchée. Utilisez l’onglet BYODB pour exécuter Subfolio avec votre propre base de données aujourd’hui.',
      byodbBody: 'Connectez Subfolio à une base de données temps réel que vous contrôlez. Les détails de connexion restent dans ce navigateur.',
      provider: 'Fournisseur',
      chooseProvider: 'Choisir un fournisseur',
      databaseUrl: 'URL de la base de données',
      apiKey: 'Clé API',
      projectId: 'ID de projet',
      appId: 'ID d’app',
      authDomain: 'Domaine d’authentification',
      dataPath: 'Chemin des données',
      pocketbaseUrl: 'URL PocketBase',
      collection: 'Collection',
      returnOverview: 'Retour à l’aperçu',
      connectDatabase: 'Connecter la base'
    }
  }
}

const languageOptions = computed(() => [
  { value: 'en', label: messages[locale.value].common.english },
  { value: 'fr', label: messages[locale.value].common.french }
])

const resolveMessage = (path, selectedLocale = locale.value) => {
  const parts = path.split('.')
  let value = messages[selectedLocale]
  for (const part of parts) value = value?.[part]
  if (value !== undefined) return value

  value = messages.en
  for (const part of parts) value = value?.[part]
  return value
}

const interpolate = (value, params = {}) =>
  value.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`)

const t = (path, params = {}) => {
  const value = resolveMessage(path)
  return typeof value === 'string' ? interpolate(value, params) : path
}

const tm = (path) => resolveMessage(path)

const setLocale = (value) => {
  if (!supportedLocales.includes(value)) return
  locale.value = value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, value)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = value
  }
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value
}

export function useI18n() {
  return {
    locale,
    supportedLocales,
    languageOptions,
    t,
    tm,
    setLocale
  }
}
