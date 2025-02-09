import React, { Component } from "react";
import "./style.css";

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: new Date(),
      selectedDate: null,
      events: {}, // Stores events with the date as the key
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

  // Select a date
  selectDate = (date) => {
    this.setState({ selectedDate: date });
  };

  // Render days in the calendar
  renderDays = () => {
    const { currentDate, events } = this.state;
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split("T")[0];
      days.push(
        <div
          key={i}
          className={`calendar-day ${events[dateString] ? "event-day" : ""}`}
          onClick={() => this.selectDate(date)}
        >
          <span>{i}</span>
        </div>
      );
    }

    return days;
  };

  render() {
    const { currentDate, selectedDate, events } = this.state;
    const currentMonth = currentDate.toLocaleString("default", { month: "long" });
    const currentYear = currentDate.getFullYear();

    return (
      <div className="calendar-app">
        <div className="calendar-header">
          <button onClick={() => this.changeMonth(-1)}>{"<"}</button>
          <h2>
            {currentMonth} {currentYear}
          </h2>
          <button onClick={() => this.changeMonth(1)}>{">"}</button>
        </div>
        <div className="calendar-grid">{this.renderDays()}</div>

        <div className="event-panel">
          <h3>{selectedDate ? selectedDate.toDateString() : "No Date Selected"}</h3>
          {selectedDate && (
            <div>
              <textarea
                placeholder="Add event"
                onBlur={(e) => {
                  const dateKey = selectedDate.toISOString().split("T")[0];
                  const newEvents = { ...events, [dateKey]: e.target.value };
                  this.setState({ events: newEvents });
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}


export default MapComponent;
