import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

enum ProductType {
    'Хранителни стоки',
    'Канцеларски материали',
    'Строителни материали'
}

@modelOptions({
    schemaOptions: {
        collection: 'products',
        versionKey: false,
        timestamps: true,
        strict: true,
    }
})
class Product {

    @prop({ required: true, maxlength: 50, unique: true })
    public name!: string;

    @prop({ maxlength: 2000 })
    public description?: string;

    @prop({ required: true })
    public photoPath!: string;

    @prop({ required: true, min: 0.01 })
    public buyPrice!: number;

    @prop({ required: true, min: 0.01 })
    public sellPrice!: number;

    @prop({ required: true, min: 0 })
    public count!: number;

    @prop({
        enum: ['Хранителни стоки',
            'Канцеларски материали',
            'Строителни материали'], required: true
    })
    public type!: string;


}

const ProductModel = getModelForClass(Product);
export default ProductModel;