import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import commentRoute from "./routes/comment.route.js";
import likeRoute from "./routes/like.route.js";
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";
import scanRoute from "./routes/scan.route.js";

app.use("/api/v1/users", userRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/likes", likeRoute);
app.use("/api/v1/scan", scanRoute);

export { app };
