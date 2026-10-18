import {redis} from "../../config/redis"
import { upsertGameRating } from "./reviews.repository"

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
