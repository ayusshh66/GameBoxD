import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, users } from "../../db";
import {findUserByEmail, findUserById, createUser} from "./auth.repository"

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

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

export const loginUser = async(email : string , password : string) =>{

    try {
        
        const existingUser = await findUserByEmail(email);

        if(!existingUser){
            throw new Error("Invalid email or password");
        }

        const newHashPassword = await bcrypt.compare(password, existingUser.passwordHash);

        if(!newHashPassword){
            throw new Error("Invalid Password")
        }

        const token = jwt.sign({
            userId : existingUser.id
        },JWT_SECRET, {
            expiresIn : "7d",
        })

        return {
            user : existingUser.username,
            token,
        }
        
    } catch (error) {
        console.error(`error in login`)
        throw error;
    }
}

