import mongoose, {Schema} from "mongoose";

const scanSchema = new Schema(
    {
        userId : {
            type : Schema.Types.ObjectId,
            ref : 'User'
        },
        image : {
            type : String,
            required : true
        },
        response : {
            type : String,
            required : true
        },
        question : {
            type  : String,
            required : true
        }
    },
    {timestamps : true}
)

export const Scan = mongoose.model("Scan",scanSchema)