import { findAllPlatform, findPlatformById, findPlatformBySlug } from "./platforms.repository"



export const getAllPlatform = async() => {

    return await findAllPlatform();

}

export const getPlatformById = async(platformId:string) =>{

    return await findPlatformById(platformId);

}

export const getPlatformBySlug = async(slug:string) => {

    return await findPlatformBySlug(slug);

}