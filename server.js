const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 5500;

app.use(session({
    secret: 'secret key',
    resave: false, // Виправлено тут
    saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true })); // Використовуйте express.urlencoded()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/setup-2fa', (req, res) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    req.session.secret = secret.base32;

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        res.json({ qrCodeUrl: data_url });
    });
});

app.post('/verify-otp', (req, res) => {
    const { token } = req.body;
    const verifid = speakeasy.totp.verify({
        secret: req.session.secret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (verifid) {
        res.send("Аутентифікація пройшла успішно!");
    } else {
        res.send("Невірний OTP");
    }
})

app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
