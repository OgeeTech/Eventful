import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';

// 1. Data we will use for testing
const testUser = {
    name: "Test Student",
    email: "test_student@example.com",
    password: "password123",
    role: "attendee"
};

describe("🔐 Authentication Tests", () => {

    // Cleanup: Connect to a SPECIFIC TEST DB before tests
    beforeAll(async () => {
        // FIX: Hardcode the test DB URL so we don't wipe the real DB
        const testMongoUri = 'mongodb://localhost:27017/eventful_test_db';

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testMongoUri);
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase(); // Cleans up 'eventful_test_db' only
        await mongoose.connection.close();
    });

    // TEST 1: Register
    it("should register a new user", async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);

        expect(res.statusCode).toEqual(201);
        // UPDATED: Changed string to match your backend response
        expect(res.body).toHaveProperty("message", "User created successfully");
    });

    // TEST 2: Login
    it("should login the user and return a token", async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("name", "Test Student");
    });

    // TEST 3: Fail Login (Wrong Password)
    it("should fail with wrong password", async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: "wrongpassword"
        });

        expect(res.statusCode).toEqual(400);
    });
});