import React, { useState, useEffect, useRef, memo } from "react";
import "./styles/ReportGenerator.css";

const ChatMessage = memo(({ msg, index, messagesLength, downloadCSV }) => {
    const renderCellContent = (cell) => {
        if (typeof cell === 'object' && cell !== null) {
            return JSON.stringify(cell);
        }
        return cell;
    };

    return (
        <div key={msg.id || index} className={`chat-message ${msg.sender}`}>
            {msg.type === "text" ? (
                <div className="message-text">
                    {msg.isLoading ? (
                        <span className="loading-dots">...</span>
                    ) : (
                        msg.text.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))
                    )}
                </div>
            ) : (
                <div className="chat-table-response">
                    <p className="res-head">{msg.text}</p>
                    {msg.tables && msg.tables.map((table, i) => (
                        <div key={i} className="table-scroll-wrapper">
                            <table className="chat-table">
                                <thead>
                                    <tr>
                                        {table.headers.map((header, j) => (
                                            <th key={j}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {table.rows.map((row, k) => (
                                        <tr key={k}>
                                            {Array.isArray(row) ? row.map((cell, l) => (
                                                <td key={l}>{renderCellContent(cell)}</td>
                                            )) : (
                                                <td colSpan={table.headers.length}>Invalid row data</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                    <div className="action-buttons">
                        {msg.tables && msg.tables.length > 0 && (
                            <div className="dl-icon-wrapper" onClick={() => downloadCSV(msg.tables[0], 'report-data.csv')}>
                                <img src="../../icons/repgen-icons/download.png" alt="Download" className="download-icon"/>
                                <span className={`tooltip ${index === messagesLength - 1 ? 'right-aligned' : ''}`}>Download CSV</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

const BodyContent = ({employee_id}) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [messages, setMessages] = useState([]); 
    const [inputText, setInputText] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [isBotResponding, setIsBotResponding] = useState(false);
    const [userName, setUserName] = useState(employee_id || '');
    const [editingConvoId, setEditingConvoId] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const textareaRef = useRef(null);

    const API_BASE_URL = "http://127.0.0.1:8000/";

    const updateConversationTitle = async (conversationId, newTitle) => {
        try {
            const response = await fetch(`${API_BASE_URL}chatbot/update_title/${conversationId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Failed to update title'}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Error updating conversation title:', err);
            throw err;
        }
    };

    const handleEditClick = (convoId, currentTitle) => {
        setEditingConvoId(convoId);
        setNewTitle(currentTitle);
    };

    const handleTitleUpdate = async (convoId) => {
        if (!newTitle.trim()) {
            setError("Title cannot be empty");
            return;
        }

        try {
            await updateConversationTitle(convoId, newTitle.trim());
            
            setConversations(prev => prev.map(conv => 
                conv.convo_id === convoId 
                    ? { ...conv, title: newTitle.trim() }
                    : conv
            ));
            
            setEditingConvoId(null);
            setNewTitle('');
        } catch (err) {
            setError(`Failed to update title: ${err.message}`);
        }
    };

    const cancelEdit = () => {
        setEditingConvoId(null);
        setNewTitle('');
    };

    useEffect(() => {
        if (employee_id) {
            fetchUserName();
            fetchConversations();
        }
    }, [employee_id]); 
    
    const fetchUserName = async () => {
        if (!employee_id) return;
        try {
            const response = await fetch(`${API_BASE_URL}chatbot/load_user_details/${employee_id}/`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'User details not found'}`);
            }
            const userData = await response.json();
            setUserName(userData.first_name || employee_id || 'User');
        } catch (err) {
            console.error("Failed to fetch user name:", err);
            setUserName(employee_id || 'User');
        }
    };

    const fetchConversations = async () => {
        if (!employee_id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}chatbot/load_conversations/${employee_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const formattedConversations = data.map(conv => {
                let title = conv.conversation_title;
                if (!title) {
                    const parts = conv.conversation_id.split('_');
                    title = `Convo ${parts[1] ? parts[1].substring(0, 8) : conv.conversation_id.substring(0, 8)}`;
                }
                return {
                    convo_id: conv.conversation_id,
                    employee_id: conv.employee_id,
                    created_at: conv.started_at,
                    updated_at: conv.updated_at,
                    title: title
                };
            });

            setConversations(formattedConversations);       
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(`Failed to load conversations: ${err.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        setIsLoadingMessages(true);
        setError(null);
        setMessages([]);
        setActiveConversationId(conversationId);
        console.log("Fetching messages for conversation ID:", conversationId);

        const TABLE_DATA_MARKER = "[TABLE_DATA]:";

        try {
            const response = await fetch(`${API_BASE_URL}chatbot/load_messages/${conversationId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Failed to fetch'}`);
            }

            const data = await response.json();
            const formattedMessages = data.map(msg => {
                let messageType = "text";
                let tablesData = null;
                let originalSqlQuery = msg.sql_query;

                if (msg.sql_query && msg.sql_query.startsWith(TABLE_DATA_MARKER)) {
                    try {
                        const tableJsonString = msg.sql_query.substring(TABLE_DATA_MARKER.length);
                        tablesData = JSON.parse(tableJsonString);
                        messageType = "table";
                        originalSqlQuery = null;
                    } catch (parseError) {
                        console.error("Failed to parse table data from fetched sql_query:", parseError, "for message:", msg.message_id);
                        messageType = "text";
                        tablesData = null;
                    }
                }

                return {
                    id: msg.message_id,
                    sender: msg.sender,
                    text: msg.message,
                    type: messageType,
                    tables: tablesData,
                    sql_query: originalSqlQuery
                };
            });

            setMessages(formattedMessages);

        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(`Failed to load conversation: ${err.message}. Please select another or try again.`);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const createNewConversation = async () => {
        if (!employee_id) {
            setError("Employee ID is missing, cannot create conversation.");
            throw new Error("Employee ID is missing.");
        }
        setError(null);
        setIsCreatingConversation(true);
        console.log("Creating new conversation for employee ID:", employee_id);
        try {
            const response = await fetch(`${API_BASE_URL}chatbot/create_conversation/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    employee_id: employee_id
                }) 
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Failed to create conversation'}`);
            }
            
            const newConversationData = await response.json();
            let title = newConversationData.conversation_title;
            if (!title) {
                 const parts = newConversationData.conversation_id.split('_');
                 title = `Convo ${parts[1] ? parts[1].substring(0, 8) : newConversationData.conversation_id.substring(0, 8)}`;
            }
            const formattedNewConversation = {
                convo_id: newConversationData.conversation_id,
                employee_id: newConversationData.employee_id,
                created_at: newConversationData.started_at,
                updated_at: newConversationData.updated_at,
                title: title
            };

            setConversations(prev => [formattedNewConversation, ...prev]);
            setMessages([]);
            setActiveConversationId(formattedNewConversation.convo_id);

            return formattedNewConversation; 
        } catch (err) {
            console.error('Error creating conversation:', err);
            setError(`Failed to create new conversation: ${err.message}. Please try again.`);
            throw err; 
        } finally {
            setIsCreatingConversation(false);
        }
    };

    const saveMessage = async (conversationId, messageData) => {
        if (!conversationId) {
            console.error("Cannot save message without an active conversation ID.");
            throw new Error("No active conversation selected.");
        }

        const TABLE_DATA_MARKER = "[TABLE_DATA]:";

        try {
            const payload = {
                sender: messageData.sender,
                message: messageData.text,
                sql_query: messageData.sql_query || null
            };

            if (messageData.type === 'table' && messageData.tables) {
                try {
                    const tableJsonString = JSON.stringify(messageData.tables);
                    payload.sql_query = TABLE_DATA_MARKER + tableJsonString;
                } catch (jsonError) {
                    console.error("Failed to stringify table data:", jsonError);
                    payload.sql_query = null;
                }
            }

            const response = await fetch(`${API_BASE_URL}chatbot/create_message/${conversationId}/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Response:", errorData);
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Failed to save message'}`);
            }

            const savedMessage = await response.json();

            let messageType = "text";
            let tablesData = null;
            let originalSqlQuery = savedMessage.sql_query;

            if (savedMessage.sql_query && savedMessage.sql_query.startsWith(TABLE_DATA_MARKER)) {
                try {
                    const tableJsonString = savedMessage.sql_query.substring(TABLE_DATA_MARKER.length);
                    tablesData = JSON.parse(tableJsonString);
                    messageType = "table";
                    originalSqlQuery = null;
                } catch (parseError) {
                    console.error("Failed to parse table data from sql_query:", parseError);
                    messageType = "text";
                    tablesData = null;
                }
            }

            return {
                id: savedMessage.message_id,
                sender: savedMessage.sender,
                text: savedMessage.message,
                type: messageType,
                tables: tablesData,
                sql_query: originalSqlQuery,
                conversation_title: savedMessage.conversation_title
            };

        } catch (err) {
            console.error('Error saving message via API:', err);
            throw err;
        }
    };

    const formatChatHistory = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        
        const history = {
            today: [],
            previous7Days: [],
            previous30Days: []
        };
        
        conversations.forEach(conversation => {
            const convDate = new Date(conversation.updated_at); 
            
            if (convDate >= today) {
                history.today.push({
                    convo_id: conversation.convo_id,
                    title: conversation.title,
                    active: activeConversationId === conversation.convo_id
                });
            } else if (convDate >= sevenDaysAgo) {
                history.previous7Days.push({
                    convo_id: conversation.convo_id,
                    title: conversation.title,
                    active: activeConversationId === conversation.convo_id
                });
            } else if (convDate >= thirtyDaysAgo) {
                history.previous30Days.push({
                    convo_id: conversation.convo_id,
                    title: conversation.title,
                    active: activeConversationId === conversation.convo_id
                });
            }
        });
        
        return history;
    };
    
    const chatHistory = formatChatHistory();

    const filterChatHistory = (history) => {
        if (!searchInput.trim()) return history;

        const searchTerm = searchInput.toLowerCase();
        return Object.keys(history).reduce((filtered, period) => {
            const filteredItems = history[period].filter(item => 
                item.title.toLowerCase().includes(searchTerm))
            if (filteredItems.length > 0) {
                filtered[period] = filteredItems;
            }
            return filtered;
        }, {});
    };

    const filteredChatHistory = filterChatHistory(chatHistory);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const getBotResponse = async (userMessageText, currentConversationId) => {
        if (!currentConversationId) {
            console.error("Cannot get bot response without a conversation ID.");
            throw new Error("Conversation ID is missing.");
        }

        try {
            const response = await fetch(`${API_BASE_URL}chatbot/respond/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessageText,
                    conversation_id: currentConversationId
                 })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Chatbot API error! status: ${response.status} - ${errorData.error || 'Failed to get response'}`);
            }

            const botData = await response.json();
            return botData;

        } catch (err) {
            console.error('Error fetching bot response:', err);
            throw err;
        }
    };

    const handleSendMessage = async () => {
        const trimmedInput = inputText.trim();
        if (trimmedInput === "" || isBotResponding || !activeConversationId) return;

        let currentConversationId = activeConversationId;

        if (!currentConversationId) {
            try {
                const newConvData = await createNewConversation(); 
                currentConversationId = newConvData.convo_id;
                 if (!currentConversationId) {
                     throw new Error("Failed to retrieve conversation ID after creation.");
                 }
            } catch (err) {
                 console.error('Error creating new conversation within send:', err);
                 return; 
            }
        }

        const userMessage = { 
            id: `temp-${Date.now()}`,
            sender: "user", 
            text: trimmedInput, 
            type: "text" 
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        if (textareaRef.current) {
            textareaRef.current.style.height = '40px'; 
        }

        try {
            const messageToSend = { sender: "user", text: trimmedInput };
            const savedUserMessage = await saveMessage(currentConversationId, messageToSend);
            
            setMessages(prev => prev.map(msg => 
                msg.id === userMessage.id ? { ...savedUserMessage, type: "text" } : msg
            ));

        } catch (userSaveErr) {
            console.error('Error sending user message:', userSaveErr);
            setError(`Failed to send message: ${userSaveErr.message}. Please try again.`);
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        } 

        setIsBotResponding(true);
        try {
            const thinkingMessage = {
                id: `temp-bot-thinking-${Date.now()}`,
                sender: 'bot',
                text: '...',
                type: 'text', 
                isLoading: true
            };
            setMessages(prev => [...prev, thinkingMessage]);

            const botApiResponse = await getBotResponse(trimmedInput, activeConversationId);

            setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

            let botText = botApiResponse.response || "Sorry, I couldn't generate a response.";
            let botMessageType = "text";
            let botTableData = null;
            let botSqlQuery = botApiResponse.sql_query || null;

            if (botApiResponse.sql_error) {
                botText += `\n\n[Error executing SQL: ${botApiResponse.sql_error}]`;
            }

            if (botApiResponse.data && botApiResponse.data.headers && botApiResponse.data.rows) {
                 botMessageType = "table";
                 botTableData = botApiResponse.data;
            }

            const botMessageDataForSaving = {
                sender: "bot",
                text: botText,
                type: botMessageType,
                sql_query: botSqlQuery,
                tables: botMessageType === 'table' ? [{
                    headers: botTableData.headers,
                    rows: botTableData.rows
                }] : null
            };

            const savedBotMessageResult = await saveMessage(currentConversationId, botMessageDataForSaving);

            if (savedBotMessageResult.conversation_title) {
                setConversations(prevConvos =>
                    prevConvos.map(conv =>
                        conv.convo_id === currentConversationId
                            ? { ...conv, title: savedBotMessageResult.conversation_title }
                            : conv
                    )
                );
            }

            const finalBotMessageForUI = {
                id: savedBotMessageResult.id,
                sender: savedBotMessageResult.sender,
                text: savedBotMessageResult.text,
                type: botMessageType,
                ...(botMessageType === "table" && botTableData && {
                    tables: [{
                        title: savedBotMessageResult.text,
                        headers: botTableData.headers,
                        rows: botTableData.rows
                    }]
                })
            };
            setMessages(prev => [...prev, finalBotMessageForUI]);

        } catch (botProcessingErr) {
            console.error('Error processing bot response:', botProcessingErr);
             setMessages(prev => prev.filter(msg => !msg.isLoading)); 
            const errorBotMessage = {
                id: `error-bot-${Date.now()}`,
                sender: 'bot',
                text: `Sorry, I encountered an error: ${botProcessingErr.message}`,
                type: 'text'
            };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsBotResponding(false);
        }
    };

    const archiveConversation = async (conversationIdToArchive) => {
        if (isBotResponding) {
            console.warn("Cannot archive conversation while bot is responding.");
            return; 
        }

        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}chatbot/archive_conversation/${conversationIdToArchive}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Failed to archive conversation'}`);
            }

            console.log(`Conversation ${conversationIdToArchive} archived successfully.`);

            setConversations(prev => prev.filter(conv => conv.convo_id !== conversationIdToArchive));

            if (activeConversationId === conversationIdToArchive) {
                setMessages([]);
                setActiveConversationId(null);
            }

        } catch (err) {
            console.error('Error archiving conversation:', err);
            setError(`Failed to archive conversation: ${err.message}. Please try again.`);
        }
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                100
            )}px`;
        }
    };

    const startNewChat = async () => {
        try {
            await createNewConversation();
            setIsSidebarVisible(false);
        } catch (err) {
            console.log("Failed to start new chat from button click.");
        }
    };

    const downloadCSV = (data, filename = 'report-data.csv') => {
        if (!data || !data.headers || !data.rows || data.rows.length === 0) {
            return;
        }
        
        const header = data.headers.join(',');
        const rows = data.rows.map(row => row.join(','));
        const csvContent = [header, ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="repgen">
            <div className="body-content-container">
                <div className={`sidebar-container ${isSidebarVisible ? "visible" : ""}`}>
                    {isSidebarVisible && (
                        <div className="sidebar-content-wrapper">
                            {isSearchVisible ? (
                                <div className={`search-bar-container ${isSearchVisible ? "visible" : ""}`}
                                    onTransitionEnd={() => !isSearchVisible && setSearchInput("")}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="search-input"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                    <div className="ham-menu-icon active" onClick={() => setIsSearchVisible(false)}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            ) : (
                                <div className='sidebar-header'>
                                    <div className="sidebar-icons-ham-icon-wrapper">
                                        <div 
                                            className={`ham-menu-icon active ${isBotResponding || isCreatingConversation  ? 'disabled' : ''}`} 
                                            onClick={!(isBotResponding || isCreatingConversation) ? toggleSidebar : undefined}
                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 }} 
                                        >
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <div className="srch-new-icon">
                                        <img 
                                                src="../../icons/repgen-icons/search.png" 
                                                alt="Search" 
                                                className="search-icon"
                                                onClick={() => setIsSearchVisible(true)}
                                            />
                                            <img 
                                                src="../../icons/repgen-icons/newchat.png" 
                                                alt="New" 
                                                className={`newchat-icon ${isBotResponding || isCreatingConversation ? 'disabled' : ''}`}
                                                onClick={!(isBotResponding || isCreatingConversation) ? startNewChat : undefined}
                                                style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="sidebar-content">
                                {loading ? (
                                    <div className="loading-message">Loading conversations...</div>
                                ) : error ? (
                                    <div className="error-message">{error}</div>
                                ) : Object.keys(filteredChatHistory).length > 0 ? (
                                    <>
                                        {filteredChatHistory.today && (
                                            <div className="history-section">
                                                <h3 className="history-period">Today</h3>
                                                <ul className="history-list">
                                                    {filteredChatHistory.today.map(chat => (
                                                        <li 
                                                        key={chat.convo_id} 
                                                        className={`history-item ${chat.active ? 'active' : ''} ${editingConvoId === chat.convo_id ? 'editing' : ''}`}
                                                        style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 
                                                        }} 
                                                    >
                                                        {editingConvoId === chat.convo_id ? (
                                                            <div className="title-edit-container" style={{ display: 'flex', flexGrow: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={newTitle}
                                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                                    className="title-edit-input"
                                                                    style={{ flexGrow: 1 }}
                                                                />
                                                                <div className="edit-actions">
                                                                    <div 
                                                                        className="confirm-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? () => handleTitleUpdate(chat.convo_id) : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/confirm.png" alt="Confirm" />
                                                                    </div>
                                                                    <div 
                                                                        className="cancel-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? cancelEdit : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/cancel.png" alt="Cancel" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span 
                                                                    onClick={!(isBotResponding || isCreatingConversation) ? () => fetchMessages(chat.convo_id) : undefined}
                                                                    style={{ 
                                                                        flexGrow: 1, 
                                                                        cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', 
                                                                        paddingRight: '10px', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis', 
                                                                        whiteSpace: 'nowrap' 
                                                                    }}
                                                                >
                                                                    {chat.title}
                                                                </span>
                                                                {editingConvoId !== chat.convo_id && (
                                                                    <>
                                                                        <img
                                                                            src="../../icons/repgen-icons/edit.png" 
                                                                            alt="Edit"
                                                                            className={`edit-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { 
                                                                                e.stopPropagation(); 
                                                                                handleEditClick(chat.convo_id, chat.title); 
                                                                            } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '24px', height: '24px', flexShrink: 0 }}
                                                                        />
                                                                        <img
                                                                            src="../../icons/repgen-icons/archive.png" 
                                                                            alt="Archive"
                                                                            className={`archive-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { e.stopPropagation(); archiveConversation(chat.convo_id); } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '19px', height: '19px', flexShrink: 0 }}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {filteredChatHistory.previous7Days && (
                                            <div className="history-section">
                                                <h3 className="history-period">Previous 7 Days</h3>
                                                <ul className="history-list">
                                                    {filteredChatHistory.previous7Days.map(chat => (
                                                        <li 
                                                        key={chat.convo_id} 
                                                        className={`history-item ${chat.active ? 'active' : ''} ${editingConvoId === chat.convo_id ? 'editing' : ''}`}
                                                        style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 
                                                        }} 
                                                    >
                                                        {editingConvoId === chat.convo_id ? (
                                                            <div className="title-edit-container" style={{ display: 'flex', flexGrow: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={newTitle}
                                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                                    className="title-edit-input"
                                                                    style={{ flexGrow: 1 }}
                                                                />
                                                                <div className="edit-actions">
                                                                    <div 
                                                                        className="confirm-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? () => handleTitleUpdate(chat.convo_id) : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/confirm.png" alt="Confirm" />
                                                                    </div>
                                                                    <div 
                                                                        className="cancel-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? cancelEdit : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/cancel.png" alt="Cancel" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span 
                                                                    onClick={!(isBotResponding || isCreatingConversation) ? () => fetchMessages(chat.convo_id) : undefined}
                                                                    style={{ 
                                                                        flexGrow: 1, 
                                                                        cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', 
                                                                        paddingRight: '10px', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis', 
                                                                        whiteSpace: 'nowrap' 
                                                                    }}
                                                                >
                                                                    {chat.title}
                                                                </span>
                                                                {editingConvoId !== chat.convo_id && (
                                                                    <>
                                                                        <img
                                                                            src="../../icons/repgen-icons/edit.png" 
                                                                            alt="Edit"
                                                                            className={`edit-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { 
                                                                                e.stopPropagation(); 
                                                                                handleEditClick(chat.convo_id, chat.title); 
                                                                            } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '24px', height: '24px', flexShrink: 0 }}
                                                                        />
                                                                        <img
                                                                            src="../../icons/repgen-icons/archive.png" 
                                                                            alt="Archive"
                                                                            className={`archive-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { e.stopPropagation(); archiveConversation(chat.convo_id); } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '19px', height: '19px', flexShrink: 0 }}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {filteredChatHistory.previous30Days && (
                                            <div className="history-section">
                                                <h3 className="history-period">Previous 30 Days</h3>
                                                <ul className="history-list">
                                                    {filteredChatHistory.previous30Days.map(chat => (
                                                        <li 
                                                        key={chat.convo_id} 
                                                        className={`history-item ${chat.active ? 'active' : ''} ${editingConvoId === chat.convo_id ? 'editing' : ''}`}
                                                        style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 
                                                        }} 
                                                    >
                                                        {editingConvoId === chat.convo_id ? (
                                                            <div className="title-edit-container" style={{ display: 'flex', flexGrow: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={newTitle}
                                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                                    className="title-edit-input"
                                                                    style={{ flexGrow: 1 }}
                                                                />
                                                                <div className="edit-actions">
                                                                    <div 
                                                                        className="confirm-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? () => handleTitleUpdate(chat.convo_id) : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/confirm.png" alt="Confirm" />
                                                                    </div>
                                                                    <div 
                                                                        className="cancel-edit-icon"
                                                                        onClick={!(isBotResponding || isCreatingConversation) ? cancelEdit : undefined}
                                                                    >
                                                                        <img src="../../icons/repgen-icons/cancel.png" alt="Cancel" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span 
                                                                    onClick={!(isBotResponding || isCreatingConversation) ? () => fetchMessages(chat.convo_id) : undefined}
                                                                    style={{ 
                                                                        flexGrow: 1, 
                                                                        cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', 
                                                                        paddingRight: '10px', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis', 
                                                                        whiteSpace: 'nowrap' 
                                                                    }}
                                                                >
                                                                    {chat.title}
                                                                </span>
                                                                {editingConvoId !== chat.convo_id && (
                                                                    <>
                                                                        <img
                                                                            src="../../icons/repgen-icons/edit.png" 
                                                                            alt="Edit"
                                                                            className={`edit-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { 
                                                                                e.stopPropagation(); 
                                                                                handleEditClick(chat.convo_id, chat.title); 
                                                                            } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '24px', height: '24px', flexShrink: 0 }}
                                                                        />
                                                                        <img
                                                                            src="../../icons/repgen-icons/archive.png" 
                                                                            alt="Archive"
                                                                            className={`archive-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                                                            onClick={!(isBotResponding || isCreatingConversation) ? (e) => { e.stopPropagation(); archiveConversation(chat.convo_id); } : undefined}
                                                                            style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', width: '19px', height: '19px', flexShrink: 0 }}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-results">No matching reports found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="sidebar-main-separator">
                    <div className="navbar-main-separator">
                        <div className='navbar-container'>
                            {!isSidebarVisible && (
                                <div 
                                    className={`sidebar-icons-ham-icon-wrapper ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                    onClick={!(isBotResponding || isCreatingConversation) ? toggleSidebar : undefined}
                                    style={{ cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer', opacity: (isBotResponding || isCreatingConversation) ? 0.6 : 1 }} 
                                >
                                    <div className="ham-menu-icon">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="main-content-container">
                        {isLoadingMessages ? (
                            <div className="loading-message">Loading conversation...</div>
                        ) : (
                            <>
                                <div className="chat-history">
                                    {messages.length === 0 ? (
                                        <div className="welres-container">
                                            <h1 className="welc-text">Hello {userName}</h1>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <ChatMessage
                                                key={msg.id || index}
                                                msg={msg}
                                                index={index}
                                                messagesLength={messages.length}
                                                downloadCSV={downloadCSV}
                                            />
                                        ))
                                    )}
                                </div>

                                <div className="textbar-container">
                                    <textarea
                                        ref={textareaRef}
                                        placeholder={(isBotResponding || isCreatingConversation) ? "Processing..." : "Ask anything"}
                                        className="text-input"
                                        value={inputText}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey && !(isBotResponding || isCreatingConversation)) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        rows="1"
                                        style={{ height: '40px' }}
                                        disabled={isBotResponding || isCreatingConversation}
                                    />
                                    <img
                                        src="../../icons/repgen-icons/sendmsg.png"
                                        className={`sendmsg-icon ${(isBotResponding || isCreatingConversation) ? 'disabled' : ''}`} 
                                        onClick={!(isBotResponding || isCreatingConversation) ? handleSendMessage : undefined} 
                                        alt="Send"
                                        style={{ opacity: (isBotResponding || isCreatingConversation) ? 0.5 : 1, cursor: (isBotResponding || isCreatingConversation) ? 'not-allowed' : 'pointer' }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BodyContent;