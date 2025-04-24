import { SubmitSuggestionButton } from "../../../../partials/AISuggestion/AISuggestion";
import { Field } from "../../../../partials/Elements/Elements";
import styleModule from '../../../../partials/AISuggestion/style.module.css';
import { useEffect, useState } from "react";
import useProcessDescription from "../../../../../queries/ai/processes/process-description";
import useProcessTags from "../../../../../queries/ai/processes/process-tags";

export function AIProcessOverviewButton({onClick}) {
    return (
        <div className={`p-1 rounded ${styleModule['buttonBorderGradient']} h-9`}>
            <button type="button" onClick={onClick} className="flex justify-center items-center bg-[#FADBEB] font-medium text-sm text-text-pink w-44 rounded h-full">
                AI Review
            </button>
        </div>
    );
}

export default function AIProcessOverview({processTitle, onClose, onApplySuggestions}) {
    const [aiDescription, setAiDescription] = useState(null);
    const [aiTags, setAiTags] = useState(null);
    const [descriptionError, setDescriptionError] = useState(null);
    const [tagsError, setTagsError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);

    // Process description hook
    const {
        isPending: isDescriptionPending,
        mutate: mutateDescription
    } = useProcessDescription({
        onSuccess: (data) => {
            console.log("Description success:", data);
            
            // Handle different response formats
            if (typeof data === 'string') {
                // Direct string response
                setAiDescription(data);
            } else if (data && typeof data === 'object') {
                // Handle object response
                if (data.description) {
                    setAiDescription(data.description);
                } else if (data.toString) {
                    // Try to convert object to string if possible
                    setAiDescription(data.toString());
                } else {
                    console.warn("Received data but couldn't extract description:", data);
                }
            } else {
                console.warn("Received unexpected data format:", data);
            }
            
            setDescriptionError(null);
        },
        onError: (error) => {
            console.error("Description error:", error);
            const errorDetails = getErrorDetails(error);
            setDescriptionError(`Error: ${errorDetails}`);
        }
    });

    // Process tags hook
    const {
        isPending: isTagsPending,
        mutate: mutateTags
    } = useProcessTags({
        onSuccess: (data) => {
            console.log("Tags success:", data);
            
            // Handle different response formats
            if (typeof data === 'string') {
                // Direct string response
                setAiTags(data);
            } else if (data && typeof data === 'object') {
                // Handle object response
                if (data.tags) {
                    setAiTags(data.tags);
                } else if (data.toString) {
                    // Try to convert object to string if possible
                    setAiTags(data.toString());
                } else {
                    console.warn("Received data but couldn't extract tags:", data);
                }
            } else {
                console.warn("Received unexpected data format:", data);
            }
            
            setTagsError(null);
        },
        onError: (error) => {
            console.error("Tags error:", error);
            const errorDetails = getErrorDetails(error);
            setTagsError(`Error: ${errorDetails}`);
        }
    });

    function getErrorDetails(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            
            let errorMsg = `${error.response.status}`;
            
            if (error.response.data && error.response.data.error) {
                errorMsg += ` - ${error.response.data.error}`;
            } else if (error.response.data && error.response.data.detail) {
                errorMsg += ` - ${error.response.data.detail}`;
            } else if (typeof error.response.data === 'string') {
                errorMsg += ` - ${error.response.data}`;
            }
            
            return errorMsg;
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            return `No response from server. Check if the endpoint is implemented and accessible: ${error.config?.url || 'unknown endpoint'}`;
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up request:", error.message);
            return error.message || "Unknown error";
        }
    }

    useEffect(() => {
        if (processTitle && processTitle.trim() !== '') {
            fetchProcessSuggestions();
        }
    }, []);

    useEffect(() => {
        setAiDescription(null);
        setAiTags(null);
        setDescriptionError(null);
        setTagsError(null);
    }, [processTitle]);

    // Function to fetch process description
    function fetchDescription() {
        setDescriptionError(null);
        mutateDescription({
            process: processTitle,
            suggestion: promptSuggestion
        });
    }

    // Function to fetch process tags
    function fetchTags() {
        setTagsError(null);
        mutateTags({
            process: processTitle
        });
    }

    function fetchProcessSuggestions() {
        if (!processTitle || processTitle.trim() === '') {
            setDescriptionError('The process title must be specified.');
            return;
        }

        setIsRetrying(true);

        // Fetch description and tags separately
        fetchDescription();
        fetchTags();

        // Reset retry flag after 500ms
        setTimeout(() => {
            setIsRetrying(false);
        }, 500);
    }

    function handleApplySuggestions() {
        if (onApplySuggestions) {
            onApplySuggestions({
                description: aiDescription || "",
                tags: aiTags || ""
            });
        }
        if (onClose) {
            onClose();
        }
    }

    // Extract tag text from string that might be in the format "tags: finance, industry, process"
    function extractTagsFromString(tagString) {
        if (!tagString) return [];
        
        // If string starts with "tags:", remove that prefix
        const cleanedString = tagString.startsWith('tags:') 
            ? tagString.substring(5).trim() 
            : tagString;
            
        return cleanedString.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // Extract description text if it's in a format like "description: This is the description"
    function extractDescriptionFromString(descString) {
        if (!descString) return '';
        
        // If string starts with "description:", remove that prefix
        return descString.startsWith('description:') 
            ? descString.substring(12).trim() 
            : descString;
    }

    const isDescriptionLoading = isDescriptionPending && !isRetrying;
    const isTagsLoading = isTagsPending && !isRetrying;
    const hasAnyData = aiDescription || aiTags;
    
    // Clean up data for display
    const displayDescription = extractDescriptionFromString(aiDescription);
    const displayTags = extractTagsFromString(aiTags);

    return (
        <div className="bg-white p-6 rounded-lg border border-[#CCC] flex flex-col gap-6 h-full">
            {descriptionError && tagsError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md mb-2">
                    <h3 className="font-semibold">API Connection Issue</h3>
                    <p className="text-sm">
                        There seems to be an issue connecting to the AI services. Please check that:
                    </p>
                    <ol className="list-decimal ml-5 text-sm mt-1">
                        <li>The AI endpoints are properly configured on the server</li>
                        <li>Your internet connection is stable</li>
                        <li>You have the proper permissions to access these services</li>
                    </ol>
                </div>
            )}
            
            <article className="flex-1 overflow-auto">
                {/* Description Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Process Description</h3>
                        <button 
                            onClick={fetchDescription}
                            className="text-xs text-text-pink hover:underline"
                        >
                            Refresh
                        </button>
                    </div>
                    
                    {isDescriptionLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                        </div>
                    ) : descriptionError ? (
                        <p className="italic text-red-500 text-sm mb-4">{descriptionError}</p>
                    ) : displayDescription ? (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="whitespace-pre-wrap">{displayDescription}</p>
                        </div>
                    ) : (
                        <p className="italic text-text-gray">No description generated yet.</p>
                    )}
                </div>

                {/* Tags Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Suggested Tags</h3>
                        <button 
                            onClick={fetchTags}
                            className="text-xs text-text-pink hover:underline"
                        >
                            Refresh
                        </button>
                    </div>
                    
                    {isTagsLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                        </div>
                    ) : tagsError ? (
                        <p className="italic text-red-500 text-sm mb-4">{tagsError}</p>
                    ) : displayTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {displayTags.map((tag, index) => (
                                <span key={index} className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="italic text-text-gray">No tags generated yet.</p>
                    )}
                </div>
            </article>
            <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                    <Field 
                        placeholder={'Suggest changes (e.g., "focus on local market")'}
                        onChange={(e) => setPromptSuggestion(e.target.value)} 
                        value={promptSuggestion} 
                    />
                    <SubmitSuggestionButton onClick={fetchProcessSuggestions} />
                </div>
                
                {onApplySuggestions && (
                    <div className="flex justify-end gap-3">
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={handleApplySuggestions}
                            disabled={!hasAnyData && !descriptionError && !tagsError}
                            className="px-4 py-2 bg-button-pink text-white rounded-md hover:bg-pink-700 disabled:bg-gray-300"
                        >
                            {hasAnyData ? "Apply Suggestions" : "Close"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 