// require("dotenv").config();
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://gen-ai-1-frontend-g7vo.onrender.com",
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
    if (err.stack) console.error(err.stack);

    const statusCode = err.status || err.statusCode || 500;
    
    // Mapping specific error codes to user-friendly messages if needed
    let errorMessage = err.message || "An unexpected error occurred on the server.";
    if (statusCode === 429) {
        errorMessage = "AI service quota exhausted. Please try again later.";
    } else if (statusCode === 503) {
        errorMessage = "AI service is currently overloaded. Please try again later.";
    }

    res.status(statusCode).json({
        success: false,
        error: err.name || "ServerError",
        message: errorMessage
    });
});

module.exports = app
