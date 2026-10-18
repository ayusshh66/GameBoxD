import {redis} from "../../config/redis"
import { insertGameReview, removeGameRating, removeGameReview, upsertGameRating } from "./reviews.repository"

export const invalidateGameCache = async(slug:string) => {

    try {

        await redis.del(`gameboxd:game:slug:${slug}`)
        
    } catch (error) {
        console.error("not able to deleted game rview from redis cache")
    }

}

export const rateGame = async (
  gameId: string,
  userId: string,
  rating: number
) => {
  const result = await upsertGameRating(gameId, userId, rating);

  if (result) {
    await invalidateGameCache(result.slug);
  }

  return result?.rating ?? null;
};

export const deleteRating = async (
  gameId: string,
  userId: string
) => {
  const result = await removeGameRating(gameId, userId);

  if (result) {
    await invalidateGameCache(result.slug);
  }

  return Boolean(result);
};

export const createGameReview = async(gameId:string,
    userId:string,
    data: {
        content : string,
        isSpoiler : boolean
    }
) => {

    const result = await insertGameReview(gameId, userId, data);

    if(result.status === "created"){
        await invalidateGameCache(result.slug);
    }

    return result;

}