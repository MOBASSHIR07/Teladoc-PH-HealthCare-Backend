import { NextFunction,  Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(req.body.data){
            req.body = JSON.parse(req.body.data);
        }

        const validationResult = zodSchema.safeParse(req.body);
        if (!validationResult.success) {
            next(validationResult.error);
        }
        req.body = validationResult.data;
        next();
    }
}
// import { NextFunction, Request, Response } from "express";
// import z from "zod";

// export const validateRequest = (zodSchema: z.ZodSchema<any>) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
           
//             if (req.body.data) {
//                 req.body = JSON.parse(req.body.data);
//             }

          
//             const validationResult = await zodSchema.parseAsync({
//                 body: req.body,
//                 query: req.query,
//                 params: req.params,
//                 cookies: req.cookies,
//             });

        
//             const parsedData = validationResult as any;

           
           
//             if (parsedData.body) {
//                 req.body = parsedData.body;
//             }

//             return next(); 
//         } catch (error) {
//             return next(error); 
//         }
//     };
// };