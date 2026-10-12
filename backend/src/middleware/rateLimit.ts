import express, { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";


export const loginRateLimiter = async(req:Request, res:Response, next:NextFunction) => {

    try {

        const key = `gameboxd:ratelimiter:login:${req.ip}`;

        const attempts = await redis.incr(key);

        if(attempts === 1){
            await redis.expire(key,60)
        }

        if(attempts > 10){
            return res.status(400).json({
                success:false,
                message:"too many login request, pleawse try again in a while"
            })
        }

        next();
        
    } catch (error) {
        console.error("error in login rate limiter",error)
        next(error);
    }

}   