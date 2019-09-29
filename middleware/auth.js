const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {

    try {
        const decode = jwt.verify(req.body.token, process.env.JWT_KEY);
        const UserData = decode;
        next();
    } catch {
        return res.status(401).json({
            message: "Auth Failed"
        });
    }
}