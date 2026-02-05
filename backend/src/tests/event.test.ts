import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';

let creatorToken = "";

describe("📅 Event Tests", () => {

    beforeAll(async () => {
        // FIX: Force a specific Test DB URL so we don't accidentally wipe the real one
        const testMongoUri = 'mongodb://localhost:27017/eventful_test_db';

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testMongoUri);
        }

        // 1. Create a User & Login to get Token
        await request(app).post('/api/auth/register').send({
            name: "Creator Test",
            email: "creator@test.com",
            password: "password123",
            role: "creator"
        });

        const loginRes = await request(app).post('/api/auth/login').send({
            email: "creator@test.com",
            password: "password123"
        });

        creatorToken = loginRes.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase(); // Now safely wipes 'eventful_test_db' only
        await mongoose.connection.close();
    });

    // TEST: Create Event
    it("should create a new event (Authenticated)", async () => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${creatorToken}`) // 👈 Send Token
            .send({
                title: "Test Concert",
                description: "Testing with Jest",
                date: "2025-12-25",
                location: "Abuja",
                price: 5000,
                capacity: 100
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.event).toHaveProperty("title", "Test Concert");
    });

    // TEST: Fail Create (No Token)
    it("should fail to create event without login", async () => {
        const res = await request(app).post('/api/events').send({
            title: "Hacker Event",
            date: "2025-12-25"
        });

        expect(res.statusCode).toEqual(401); // Unauthorized
    });
});