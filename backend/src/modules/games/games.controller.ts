import express ,{ NextFunction, Request, Response} from "express";
import { getAllGames, getGameBySlug } from "./games.service";



export const getGames = async(req: Request, res:Response, next:NextFunction) => {
    
    try {

        const result = await getAllGames();

        return res.status(200).json({
            success : true,
            message : "game has been fetched successfully",
            data : result,
        })
        
    } catch (error) {
        next(error)
    }

}

