import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo, Underline, Alignment, List, Heading} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './spacer-plugin.css';
import './custom.css';
import SpacerPlugin from './SpacerPlugin';

function CustomCKEditor({name, value, onChange}) {
    return (
        <CKEditor
            editor={ ClassicEditor }
            data={value}
            onChange={(e, editor) => {
                onChange({target: {name, value: editor.getData()}});
            }}
            config={ {
                toolbar: {
                    items: [
                        'bold',
                        'italic',
                        'underline',
                        '|',
                        'spacer',
                        'heading',
                        'spacer',
                        '|',
                        'alignment',
                        '|',
                        {
                            label: 'Insert',
                            icon: 'plus',
                            items: ['bulletedList', 'numberedList']
                        },
                        '|',
                        'undo',
                        'redo'
                ],
                },
                plugins: [
                    Bold, Essentials, Italic, Mention, Paragraph, Heading, Undo, Underline, Alignment, List, SpacerPlugin
                ],
                // initialData: '<p>Hello from CKEditor 5 in React!</p>',
                removePlugins: ['Logo'],
            } }
        />
    );
}

export default CustomCKEditor;
