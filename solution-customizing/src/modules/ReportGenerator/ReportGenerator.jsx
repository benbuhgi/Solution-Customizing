import React, { useState } from "react";
import "./styles/ReportGenerator.css";

const BodyContent = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [messages, setMessages] = useState([]); // Store chat messages
    const [inputText, setInputText] = useState(""); // Store input text

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert("Copied to clipboard!"))
            .catch(err => console.error("Failed to copy:", err));
    };
    

    const handleSendMessage = () => {
        if (inputText.trim() !== "") {
            // Add user message to chat history
            setMessages([...messages, { sender: "user", text: inputText, type: "text" }]);
            setInputText(""); // Clear input field

            // Simulate bot response
            setTimeout(() => {
                const response = generateResponse(inputText);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    response
                ]);
            }, 1000); // Delay to mimic real chatbot behavior
        }
    };

    // Function to generate a bot response based on the prompt
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
                {/* Sidebar */}
                <div className={`sidebar-container ${isSidebarVisible ? "visible" : ""}`}>
                    {isSidebarVisible && (
                        <div className='sidebar-icons-ham-icon-wrapper' >
                            <div className="ham-menu-icon active" onClick={toggleSidebar}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className="srch-new-icon">
                                <img src="../../icons/repgen/search.png" alt="Search" className="search-icon"/>
                                <img src="../../icons/repgen/newchat.png" alt="New" className="newchat-icon"/>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
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

                    {/* Main Chat Area */}
                    <div className="main-content-container">
                        {/* Chat History */}
                        <div className="chat-history">
                            {messages.length === 0 ? (
                                <div className="welres-container">
                                    <h1 className="welc-text">Hello, Crusch K.</h1>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`chat-message ${msg.sender}`}>
                                        {msg.type === "text" ? (
                                            msg.text
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
                                                <div className="copy-icon-wrapper" onClick={() => copyToClipboard(`${msg.title}\n${msg.text2}`)}>
    <img 
        src="../../icons/repgen/copy.png" 
        alt="Copy" 
        className="copy-icon"
    />
    <span className="tooltip">Copy Summary</span>
</div>

                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>


                        {/* Input and Send Button */}
                        <div className="textbar-container">
                            <textarea
                                placeholder="Ask anything"
                                className="text-input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                            />
                            <img
                                src="../../icons/repgen/sendmsg.png"
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
