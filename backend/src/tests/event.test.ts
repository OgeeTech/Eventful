import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';

// 👇 MOCK REDIS: This prevents the "ClientClosedError"
jest.mock('../config/redis', () => ({
    redisClient: {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        connect: jest.fn(),
        isOpen: true
    },
    connectRedis: jest.fn()
}));

// Test User Data
const creatorUser = {
    name: "Event Creator",
    email: "creator@example.com",
    password: "password123",
    role: "creator"
};

let creatorToken = "";

describe("📅 Event Tests", () => {

    // 1. Setup Test DB
    beforeAll(async () => {
        const testMongoUri = 'mongodb://localhost:27017/eventful_test_events_db';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testMongoUri);
        }

        // Register & Login to get a Token
        await request(app).post('/api/auth/register').send(creatorUser);
        const res = await request(app).post('/api/auth/login').send({
            email: creatorUser.email,
            password: creatorUser.password
        });
        creatorToken = res.body.token;
    });

    // 2. Cleanup after tests
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    // TEST 1: Create Event
    it("should create a new event (Authenticated)", async () => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${creatorToken}`)
            .send({
                title: "Test Concert",
                description: "Live music",
                date: "2025-12-25",
                price: 5000,
                location: "Lagos",
                capacity: 100
            });

        // 🟢 DEBUG: If this fails, print the error
        if (res.statusCode !== 201) {
            console.error("Test Failed Response:", res.body);
        }

        expect(res.statusCode).toEqual(201);
        expect(res.body.event).toHaveProperty("title", "Test Concert");
    });

    // TEST 2: Create Event (Unauthenticated)
    it("should fail to create event without login", async () => {
        const res = await request(app)
            .post('/api/events')
            .send({
                title: "Hack Attempt",
                date: "2025-12-25",
                price: 0
            });

        expect(res.statusCode).toEqual(401);
    });
});