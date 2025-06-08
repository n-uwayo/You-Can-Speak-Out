// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");

// // Middleware to verify token
// function authMiddleware(req, res, next) {
//     const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;

//     if (!token) return res.status(401).json({ message: "No token provided" });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(401).json({ message: "Invalid token" });
//     }
// }

// router.get("/", authMiddleware, (req, res) => {
//     const role = req.user.role;

//     if (role === "admin") {
//         return res.json({ message: "Welcome Admin! Manage users and content here." });
//     } else if (role === "facilitator") {
//         return res.json({ message: "Welcome Facilitator! Upload tutorials and manage sessions here." });
//     } else if (role === "student") {
//         return res.json({ message: "Welcome Student! Here are your tasks and progress." });
//     } else {
//         return res.status(403).json({ message: "Access denied" });
//     }
// });

// module.exports = router;