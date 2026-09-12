import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, users } from "../../db";
import {findUserByEmail, findUserById, createUser} from "./auth.repository"

export const register = async(username : string,
    email : string,
    password : string,
) =>{

    try {

        const existingUser = await findUserByEmail(email);

        if(existingUser){
            throw new Error("User Already Exists");
        }

        const passwordHash = await bcrypt.hash(password,12);

        const user = await createUser({username, email, passwordHash});

        return user;
        
    } catch (error) {
        console.error(`error in registering`)
        throw error
    }

}

