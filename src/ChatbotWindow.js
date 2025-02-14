import React, { useState } from "react";
import "./ChatbotWindow.css";
import ReactMarkdown from "react-markdown";

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const ChatbotWindow = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "👋 Hello! You can upload a `.ics` file, fetch your calendar, or just chat with me.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  // **处理用户文本输入**
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
    const userInput = input;
    setInput("");

    await sendToOpenAI(userInput);
  };

  // **发送请求到 OpenAI API**

  const sendToOpenAI = async (message) => {
    try {
      const updatedMessages = [
        { role: "system", content: "You are a helpful AI assistant that can chat with users and analyze `.ics` schedule files. You read the `.ics` file that uploaded by user, and rearrange them by optimize the time managment, and then MUST return the new `.ics` file back to the user. you also do the analysis on the schedule and give some suggestion. if user send a normal chat, you can also do the normal chat. If you return `.ics` formatted data, make sure it's a complete and valid calendar file." },
        ...messages.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text
        })),
        { role: "user", content: message }
      ];
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMessages, // 👈 发送完整的对话记录
        }),
      });
  
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        let formattedResponse = data.choices[0].message.content;
  
        // **检测 `.ics` 数据**
        if (formattedResponse.includes("BEGIN:VCALENDAR")) {
          alert("📅 Detected ICS data! Updating your calendar...");
          parseICS(formattedResponse);
        }
  
        setMessages((prevMessages) => [...prevMessages, { text: formattedResponse, sender: "bot" }]);
      }
    } catch (error) {
      console.error("❌ OpenAI API request failed:", error);
      setMessages((prevMessages) => [...prevMessages, { text: "❌ Failed to connect to AI. Please try again later!", sender: "bot" }]);
    }
  };
  
  

  // **解析 .ics 文件**
  const parseICS = async (icsData) => {
    try {
      const events = [];
      const lines = icsData.split("\n");
      let currentEvent = {};

      for (let line of lines) {
        line = line.trim(); 

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

  // **处理 .ics 文件上传**
  const handleFileUpload = async (fileObj) => {
    if (!fileObj) return;
    setFile(fileObj);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const icsData = e.target.result;
      const events = await parseICS(icsData);

      if (events.length === 0) {
        setMessages((prevMessages) => [...prevMessages, { text: "📭 Your calendar is empty!", sender: "bot" }]);
        return;
      }

      const eventsSummary = events.map(e => `📅 ${e.summary} \n🕒 ${e.start} - ${e.end} \n📍 ${e.location || "No location"}`).join("\n\n");

      setMessages((prevMessages) => [...prevMessages, { text: "✅ Calendar parsing successful, analyzing schedule...", sender: "bot" }]);

      await sendToOpenAI(`The following is my schedule. Please analyze my busyness and provide optimization suggestions:\n${eventsSummary}`);
    };

    reader.readAsText(fileObj);
  };

  // **生成 .ics 文件并自动上传**
  const fetchICSFromCalendar = () => {
    if (!events || Object.keys(events).length === 0) {
      alert("No events found in your calendar.");
      return;
    }

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Day Manager//EN\n`;

    Object.keys(events).forEach((dateKey) => {
      events[dateKey].forEach((event, index) => {
        const startDateTime = `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00Z`;
        const endTimeHour = parseInt(event.time.split(":")[0]) + 1; 
        const endTimeHourStr = endTimeHour.toString().padStart(2, '0');
        const endDateTime = `${event.date.replace(/-/g, "")}T${endTimeHourStr}${event.time.split(":")[1]}00Z`;

        const uid = `event-${dateKey}-${index}@daymanager.com`; 

        icsContent += `
BEGIN:VEVENT
UID:${uid}
SUMMARY:${event.title}
DTSTART:${startDateTime}
DTEND:${endDateTime}
LOCATION:${event.location || "No location"}
DESCRIPTION:${event.description || ""}
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT`;
      });
    });

    icsContent += `\nEND:VCALENDAR`;

    // **转换为 File 并自动上传**
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const file = new File([blob], "calendar.ics", { type: "text/calendar" });

    handleFileUpload(file);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>💬</button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Manager AI</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : <p>{msg.text}</p>}
              </div>
            ))}
          </div>

          <div className="chatbot-file-upload">
            <button className="fetch-button" onClick={fetchICSFromCalendar}>Analysis My calendar</button>
          </div>

          <div className="chatbot-input">
            <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWindow;
