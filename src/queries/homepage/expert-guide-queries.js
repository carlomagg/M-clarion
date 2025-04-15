import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

// fetch all expert guides
async function fetchExpertGuides() {
    const response = await axios.get('clarion_users/list-all-expert-guides/');
    return response.data['expert_guides'];
}

// all expert guides options
export function expertGuidesOptions(options = {}) {
    return queryOptions({
        queryKey: ['expert-guides'],
        queryFn: fetchExpertGuides,
        ...options
    });
}

// top four expert guides options
export function topFourExpertGuidesOptions() {
    return expertGuidesOptions({select: (data) => data.slice(0, 4)});
}

// fetch single expert guide
async function fetchExpertGuide({queryKey}) {
    const response = await axios.get(`clarion_users/get-expert-guide/${queryKey[1]}`);
    return response.data['expert_guide'][0];
}

export function expertGuideOptions(id, options = {}) {
    return queryOptions({
        queryKey: ['expert-guides', id],
        queryFn: fetchExpertGuide,
        ...options
    });
}