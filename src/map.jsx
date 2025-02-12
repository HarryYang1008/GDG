import React, { Component } from "react";
import "./style.css";
import ChatbotWindow from "./ChatbotWindow"; // 引入 Chatbot 组件




class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: new Date(),
      selectedDate: null,
      showModal: false,
      events: {}, // 用于存储每个日期的事件
      eventType: "event",
    };
  }

  goToToday = () => {
    const today = new Date();
    this.setState({ currentDate: today, selectedDate: today });
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
    this.setState({ selectedDate: date, showModal: true });
  };

  // Close modal
  closeModal = () => {
    this.setState({ showModal: false });
  };

  // Save event
  saveEvent = (eventText) => {
    const { selectedDate, events } = this.state;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const updatedEvents = { ...events, [dateKey]: eventText };
    this.setState({ events: updatedEvents, showModal: false });
  };

  // Render days in the calendar
  renderDays = () => {
    const { currentDate } = this.state;
    const today = new Date(); // 获取今天的日期
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay();
  
    const days = [];
    // 填充空白占位符，确保日期与星期对齐
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
  
    // 填充当前月份的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(); // 判断是否为今天
      days.push(
        <div
          key={i}
          className={`calendar-day ${isToday ? "today" : ""}`}
          onClick={() => this.selectDate(date)}
        >
          <span>{i}</span>
        </div>
      );
    }
  
    return days;
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
          <h1>Day-Manager</h1>
        </header>

        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li>My Calendars</li>
            <li>Tasks</li>
            <li>Events</li>
            <li>Holidays</li>
          </ul>
        </aside>

        {/* Main Calendar */}
        <main className="calendar-container">
        <div className="calendar-header">
          {/* Today Button */}
          <button className="today-button" onClick={() => this.goToToday()}>
            Today
          </button>

          {/* Month and Year Display */}
          <div className="month-year-display">
            <button className="arrow-button" onClick={() => this.changeMonth(-1)}>
              {"<"}
            </button>
            <h2>
              {currentMonth} {currentYear}
            </h2>
            <button className="arrow-button" onClick={() => this.changeMonth(1)}>
              {">"}
            </button>
          </div>

          {/* Additional Buttons */}
          <div className="header-actions">
            <button className="view-button">Month</button>
            <button className="view-button">Week</button>
            <button className="view-button">Day</button>
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
          <div className="calendar-grid">{this.renderDays()}</div>
          <ChatbotWindow />
        </main>

        
        {/* Modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              {/* Close Button */}
              <button className="close-button" onClick={this.closeModal}>
                ×
              </button>
              
              {/* Title */}
              <h3>Add title and time</h3>

              {/* Event/Task Toggle */}
              <div className="toggle-options">
                <button
                  className={`toggle-button ${this.state.eventType === "event" ? "active" : ""}`}
                  onClick={() => this.setState({ eventType: "event" })}
                >
                  Event
                </button>
                <button
                  className={`toggle-button ${this.state.eventType === "task" ? "active" : ""}`}
                  onClick={() => this.setState({ eventType: "task" })}
                >
                  Task
                </button>
              </div>

              {/* Time Input */}
              <div className="modal-row">
                <label>Date</label>
                <input
                  type="date"
                  defaultValue={selectedDate?.toISOString().split("T")[0] || ""}
                />
                <button className="add-time-button">Add time</button>
              </div>

              {/* Additional Inputs */}
              <div className="modal-row">
                <label>Add guests</label>
                <input type="text" placeholder="Enter email addresses" />
              </div>

              <div className="modal-row">
                <label>Add Google Meet video conferencing</label>
                <button className="add-meeting-button">Add</button>
              </div>

              <div className="modal-row">
                <label>Add location</label>
                <input type="text" placeholder="Enter location" />
              </div>

              <div className="modal-row">
                <label>Add description</label>
                <textarea placeholder="Add description or a Google Drive attachment"></textarea>
              </div>

              {/* Save Button */}
              <button className="save-button" onClick={() => this.saveEvent()}>
                Save
              </button>
            </div>
          </div>
        )}


      </div>
    );
  }
}

export default MapComponent;







