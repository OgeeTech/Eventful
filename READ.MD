eventful/
│
├── frontend/                      # CLIENT (HTML, CSS, JS)
│   │
│   ├── index.html                 # Landing page
│   ├── login.html                 # Login
│   ├── register.html              # Signup
│   │
│   ├── events/
│   │   ├── events.html            # All events (eventees)
│   │   ├── event-details.html     # Single event
│   │   ├── checkout.html          # Payment page
│   │   └── ticket.html            # Ticket + QR code
│   │
│   ├── creator/
│   │   ├── dashboard.html         # Creator dashboard
│   │   ├── create-event.html      # Create event
│   │   ├── my-events.html         # Creator events
│   │   ├── attendees.html         # Event attendees
│   │   ├── analytics.html         # Analytics
│   │   └── payments.html          # Payment records
│   │
│   ├── shared/
│   │   ├── navbar.html            # Navbar
│   │   ├── footer.html            # Footer
│   │   └── auth-guard.js          # Role protection
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── auth.css
│   │   │   ├── events.css
│   │   │   ├── dashboard.css
│   │   │   └── ticket.css
│   │   │
│   │   ├── js/
│   │   │   ├── api.js             # Fetch wrapper
│   │   │   ├── auth.js            # Login / register logic
│   │   │   ├── events.js          # Events logic
│   │   │   ├── payments.js        # Paystack frontend
│   │   │   ├── qr.js              # QR rendering
│   │   │   ├── notifications.js   # Reminder handling
│   │   │   └── analytics.js
│   │   │
│   │   └── images/
│   │       └── logo.png
│   │
│   └── README.md                  # Frontend guide
│
├── backend/                       # SERVER (Node.js + TS)
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Env config
│   │   │   ├── db.ts              # MongoDB connection
│   │   │   ├── redis.ts           # Redis setup
│   │   │   └── paystack.ts        # Paystack config
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.middleware.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── user.model.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── event.model.ts
│   │   │   │   ├── event.controller.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   └── event.routes.ts
│   │   │   │
│   │   │   ├── tickets/
│   │   │   │   ├── ticket.model.ts
│   │   │   │   ├── ticket.controller.ts
│   │   │   │   └── ticket.routes.ts
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── payment.model.ts
│   │   │   │   ├── payment.controller.ts
│   │   │   │   └── payment.routes.ts
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   └── analytics.routes.ts
│   │   │   │
│   │   │   └── notifications/
│   │   │       ├── reminder.job.ts
│   │   │       └── notification.service.ts
│   │   │
│   │   ├── common/
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── qrcode.ts
│   │   │   │   └── logger.ts
│   │   │   │
│   │   │   └── cache/
│   │   │       └── redis.cache.ts
│   │   │
│   │   ├── app.ts                 # Express app
│   │   └── server.ts              # Entry point
│   │
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── events.test.ts
│   │   └── payments.test.ts
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── .gitignore
└── README.md                      # Overall project doc
