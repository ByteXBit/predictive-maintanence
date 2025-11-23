import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import cookieParser from 'cookie-parser';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// User roles
type UserRole = 'OPERATOR' | 'MAINTENANCE' | 'MANAGER';

// In-memory user store (replace with database in production)
interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
}

const users: User[] = [
  {
    id: '1',
    email: 'operator@example.com',
    password: bcrypt.hashSync('Password123!', 10),
    role: 'OPERATOR',
  },
  {
    id: '2',
    email: 'maintenance@example.com',
    password: bcrypt.hashSync('Password123!', 10),
    role: 'MAINTENANCE',
  },
  {
    id: '3',
    email: 'manager@example.com',
    password: bcrypt.hashSync('Password123!', 10),
    role: 'MANAGER',
  },
];

// JWT Middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole };
}

const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Try to get token from cookie first, then from Authorization header
  const token =
    req.cookies?.token ||
    (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user as { id: string; email: string; role: UserRole };
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role = 'OPERATOR' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate role
    const validRoles: UserRole[] = ['OPERATOR', 'MAINTENANCE', 'MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      password: hashedPassword,
      role: role as UserRole,
    };

    users.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user,
  });
});

// Example protected data endpoint
app.get('/api/maintenance/data', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: 'Maintenance data',
    data: {
      equipment: [
        { id: 1, name: 'Machine A', status: 'operational', lastMaintenance: '2024-01-15' },
        { id: 2, name: 'Machine B', status: 'maintenance_required', lastMaintenance: '2024-01-10' },
      ],
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

