import express, {Request, Response, NextFunction} from "express";
import { getAllTagService } from "./tags.service";


export const getAllTagController = async(req:Request, res:Response, next:NextFunction) => {

    try {

        const tags = await getAllTagService();

        res.status(200).json({
            success:true,
            message:"all tags are fetched successfully!",
            data:tags
        })
        
    } catch (error) {
        next(error)
    }

}

