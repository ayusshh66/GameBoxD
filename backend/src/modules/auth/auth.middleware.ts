import express, {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken"
import { findUserById } from "./auth.repository";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async(req:AuthRequest, res:Response, next : NextFunction) => {

    try {

        const token = req.cookies.token;

        if(!token){
            return res.status(400).json({
                success : false,
                message : "Authentication Required",
            })
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {userId : string};

        req.userId = decoded.userId;

        next();
        
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "error in authentication",
        })
    }

}


export const getMe = async(req:AuthRequest, res:Response, next: NextFunction) =>{

    try {

        const existingUser = await findUserById(req.userId!);

        if(!existingUser){
            return res.status(400).json({
                success : false,
                message : "user not found",
            })
        }

        return res.status(200).json({
            success : true,
            message : "got the user",
            data : {
                username : existingUser.username,
                id : existingUser.id,
                email : existingUser.email,
            }
        })

    } catch (error) {
        next(error);
    }

}
