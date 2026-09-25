import { createTag, deleteTag, findAllTags, findTagById, findTagBySlug, updateTag } from "./tags.repository"
import { CreateTagInput, UpdateTagInput } from "./tags.validation";


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

export const updateTagService = async(tagId:string, data:UpdateTagInput) => {

    const existingTag = await findTagById(tagId);

    if(!existingTag){
        return null;
    }

    return await updateTag(tagId, data);

}

export const deleteTagService = async(tagId:string) => {

    const existingTag = await findTagById(tagId);

    if(!existingTag){
        return null;
    }

    return await deleteTag(tagId);

}