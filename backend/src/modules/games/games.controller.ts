import express ,{ NextFunction, Request, Response} from "express";
import { getAllGames, getGameBySlug } from "./games.service";


export const getGames = async(req: Request<{
    limit : number,
    offset : number,
}>, res:Response, next:NextFunction) => {
    
    try {

        const {limit, offset} = req.params;

        const result = await getAllGames(limit, offset);

        return res.status(200).json({
            success : true,
            message : "game has been fetched successfully",
            data : result,
        })
        
    } catch (error) {
        next(error)
    }

}

export const getGame = async(req: Request <{slug:string}>, res : Response, next:NextFunction) => {

    try {

        const {slug} = req.params;

        const result = await getGameBySlug(slug);

        if(!result){
            return res.status(400).json({
                success : false,
                message : "game not found",
            })
        }

        return res.status(200).json({
            success : true,
            message : "game found",
            data : result,
        })
        
    } catch (error) {
        next(error);
    }

}

export const latestGames = async(req:Request<{limit:number}>, res:Response, next:NextFunction) => {

    const {limit} = req.params;

    

}

