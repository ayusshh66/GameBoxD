import express, {Request, Response, NextFunction} from "express";
import { getAllPlatform } from "./platforms.service";


export const getAllPlatformController = async(req:Request, res:Response,next:NextFunction) => {

    const platforms = await getAllPlatform();

    if(!platforms){
        return res.status(400).json({
            message:"the platform data is empty, please post some platforms"
        })
    }

    res.status(200).json({
        success:true,
        message:"platforms fetched successfully!",
        data:platforms,
    })

}