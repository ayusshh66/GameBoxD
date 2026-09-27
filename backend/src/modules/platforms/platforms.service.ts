import { findAllPlatform, findPlatformById } from "./platforms.repository"



export const getAllPlatform = async() => {

    return await findAllPlatform();

}

export const getPlatformById = async(platformId:string) =>{

    return await findPlatformById(platformId);

}