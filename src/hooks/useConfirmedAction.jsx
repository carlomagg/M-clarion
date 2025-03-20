import { useState } from "react";
import { createPortal } from "react-dom";
import { FormCustomButton } from "../components/partials/buttons/FormButtons/FormButtons";

// show confirmation prompt before proceeding with action
export default function useConfirmedAction() {
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [action, setAction] = useState(null);
    const [promptMessage, setPromptMessage] = useState('Are you sure you want to complete this action? This cannot be undone');

    return {
        confirmAction: (callback, promptMessage = '') => {
            setAction(() => callback);
            setIsDialogVisible(true);
            promptMessage && setPromptMessage(promptMessage);
        },
        confirmationDialog: isDialogVisible ?
            createPortal(
                <ConfirmationDialog promptMessage={promptMessage} onProceed={() => {action(); setIsDialogVisible(false);}} onCancel={() => setIsDialogVisible(false)} />,
                document.body
            ) : null
    };
}

function ConfirmationDialog({promptMessage, onProceed, onCancel}) {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-50 grid place-items-center bg-black/15">
            <div className="bg-white w-[580px] py-5 px-6 rounded-lg flex flex-col gap-6">
                <h4 className="text-lg font-semibold">Are you sure?</h4>
                <p className="font-medium">{promptMessage}</p>
                <div className="flex gap-4">
                    <FormCustomButton onClick={onCancel} text={'Cancel'} color="gray" />
                    <FormCustomButton onClick={onProceed} text={'Confirm'} color="pink" />
                </div>
            </div>
        </div>
    );
}