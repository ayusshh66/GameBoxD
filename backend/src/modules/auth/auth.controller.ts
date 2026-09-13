import express, { NextFunction, Request, Response } from "express";
import { registerSchema } from "./auth.validation";
import { error } from "node:console";
import { registerUser } from "./auth.service";


export const register = async(req: Request, res : Response, next : NextFunction) => {

    try {

        const result = await registerSchema.safeParseAsync(req.body);

        if(result.error){
            return res.status(400).json({error : `Invalid credentials ${result.error}`})
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