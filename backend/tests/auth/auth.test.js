/**
 * Auth Tests
 * Tests for POST /api/auth/register, POST /api/auth/login, and auth middleware
 */

require('dotenv').config();
process.env.JWT_SECRET = 'test_jwt_secret_for_tests';

const request = require('supertest');
const { createTestDb, createTestApp, resetDb } = require('../setup');

let db;
let app;

beforeAll(() => {
    db = createTestDb();
    app = createTestApp(db);
});

beforeEach(() => {
    resetDb(db);
});

afterAll(() => {
    db.close();
});

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
describe('POST /api/auth/register', () => {
    test('201 — registro exitoso devuelve usuario sin password_hash', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'newuser', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username', 'newuser');
        expect(res.body).toHaveProperty('role', 'admin');
        expect(res.body).not.toHaveProperty('password_hash');
    });

    test('409 — username duplicado', async () => {
        await request(app).post('/api/auth/register').send({ username: 'dupeuser', password: 'pass123' });
        const res = await request(app).post('/api/auth/register').send({ username: 'dupeuser', password: 'otherpass' });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already exists/i);
    });

    test('400 — sin username', async () => {
        const res = await request(app).post('/api/auth/register').send({ password: 'pass123' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 — sin password', async () => {
        const res = await request(app).post('/api/auth/register').send({ username: 'user1' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 — username demasiado corto', async () => {
        const res = await request(app).post('/api/auth/register').send({ username: 'ab', password: 'pass123' });
        expect(res.status).toBe(400);
    });

    test('400 — password demasiado corta', async () => {
        const res = await request(app).post('/api/auth/register').send({ username: 'validuser', password: '12' });
        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({ username: 'loginuser', password: 'mypassword' });
    });

    test('200 — login exitoso devuelve token y user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'loginuser', password: 'mypassword' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', 'loginuser');
        expect(res.body.user).not.toHaveProperty('password_hash');
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(20);
    });

    test('401 — password incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'loginuser', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('401 — usuario inexistente', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'nobody', password: 'somepass' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('400 — sin username', async () => {
        const res = await request(app).post('/api/auth/login').send({ password: 'pass' });
        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────────
// MIDDLEWARE — Rutas protegidas
// ─────────────────────────────────────────────
describe('Auth Middleware — rutas protegidas', () => {
    let token;

    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({ username: 'admin', password: 'adminpass' });
        const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'adminpass' });
        token = res.body.token;
    });

    test('GET /api/tools es público (sin token)', async () => {
        const res = await request(app).get('/api/tools');
        expect(res.status).toBe(200);
    });

    test('POST /api/tools sin token devuelve 401', async () => {
        const res = await request(app)
            .post('/api/tools')
            .send({ nombre: 'Test Tool' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/no token/i);
    });

    test('POST /api/tools con token válido funciona', async () => {
        const res = await request(app)
            .post('/api/tools')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Tool con auth', descripcion: 'Test', url: 'https://test.com' });

        expect(res.status).toBe(201);
        // La API envuelve la respuesta en { tool: { ... } }
        const tool = res.body.tool || res.body;
        expect(tool).toHaveProperty('nombre', 'Tool con auth');
    });

    test('DELETE /api/tools/:id con token inválido devuelve 403', async () => {
        const res = await request(app)
            .delete('/api/tools/999')
            .set('Authorization', 'Bearer tokeninvalido');

        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/invalid or expired/i);
    });

    test('PUT /api/tools/:id sin token devuelve 401', async () => {
        const res = await request(app)
            .put('/api/tools/1')
            .send({ nombre: 'Updated' });

        expect(res.status).toBe(401);
    });
});
