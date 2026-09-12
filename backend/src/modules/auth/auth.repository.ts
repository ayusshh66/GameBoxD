import { eq } from "drizzle-orm";
import { db,users } from "../../db/index";


export const findUserByEmail = async(email:string) =>{

    try {

        const user = await db.query.users.findFirst({
            where : eq(users.email, email),
        })

        return user ?? null;
        
    } catch (error) {
        console.error(`error in finding user by email ${error}`)
        throw error;
    }

}

