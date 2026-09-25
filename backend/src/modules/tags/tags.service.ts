import { createTag, findAllTags, findTagById, findTagBySlug } from "./tags.repository"
import { CreateTagInput } from "./tags.validation";


export const getAllTagService = async() => {

    return await findAllTags();

}

export const getTagById = async(tagId:string) => {

    return await findTagById(tagId);

}

export const getTagBySlug = async(slug:string) => {

    return await findTagBySlug(slug);

}

export const createTagService = async(data: CreateTagInput) => {

    return await createTag(data);

}