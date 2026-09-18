import express ,{ NextFunction, Request, Response} from "express";
import { getAllGames, getGameBySlug, getLatestGames, getTopGames, getUpcomingGames } from "./games.service";


export const getGames = async(req: Request<{
    limit : number,
    page : number,
}>, res:Response, next:NextFunction) => {
    
    try {

        const page = Number(req.params.page) || 20;
        const limit = Math.min(Number(req.params.limit) || 20, 100);

        const result = await getAllGames(limit, page);

        return res.status(200).json({
            success : true,
            message : "game has been fetched successfully",
            page,
            limit,
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

    const limit = Math.min(
      Number(req.query.limit) || 20,
      100
    );

    const result = await getLatestGames(limit);

    if(!result){
        return res.status(400).json({
            success : false,
            message : "no latest game found",
        })
    }

    return res.status(200).json({
        success : true,
        message : "Successfully found the latest game",
        data : result,
        limit,
    })
}

export const upcomingGames = async(req:Request<{limit : number}>, res: Response, :next:NextFunction) => {

    try {

        const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await getUpcomingGames(limit);

    if(!result){
        return res.status(400).json({
            success : false,
            message : "unable to fetch the upcoming games"
        })
    }

    return res.status(200).json({
        success:true,
        message : "successfully found the upcoming game",
        limit,
        data : result,
    })

        
    } catch (error) {
        console.error("error in fetching upcoming games", error)
        next(error)
    }
}

export const topGames = async(req:Request<{limit : number}>, res:Response, next:NextFunction) => {

    try {

        const limit = Math.min(Number(req.params.limit) || 20, 100);

        const result = await getTopGames(limit);

        if(!result){
            return res.status(400).json({
                success : false,
                message : "unable to find top game",
            })
        }

        return res.status(200).json({
            success : true,
            message : "successfully found the top game",
            data : result,
            limit,
        })
        
    } catch (error) {
        console.error("error in finding top game", error);
        next(error)
    }

}

