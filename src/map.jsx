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
      events: {}, // 用于存储每个日期的事件
      eventType: "event",
     
        eventTitle: "",
        eventDate: "",
        eventTime: "",
        eventLocation: "",
        eventDescription: "",
      
      
    };
  }


  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };


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

  

  // Render days in the calendar
  renderDays = () => {
    const { currentDate, events } = this.state;
    const today = new Date();
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
        date.getFullYear() === today.getFullYear();
  
      const dateKey = date.toISOString().split("T")[0];
      const eventList = events[dateKey] || []; // 获取当天的事件
  
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
  
          {/* 事件列表 */}
          <div className="events-container">
            {eventList.length > 0 ? (
              eventList.map((event, index) => (
                <div key={index} className="event">
                  <div className="event-time">🕒 {event.time} {event.title}</div>
                </div>
              ))
            ) : (
              <div className="no-events">No events</div>
            )}
          </div>
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
          value={this.state.eventDate}
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







