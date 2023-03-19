import { Express, Request, Response } from "express";
import { validateSchema } from "../middleware/schema-validator";
import userRegisterSchema from "../schema/user-register.schema";
import userLoginSchema from '../schema/user-login.schema';
import { authenticateUser, loginHandler, logout, mySelf, registerHandler, renewTokenHandler, resetPasswordHandler, resetPasswordTokenHandler } from '../controller/auth.controller';
import productAddSchema from '../schema/product-add.schema';
import { addProductHandler, deleteHandler, getProductByIdHandler, updateHandler } from '../controller/products.controller';
import productUpdateSchema from '../schema/product-update.schema';
import { getAllProductsHandler } from '../controller/products.controller';


export function registerRoutes(app: Express) {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!');
    });

    app.get('/products', authenticateUser, getAllProductsHandler);
    // app.get('/products', getAllProductsHandler);
    app.get('/products/:id', authenticateUser, getProductByIdHandler)
    // app.get('/products/:id', getProductByIdHandler);

    app.post('/auth/login', validateSchema(userLoginSchema), loginHandler);
    app.post('/auth/register', validateSchema(userRegisterSchema), registerHandler);
    app.post('/products', [validateSchema(productAddSchema), authenticateUser], addProductHandler);
    app.post('/auth/token', renewTokenHandler);
    // app.delete('/products', deleteHandler);
    app.delete('/products/:id', authenticateUser, deleteHandler);
    app.put('/products/:id', [authenticateUser, validateSchema(productUpdateSchema)], updateHandler);

    app.get('/wait', (req: Request, res: Response) => {
        setTimeout(() => {
            res.json('viktor pederasa');
        }, 3000);
    });

    app.post('/auth/logout', logout)
    app.get('/me', mySelf);
    app.post('/auth/resetPasswordToken', resetPasswordTokenHandler);
    app.post('/auth/resetPassword', resetPasswordHandler);



    // app.post('/addProducts', addSomeProducts);
    // async function addSomeProducts(req: Request, res: Response) {
    //     await addTenProducts(req, res);
    // }
    // async function addTenProducts(req: Request, res: Response) {
    //     const products = [];
    //     for (let i = 1; i <= 10; i++) {
    //         products.push({
    //             name: `product ${i}`,
    //             buyPrice: 10 * i,
    //             sellPrice: 11 * i,
    //             photoPath: `${process.env.photosPath}\kitty.png`,
    //             type: 'Хранителни стоки',
    //             count: 25 * i,
    //             description: 'Описание на продукт ' + i + ' A warehouse product could be a pallet of electronics components that are being stored in a temperature-controlled environment until they are ready to be assembled into finished products.',

    //         });
    //     }
    //     try {
    //         await ProductModel.insertMany(products);
    //         res.status(200).send({ message: 'Products added' });
    //     } catch (err) {
    //         res.send(err);
    //     }
    // }

}
