	const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const session = require("express-session");

const app = express();
const db = new sqlite3.Database("database.db");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Обслуживание статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Инициализация базы данных (создание таблицы, если её нет)
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`
    );
});

// Маршрут для регистрации
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Проверяем, существует ли уже такой пользователь
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).send("Ошибка сервера");
        }
        if (user) {
            return res.status(400).send("Пользователь уже существует");
        }

        // Если такого пользователя нет, добавляем нового
        db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, password],
            (err) => {
                if (err) {
                    return res.status(500).send("Ошибка сервера");
                }
                console.log("Пользователь зарегистрирован:", username);
                res.send("Пользователь зарегистрирован!");
            }
        );
    });
});


// Маршрут для авторизации
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, user) => {
            if (err) {
                console.error("Ошибка при выполнении запроса:", err);
                return res.status(500).send("Ошибка сервера");
            }
            if (!user) {
                console.log("Пользователь не найден:", username);
                return res.status(400).send("Пользователь не найден");
            }

            if (user.password !== password) {
                console.log("Неверный пароль для пользователя:", username);
                return res.status(400).send("Неверный пароль");
            }

            console.log("Пользователь вошел:", username);
            req.session.userId = user.id;  // Сохраняем ID пользователя в сессии
            res.send("Успешный вход!");  // Отправляем успешное сообщение
        }
    );
});


// Страница каталога
app.get("/catalog", (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

// Маршрут для добавления товара в корзину
app.post("/cart/add", (req, res) => {
    const { productName, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send("Необходимо войти в систему");
    }

    db.run(
        "INSERT INTO cart (user_id, product_name, quantity) VALUES (?, ?, ?)",
        [userId, productName, quantity],
        (err) => {
            if (err) {
                console.error("Ошибка при добавлении товара в корзину:", err);
                return res.status(500).send("Ошибка сервера");
            }
            res.send("Товар добавлен в корзину");
        }
    );
});

// Страница корзины
app.get("/cart", (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect("/login"); // Если нет сессии, редиректим на страницу логина
    }

    // Если пользователь авторизован, показываем корзину
    db.all(
        "SELECT product_name, quantity FROM cart WHERE user_id = ?",
        [userId],
        (err, rows) => {
            if (err) {
                console.error("Ошибка при получении корзины:", err);
                return res.status(500).send("Ошибка сервера");
            }

            let cartHTML = `
                <h1>Ваша корзина</h1>
                <ul>`;
            rows.forEach(row => {
                cartHTML += `<li>${row.product_name} - ${row.quantity}</li>`;
            });
            cartHTML += `</ul>
                <form action="/cart/checkout" method="POST">
                    <button type="submit">Оформить заказ</button>
                </form>
            `;
            res.send(cartHTML);
        }
    );
});


// Маршрут для оформления заказа (очистки корзины)
app.post("/cart/checkout", (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send("Необходимо войти в систему");
    }

    db.run(
        "DELETE FROM cart WHERE user_id = ?",
        [userId],
        (err) => {
            if (err) {
                console.error("Ошибка при оформлении заказа:", err);
                return res.status(500).send("Ошибка сервера");
            }
            res.redirect("/catalog");
        }
    );
});

// Страница логина
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
