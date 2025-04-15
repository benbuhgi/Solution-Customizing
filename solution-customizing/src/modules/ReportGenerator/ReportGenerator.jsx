import React, { useState, useEffect, useRef } from "react";
import "./styles/ReportGenerator.css";

const BodyContent = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [messages, setMessages] = useState([]); 
    const [inputText, setInputText] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(101);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const authToken = "dummy-token";
    const textareaRef = useRef(null);

    // API base URL - would typically come from environment variables
    const API_BASE_URL = "https://api.example.com";

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        setError(null);
        try {
            // In a real app, this would be an actual API call
            // const response = await fetch(`${API_BASE_URL}/conversations`, {
            //   headers: { 'Authorization': `Bearer ${authToken}` }
            // });
            // const data = await response.json();
            
            // Mock API response
            const data = [
                { id: 1, user_id: 101, created_at: '2025-04-10T14:30:00Z', title: 'Financial Report - January 2024' },
                { id: 2, user_id: 101, created_at: '2025-04-12T09:15:00Z', title: 'Sales Analysis Q1 2025' },
                { id: 3, user_id: 101, created_at: '2025-04-13T16:45:00Z', title: 'Marketing Campaign Results' }
            ];
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        setIsLoadingMessages(true);
        try {
            // In a real app, this would be an actual API call
            // const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            //   headers: { 'Authorization': `Bearer ${authToken}` }
            // });
            // const data = await response.json();
            
            // Mock API response based on conversation ID
            let mockMessages = [];
            
            switch(conversationId) {
                case 1:
                    mockMessages = [
                        { sender: "user", text: "Show me the financial report for January 2024", type: "text" },
                        generateResponse("financial report")
                    ];
                    break;
                case 2:
                    mockMessages = [
                        { sender: "user", text: "What were the sales numbers for Q1 2025?", type: "text" },
                        { 
                            sender: "bot", 
                            type: "table", 
                            text: "Here are the sales numbers for Q1 2025:", 
                            title: "Sales Analysis: Q1 2025",
                            title2: "Summary",
                            text2: "Total Sales: PHP 8,750,000 | Growth Rate: 12% | Top Product: Model X-200",
                            tables: [
                                {
                                    title: "Quarterly Sales Breakdown",
                                    headers: ["Month", "Amount (PHP)", "Growth"],
                                    rows: [
                                        ["January", "2,500,000", "8%"],
                                        ["February", "2,800,000", "10%"],
                                        ["March", "3,450,000", "15%"],
                                        ["Total", "8,750,000", "12%"]
                                    ]
                                }
                            ]
                        }
                    ];
                    break;
                case 3:
                    mockMessages = [
                        { sender: "user", text: "Show results from the recent marketing campaign", type: "text" },
                        { 
                            sender: "bot", 
                            type: "table", 
                            text: "Here are the marketing campaign results:", 
                            title: "Marketing Campaign: Spring 2025",
                            title2: "Summary",
                            text2: "Total Reach: 1.2M | Conversion Rate: 4.5% | ROI: 3.2x",
                            tables: [
                                {
                                    title: "Campaign Metrics",
                                    headers: ["Metric", "Value"],
                                    rows: [
                                        ["Impressions", "1,200,000"],
                                        ["Clicks", "54,000"],
                                        ["Conversions", "2,430"],
                                        ["Cost", "PHP 850,000"],
                                        ["Revenue", "PHP 2,720,000"]
                                    ]
                                }
                            ]
                        }
                    ];
                    break;
                default:
                    mockMessages = [];
            }
            
            setMessages(mockMessages);
            setActiveConversationId(conversationId);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load conversation. Please try again.');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const createNewConversation = async () => {
        try {
            // In a real app, this would be an actual API call
            // const response = await fetch(`${API_BASE_URL}/conversations`, {
            //   method: 'POST',
            //   headers: { 
            //     'Authorization': `Bearer ${authToken}`,
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({ title: 'New Conversation' })
            // });
            // const newConversation = await response.json();
            
            // Mock API response
            const newConversation = {
                id: Math.max(0, ...conversations.map(c => c.id)) + 1,
                user_id: currentUserId,
                created_at: new Date().toISOString(),
                title: 'New Conversation'
            };
            
            setConversations([newConversation, ...conversations]);
            setMessages([]);
            setActiveConversationId(newConversation.id);
        } catch (err) {
            console.error('Error creating conversation:', err);
            setError('Failed to create new conversation. Please try again.');
        }
    };

    const saveMessage = async (conversationId, message) => {
        try {
            // In a real app, this would be an actual API call
            // const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            //   method: 'POST',
            //   headers: { 
            //     'Authorization': `Bearer ${authToken}`,
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify(message)
            // });
            // return await response.json();
            
            // In this mock implementation, we just return the message
            return message;
        } catch (err) {
            console.error('Error saving message:', err);
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
            const convDate = new Date(conversation.created_at);
            
            if (convDate >= today) {
                history.today.push({
                    id: conversation.id,
                    title: conversation.title,
                    active: activeConversationId === conversation.id
                });
            } else if (convDate >= sevenDaysAgo) {
                history.previous7Days.push({
                    id: conversation.id,
                    title: conversation.title,
                    active: activeConversationId === conversation.id
                });
            } else if (convDate >= thirtyDaysAgo) {
                history.previous30Days.push({
                    id: conversation.id,
                    title: conversation.title,
                    active: activeConversationId === conversation.id
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert("Copied to clipboard!"))
            .catch(err => console.error("Failed to copy:", err));
    };

    const handleSendMessage = async () => {
        if (inputText.trim() !== "") {
            const userMessage = { sender: "user", text: inputText, type: "text" };
            
            // If no active conversation, create one first
            if (!activeConversationId) {
                await createNewConversation();
            }
            
            // Save user message
            try {
                await saveMessage(activeConversationId, userMessage);
                setMessages([...messages, userMessage]);
                setInputText("");
                
                if (textareaRef.current) {
                    textareaRef.current.style.height = '30px';
                }

                // Generate and save bot response
                setTimeout(async () => {
                    const botResponse = generateResponse(inputText);
                    await saveMessage(activeConversationId, botResponse);
                    setMessages(prev => [...prev, botResponse]);
                }, 1000);
                
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message. Please try again.');
            }
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
        await createNewConversation();
        setIsSidebarVisible(false);
    };

    const generateResponse = (prompt) => {
        if (prompt.toLowerCase().includes("financial report")) {
            return {
                sender: "bot",
                type: "table",
                text: "Sure! Here's the financial report for January 2024 (excluding refunds). I've also included a downloadable Excel file for your reference. Let me know if you need any additional details or insights!",
                title: "Financial Report: January 2024 (Excluding Refunds)",
                title2: "Summary",
                text2: "Total Revenue: PHP 5,450,000 | Total Expenses: PHP 3,120,000 | Net Income: PHP 2,330,000 | Refunds Excluded: PHP 150,000",
                tables: [
                    {
                        title: "Revenue Breakdown",
                        headers: ["Category", "Amount (PHP)"],
                        rows: [
                            ["Product Sales", "4,500,000"],
                            ["Service Income", "750,000"],
                            ["Other Revenue", "200,000"],
                            ["Total", "5,450,000"]
                        ]
                    },
                    {
                        title: "Expense Breakdown",
                        headers: ["Category", "Amount (PHP)"],
                        rows: [
                            ["Salaries", "1,500,000"],
                            ["Marketing", "750,000"],
                            ["Office Expenses", "450,000"],
                            ["Utilities", "220,000"],
                            ["Miscellaneous", "200,000"],
                            ["Total", "3,120,000"]
                        ]
                    }
                ]
            };
        }
        return { sender: "bot", text: "I'm not sure how to answer that yet, but I'm learning!", type: "text" };
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
                                        <div className="ham-menu-icon active" onClick={toggleSidebar}>
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
                                                className="newchat-icon"
                                                onClick={startNewChat}
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
                                                            key={chat.id} 
                                                            className={`history-item ${chat.active ? 'active' : ''}`}
                                                            onClick={() => fetchMessages(chat.id)}
                                                        >
                                                            {chat.title}
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
                                                            key={chat.id} 
                                                            className={`history-item ${chat.active ? 'active' : ''}`}
                                                            onClick={() => fetchMessages(chat.id)}
                                                        >
                                                            {chat.title}
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
                                                            key={chat.id} 
                                                            className={`history-item ${chat.active ? 'active' : ''}`}
                                                            onClick={() => fetchMessages(chat.id)}
                                                        >
                                                            {chat.title}
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
                                <div className='sidebar-icons-ham-icon-wrapper' onClick={toggleSidebar}>
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
                                            <h1 className="welc-text">Hello, Crusch K.</h1>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <div key={index} className={`chat-message ${msg.sender}`}>
                                                {msg.type === "text" ? (
                                                    <div className="message-text">
                                                        {msg.text.split("\n").map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line}
                                                                <br />
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="chat-table-response">
                                                        <p className="res-head">{msg.text}</p>
                                                        <h3>{msg.title}</h3>
                                                        {msg.tables.map((table, i) => (
                                                            <div key={i}>
                                                                <h4>{table.title}</h4>
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
                                                                                {row.map((cell, l) => (
                                                                                    <td key={l}>{cell}</td>
                                                                                ))}
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ))}
                                                        <p className="res-foot">{msg.title2}</p>
                                                        <p className="foot-cont">{msg.text2}</p>
                                                        <div className="action-buttons">
                                                            <div className="copy-icon-wrapper" onClick={() => copyToClipboard(`${msg.title}\n${msg.text2}`)}>
                                                                <img src="../../icons/repgen-icons/copy.png" alt="Copy" className="copy-icon"/>
                                                                <span className={`tooltip ${index === messages.length - 1 ? 'right-aligned' : ''}`}>Copy Summary</span>
                                                            </div>
                                                            <div className="dl-icon-wrapper" onClick={() => downloadCSV(msg.tables[0], 'financial-report.csv')}>
                                                                <img src="../../icons/repgen-icons/download.png" alt="Download" className="download-icon"/>
                                                                <span className={`tooltip ${index === messages.length - 1 ? 'right-aligned' : ''}`}>Download CSV</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="textbar-container">
                                    <textarea
                                        ref={textareaRef}
                                        placeholder="Ask anything"
                                        className="text-input"
                                        value={inputText}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(); 
                                            }
                                        }}
                                        rows="1"
                                        style={{ height: '40px' }}
                                    />
                                    <img
                                        src="../../icons/repgen-icons/sendmsg.png"
                                        className="sendmsg-icon"
                                        onClick={handleSendMessage}
                                        alt="Send"
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