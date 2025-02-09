import React, { Component } from "react";
import "./style.css";

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
    const { currentDate, events } = this.state;
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay();

    const days = [];
    // Fill empty slots before the 1st day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Fill the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateKey = date.toISOString().split("T")[0];
      days.push(
        <div
          key={i}
          className={`calendar-day ${events[dateKey] ? "has-event" : ""}`}
          onClick={() => this.selectDate(date)}
        >
          <span>{i}</span>
          {events[dateKey] && <div className="event-indicator"></div>}
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
            <button onClick={() => this.changeMonth(-1)}>{"<"}</button>
            <h2>
              {currentMonth} {currentYear}
            </h2>
            <button onClick={() => this.changeMonth(1)}>{">"}</button>
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







