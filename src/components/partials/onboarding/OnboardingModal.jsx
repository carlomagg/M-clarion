import { useState } from "react";
import { createPortal } from "react-dom";
import DialogOne from "./DialogOne";
import DialogTwo from "./DialogTwo";
import DialogThree from "./DialogThree";
import DialogFour from "./DialogFour";
import DialogFive from "./DialogFive";
import DialogSix from "./DialogSix";
import { set } from "lockr";

export default function OnboardingModal({onRemoveModal}) {
    const [presentStep, setPresentStep] = useState(0);

    function handleRemoveModal() {
        set('isOnboardingTourShown', true);
        onRemoveModal();
    }

    const steps = [
        <DialogOne onSkipTourClicked={handleRemoveModal} onStartTourClicked={() => setPresentStep(1)} />,
        <DialogTwo onBackClicked={() => setPresentStep(0)} onNextClicked={() => setPresentStep(2)} />,
        <DialogThree onBackClicked={() => setPresentStep(1)} onNextClicked={() => setPresentStep(3)} />,
        <DialogFour onBackClicked={() => setPresentStep(2)} onNextClicked={() => setPresentStep(4)} />,
        <DialogFive onBackClicked={() => setPresentStep(3)} onNextClicked={() => setPresentStep(5)} />,
        <DialogSix onBackClicked={() => setPresentStep(4)} onDoneClicked={handleRemoveModal} />,
    ];

    return createPortal(
        <div className="fixed top-0 left-0 w-full h-full z-[9999] grid place-items-center bg-black/25">
            <DialogContainer>
                {steps[presentStep]}
            </DialogContainer>
        </div>,
        document.body
    )
}

export function DialogContainer({children}) {
    return (
        <div className="bg-white w-[768px] rounded-2xl p-16 shadow-[0px_2px_3px_#0000004D,_0px_6px_10px_4px_#00000026] bg-gradient-to-tr from-text-pink/25 to-text-pink/10">
            {children}
        </div>
    );
}
