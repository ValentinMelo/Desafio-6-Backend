import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.status(401).send('Credenciales incorrectas');
  }

  req.session.user = user;
  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error al registrar usuario');
  }
});

export default router;
