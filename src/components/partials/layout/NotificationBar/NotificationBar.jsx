import './NotificationBar.css';

function NotificationBar() {
    return (
        <div className='bg-white px-8 py-4 text-sm items-center flex gap-4 has-vertical-dividers sticky top-0 z-10'>
            <div className='whitespace-nowrap'>
                <span className='text-text-pink'>24</span>
                {' '}unread notification
            </div>

            <div className='whitespace-nowrap'>
                <span className='text-text-pink'>350</span>
                {' '}assessments waiting to be completed
            </div>

            <div className='whitespace-nowrap'>
                <span className='text-text-pink'>20</span>
                {' '}issues outstanding
            
            </div>
            
            <div className='whitespace-nowrap'>
                <span className='text-text-pink'>15</span>
                {' '}policies
            
            </div>
            
            <div className='whitespace-nowrap'>
                <span className='text-text-pink'>5</span>
                {' '}tasks
            </div>
        </div>
    )
}

export default NotificationBar;