import { SubmitSuggestionButton } from "../../../../partials/AISuggestion/AISuggestion";
import { Field } from "../../../../partials/Elements/Elements";
import styleModule from '../../../../partials/AISuggestion/style.module.css';
import { useEffect, useState } from "react";
import useRiskOverview from "../../../../../queries/ai/risks/risk-overview";

export function AIOverviewButton({onClick}) {
    return (
        <div className={`p-1 rounded ${styleModule['buttonBorderGradient']} h-9`}>
            <button type="button" onClick={onClick} className="flex justify-center items-center bg-[#FADBEB] font-medium text-sm text-text-pink w-44 rounded h-full">
                AI Review
            </button>
        </div>
    );
}

export default function AIOverview({riskName, riskCategory, riskClass}) {
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');

    const {isPending, mutate} = useRiskOverview({
        onSuccess: (data) => {setAiSuggestion(data)},
        onError: (error) => setAiError(error.response.data.error),
    });

    useEffect(() => {
        fetchRiskOverview();
    }, []);

    useEffect(() => {
        setAiSuggestion(null);
        setAiError(null);
    }, [riskName, riskCategory, riskClass]);

    function fetchRiskOverview() {
        if (riskName === '' || riskCategory === '' || riskClass === '') {
            setAiError('The risk name, category and class must be specified.');
            return;
        }
        mutate({risk: riskName, category: riskCategory, risk_class: riskClass, suggestion: promptSuggestion});
    }

    function formatOverview(aiOverview) {
        const overviewSections = aiOverview.split('\n\n').map((paragraph, i) => {
            const regExpResult = new RegExp('^([^:]*):\s*(.*)$').exec(paragraph);
            const title = regExpResult[1];
            const content = regExpResult[2];
            return {title, content};
        });

        return (
            <div className="flex flex-col gap-8">
                <div>
                    <h3 className="font-bold">Overview of Risk:</h3>
                    <p>{overviewSections[0].content}</p>
                </div>
                <div>
                    <h3 className="font-bold">Key Elements of the Risk:</h3>
                    <ul className="list-decimal ml-6">
                        {
                            overviewSections.slice(1).map(section => {
                                // remove parenthesis
                                // const regExpResult = new RegExp(/^\((.*)\)$/).exec(section.content.trim());
                                // const content = regExpResult[1];
                                // split the content into items
                                // const listItems = content.split(';');
                                // console.log(listItems)
                                return (
                                    <li key={section.title}>
                                        <span className="capitalize font-medium">{section.title.replace(/_/g, ' ')}</span>
                                        {/* <ul className="list-disc ml-10">
                                            {
                                                listItems.map((item, i) => <li key={i}>{item}</li>)
                                            }
                                        </ul> */}
                                        <div className="ml-10">
                                            {
                                                section.content
                                            }
                                        </div>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }

    const article = isPending ?
        <p className="italic text-text-gray">Fetching AI Suggestion...</p> :
        (
            aiError ?
            <p className="italic text-red-500">{aiError}</p> :
            aiSuggestion && formatOverview(aiSuggestion)
        )

    return (
        <div className="bg-white p-6 rounded-lg border border-[#CCC] flex flex-col gap-6 h-full">
                <article className="flex-1 overflow-auto">
                    {article}
                </article>
                <div className="flex gap-3">
                    <Field placeholder={'Suggest changes'} onChange={(e) => setPromptSuggestion(e.target.value)} />
                    <SubmitSuggestionButton onClick={fetchRiskOverview} />
                </div>
        </div>
    );
}