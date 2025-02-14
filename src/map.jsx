import React, { Component } from "react";
import "./style.css";
import ChatbotWindow from "./ChatbotWindow"; // 引入 Chatbot 组件
import usericon from "./user_icon.png";




class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: new Date(),
      selectedDate: null,
      showModal: false,
      events: {}, 
      eventType: "event",
      eventTitle: "",
      eventDate: "",
      eventTime: "",
      eventLocation: "",
      eventDescription: "",
      viewMode: "monthly", // 👈 新增一个 viewMode 来控制当前是 Monthly 还是 Weekly
      currentDate: new Date(),
      weeklyStartDate: this.getStartOfWeek(new Date()), // 获取当前周的起始日期
      
    };
    
  }
  

  changeWeek = (direction) => {
    this.setState((prevState) => ({
      weeklyStartDate: new Date(prevState.weeklyStartDate.setDate(prevState.weeklyStartDate.getDate() + direction * 7))
    }));
  };
  
  

  setViewMode = (mode) => {
    if (mode === "weekly") {
      this.setState({ 
        viewMode: "weekly",
        weeklyStartDate: this.getStartOfWeek(this.state.currentDate) // 计算当前周起始日期
      });
    } else {
      this.setState({ viewMode: "monthly" });
    }
  };
  

  

  getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // 从周日开始
    return startOfWeek;
  };
  

  
  toggleViewMode = (mode) => {
    this.setState({ viewMode: mode });
  };
  

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  


  goToToday = () => {
    const today = new Date();
    this.setState({
      currentDate: today,
      selectedDate: today,
      weeklyStartDate: this.getStartOfWeek(today) // 👈 在 Weekly 视图下更新本周起始日期
    });
  };
  
  

  // Change the month
  changeMonth = (direction) => {
    const { currentDate } = this.state;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    );
    this.setState({ currentDate: newDate });
  };

  // Select a date and open modal
  selectDate = (date) => {
    this.setState({ 
      selectedDate: date, 
      showModal: true, 
      eventDate: date.toISOString().split("T")[0] // 将日期格式化为 YYYY-MM-DD
    });
  };

  // Close modal
  closeModal = () => {
    this.setState({ showModal: false });
  };

  // Save event
  saveEvent = () => {
  const { selectedDate, events, eventTitle, eventDate, eventTime, eventLocation, eventDescription } = this.state;
  if (!selectedDate || !eventTitle || !eventDate || !eventTime) {
    alert("Please fill in the required fields.");
    return;
  }

  const dateKey = selectedDate.toISOString().split("T")[0];

  const newEvent = {
    title: eventTitle,
    date: eventDate,
    time: eventTime,
    location: eventLocation,
    description: eventDescription
  };

  const updatedEvents = {
    ...events,
    [dateKey]: [...(events[dateKey] || []), newEvent] // 允许多个事件
  };

  this.setState({ 
    events: updatedEvents, 
    showModal: false,
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    eventDescription: ""
  });
  };
  

  updateCalendar = (newEventsArray) => {
    this.setState((prevState) => {
        const updatedEvents = { ...prevState.events };

        newEventsArray.forEach((event) => {
            const dateKey = event.date;
            updatedEvents[dateKey] = [];
            updatedEvents[dateKey].push(event);
        });

        return { events: updatedEvents };
    }, () => {
        console.log("✅ Calendar successfully updated:", this.state.events);
        this.forceUpdate();
    });
};






  


  
parseICS = async (icsData) => {
    try {
      const events = [];
      const lines = icsData.split("\n");
      let currentEvent = {};

      for (let line of lines) {
        line = line.trim();

        if (line.startsWith("BEGIN:VEVENT")) {
          currentEvent = {};
        } else if (line.startsWith("SUMMARY:")) {
          currentEvent.title = line.replace("SUMMARY:", "").trim();
        } else if (line.startsWith("DTSTART:")) {
          currentEvent.date = line.replace("DTSTART:", "").substring(0, 8); // 获取 YYYYMMDD
          currentEvent.time = line.replace("DTSTART:", "").substring(9, 13); // 获取 HHMM
        } else if (line.startsWith("DTEND:")) {
          currentEvent.endTime = line.replace("DTEND:", "").substring(9, 13); // 获取 HHMM
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
handleICSUpload = async (event) => {
  const uploadedFile = event.target.files[0];
  if (!uploadedFile) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const icsData = e.target.result;
    const parsedEvents = await this.parseICS(icsData);

    if (parsedEvents.length === 0) {
      alert("📭 No valid events found in the .ics file.");
      return;
    }

    // **格式化解析的数据并合并到现有 events 状态**
    const updatedEvents = { ...this.state.events };

    parsedEvents.forEach((event) => {
      const dateKey = `${event.date.substring(0, 4)}-${event.date.substring(4, 6)}-${event.date.substring(6, 8)}`;

      if (!updatedEvents[dateKey]) {
        updatedEvents[dateKey] = [];
      }

      updatedEvents[dateKey].push({
        title: event.title || "Untitled Event",
        date: dateKey,
        time: event.time ? `${event.time.substring(0, 2)}:${event.time.substring(2, 4)}` : "00:00",
        location: event.location || "No location",
        description: event.description || "",
      });
    });

    // **更新状态**
    this.setState({ events: updatedEvents });
    alert("✅ Calendar updated successfully!");
  };

  reader.readAsText(uploadedFile);
  };
  

generateICS = () => {
  const { events } = this.state;
  let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Day Manager//EN\n`;

  Object.keys(events).forEach((dateKey) => {
    events[dateKey].forEach((event) => {
      const startDateTime = `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00Z`; // 格式 YYYYMMDDTHHMMSSZ
      const endDateTime = `${event.date.replace(/-/g, "")}T${parseInt(event.time.split(":")[0]) + 1}${event.time.split(":")[1]}00Z`; // 事件时长默认 1 小时

      icsContent += `
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${startDateTime}
DTEND:${endDateTime}
LOCATION:${event.location || "No location"}
DESCRIPTION:${event.description || ""}
END:VEVENT`;
    });
  });

  icsContent += `\nEND:VCALENDAR`;

  // 创建 Blob 并下载
  const blob = new Blob([icsContent], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "calendar.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


renderDays = () => {
  const {currentDate,weeklyStartDate,events,viewMode} = this.state;
  console.log("🔄 Rendering calendar with events:", events); // **调试：确保数据被读取**
  const today = new Date();
  let days = [];

  if (viewMode === "monthly") {
    // **📆 Monthly View**
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay();

    // 填充空白占位符
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 填充当前月份的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateKey = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();
      const eventList = events[dateKey] || [];

      days.push(
        <div
          key={i}
          className={`calendar-day card ${isToday ? "today" : ""}`}
          onClick={() => this.selectDate(date)}
        >
          <div className="date-header">
            <span className="date-number">{i}</span>
            {isToday && <span className="today-label">Today</span>}
          </div>

          {/* 事件展示 */}
          <div className="events-container">
            {eventList.length > 0 ? (
              eventList.map((event, index) => (
                <div key={index} className="event">
                  <div className="event-time">🕒 {event.time} -- {event.title}</div>
                </div>
              ))
            ) : (
              <div className="no-events">No events</div>
            )}
          </div>
        </div>
      );
    }
  } else {
    // **📅 Weekly View**
    for (let i = 0; i < 7; i++) {
      const date = new Date(weeklyStartDate);
      date.setDate(weeklyStartDate.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();
      const eventList = events[dateKey] || [];

      days.push(
        <div
          key={i}
          className={`week-day-card ${isToday ? "today" : ""}`}
          onClick={() => this.selectDate(date)}
        >
          <div className="week-date">
            <span className="week-day">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
            <span className={`week-number ${isToday ? "highlight" : ""}`}>{date.getDate()}</span>
          </div>

          {/* 事件展示 */}
          <div className="events-container">
            {eventList.length > 0 ? (
              eventList.map((event, index) => (
                <div key={index} className="event">
                  🕒 {event.time} - {event.title}
                </div>
              ))
            ) : (
              <div className="no-events">No events</div>
            )}
          </div>
        </div>
      );
    }
  }

  return days;
};


  

  renderWeekView = () => {
    const { weeklyStartDate, events } = this.state;
    const today = new Date();
  
    // 创建数组存放这周的 7 天
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weeklyStartDate);
      date.setDate(weeklyStartDate.getDate() + i);
  
      const dateKey = date.toISOString().split("T")[0];
      const eventList = events[dateKey] || [];
  
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
  
      weekDays.push(
        <div key={i} className={`week-day-card ${isToday ? "today" : ""}`} onClick={() => this.selectDate(date)}>
          <div className="week-date">
            <span className="week-day">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
            <span className={`week-number ${isToday ? "highlight" : ""}`}>{date.getDate()}</span>
          </div>
  
          {/* 事件展示 */}
          <div className="week-events-container">
            {eventList.length > 0 ? (
              eventList.map((event, index) => (
                <div key={index} className="week-event">
                  🕒 {event.time} - {event.title}
                </div>
              ))
            ) : (
              <div className="no-events">No events</div>
            )}
          </div>
        </div>
      );
    }
  
    return <div className="week-view">{weekDays}</div>;
  };
  
  



  render() {
    const { currentDate, selectedDate, showModal, events } = this.state;
    const currentMonth = currentDate.toLocaleString("default", { month: "long" });
    const currentYear = currentDate.getFullYear();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
      <div className="app-container">
        {/* Banner */}
        <header className="banner">
          <div className="banner-left">
            <h1>Day-Manager</h1>
          </div>
          <div className="banner-right">
            <button className="user-icon" onClick={() => alert("User menu clicked!")}>
              <img src={usericon} alt="User Icon" />
            </button>
          </div>
        </header>

      
        {/* Main Calendar */}
        <main className="calendar-container">
        <div className="calendar-header">
          {/* Today Button */}
            <button className="today-button" onClick={() => this.goToToday()}>

            Today
            </button>
            

         {/* Month and Year Display */}
        <div className="month-year-display">
          {this.state.viewMode === "monthly" ? (
            <>
              <button className="arrow-button" onClick={() => this.changeMonth(-1)}>{"<"}</button>
              <h2>
                {currentMonth} {currentYear}
              </h2>
              <button className="arrow-button" onClick={() => this.changeMonth(1)}>{">"}</button>
            </>
          ) : (
            <>
              <button className="arrow-button" onClick={() => this.changeWeek(-1)}>{"<"}</button>
              <h2>Week of {this.state.weeklyStartDate.toDateString()}</h2>
              <button className="arrow-button" onClick={() => this.changeWeek(1)}>{">"}</button>
            </>
          )}
        </div>


          {/* Additional Buttons */}
          <div className="header-actions">
            <button className="settings-button">⚙️</button>
          </div>
        </div>


          {/* Weekdays Row */}
          <div className="calendar-weekdays">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {/* 视图模式切换按钮 */}
          <div className="view-mode-toggle">
            <button className={this.state.viewMode === "monthly" ? "active" : ""} onClick={() => this.setViewMode("monthly")}>
              Monthly
            </button>
            <button className={this.state.viewMode === "weekly" ? "active" : ""} onClick={() => this.setViewMode("weekly")}>
              Weekly
            </button>
          </div>



          {/* 根据视图模式选择渲染内容 */}
          <div className="calendar-grid">{this.renderDays()}</div>

          <ChatbotWindow events={this.state.events} updateCalendar={this.updateCalendar} />

          <button className="upload-container">
              <label htmlFor="ics-upload" className="upload-label">
                📂 Upload `.ics` file
              </label>
              <input
                id="ics-upload"
                type="file"
                accept=".ics"
                onChange={this.handleICSUpload}
                style={{ display: "none" }}
              />
            </button>
        </main>

        
        
        {/* Modal */}
{showModal && (
  <div className="modal">
    <div className="modal-content">
      {/* Close Button */}
      <button className="close-button" onClick={this.closeModal}>×</button>

      {/* Title */}
      <h3>Add New Event</h3>

      {/* Event Title */}
      <div className="modal-row">
        <label>Title *</label>
        <input
          type="text"
          name="eventTitle"
          value={this.state.eventTitle}
          onChange={this.handleChange}
          placeholder="Enter event title"
          required
        />
      </div>

      {/* Date Input */}
      <div className="modal-row">
        <label>Date *</label>
        <input
          type="date"
          name="eventDate"
          value={this.state.eventDate} // 绑定状态
          onChange={this.handleChange}
          required
        />
      </div>

      {/* Time Input */}
      <div className="modal-row">
        <label>Time *</label>
        <input
          type="time"
          name="eventTime"
          value={this.state.eventTime}
          onChange={this.handleChange}
          required
        />
      </div>

      {/* Location Input */}
      <div className="modal-row">
        <label>Location</label>
        <input
          type="text"
          name="eventLocation"
          value={this.state.eventLocation}
          onChange={this.handleChange}
          placeholder="Enter location (optional)"
        />
      </div>

      {/* Description Input */}
      <div className="modal-row">
        <label>Description</label>
        <textarea
          name="eventDescription"
          value={this.state.eventDescription}
          onChange={this.handleChange}
          placeholder="Add description or a Google Drive attachment"
        />
      </div>

      {/* Save Button */}
      <button className="save-button" onClick={this.saveEvent}>Save</button>
    </div>
  </div>
)}



      </div>
    );
  }
}

export default MapComponent;







