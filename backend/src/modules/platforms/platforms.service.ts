import { createPlatform, deletePlatform, findAllPlatform, findPlatformById, findPlatformBySlug, updatePlatform } from "./platforms.repository"
import { CreatePlatformInput, UpdatePlatformInput } from "./platforms.validation";



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

export const updatePlatformService = async(platformId:string, data:UpdatePlatformInput) => {

    return await updatePlatform(platformId, data);

}

export const deletePlatformService = async(platformId:string) => {

    return await deletePlatform(platformId);

}