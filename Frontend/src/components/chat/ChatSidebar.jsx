import React from 'react';
import './ChatSidebar.css';


const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
  onRegister,
  open
}) => {


  
  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <button
            key={c.id}
            className={"chat-list-item " + (c.id === activeChatId ? 'active' : '')}
            onClick={() => onSelectChat(c.id)}
          >
            <span className="title-line">{c.title}</span>
          </button>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-auth-actions">
        <button className="sidebar-auth-btn sidebar-auth-btn-secondary" onClick={onRegister}>
          Register
        </button>
        <button className="sidebar-auth-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
