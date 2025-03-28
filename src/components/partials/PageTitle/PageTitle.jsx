import { useEffect } from 'react';
import styles from './PageTitle.module.css';

function PageTitle({title}) {
    useEffect(() => {
        document.title = title;
    }, [title]);
}

export default PageTitle;