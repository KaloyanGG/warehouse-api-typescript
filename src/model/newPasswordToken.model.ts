import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";


@modelOptions({
    schemaOptions: {
        collection: 'newPasswordTokens',
        versionKey: false,
        timestamps: true,
        strict: true,
    }
})
class NewPasswordToken {
    @prop({ required: true, unique: true })
    public token!: string;

    @prop({ required: true })
    public userId!: string;

    @prop({ required: true })
    public expirationDate!: Date;

}

const NewPasswordTokenModel = getModelForClass(NewPasswordToken);
export default NewPasswordTokenModel;