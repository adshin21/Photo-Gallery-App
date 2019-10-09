const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let decode = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decode;
        req.login = true;
    } catch {
        req.login = false;
    }
    next();
};