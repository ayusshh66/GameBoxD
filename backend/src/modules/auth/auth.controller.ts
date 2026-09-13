import express, { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation";
import { loginUser, loginUser, registerUser } from "./auth.service";
import { es } from "zod/v4/locales";


export const register = async(req: Request, res : Response, next : NextFunction) => {

    try {

        const result = await registerSchema.safeParseAsync(req.body);

        if(result.error){
            
            return res.status(400).json({
                success : false,
                message : "Error in validation register schema",
                errors : result.error.format(),
            })
        }

        const {username, email, password} = result.data;

        const newUser = await registerUser(
            username,
            email,
            password
        );

        return res.status(200).json({
            success : true,
            message : "user registered successfully",
            data : newUser,
        })
        
    } catch (error) {
        next(error)
    }

}

export const login = async(req:Request, res:Response, next: NextFunction) => {

    try {

        const result = await loginSchema.safeParseAsync(req.body);

        if(!result.success){
            return res.status(400).json({
                success : false,
                message : "error in validation of login schema",
                errors : result.error.format(),
            })
        }

        const {email, password} = result.data;

        const existingUser = await loginUser(
            email,
            password
        );

        res.cookie("token", existingUser.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            success : true,
            message : "user logged in successfully",
            data : existingUser.user,
        })

    } catch (error) {
        next(error);
    }

}