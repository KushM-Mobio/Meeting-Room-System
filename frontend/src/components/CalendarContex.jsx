import { createContext, useContext, useState } from "react";

const calendarContext = createContext()

const CalendarProvider = ({ children }) => {

    const [meetingRoomType, setMeetingRoomType] = useState([]);
    const [meetingDetails, setMeetingDetails] = useState([]);
    const [events, setEvents] = useState([])

    return (
        <calendarContext.Provider 
        value={{ meetingRoomType, setMeetingRoomType, meetingDetails, setMeetingDetails, events, setEvents }}>
            {children}
        </calendarContext.Provider>
    )
}

const useCalendar = () => {
    return useContext(calendarContext)
}

export { useCalendar, CalendarProvider }