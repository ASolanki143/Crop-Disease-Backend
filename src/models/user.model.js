import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//first name, last name, dob, city, state, village, gender, occupation,
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        avatar: {
            type: String, // cloudinary url
            // required: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
        },
        city: {
            type: String,
        },
        village: {
            type: String,
        },
        state: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        occupation: {
            type: String,
        },
        scanHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "scanHistory",
            },
        ],
        chatHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        refreshToken: {
            type: String,
            // required: true
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            description: this.description,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
