import express, {Request, Response, NextFunction} from "express";
import { createTagService, deleteTagService, getAllTagService, getTagById, getTagBySlug, updateTagService } from "./tags.service";
import { createTagSchema, updateTagSchema } from "./tags.validation";


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

    try {

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
        
    } catch (error) {
        next(error)
    }

}

export const getTagBySlugController = async(req:Request<{slug:string}>, res:Response, next:NextFunction) => {

    try {

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
        
    } catch (error) {
        next(error)
    }

}

export const createTagController = async(req:Request, res:Response, next:NextFunction) => {

    try {

        const result = await createTagSchema.safeParseAsync(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"invalid input",
                error : result.error.format()
            })
        }

        const data = result.data;

        const newTag = await createTagService(data);

        res.status(200).json({
            success:false,
            message:"tag created sucessfully!",
            data:newTag,
        })
        
    } catch (error) {
        next(error)
    }

}

export const updateTagController = async(req:Request<{tagId:string}>, res:Response, next:NextFunction) => {

    try {

        const {tagId} = req.params;

        const result = await updateTagSchema.safeParseAsync(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"tag not updated, maybe invalid input",
                error : result.error.format(),
            })
        }
        
        const data = result.data;

        const updatedTag = await updateTagService(tagId, data)

        if (!updatedTag) {
        res.status(404).json({
        success: false,
        message: "Tag not found",
      });
      return;
    }

        res.status(200).json({
            success:true,
            message:"tag updated successfully!",
            data:updatedTag,
        })
        
    } catch (error) {
       next(error); 
    }

}

export const deleteTagController = async(req:Request<{tagId:string}>, res:Response, next:NextFunction) => {

    try {

        const {tagId} = req.params;

        const  deletedTag = await deleteTagService(tagId);

        if(!deletedTag){
            return res.status(400).json({
                success:false,
                message:"tag not found!",
            })
        }

        res.status(200).json({
            success:true,
            message:"tag deleted successfully!",
            data:deletedTag,
        })
        
    } catch (error) {
        next(error)
    }

}