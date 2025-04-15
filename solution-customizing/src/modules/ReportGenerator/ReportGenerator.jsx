import React, { useState } from "react";
import "./styles/ReportGenerator.css";

const BodyContent = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [messages, setMessages] = useState([]); 
    const [inputText, setInputText] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchInput, setSearchInput] = useState(""); 

    // Sample chat history data grouped by time period
    const chatHistory = {
        today: [
            { id: 1, title: "Report Placeholder 1" }
        ],
        previous7Days: [
            { id: 2, title: "Report Placeholder 2" },
            { id: 3, title: "Report Placeholder 3" },
            { id: 4, title: "Report Placeholder 4" },
            { id: 5, title: "Report Placeholder 5" },
            { id: 6, title: "Report Placeholder 6" },
            { id: 7, title: "Report Placeholder 7" },
            { id: 8, title: "Report Placeholder 8" }
        ],
        previous30Days: [
            { id: 9, title: "Report Placeholder 9" },
            { id: 10, title: "Report Placeholder 10" },
            { id: 11, title: "Report Placeholder 11" },
            { id: 12, title: "Report Placeholder 12" },
            { id: 13, title: "Report Placeholder 13" }
        ]
    };

    // Filter chat history based on search input
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

    // Get filtered chat history
    const filteredChatHistory = filterChatHistory(chatHistory);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert("Copied to clipboard!"))
            .catch(err => console.error("Failed to copy:", err));
    };

    // Function to download all tables in a message as a single CSV
    const downloadAllTablesAsCSV = (message, filename = 'report-data.csv') => {
        if (!message || !message.tables || message.tables.length === 0) {
            alert("No data available to download");
            return;
        }
        
        let csvContent = "";
        
        // Add report title as header
        csvContent += message.title + "\n\n";
        
        // For each table in the message
        message.tables.forEach((table, index) => {
            // Add table title as a header
            csvContent += table.title + "\n";
            
            // Add table headers
            csvContent += table.headers.join(',') + "\n";
            
            // Add table rows
            table.rows.forEach(row => {
                csvContent += row.join(',') + "\n";
            });
            
            // Add a blank line between tables (except after the last table)
            if (index < message.tables.length - 1) {
                csvContent += "\n";
            }
        });
        
        // Add summary at the end
        if (message.title2 && message.text2) {
            csvContent += "\n" + message.title2 + "\n";
            csvContent += message.text2 + "\n";
        }
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSendMessage = () => {
        if (inputText.trim() !== "") {
            setMessages([...messages, { sender: "user", text: inputText, type: "text" }]);
            setInputText(""); 

            setTimeout(() => {
                const response = generateResponse(inputText);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    response
                ]);
            }, 1000); 
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInputText("");
    };

    const handleHistoryItemClick = (item) => { //page navigation placeholder
        alert(`Navigate to ${item.title} page`); 
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
                            ["Salaries", "1,500,000"]
                        ]
                    }
                ]
            };
        }
        return { sender: "bot", text: "I'm not sure how to answer that yet, but I'm learning!", type: "text" };
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
                                {Object.keys(filteredChatHistory).length > 0 ? (
                                    <>
                                        {filteredChatHistory.today && (
                                            <div className="history-section">
                                                <h3 className="history-period">Today</h3>
                                                <ul className="history-list">
                                                    {filteredChatHistory.today.map(chat => (
                                                        <li 
                                                            key={chat.id} 
                                                            className="history-item"
                                                            onClick={() => handleHistoryItemClick(chat)}
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
                                                            className="history-item"
                                                            onClick={() => handleHistoryItemClick(chat)}
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
                                                            className="history-item"
                                                            onClick={() => handleHistoryItemClick(chat)}
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
                                                    <div 
                                                        className="dl-icon-wrapper" 
                                                        onClick={() => downloadAllTablesAsCSV(msg, `${msg.title.replace(/\s+/g, '-').toLowerCase()}-report.csv`)}
                                                    >
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
                                placeholder="Ask anything"
                                className="text-input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(); 
                                    }
                                }}
                            />
                            <img
                                src="../../icons/repgen-icons/sendmsg.png"
                                className="sendmsg-icon"
                                onClick={handleSendMessage}
                                alt="Send"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BodyContent;