<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-8 pb-16 lg:px-8">
    <!-- Header -->
    <header class="flex flex-col items-start justify-between gap-6 py-3 sm:flex-row sm:items-center">
      <div class="flex items-center gap-3">
        <span
          class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-teal-400 text-xl font-semibold text-white shadow-lg shadow-accent/25"
        >
          S
        </span>
        <div>
          <p class="text-lg font-semibold text-ink">Subfolio</p>
          <p class="text-sm text-muted">Smart subscription finance</p>
        </div>
      </div>
      <nav class="flex flex-wrap gap-5 text-sm text-muted">
        <a href="#" class="border-b-2 border-transparent pb-1 transition hover:border-accent hover:text-ink">
          Overview
        </a>
        <a href="#" class="border-b-2 border-transparent pb-1 transition hover:border-accent hover:text-ink">
          Forecasting
        </a>
        <a href="#" class="border-b-2 border-transparent pb-1 transition hover:border-accent hover:text-ink">
          Security
        </a>
        <a href="#" class="border-b-2 border-transparent pb-1 transition hover:border-accent hover:text-ink">
          Pricing
        </a>
      </nav>
      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <RouterLink
          to="/login"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2.5 text-ink transition hover:border-accent hover:bg-white"
        >
          Sign in
        </RouterLink>
        <RouterLink
          to="/app"
          class="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
        >
          Get started
        </RouterLink>
      </div>
    </header>

    <main class="flex flex-col gap-20">
      <!-- Hero Section -->
      <section class="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Forecasting for modern money
          </p>
          <h1 class="mb-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Know your subscriptions today and your balance tomorrow.
          </h1>
          <p class="mb-6 text-lg text-muted">
            Subfolio is a smart, forward-looking finance app that helps you track subscriptions,
            predict expenses and income, and clearly understand where your money goes over time.
          </p>
          <div class="mb-8 flex flex-wrap gap-3">
            <RouterLink
              to="/app"
              class="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
            >
              Create your dashboard
            </RouterLink>
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2.5 text-ink transition hover:border-accent hover:bg-white"
            >
              See the demo
            </RouterLink>
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p class="text-xl font-semibold text-ink">$3,420</p>
              <p class="text-sm text-muted">Projected month-end balance</p>
            </div>
            <div>
              <p class="text-xl font-semibold text-ink">18</p>
              <p class="text-sm text-muted">Active subscriptions tracked</p>
            </div>
            <div>
              <p class="text-xl font-semibold text-ink">+12%</p>
              <p class="text-sm text-muted">Income trend over 90 days</p>
            </div>
          </div>
        </div>
        <div class="grid gap-5">
          <div class="rounded-3xl border border-border-strong bg-white p-6 shadow-card">
            <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Upcoming renewals
            </p>
            <div class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3">
              <div>
                <p class="font-semibold text-ink">Streamline Pro</p>
                <p class="text-sm text-muted">Renews in 3 days</p>
              </div>
              <span class="font-semibold text-accent-dark">$32</span>
              <div>
                <p class="font-semibold text-ink">Cloud Ledger</p>
                <p class="text-sm text-muted">Renews in 9 days</p>
              </div>
              <span class="font-semibold text-accent-dark">$18</span>
              <div>
                <p class="font-semibold text-ink">Pulse Gym</p>
                <p class="text-sm text-muted">Renews in 12 days</p>
              </div>
              <span class="font-semibold text-accent-dark">$64</span>
            </div>
          </div>
          <div
            class="rounded-3xl border border-sun/40 bg-gradient-to-br from-amber-50 to-white p-6 shadow-card"
          >
            <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Cash flow outlook
            </p>
            <p class="mb-4 font-semibold text-ink">Your next 30 days are looking steady.</p>
            <div class="mb-3 h-2.5 overflow-hidden rounded-full bg-accent/15">
              <div class="h-full w-[72%] rounded-full bg-gradient-to-r from-accent to-teal-400"></div>
            </div>
            <div class="flex justify-between text-sm text-muted">
              <span>Expenses: $1,240</span>
              <span>Income: $2,560</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Insight Section -->
      <section class="grid gap-8">
        <div class="max-w-xl">
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Clarity in motion
          </p>
          <h2 class="mb-2 font-serif text-3xl text-ink">See patterns, not just transactions.</h2>
          <p class="text-muted">
            Subfolio layers subscription schedules, recurring bills, and paycheck timing into a
            single view so you can plan with confidence.
          </p>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-3xl border border-border-strong bg-white p-7 shadow-card">
            <h3 class="mb-2 font-serif text-xl text-ink">Momentum forecast</h3>
            <p class="text-muted">
              Follow daily net flow and see when your balance is set to rise or dip.
            </p>
            <ul class="mt-4 grid gap-2.5 text-sm text-muted">
              <li class="before:mr-2 before:text-accent before:content-['•']">
                Daily balance projection
              </li>
              <li class="before:mr-2 before:text-accent before:content-['•']">Alerts before dips</li>
              <li class="before:mr-2 before:text-accent before:content-['•']">Salary and gig sync</li>
            </ul>
          </div>
          <div
            class="grid gap-4 rounded-3xl border border-border bg-gradient-to-br from-white to-surface p-7 shadow-card"
          >
            <div>
              <p class="font-semibold text-ink">Forecast snapshot</p>
              <p class="text-sm text-muted">Next 14 days</p>
            </div>
            <div class="grid h-28 grid-cols-5 items-end gap-2">
              <span class="h-[55%] rounded-lg bg-gradient-to-t from-accent/30 to-accent"></span>
              <span class="h-[80%] rounded-lg bg-gradient-to-t from-accent/30 to-accent"></span>
              <span class="h-[65%] rounded-lg bg-gradient-to-t from-accent/30 to-accent"></span>
              <span class="h-[92%] rounded-lg bg-gradient-to-t from-accent/30 to-accent"></span>
              <span class="h-[70%] rounded-lg bg-gradient-to-t from-accent/30 to-accent"></span>
            </div>
            <p class="text-sm text-muted">Balance stays above your comfort floor all month.</p>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="grid gap-8">
        <div class="max-w-xl">
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Built for calm
          </p>
          <h2 class="font-serif text-3xl text-ink">
            Everything you need to run your financial life.
          </h2>
        </div>
        <div class="grid gap-6 sm:grid-cols-2">
          <article class="rounded-2xl border border-border-strong bg-white p-6">
            <h3 class="font-serif text-lg text-ink">Subscription intelligence</h3>
            <p class="mt-2 text-muted">
              Spot duplicate services, paused trials, and price increases instantly.
            </p>
          </article>
          <article class="rounded-2xl border border-border-strong bg-white p-6">
            <h3 class="font-serif text-lg text-ink">Income pulse</h3>
            <p class="mt-2 text-muted">
              Track multiple income streams and see the impact of each deposit.
            </p>
          </article>
          <article class="rounded-2xl border border-border-strong bg-white p-6">
            <h3 class="font-serif text-lg text-ink">Expense predictions</h3>
            <p class="mt-2 text-muted">
              Subfolio learns your cadence to predict upcoming spending with precision.
            </p>
          </article>
          <article class="rounded-2xl border border-border-strong bg-white p-6">
            <h3 class="font-serif text-lg text-ink">Action-ready insights</h3>
            <p class="mt-2 text-muted">
              Smart nudges help you cut costs, pause subscriptions, and rebalance.
            </p>
          </article>
        </div>
      </section>

      <!-- Expenses Section -->
      <section class="grid gap-8">
        <div class="max-w-xl">
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Expense hub
          </p>
          <h2 class="mb-2 font-serif text-3xl text-ink">
            Log expenses and review them by month or year.
          </h2>
          <p class="text-muted">
            Capture recurring costs and one-off purchases, then keep everything organized in a
            single ledger.
          </p>
        </div>
        <div class="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <form class="grid gap-4 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
            <div>
              <label for="expense-name" class="mb-1.5 block text-sm text-muted">Expense name</label>
              <input
                id="expense-name"
                type="text"
                placeholder="Streaming service"
                class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label for="expense-category" class="mb-1.5 block text-sm text-muted">Category</label>
              <select
                id="expense-category"
                class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink focus:border-accent focus:outline-none"
              >
                <option>Subscriptions</option>
                <option>Utilities</option>
                <option>Groceries</option>
                <option>Housing</option>
              </select>
            </div>
            <div>
              <label for="expense-amount" class="mb-1.5 block text-sm text-muted">Amount</label>
              <input
                id="expense-amount"
                type="number"
                placeholder="42.00"
                class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label for="expense-frequency" class="mb-1.5 block text-sm text-muted">
                Frequency
              </label>
              <select
                id="expense-frequency"
                class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink focus:border-accent focus:outline-none"
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label for="expense-date" class="mb-1.5 block text-sm text-muted">Next due</label>
              <input
                id="expense-date"
                type="date"
                class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <button
              type="button"
              class="mt-1 w-fit inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
            >
              Add expense
            </button>
          </form>
          <div class="grid gap-5 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
            <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p class="text-lg font-semibold text-ink">Expense ledger</p>
                <p class="text-sm text-muted">March 2026 overview</p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm text-ink transition hover:border-accent hover:bg-white"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  class="rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm text-ink transition hover:border-accent hover:bg-white"
                >
                  Yearly
                </button>
              </div>
            </div>
            <div class="grid gap-3">
              <div
                class="hidden grid-cols-5 items-center gap-3 px-1.5 pb-1 text-xs uppercase tracking-wide text-muted sm:grid"
              >
                <span>Expense</span>
                <span>Category</span>
                <span>Frequency</span>
                <span>Next due</span>
                <span class="text-right">Amount</span>
              </div>
              <div
                class="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-5"
              >
                <span class="font-medium text-ink">Streamline Pro</span>
                <span class="text-muted">Subscriptions</span>
                <span class="text-muted">Monthly</span>
                <span class="text-muted">Mar 18</span>
                <span class="font-semibold text-accent-dark sm:text-right">$32.00</span>
              </div>
              <div
                class="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-5"
              >
                <span class="font-medium text-ink">Metro Utilities</span>
                <span class="text-muted">Utilities</span>
                <span class="text-muted">Monthly</span>
                <span class="text-muted">Mar 21</span>
                <span class="font-semibold text-accent-dark sm:text-right">$118.00</span>
              </div>
              <div
                class="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-5"
              >
                <span class="font-medium text-ink">Pulse Gym</span>
                <span class="text-muted">Wellness</span>
                <span class="text-muted">Monthly</span>
                <span class="text-muted">Mar 26</span>
                <span class="font-semibold text-accent-dark sm:text-right">$64.00</span>
              </div>
              <div
                class="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-5"
              >
                <span class="font-medium text-ink">Home Insurance</span>
                <span class="text-muted">Housing</span>
                <span class="text-muted">Yearly</span>
                <span class="text-muted">Apr 02</span>
                <span class="font-semibold text-accent-dark sm:text-right">$420.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section
        class="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-accent/10 to-sun/20 p-9 sm:flex-row sm:items-center"
      >
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Ready for clarity?
          </p>
          <h2 class="mb-2 font-serif text-2xl text-ink">
            Build a subscription plan you can actually trust.
          </h2>
          <p class="text-muted">
            Connect your accounts, import subscriptions, and start forecasting today.
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/app"
            class="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
          >
            Start free
          </RouterLink>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2.5 text-ink transition hover:border-accent hover:bg-white"
          >
            Talk to us
          </RouterLink>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="flex flex-col justify-between gap-6 text-muted sm:flex-row">
      <div>
        <p class="font-semibold text-ink">Subfolio</p>
        <p class="text-sm">A smarter way to see your financial future.</p>
      </div>
      <div class="flex gap-4">
        <a href="#" class="transition hover:text-ink">Privacy</a>
        <a href="#" class="transition hover:text-ink">Security</a>
        <a href="#" class="transition hover:text-ink">Support</a>
      </div>
    </footer>
  </div>
</template>
