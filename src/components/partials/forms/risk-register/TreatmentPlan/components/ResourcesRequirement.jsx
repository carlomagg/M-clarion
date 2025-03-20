import { useEffect, useState } from "react";
import AISuggestionBox from "../../../../AISuggestion/AISuggestion";
import CKEAIField from "../../../../CKEAIField";
import useResourceRequirementSuggestion from "../../../../../../queries/ai/risks/resource-requirement";

export default function ResourcesRequirementField({value, onChange, riskName, riskResponse, riskFamily}) {
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');

    const {isPending, mutate} = useResourceRequirementSuggestion({
        onSuccess: (data) => {setAiSuggestion(data)},
        onError: (error) => setAiError(error.response.data.error),
    });

    useEffect(() => {
        setAiSuggestion(null);
        setAiError(null);
    }, [riskName, riskResponse, riskFamily]);

    function fetchRiskDescriptionSuggestion() {
        if (riskName === '' || riskResponse === '' || riskFamily === '') {
            setAiError('The risk name, response and family must be specified.');
            return;
        }
        mutate({risk: riskName, risk_response: riskResponse, control_family: riskFamily, suggestion: promptSuggestion});
    }

    return (
        <CKEAIField {...{name: 'resources_requirement', label: 'Resource Requirement', value, onChange, error: null}}>
            <AISuggestionBox style={{position: 'absolute', bottom: '1rem', right: '1rem'}} onFetch={fetchRiskDescriptionSuggestion} isFetching={isPending} error={aiError} content={aiSuggestion} suggestion={promptSuggestion} onSuggestionChange={(e) => setPromptSuggestion(e.target.value)} />
        </CKEAIField>
    );
}