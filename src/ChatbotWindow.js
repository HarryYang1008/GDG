import React, { useState } from "react";
import "./ChatbotWindow.css";
import ReactMarkdown from "react-markdown";
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const ChatbotWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "👋 Hello! You can upload a `.ics` file or just chat with me.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  // 解析 .ics 日历文件
  const parseICS = async (icsData) => {
    try {
      const events = [];
      const lines = icsData.split("\n");
      let currentEvent = {};

      for (let line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
          currentEvent = {};
        } else if (line.startsWith("SUMMARY:")) {
          currentEvent.summary = line.replace("SUMMARY:", "").trim();
        } else if (line.startsWith("DTSTART:")) {
          currentEvent.start = line.replace("DTSTART:", "").trim();
        } else if (line.startsWith("DTEND:")) {
          currentEvent.end = line.replace("DTEND:", "").trim();
        } else if (line.startsWith("LOCATION:")) {
          currentEvent.location = line.replace("LOCATION:", "").trim();
        } else if (line.startsWith("DESCRIPTION:")) {
          currentEvent.description = line.replace("DESCRIPTION:", "").trim();
        } else if (line.startsWith("END:VEVENT")) {
          events.push(currentEvent);
        }
      }

      return events;
    } catch (error) {
      console.error("❌ Failed to parse .ics file:", error);
      return [];
    }
  };

  // 处理 .ics 文件上传
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const icsData = e.target.result;
      const events = await parseICS(icsData);

      if (events.length === 0) {
        setMessages((prevMessages) => [...prevMessages, { text: "📭 Your calendar is empty!", sender: "bot" }]);
        return;
      }

      // 整理事件
      const eventsSummary = events.map(e => `📅 ${e.summary} \n🕒 ${e.start} - ${e.end} \n📍 ${e.location || "No location"}`).join("\n\n");

      setMessages((prevMessages) => [...prevMessages, { text: "✅ Calendar parsing successful, analyzing schedule...", sender: "bot" }]);

      // 发送到 OpenAI API 进行日程优化
      await sendToOpenAI(`The following is my schedule. Please analyze my busyness and provide optimization suggestions:\n${eventsSummary}`);
    };

    reader.readAsText(uploadedFile);
  };

  // 发送文本或 `.ics` 解析结果到 OpenAI API
  const sendToOpenAI = async (message) => {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`, // 确保替换 API Key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that can chat with users and analyze `.ics` schedule files, please do not repeat the calendar containt, do the suggestion,if there is any free time in a day, help user to manage some relax event resonable, after analysis do the normal chat, if user ask something else expect calendar, then reply in the normal tone. Use Markdown formatting for better readability, Bold font can be used, but do not use headings.." },
                    { role: "user", content: message }
                ],
            }),
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            let formattedResponse = data.choices[0].message.content;

            // ✅ 确保 Markdown 解析正确
            formattedResponse = formattedResponse
                .replace(/\d+\.\s/g, "\n\n🔹 ")  // 让 1. 2. 3. 自动换行
                .replace(/\*\*(.*?)\*\*/g, "\n\n**$1**") // 确保标题加粗

            setMessages((prevMessages) => [...prevMessages, { text: formattedResponse, sender: "bot" }]);
        }
    } catch (error) {
        console.error("❌ OpenAI API request failed:", error);
        setMessages((prevMessages) => [...prevMessages, { text: "❌ Failed to connect to AI. Please try again later!", sender: "bot" }]);
    }
};



  // 处理用户文本输入
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // 先显示用户输入的消息
    setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
    const userInput = input;
    setInput("");

    // 发送到 OpenAI API 进行普通对话
    await sendToOpenAI(userInput);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Manager AI</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                    {msg.sender === "bot" ? (
                        <ReactMarkdown className="markdown-content">{msg.text}</ReactMarkdown>
                    ) : (
                        <p>{msg.text}</p>
                    )}
                </div>
            ))}
         </div>

          {/* 文件上传按钮 */}
          <div className="chatbot-file-upload">
            <label htmlFor="file-upload" className="file-upload-label">
              📂 Upload `.ics` file
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".ics"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWindow;
