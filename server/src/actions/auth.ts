import * as bcrypt from 'bcrypt';
// const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
// const { Strategy: GitHubStrategy } = require('passport-github2');
// const fs = require('fs');
// const path = require('path');
// const url = require('url');
// const srs = require('secure-random-string');
// const https = require('https');
// const FormData = require('form-data');
import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import * as r from 'rethinkdb';
import { UserRecord } from '../db/types';
import { logger } from '../logger';

// TODO: finish session expiration (enforce and detect and renew)
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;

// function serializeProfile(profile) {
//   return {
//     id: profile._id,
//     fullname: profile.fullname,
//     username: profile.username,
//     verified: profile.verified,
//     photo: profile.photo,
//   };
// }

// Load the secret config vars from a local file in development. In production, we'll use
// environment vars (see below).
// function loadAuthConfig() {
//   const configPath = path.resolve(__dirname, '../../auth.config.json');
//   try {
//     if (fs.accessSync(configPath, fs.constants.R_OK) === undefined) {
//       return JSON.parse(fs.readFileSync(configPath, 'utf8'));
//     }
//   } catch (e) {
//     logger.info('No local auth config found:', e);
//   }
//   return {};
// }

export default function (apiRouter: express.Router, conn: r.Connection) {
  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: 'secret', // TODO: move to .env
  };
  // const config = Object.assign(loadAuthConfig(), process.env);

  // function makeCallbackUrl(req, pathname) {
  //   // logger.info('search:', req.search);
  //   const urlParams = {
  //     pathname,
  //     // search: req.search,
  //   };
  //   if (config.USE_HTTPS) {
  //     urlParams.protocol = 'https:';
  //   }
  //   if (config.HOST) {
  //     urlParams.host = config.HOST;
  //   }
  //   return url.format(urlParams);
  // }

  // Set up JWT strategy
  passport.use(new JwtStrategy(jwtOpts, (payload, done) => {
    done(null, { id: payload.username });
  }));

  // TODO: implement
  // Google OAuth2 login.
  // if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  //   passport.use(new GoogleStrategy({
  //     clientID: config.GOOGLE_CLIENT_ID,
  //     clientSecret: config.GOOGLE_CLIENT_SECRET,
  //     callbackURL: '/auth/google/callback',
  //   }, (accessToken, refreshToken, profile, done) => {
  //     const emails = profile.emails.map(em => em.value);
  //     users.findOne({ email: { $in: emails } }).then(user => {
  //       if (user) {
  //         // User with matching email in our database
  //         // TODO: update photo if they don't have one. (Do we want to remember where the photo
  //         // came from and auto-update if it's from the same source?)
  //         // logger.info('Found google user:', user.username);
  //         done(null, user);
  //       } else {
  //         // User not found, insert new user into the database.
  //         const accountEmail = profile.emails.filter(em => em.type === 'account');
  //         const primaryEmail = accountEmail.length > 0 ? accountEmail[0] : profile.emails[0];
  //         // Note that we don't have a username or password. We'll ask them for a username later.
  //         // In the mean time we'll use their email as their username.
  //         // TODO: test this
  //         users.insertOne({
  //           fullname: profile.displayName,
  //           email: primaryEmail.value,
  //           photo: profile.photos && profile.photos.length > 0 && profile.photos[0].value,
  //           photoSource: 'google', // Remember photo came from Google.
  //           projects: [],
  //           organizations: [],
  //           verified: true,
  //         }).then(u => {
  //           logger.info('Google user creation successful:', primaryEmail);
  //           done(null, u.ops[0]);
  //         }, reason => {
  //           logger.error('Google user creation error:', reason);
  //           done(null, false, { err: 'internal' });
  //         });
  //       }
  //     }, err => {
  //       logger.error('Google login error:', err);
  //       done(null, false, { err: 'internal' });
  //     });
  //   }));

  //   app.get('/auth/google', (req, res, next) => {
  //     passport.authenticate('google', {
  //       scope: ['openid', 'email', 'profile'],
  //       callbackURL: makeCallbackUrl(req, '/auth/google/callback'),
  //     })(req, res, next);
  //   });
  //
  //   app.get('/auth/google/callback',
  //     (req, res, next) => {
  //       passport.authenticate('google', {
  //         failureRedirect: '/login',
  //         callbackURL: makeCallbackUrl(req, '/auth/google/callback'),
  //       })(req, res, next);
  //     },
  //     (req, res) => {
  //       res.redirect('/');
  //     });
  // }

  // Github OAuth2 login.
  // if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) {
  //   passport.use(new GitHubStrategy({
  //     clientID: config.GITHUB_CLIENT_ID,
  //     clientSecret: config.GITHUB_CLIENT_SECRET,
  //     callbackURL: '/auth/github/callback',
  //   }, (accessToken, refreshToken, profile, done) => {
  //     const emails = profile.emails.map(em => em.value);
  //     users.findOne({ email: { $in: emails } }).then(user => {
  //       if (user) {
  //         // User with matching email in our database
  //         // TODO: update photo if they don't have one. (Do we want to remember where the photo
  //         // came from and auto-update if it's from the same source?)
  //         logger.info('Found github user:', user);
  //         done(null, user);
  //       } else {
  //         // User not found, insert new user into the database.
  //         logger.info('No user found with emails:', emails);
  //         logger.info('User not found, attempting to create a user with email:', emails[0]);
  //         // Note that we don't have a username or password. We'll ask them for a username later.
  //         // In the mean time we'll use their email as their username.
  //         users.insertOne({
  //           // TODO: test this
  //           // profile.username
  //           fullname: profile.displayName,
  //           loginUsername: profile.username, // Save so that we can suggest a unique user name
  //           email: emails[0],
  //           photo: profile._json && profile._json.avatar_url,
  //           photoSource: 'github', // Remember photo came from Github.
  //           projects: [],
  //           organizations: [],
  //           verified: true,
  //         }).then(u => {
  //           logger.info('Github user creation successful:', emails[0]);
  //           done(null, u.ops[0]);
  //         }, reason => {
  //           logger.error('Github user creation error:', reason);
  //           done(null, false, { err: 'internal' });
  //         });
  //       }
  //     }, err => {
  //       logger.error('Github login error:', err);
  //       done(null, false, { err: 'internal' });
  //     });
  //   }));
  //
  //   app.get('/auth/github', (req, res, next) => {
  //     // console.log('query:', req.query, req.protocol, req.hostname);
  //     passport.authenticate('github', {
  //       scope: ['openid', 'email', 'profile'],
  //       callbackURL: makeCallbackUrl(req, '/auth/github/callback'),
  //     })(req, res, next);
  //   });
  //
  //   app.get('/auth/github/callback',
  //     (req, res, next) => {
  //       passport.authenticate('github', {
  //         failureRedirect: '/login',
  //         callbackURL: makeCallbackUrl(req, '/auth/github/callback'),
  //       })(req, res, next);
  //     },
  //     (req, res) => {
  //       // console.log('req:', req.query);
  //       res.redirect('/');
  //     });
  // }

  // passport.serializeUser((user: UserRecord, cb) => {
  //   cb(null, user.id);
  // });
  //
  // passport.deserializeUser((id: string, cb) => {
  //   r.table('users').get(id).run(conn).then((user: any) => {
  //     cb(null, { password: null, ...user });
  //   }, err => {
  //     logger.error('deserializeUser.error:', err);
  //     cb(err);
  //   });
  // });

  // Login Handler
  apiRouter.post('/login', (req, res) => {
    const { username, password } = req.body;
    r.table('users').get(username).run(conn).then((user: any) => {
      if (!user) {
        res.status(401).json({ err: 'unknown-user' });
      } else {
        // Compare user password hash with password.
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            logger.info('Login successful:', username, user);
            const expires = new Date(Date.now() + TOKEN_EXPIRATION);
            const token = jwt.encode({ username: user.id, expires }, jwtOpts.secretOrKey);
            res.json({ token, expires });
          } else if (err) {
            logger.error('User login error:', err);
            res.status(500).json({ err: 'internal' });
          } else {
            res.status(401).json({ err: 'incorrect-password' });
          }
        });
      }
    }, (err: any) => {
      logger.error('users.findOne:', username, err);
      return res.status(500).json({ err: 'internal' });
    });
  });

  // Resume an existing session.
  apiRouter.post('/resume', passport.authenticate('jwt', { session: false }), (req, res) => {
    const expires = new Date(Date.now() + TOKEN_EXPIRATION);
    const token = jwt.encode({ username: req.user.username, expires }, jwtOpts.secretOrKey);
    res.json({ token, expires });
  });

  // Logout Handler
  apiRouter.post('/logout', (req, res) => {
    // TODO: call passport.authenticate
    // TODO: is this even meaningful?
    if (req.user) {
      req.logOut();
    }
    return res.send({});
  });

  // Signup handler
  apiRouter.post('/signup', (req, res) => {
    const { email, username, fullname, password, password2 } = req.body;
    // TODO: Validate email, username, fullname.
    if (email.length < 3) {
      res.send({ err: 'invalid-email' });
    } else if (username.length < 5) {
      res.send({ err: 'username-too-short' });
    } else if (username.toLowerCase() !== username) {
      res.send({ err: 'username-lower-case' });
    } else if (!username.match(/^[a-z][a-z0-9_\-]+$/)) {
      res.send({ err: 'username-invalid-chars' });
    } else if (password.length < 5) {
      res.send({ err: 'password-too-short' });
    } else if (password !== password2) {
      res.send({ err: 'password-match' });
    } else {
      // console.log('signup', username, fullname);
      r.table('users').get(username).run(conn).then((user: any) => {
        if (user) {
          // User name taken
          res.json({ err: 'user-exists' });
        } else {
          // Compute password hash
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              logger.error('Password hash error:', err);
              res.json({ err: 'internal' });
            } else {
              // console.log(user, fullname);
              const ur: UserRecord = {
                id: username,
                fullname,
                email,
                password: hash,
                photo: null,
                verified: false,
                organizations: [],
              };
              r.table('users').insert(ur).run(conn).then(u => {
                logger.info('User creation successful:', username);
                // console.log('insertion result:', u);
                return req.logIn(ur, () => {
                  const expires = new Date(Date.now() + TOKEN_EXPIRATION);
                  const token = jwt.encode({ username: ur.id, expires }, jwtOpts.secretOrKey);
                  res.json({ token, expires });
                });
              }, reason => {
                console.log('reason:', reason);
                res.json({ err: 'internal' });
              });
            }
          });
        }
      });
    }
  });

  // Signup handler
  // apiRouter.post('finishsignup', (req, res) => {
  //   const { username } = req.body;
  //   if (!req.user) {
  //     res.status(401).send({ err: 'unauthorized' });
  //   } else if (username.length < 5) {
  //     res.send({ err: 'username-too-short' });
  //   } else if (username.toLowerCase() !== username) {
  //     res.send({ err: 'username-lower-case' });
  //   } else {
  //     users.findOne({ username }).then(user => {
  //       if (user) {
  //         // User name taken
  //         res.json({ err: 'user-exists' });
  //       } else {
  //         // Update user with new user name.
  //         users.updateOne({ _id: req.user._id }, { $set: { username } }).then(() => {
  //           logger.info('User update successful:', username);
  //           return res.end();
  //         }, reason => {
  //           logger.error('User creation error:', reason);
  //           res.json({ err: 'internal' });
  //         });
  //       }
  //     });
  //   }
  // });

  // Recover password handler
  // apiRouter.post('recoverpw', (req, res) => {
  //   const { email } = req.body;
  //   if (email.length < 3) {
  //     res.send({ err: 'invalid-email' });
  //   } else {
  //     users.findOne({ email }).then(user => {
  //       if (!user) {
  //         // No user with that email address.
  //         res.status(401).send({ err: 'unauthorized' });
  //         return;
  //       }
  //
  //       const pwToken = srs();
  //
  //       users.updateOne({ _id: user._id }, { $set: { pwToken } }).then(() => {
  //         const pwUrl = `http://${config.HOST}/resetpw?token=${pwToken}&user=${user.username}`;
  //         const textBody = `
  //           There was recently a request to change the password for your account.
  //           Use this link to set a new password ${pwUrl}
  //           If you did not make this request, you can ignore this message and your password will
  //           remain the same.
  //         `;
  //
  //         const htmlBody = `
  // <section>
  //   <div>There was recently a request to change the password for your account.</div>
  //   <a href="${pwUrl}">Click here to set a new password.</a>
  //   <div>If you did not make this request, you can ignore this message and your password will
  //   remain the same.</div>
  // </section>
  //         `;
  //
  //         // Generate a token
  //         // HTML email
  //         const form = new FormData();
  //         form.append('from', 'Klendathu <klendathu@noreply.org>');
  //         form.append('to', email);
  //         form.append('subject', 'Klendathu Password Reset');
  //         form.append('text', textBody);
  //         form.append('html', htmlBody);
  //             // 'Someone has attempted to reset your password. Click to reset password');
  //         const request = https.request({
  //           host: 'api.mailgun.net',
  //           path: `/v3/${config.MAILGUN_DOMAIN}/messages`,
  //           auth: `api:${config.MAILGUN_API_KEY}`,
  //           headers: form.getHeaders(),
  //           method: 'POST',
  //         });
  //         form.pipe(request);
  //         request.on('response', r => {
  //           if (r.statusCode !== 200) {
  //             r.on('data', d => {
  //               logger.error(r.statusCode, JSON.parse(d).message);
  //             });
  //             res.json({ err: 'send-error' });
  //           } else {
  //             logger.info('Sent password recovery email to:', email);
  //             res.status(200).end();
  //           }
  //         });
  //       }, err => {
  //         logger.error(err);
  //         res.json({ err: 'send-error' });
  //       });
  //     });
  //   }
  // });

  // Reset password handler
  // apiRouter.post('resetpw', (req, res) => {
  //   const { password, password2, username, token } = req.body;
  //   // TODO: Validate password length.
  //   if (password.length < 5) {
  //     res.send({ err: 'password-too-short' });
  //   } else if (password !== password2) {
  //     res.send({ err: 'password-match' });
  //   } else {
  //     users.findOne({ username }).then(user => {
  //       if (!user) {
  //         // No user with that username.
  //         res.status(401).send({ err: 'unauthorized' });
  //         return;
  //       } else if (user.pwToken !== token) {
  //         // Token expired
  //         res.status(401).send({ err: 'unauthorized' });
  //         return;
  //       }
  //
  //       // Compute password hash
  //       bcrypt.hash(password, 10, (err, hash) => {
  //         if (err) {
  //           logger.error('Password hash error:', err);
  //           res.json({ err: 'internal' });
  //         } else {
  //           // Insert new user into the database.
  //           users.updateOne({ username }, {
  //             $set: { password: hash },
  //             $reset: { pwToken: '' },
  //           }).then(() => {
  //             logger.info('Password change successful:', username);
  //             return req.logIn(user, () => {
  //               return res.end();
  //             });
  //           }, reason => {
  //             logger.error('Password change error:', reason);
  //             res.json({ err: 'internal' });
  //           });
  //         }
  //       });
  //     });
  //   }
  // });
}
