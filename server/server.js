require('dotenv').config(); // Подключаем dotenv
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const {join} = require("node:path");

const app = express();


const clientPath = join(__dirname, '../client');

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Читаем переменные окружения
const PORT = process.env.PORT || 3000;
const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    SECRET_KEY
} = process.env;

// Подключение к PostgreSQL
/*const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});*/

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // используйте переменную окружения
    ssl: {
        rejectUnauthorized: false
    }
});

// Настройка middleware
app.use(cors());
app.use(express.json());
app.use(express.static(clientPath));
app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
}));

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Пожалуйста, укажите логин и пароль' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
            [username, hashedPassword, email]
        );

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Пожалуйста, укажите логин и пароль' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Неверный логин или пароль' });
        }

        const user = userResult.rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ message: 'Неверный логин или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Успешный вход', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
});

// Защищённый маршрут
app.get('/api/protected', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Неверный или просроченный токен' });
        }

        res.json({ message: 'Доступ разрешён', user: decoded });
    });
});

// API для услуг
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});
// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
