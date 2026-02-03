src/
├── common/
│   ├── cache/
│   │   └── ❌ redis.cache.ts           (Pending: For Phase 4)
│   ├── middlewares/
│   │   ├── ✅ auth.middleware.ts       (Done: Protects routes)
│   │   ├── ❌ error.middleware.ts      (Pending: For Phase 2)
│   │   └── ❌ rate-limit.middleware.ts (Pending: For Phase 2)
│   └── utils/
│       ├── ✅ jwt.ts                   (Done: Token generation)
│       ├── ✅ qrcode.ts                (Done: Image generation)
│       └── ❌ logger.ts                (Pending: For Phase 2)
│
├── config/
│   ├── ✅ db.ts                        (Done: MongoDB connection)
│   ├── ✅ env.ts                       (Done: Environment validation)
│   ├── ✅ paystack.ts                  (Done: Payment gateway setup)
│   └── ❌ redis.ts                     (Pending: Connection to Redis)
│
├── modules/
│   ├── analytics/
│   │   ├── ❌ analytics.controller.ts  (Pending: Phase 7)
│   │   └── ❌ analytics.routes.ts      (Pending: Phase 7)
│   │
│   ├── auth/
│   │   ├── ✅ auth.controller.ts       (Done: Login/Register logic)
│   │   ├── ✅ auth.routes.ts           (Done: API endpoints)
│   │   └── ⚠️ auth.service.ts          (Technically logic is in Controller, might need refactor for strict exam compliance)
│   │
│   ├── events/
│   │   ├── ✅ event.controller.ts      (Done: CRUD operations)
│   │   ├── ✅ event.model.ts           (Done: Database Schema)
│   │   ├── ✅ event.routes.ts          (Done: API endpoints)
│   │   └── ❌ event.service.ts         (Pending: Caching & Notification injection)
│   │
│   ├── notifications/
│   │   ├── ❌ notification.service.ts  (Pending: Phase 6)
│   │   └── ❌ reminder.job.ts          (Pending: BullMQ Worker)
│   │
│   ├── payments/
│   │   ├── ✅ payment.controller.ts    (Done: Init & Verify logic)
│   │   ├── ✅ payment.routes.ts        (Done: API endpoints)
│   │   └── ⚠️ payment.service.ts       (Logic currently in Controller. Exam might require a separate file)
│   │
│   ├── tickets/
│   │   ├── ✅ ticket.controller.ts     (Done: Validation logic)
│   │   ├── ✅ ticket.model.ts          (Done: Database Schema)
│   │   └── ✅ ticket.routes.ts         (Done: API endpoints)
│   │
│   └── users/
│       └── ✅ user.model.ts            (Done: Database Schema)
│
├── ✅ app.ts                           (Done: Express Setup)
└── ✅ server.ts                        (Done: Server Entry Point)


<!-- front end -->
frontend/
├── assets/
│   ├── js/
│   │   ├── ❌ api.js                   (Pending: Refactor fetch calls here)
│   │   ├── ❌ auth.js                  (Pending: Refactor login logic here)
│   │   ├── ❌ events.js                (Pending: Refactor event loading here)
│   │   └── ❌ payments.js              (Pending: Refactor payment logic here)
│   │   (Note: Currently, we wrote JS inside <script> tags in HTML files.
│        For the exam, we must move them to these external files.)
│
├── ✅ index.html                       (Done: Event Gallery)
├── ✅ signin.html                      (Done: Login Page)
├── ✅ register.html                    (Done: Signup Page)
├── ✅ success.html                     (Done: Payment Success & QR)
├── ✅ dashboard.html                   (Done: Creator Dashboard)
├── ✅ scan.html                        (Done: Ticket Validator)
└── ❌ analytics.html                   (Pending: For Phase 7)



<!-- root -->
├── ✅ .env                             (Done)
├── ✅ package.json                     (Done)
├── ✅ tsconfig.json                    (Done)
├── ❌ openapi.yaml                     (Pending: Documentation)
├── ❌ README.md                        (Pending: Documentation)
└── tests/
    └── ❌ auth.test.ts                 (Pending: Jest Tests)