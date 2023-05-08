import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import { Strategy as GitHubStrategy } from 'passport-github'
import dotenv from "dotenv";
dotenv.config();

const gitClientId = process.env.GITHUB_CLIENT_ID;
const gitClientSecret = process.env.GITHUB_CLIENT_SECRET;

export default function configurePassport(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  )
  
  passport.use(
    new GitHubStrategy({
      clientID: gitClientId,
      clientSecret: gitClientSecret,
      callbackURL: "http://localhost:8080/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ githubId: profile.id });
        if (!user) {
          const newUser = new User({
            githubId: profile.id,
            username: profile.username,
            email: profile._json.email
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );;

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
