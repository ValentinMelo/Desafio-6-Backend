import express from 'express';
import passport from 'passport';
import User from '../models/user.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    req.login(user, (err) => {
      if (err) {
        console.error(`Error al iniciar sesión: ${err}`);
        return res.status(500).send('Error al iniciar sesión');
      }
      res.redirect('/');
    });
  } catch (error) {
    req.flash('error', 'Error al registrar usuario');
    res.redirect('/auth/register');
  }
});

router.get('/github', passport.authenticate('github'));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);


export default router;
