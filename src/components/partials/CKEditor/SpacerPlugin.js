// spacerplugin.js
// import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { ButtonView, IconView, Plugin, ViewEmptyElement } from 'ckeditor5';

export default class SpacerPlugin extends Plugin {
    init() {
        const editor = this.editor;

        // Add a spacer to the toolbar
        editor.ui.componentFactory.add( 'spacer', () => {
            // const view = new ButtonView();
            const view = new IconView();

            // Empty button with no icon and no label (acts as a spacer)
            view.set( {
                label: 'Spacer',
                withText: true,
                tooltip: false
            });

            // Apply custom styles to make the button act like a blank space
            view.extendTemplate( {
                attributes: {
                    class: 'ck-toolbar-spacer'
                }
            });

            return view;
        });
    }
}
