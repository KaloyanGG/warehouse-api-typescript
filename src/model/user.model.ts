import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";
import bcrypt from 'bcrypt';
import { property } from "lodash";

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
    public username!: string;

    @prop({ required: true })
    public password!: string;

    @prop({ required: true, unique: true })
    public email!: string;

    @prop()
    public phoneNumber?: string;

    public async comparePassword(candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
}


const UserModel = getModelForClass(User);
export default UserModel;