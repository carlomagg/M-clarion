import { useEffect, useRef, useState } from "react";

export default function NotificationsCenter() {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function removeMenu(e) {
            if (!containerRef.current.contains(e.target)) setIsExpanded(false);
        }

        // when menu is expanded, collpase it when a part of the window without it is clicked
        if (isExpanded) document.addEventListener('click', removeMenu)
        return () => {
            document.removeEventListener('click', removeMenu);
        }
    }, [isExpanded, containerRef.current]);

    const notifications = [
        {title: '5 pending approvals', date: 'Feb 4', isRead: false},
        {title: '7 unread announcements', date: 'Feb 4', isRead: false},
        {title: '3 Pending risk related tasks', date: 'Feb 4', isRead: false},
        {title: '4 Pending policy attestations', date: 'Feb 4', isRead: true},
    ];

    const unreadNotis = notifications.filter(n => n.isRead === false);

    return (
        <div className='relative self-end' ref={containerRef}>
            <button type="button" className='' onClick={() => setIsExpanded(!isExpanded)}>
                <NotificationBell count={unreadNotis.length} />
            </button>
            {
                isExpanded &&
                <div className='py-4 px-8 border border-[#CCC] rounded-md absolute mt-2 right-0 top-full z-50 bg-white w-[485px]'>
                    <header className='flex justify-between items-center mb-1'>
                        <h3 className='font-bold text-text-pink text-sm'>Notifications</h3>
                        <button type="button" className='text-[#6D6D6D] text-xs'>Mark all read</button>
                    </header>
                    <ul>
                        {
                            notifications.map(notification => {
                                return (
                                    <li key={notification.title}>
                                        <button type="button" className='flex justify-between p-2 w-full rounded-md hover:bg-slate-400/20'>
                                            <div className='space-y-2'>
                                                <p className='text-sm text-[#3D3D3D]'>{notification.title}</p>
                                                <p className='text-xs text-[#6D6D6D] text-left'>{notification.date}</p>
                                            </div>
                                            {
                                                notification.isRead === false &&
                                                <span className='w-3 h-3 rounded-full inline-block bg-text-pink self-center'></span>
                                            }
                                        </button>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    );
}

function NotificationBell({ count = 0 }) {
  const showUnread = count > 0;

  return (
    <div style={{ position: "relative", width: "fit-content" }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 16 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.8333 13.167V8.83366C13.4167 8.91699 13 9.00033 12.5833 9.00033H12.1667V14.0003H3.83333V8.16699C3.83333 5.83366 5.66667 4.00033 8 4.00033C8.08333 2.91699 8.58333 2.00033 9.25 1.25033C9 0.916992 8.5 0.666992 8 0.666992C7.08333 0.666992 6.33333 1.41699 6.33333 2.33366V2.58366C3.83333 3.33366 2.16667 5.58366 2.16667 8.16699V13.167L0.5 14.8337V15.667H15.5V14.8337L13.8333 13.167ZM6.33333 16.5003C6.33333 17.417 7.08333 18.167 8 18.167C8.91667 18.167 9.66667 17.417 9.66667 16.5003H6.33333ZM15.5 4.41699C15.5 6.00033 14.1667 7.33366 12.5833 7.33366C11 7.33366 9.66667 6.00033 9.66667 4.41699C9.66667 2.83366 11 1.50033 12.5833 1.50033C14.1667 1.50033 15.5 2.83366 15.5 4.41699Z"
          fill="#838280"
        />
      </svg>
      {showUnread && (
        <div
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            backgroundColor: "red",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {count}
        </div>
      )}
    </div>
  );
};