import { findAllTags } from "./tags.repository"


export const getAllTagService = async() => {

    return await findAllTags();

}

