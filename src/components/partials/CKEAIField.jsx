import { CKEField } from "./Elements/Elements";

export default function CKEAIField({name, label, value, onChange, error, children}) {
    return (
        <div className='relative'>
            <CKEField {...{name, label, value, onChange: onChange, error}} />
            {children}
        </div>
    );
}