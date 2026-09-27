import { createPlatform, findAllPlatform, findPlatformById, findPlatformBySlug } from "./platforms.repository"
import { CreatePlatformInput } from "./platforms.validation";



export const getAllPlatform = async() => {

    return await findAllPlatform();

}

export const getPlatformById = async(platformId:string) =>{

    return await findPlatformById(platformId);

}

export const getPlatformBySlug = async(slug:string) => {

    return await findPlatformBySlug(slug);

}

export const createPlatformService = async(data:CreatePlatformInput) => {

    return await createPlatform(data);

}