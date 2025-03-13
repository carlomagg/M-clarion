import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

// fetch all help categories
async function fetchHelpCategories() {
    const response = await axios.get('clarion_users/view_all-help-topic-categories/');
    return response.data['help_topics_categories'];
}

// all help categories options
export function helpCategoriesOptions(options = {}) {
    return queryOptions({
        queryKey: ['help-categories'],
        queryFn: fetchHelpCategories,
        ...options
    });
}

// top 5 help categories options
export function topFiveCategoriesOptions() {
    return helpCategoriesOptions({
        select: data => data.slice(0,5)
    });
}

// fetch help category topics
async function fetchHelpCategoryTopics({queryKey}) {
    const response = await axios.get(`clarion_users/category-with-help-topics/${queryKey[1]}`);
    return response.data['category_with_help_topics'];
}

export function helpCategoryTopicsOptions(categoryId, options = {}) {
    return queryOptions({
        queryKey: ['help-categories', categoryId, 'topics'],
        queryFn: fetchHelpCategoryTopics,
        ...options
    });
}

// fetch help guide
async function fetchHelpGuide({queryKey}) {
    const response = await axios.get(`clarion_users/get-help-topic/${queryKey[3]}`);
    return response.data['help_topic'][0];
}

export function helpGuideOptions(categoryId, topicId, options = {}) {
    return queryOptions({
        queryKey: ['help-categories', categoryId, 'topics', topicId],
        queryFn: fetchHelpGuide,
        ...options
    });
}