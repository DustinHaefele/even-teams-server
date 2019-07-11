const AuthServices = require('../auth/auth-service');


function requireAuth(req, res, next) {
  
  const authToken = req.get('Authorization') || '';
  let token;

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  } else{
    token = authToken.slice(7, authToken.length);
  } 

  try {
    const decoded = AuthServices.verifyJwt(token);
    
    AuthServices.getUserWithUserName(req.app.get('db'), decoded.sub)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized request' });
        }
        req.user = user;
        next();
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        next(err);
      });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = {
  requireAuth
};
