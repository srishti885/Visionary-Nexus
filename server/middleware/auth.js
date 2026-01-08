const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // 1. Frontend se token 'headers' mein aayega
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token, login required" });
    }

    // 2. Token ko verify karna
    const isCustomAuth = token.length < 500; // JWT check
    let decodedData;

    if (token && isCustomAuth) {      
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
      // 3. User ki ID request mein save karna taaki aage use ho sake
      req.userId = decodedData?.id;
    }

    // 4. Sab sahi hai, toh agle function par jao
    next();
  } catch (error) {
    console.log("Auth Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;