import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../users/user.model';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
        next(error);
    }
};

// ... imports

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Payload
            process.env.JWT_SECRET as string,     // Secret
            { expiresIn: '1h' }                   // Expiry
        );

        // 4. SEND RESPONSE (With Name!)
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,  // <--- CRITICAL: Make sure we send this!
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

