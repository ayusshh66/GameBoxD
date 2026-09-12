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

export const findUserById = async(id:string) =>{
    try {

        const user = await db.query.users.findFirst({
            where : eq(users.id, id),
        })

        return user ?? null;
        
    } catch (error) {
        console.error(`error in finding user by id ${error}`)
        throw error
    }
}

export const createUser = async(data : {
    username : string,
    email : string,
    passwordHash : string,
}) => {

    try {

        const [result] = await db.insert(users).values(data).returning({
            id : users.id,
            email : users.email,
            username : users.username,
        })

        return result;
        
    } catch (error) {
        console.error(`error in creating user ${error}`)
        throw error
    }

}

