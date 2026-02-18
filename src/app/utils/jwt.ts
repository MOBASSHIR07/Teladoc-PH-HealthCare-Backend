/* eslint-disable no-useless-catch */

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken =(payload : JwtPayload, secretKey: string,{expiresIn}: SignOptions)=>{
    const token = jwt.sign(payload, secretKey, {expiresIn});
    return token;
}

const verifyToken = (token: string, secretKey: string) => {
    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload; 

        return {
            success: true,
            data: decoded,
        };
    }
        catch (error:any) {     
            return {
                success: false,
                message: error.message,
                error: error,
            }
        }
    }

    const decodeToken = (token: string): JwtPayload | null => {
      
            const decoded = jwt.decode(token) as JwtPayload;    
            return decoded;
            
        }
      
        export const JwtUtils = {
            createToken,
            verifyToken,
            decodeToken,    
        }
