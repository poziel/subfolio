<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">S</span>
        <div>
          <p class="brand-name">Subfolio</p>
          <p class="brand-tagline">Smart subscription finance</p>
        </div>
      </div>
      <nav class="nav">
        <a href="#">Overview</a>
        <a href="#">Forecasting</a>
        <a href="#">Security</a>
        <a href="#">Pricing</a>
      </nav>
      <div class="nav-actions">
        <RouterLink class="ghost" to="/login">Sign in</RouterLink>
        <RouterLink class="primary" to="/app">Get started</RouterLink>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-content">
          <p class="eyebrow">Forecasting for modern money</p>
          <h1>Know your subscriptions today and your balance tomorrow.</h1>
          <p class="hero-copy">
            Subfolio is a smart, forward-looking finance app that helps you track
            subscriptions, predict expenses and income, and clearly understand where your money
            goes over time.
          </p>
          <div class="hero-actions">
            <RouterLink class="primary" to="/app">Create your dashboard</RouterLink>
            <RouterLink class="ghost" to="/login">See the demo</RouterLink>
          </div>
          <div class="hero-metrics">
            <div>
              <p class="metric-value">$3,420</p>
              <p class="metric-label">Projected month-end balance</p>
            </div>
            <div>
              <p class="metric-value">18</p>
              <p class="metric-label">Active subscriptions tracked</p>
            </div>
            <div>
              <p class="metric-value">+12%</p>
              <p class="metric-label">Income trend over 90 days</p>
            </div>
          </div>
        </div>
        <div class="hero-panel">
          <div class="panel-card">
            <p class="panel-label">Upcoming renewals</p>
            <div class="panel-list">
              <div>
                <p class="panel-title">Streamline Pro</p>
                <p class="panel-sub">Renews in 3 days</p>
              </div>
              <span class="panel-amount">$32</span>
              <div>
                <p class="panel-title">Cloud Ledger</p>
                <p class="panel-sub">Renews in 9 days</p>
              </div>
              <span class="panel-amount">$18</span>
              <div>
                <p class="panel-title">Pulse Gym</p>
                <p class="panel-sub">Renews in 12 days</p>
              </div>
              <span class="panel-amount">$64</span>
            </div>
          </div>
          <div class="panel-card accent">
            <p class="panel-label">Cash flow outlook</p>
            <p class="panel-highlight">Your next 30 days are looking steady.</p>
            <div class="panel-progress">
              <div class="panel-progress-bar"></div>
            </div>
            <div class="panel-meta">
              <span>Expenses: $1,240</span>
              <span>Income: $2,560</span>
            </div>
          </div>
        </div>
      </section>

      <section class="insight">
        <div class="section-header">
          <p class="section-eyebrow">Clarity in motion</p>
          <h2>See patterns, not just transactions.</h2>
          <p>
            Subfolio layers subscription schedules, recurring bills, and paycheck timing into a
            single view so you can plan with confidence.
          </p>
        </div>
        <div class="insight-grid">
          <div class="insight-card">
            <h3>Momentum forecast</h3>
            <p>Follow daily net flow and see when your balance is set to rise or dip.</p>
            <ul>
              <li>Daily balance projection</li>
              <li>Alerts before dips</li>
              <li>Salary and gig sync</li>
            </ul>
          </div>
          <div class="insight-card preview">
            <div>
              <p class="preview-title">Forecast snapshot</p>
              <p class="preview-sub">Next 14 days</p>
            </div>
            <div class="preview-chart">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p class="preview-note">Balance stays above your comfort floor all month.</p>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="section-header">
          <p class="section-eyebrow">Built for calm</p>
          <h2>Everything you need to run your financial life.</h2>
        </div>
        <div class="feature-grid">
          <article>
            <h3>Subscription intelligence</h3>
            <p>Spot duplicate services, paused trials, and price increases instantly.</p>
          </article>
          <article>
            <h3>Income pulse</h3>
            <p>Track multiple income streams and see the impact of each deposit.</p>
          </article>
          <article>
            <h3>Expense predictions</h3>
            <p>Subfolio learns your cadence to predict upcoming spending with precision.</p>
          </article>
          <article>
            <h3>Action-ready insights</h3>
            <p>Smart nudges help you cut costs, pause subscriptions, and rebalance.</p>
          </article>
        </div>
      </section>

      <section class="expenses">
        <div class="section-header">
          <p class="section-eyebrow">Expense hub</p>
          <h2>Log expenses and review them by month or year.</h2>
          <p>
            Capture recurring costs and one-off purchases, then keep everything organized in a
            single ledger.
          </p>
        </div>
        <div class="expenses-layout">
          <form class="expense-form">
            <div>
              <label for="expense-name">Expense name</label>
              <input id="expense-name" type="text" placeholder="Streaming service" />
            </div>
            <div>
              <label for="expense-category">Category</label>
              <select id="expense-category">
                <option>Subscriptions</option>
                <option>Utilities</option>
                <option>Groceries</option>
                <option>Housing</option>
              </select>
            </div>
            <div>
              <label for="expense-amount">Amount</label>
              <input id="expense-amount" type="number" placeholder="42.00" />
            </div>
            <div>
              <label for="expense-frequency">Frequency</label>
              <select id="expense-frequency">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label for="expense-date">Next due</label>
              <input id="expense-date" type="date" />
            </div>
            <button class="primary" type="button">Add expense</button>
          </form>
          <div class="expense-table">
            <div class="table-header">
              <div>
                <p class="table-title">Expense ledger</p>
                <p class="table-sub">March 2026 overview</p>
              </div>
              <div class="table-filters">
                <button class="ghost" type="button">Monthly</button>
                <button class="ghost" type="button">Yearly</button>
              </div>
            </div>
            <div class="table-grid">
              <div class="table-row table-head">
                <span>Expense</span>
                <span>Category</span>
                <span>Frequency</span>
                <span>Next due</span>
                <span class="amount">Amount</span>
              </div>
              <div class="table-row">
                <span>Streamline Pro</span>
                <span>Subscriptions</span>
                <span>Monthly</span>
                <span>Mar 18</span>
                <span class="amount">$32.00</span>
              </div>
              <div class="table-row">
                <span>Metro Utilities</span>
                <span>Utilities</span>
                <span>Monthly</span>
                <span>Mar 21</span>
                <span class="amount">$118.00</span>
              </div>
              <div class="table-row">
                <span>Pulse Gym</span>
                <span>Wellness</span>
                <span>Monthly</span>
                <span>Mar 26</span>
                <span class="amount">$64.00</span>
              </div>
              <div class="table-row">
                <span>Home Insurance</span>
                <span>Housing</span>
                <span>Yearly</span>
                <span>Apr 02</span>
                <span class="amount">$420.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta">
        <div>
          <p class="section-eyebrow">Ready for clarity?</p>
          <h2>Build a subscription plan you can actually trust.</h2>
          <p>Connect your accounts, import subscriptions, and start forecasting today.</p>
        </div>
        <div class="cta-actions">
          <RouterLink class="primary" to="/app">Start free</RouterLink>
          <RouterLink class="ghost" to="/login">Talk to us</RouterLink>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div>
        <p class="brand-name">Subfolio</p>
        <p class="footer-note">A smarter way to see your financial future.</p>
      </div>
      <div class="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Security</a>
        <a href="#">Support</a>
      </div>
    </footer>
  </div>
</template>
