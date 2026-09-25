import express, {Request, Response, NextFunction} from "express";
import { getAllTagService, getTagById, getTagBySlug } from "./tags.service";


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

export const getTagByIdController = async(req:Request<{tagId:string}>, res:Response, next:NextFunction) => {

    const {tagId} = req.params;

    const tags = await getTagById(tagId);

    if(!tags){
        return res.status(400).json({
            succes:false,
            message:"tag not found",
        })
    }

    res.status(200).json({
        success:true,
        message:"tag found!",
        data:tags,
    })

}

export const getTagBySlugController = async(req:Request<{slug:string}>, res:Response, next:NextFunction) => {

    const {slug} = req.params;

    const tag = await getTagBySlug(slug);

    if (!tag) {
      res.status(404).json({
        success: false,
        message: "Tag not found",
      });
      return;
    }

    res.status(200).json({
        success:true,
        message:"tag found successfully!",
        data:tag,
    })

}