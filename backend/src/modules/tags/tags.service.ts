import { findAllTags, findTagById } from "./tags.repository"


export const getAllTagService = async() => {

    return await findAllTags();

}

export const getTagById = async(tagId:string) => {

    return await findTagById(tagId);

}