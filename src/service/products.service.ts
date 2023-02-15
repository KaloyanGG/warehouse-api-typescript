import { ObjectId } from "mongoose";
import ProductModel from "../model/product.model";


async function deleteAllProducts() {
    await ProductModel.deleteMany({});
}

async function deleteProductById(id: string) {
    const a = await ProductModel.findOneAndDelete({ _id: id });
    return a;
}

export { deleteAllProducts, deleteProductById }