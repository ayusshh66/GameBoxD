import express, {NextFunction, Request, Response} from "express";
import { db } from "../index";
import { users } from "../index";
import { eq } from "drizzle-orm";

// 1. Step into the global scope
declare global {
  // 2. Target Express's internal namespace
  namespace Express {
    // 3. Extend Express's Request interface
    interface Request {
      // 4. Add our custom property
      userId?: string;
    }
  }
}

type Role = "user" | "moderator" | "admin"

export const authorize = (...allowedRoles : Role[]) => {

    return async(req:Request<{userId:string}>, res:Response, next:NextFunction) =>{

        try {

            const userId = req.userId

            if(!userId){
                return res.status(400).json({
                    success : true,
                    message: "you are not authorized",
                })
            }

            const user = await db.query.users.findFirst({
                where: (users, {eq}) => (eq(users.id, userId)),
                columns: {
                    id: true,
                    role:true,
                }
            })

            if(!user){
                return res.status(400).json({
                    success : false,
                    message : "user not found",
                })
            }

            if(allowedRoles.includes(user.role as Role)){
                return res.status(400).json({
                    success : false,
                    message : "not authorized for this action",
                })
            }

            next();
            
        } catch (error) {
            console.error("error in authorizing the role", error)
            next(error)
        }

    }

}
