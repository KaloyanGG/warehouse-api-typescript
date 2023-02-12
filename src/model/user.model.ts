import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

@modelOptions({
    schemaOptions: {
        collection: 'users',
        versionKey: false,
        timestamps: true,
        strict: true,
    }
})
class User {

    @prop({ required: true, unique: true, match: /^[a-zA-Z_]{5,50}$/ })
    public username?: string;

    @prop({ required: true })
    public password?: string;

}


const UserModel = getModelForClass(User);
export default UserModel;