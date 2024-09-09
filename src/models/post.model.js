import mongoose, {Schema} from "mongoose";

const postSchema = new Schema(
    {
        userID : {
            type : Schema.Types.ObjectId,
            required : true
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        image : {
            type : String, // Cloudinary URL
            required : true
        },
    },
    {timestamps : true}
)

export const Post = mongoose.model("Post",postSchema)