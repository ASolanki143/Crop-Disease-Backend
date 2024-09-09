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
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";

app.use("/api/v1/users", userRoute);
app.use("/api/v1/post", postRoute);

export { app };
