import express ,{ NextFunction, Request, Response} from "express";
import { createGame, getAllGames, getGameBySlug, getLatestGames, getSearchTopGames, getTopGames, getUpcomingGames, updateGame, deleteGame } from "./games.service";
import { createGameSchema, updateGameSchema } from "./games.validation";
import { db, games } from "../../db"


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

export const upcomingGames = async(req:Request<{limit : number}>, res: Response, next:NextFunction) => {

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

export const searchTopGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Number(req.query.page) || 1;

    const result = await getSearchTopGames(query, limit, page);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Unable to find top search games",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      limit,
      page,
      query,    
    });
  } catch (error) {
    console.error("Error in getting searchTopGames:", error);
    next(error);
  }
};

export const postGame = async(req:Request, res:Response, next:NextFunction) => {

    try {

        const result = await createGameSchema.safeParseAsync(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message: "inavlid input"
            })
        }

        const game = await createGame(result.data);

        return res.status(200).json({
            success : true,
            message : "game created successfully!",
            data:game
        })
        
    } catch (error) {
        console.error("error in creating new game", error)
        next(error);
    }

}

export const patchGame = async(req:Request<{gameId:string},any, any, any>, res:Response, next:NextFunction) => {

    try {

        const {gameId} = req.params;

        if (!gameId) {
            return res.status(400).json({
            success: false,
            message: "Game ID parameter is required",
        });
}

        const result = await updateGameSchema.safeParseAsync(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"wring input on update fields"
            })
        }

        const data = result.data

        const update = await updateGame(gameId  ,data );

        if(!update){
            return res.status(400).json({
                success:false,
                message:"no game found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"game successfully updated!",
            data:update,
        })
        
    } catch (error) {
        console.error("error in updating the game", error);
        next(error);
    }

}

export const deletedGame = async(req:Request, res:Response, next:NextFunction) => {

    try {

        const {gameId} = req.params;

        const deleted = await deleteGame(gameId as string);

        if(!deleted){
            return res.status(400).json({
                success:false,
                message: "game not found",
            })
        }

        return res.status(200).json({
            success:true,
            message:"game deleted successfully!",
            data:deleted,
        })
        
    } catch (error) {
        console.error("error in deleting the game", error);
        next(error)
    }

}