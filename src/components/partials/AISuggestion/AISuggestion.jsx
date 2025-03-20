import { useEffect, useRef, useState } from "react";
import aiIcon from '../../../assets/icons/ai-wand.svg';
import refreshIcon from '../../../assets/icons/refresh.svg';
import copyIcon from '../../../assets/icons/copy.svg';
import cancelIcon from '../../../assets/icons/cancel.svg';
import { Field } from "../Elements/Elements";
import styleModule from './style.module.css';

export default function AISuggestionBox({onFetch, isFetching, error, content, suggestion, onSuggestionChange, style={}}) {
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        (isDialogVisible && content === null) && onFetch();
    }, [isDialogVisible, content]);

    return (
        <div style={style}>
            <div className="relative">
                <MagicButton buttonRef={buttonRef} onClick={() => setIsDialogVisible(true)} style={isDialogVisible ? {opacity: 0, maxHeight: 0, overflow: 'hidden'} : {}} />
                {isDialogVisible && <AIDialog button={buttonRef.current} {...{isFetching, error, content, suggestion, onSuggestionChange, onFetch}} onClose={() => setIsDialogVisible(false)} />}
            </div>
        </div>
    );
}

function MagicButton({onClick, buttonRef, style}) {
    return (
        <div className={`group p-[1px] rounded ${styleModule['buttonBorderGradient']}`}>
            <button style={style} ref={buttonRef} type="button" onClick={onClick} className="flex gap-2 items-center py-1 px-3 text-xs bg-white rounded">
                <img src={aiIcon} alt="" className="inline-block" />
                <span className="hidden group-hover:inline-block whitespace-nowrap">AI suggestion</span>
            </button>
        </div>
    );
}

function AIDialog({button, onClose, isFetching, error, content, suggestion, onSuggestionChange, onFetch}) {
    const notificationBarHeight = 0;
    const headerHeight = 77;
    const dialogHeight = 384;
    const buttonBox = button.getBoundingClientRect();
    const topSpace = dialogHeight + notificationBarHeight + headerHeight;

    const top = buttonBox.top < topSpace ?
    topSpace - buttonBox.top :
    0;

    async function handleCopyClicked() {
        try {
            const regExpResult = new RegExp(`[^:]*:?\s?(.*)`).exec(content);
            content && await navigator.clipboard.writeText(regExpResult[1].trim());
        } catch (e) {
            console.log('Couldn\'t copy');
        }
    }

    const article = isFetching ?
        <p className="italic text-text-gray">Fetching AI Suggestion...</p> :
        (
            error ?
            <p className="italic text-red-500">{error}</p> :
            content && content.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)
        )

    return (
        <div style={{height: dialogHeight, bottom: top !== 0 ? -top : 0}} className={`absolute w-[600px] bottom-0 right-0 rounded-lg border z-[9] ${styleModule['dialogBorderGradient']} p-[2px]`}>
            <div className="bg-white p-4 h-full rounded-lg">
                <div className="flex flex-col gap-4 h-full">
                    <header className="flex justify-between items-center">
                        <h3 className="font-bold">AI Suggestion</h3>
                        <div className="flex gap-2">
                            <Button text={'Refresh'} icon={refreshIcon} onClick={onFetch} />
                            <Button text={'Copy'} icon={copyIcon} onClick={handleCopyClicked} />
                            <Button text={'Close'} icon={cancelIcon} onClick={onClose} />
                        </div>
                    </header>
                    <article className="flex-1 overflow-auto">
                        {article}
                    </article>
                    <div className="flex gap-3">
                        <Field placeholder={'Suggest changes'} value={suggestion} onChange={onSuggestionChange} />
                        <SubmitSuggestionButton onClick={onFetch} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Button({text, icon, onClick}) {
    return (
        <button type="button" onClick={onClick} className="rounded border-[.5px] border-black py-1 px-3 flex gap-2 items-center text-xs">
            <img src={icon} alt="" />
            {text}
        </button>
    );
}

export function SubmitSuggestionButton({onClick}) {
    return (
        <button type="button" onClick={onClick} className="bg-text-pink w-12 rounded-lg flex items-center justify-center">
            <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L6.29289 6.29289C6.68342 6.68342 6.68342 7.31658 6.29289 7.70711L3 11" stroke="white" strokeWidth="3" strokeLinecap="square"/>
            </svg>
        </button>
    );
}