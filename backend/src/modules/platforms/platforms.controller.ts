import express, {Request, Response, NextFunction} from "express";
import { getAllPlatform, getPlatformById, getPlatformBySlug } from "./platforms.service";
import { createPlatformSchema } from "./platforms.validation";


export const getAllPlatformController = async(req:Request, res:Response,next:NextFunction) => {

    try {

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
        
    } catch (error) {
        next(error)
    }

}

export const getPlatformByIdController = async(req:Request<{platformId:string}>, res:Response, next:NextFunction) => {

    try {

        const {platformId} = req.params;

    const existingPlatform = await getPlatformById(platformId)

    if(!existingPlatform){
        return res.status(400).json({
            success:false,
            message:"platform not found",
        })
    }

    res.status(200).json({
        success:true,
        message:"paltform found successfully!",
        data:existingPlatform,
    })
        
    } catch (error) {
        next(error)
    }

}

export const getPlatformBySlugController = async(req:Request<{slug:string}>,res:Response, next:NextFunction) => {

    try {

        const {slug} = req.params;

        const platform = await getPlatformBySlug(slug);

        if(!platform){
            return res.status(400).json({
                success:false,
                message:"platform not found",
            })
        }

        res.status(200).json({
            success:true,
            message:"platform found successfully!",
            data:platform,
        })
        
    } catch (error) {
        next(error)
    }

}

export const createPlatformController = async(req:Request, res:Response, next:NextFunction) => {

    const result = await createPlatformSchema

}