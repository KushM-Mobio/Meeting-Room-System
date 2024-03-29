import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction"
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useCalendar } from './CalendarContex';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import { Modal, DatePicker, Input, Select, Button } from "antd";
import moment from "moment";
import { useLogin } from './loginContext';
import jwt_decode from "jwt-decode";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

let config = {
    headers: {
        Authorization: AUTH_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
    },
};

const generateTimeList = (startTime, endTime, interval) => {
    const timeList = [];
    const start = moment(startTime, "h:mma");
    const end = moment(endTime, "h:mma");
    let timeObj = {};

    while (start <= end) {
        if (interval === 15) {
            timeObj = {
                label: start.format("h:mma"),
                value: start.format("h:mma"),
            };
        } else {
            const diffMinutes = start.diff(moment(startTime, "h:mma"), "minutes");
            const duration =
                diffMinutes < 60 ? `${diffMinutes} mins` : `${diffMinutes / 60} hrs`;
            const temp_label = `${start.format("h:mma")} (${duration})`;
            timeObj = {
                label: temp_label,
                value: start.format("h:mma"),
            };
        }

        timeList.push(timeObj);
        start.add(interval, "minutes");
    }

    return timeList;
};

function formatTime(timeString) {
    // Split the timeString by ':' to separate the hour, minute, and second parts
    const [hour, minute, second] = timeString.split(':');

    // Convert the hour part to an integer to remove leading zeros (if any)
    const hourInt = parseInt(hour, 10);

    // Check if the hour part has only one digit and add a leading zero if necessary
    const formattedHour = hourInt < 10 ? `0${hourInt}` : hourInt.toString();

    // Combine the formatted hour with the minute and second parts
    const formattedTime = `${formattedHour}:${minute}:${second}`;

    return formattedTime;
}

const CalendarView = ({ }) => {

    const { meetingRoomType, setMeetingRoomType, meetingDetails, setMeetingDetails, events, setEvents } = useCalendar()
    const [isModalVisible, setModalVisible] = useState(false);
    const [startTimeList, setStartTimeList] = useState(generateTimeList("12:00am", "11:45pm", 15));
    const [endTimeList, setEndTimeList] = useState([])
    const [showTimeBtn, setTimeBtn] = useState(true);
    const [postingDate, setPostingDate] = useState(null)
    const [showRoomTypeSelect, setShowRoomTypeSelect] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [evetModel, setEventModel] = useState(false)

    // for create new event.
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [roomType, setRoomType] = useState(null)
    const [meetingTopic, setMeetingTopic] = useState(null)
    const [access, setAccess] = useState(false)

    let localStorageEmail = null;
    if(localStorage.getItem("token")) {
        const token = localStorage.getItem("token")
        const decodedPayload = jwt_decode(token);
        localStorageEmail = decodedPayload.email
    }
    
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setAccess(false)
        } else {
            setAccess(true)
            if (events.length === 0) {
                getEvents()
            }
        }
    }, [])

    useEffect(() => {
        (async () => {
            if (postingDate !== null && startTime !== null && endTime !== null) {
                setShowRoomTypeSelect(true)
                const { data } = await axios.post(`${BASE_URL}filtered_room`,
                    {
                        date: postingDate,
                        start_time: startTime,
                        end_time: endTime
                    }, config)
                if (data?.message?.status_code === 200) {
                    let room_list = data?.message?.room_type
                    let final_list = room_list.map(item => {
                        return {
                            "label": item,
                            "value": item
                        }
                    })
                    setMeetingRoomType(final_list)
                    // setRoomType(data?.message?.room_type)
                } else {
                    toast.error("Something Wents Wrong.")
                }
            } else {
                setShowRoomTypeSelect(false)
                setMeetingRoomType([])
                setRoomType(null)
            }
        })()
    }, [startDate, startTime, endTime])

    const getEvents = async () => {
        let response = await axios.get(`${BASE_URL}get_meeting_room`, config)
        if (response?.data?.message?.status_code === 200) {
            setMeetingDetails(response?.data?.message?.data)
        } else {
            toast.error("Something Went Wrong.");
        }

        // Format the events data
        const formattedEvents = response.data.message.data.map(meeting => {
            return meeting.meeting_details.map(detail => ({

                title: `${detail.meeting_topic} (${detail.meeting_room_type}) - ${detail.meeting_user}`,
                start: `${meeting.meeting_date}T${formatTime(detail.meeting_start_time)}`,
                end: `${meeting.meeting_date}T${formatTime(detail.meeting_end_time)}`,
                allDay: false // Set this to false if you want time-based events
            }));
        }).flat(); // Flatten the array of arrays
        setEvents(formattedEvents);
    }

    const handleDateClick = (arg) => {
        // Get the clicked date from the argument
        const clickedDate = arg.date;

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to midnight

        // Check if the clicked date is before today's date
        if (clickedDate < today) {
            return; // If so, do nothing
        }
        
        // Perform the action for valid dates (after today's date)
        setModalVisible(true)
    }


    const handleOk = async () => {

        const { data } = await axios.post(`${BASE_URL}create_new_meet`, {
            "date": startDate,
            "topic": meetingTopic,
            "start_time": startTime,
            "end_time": endTime,
            "room_type": roomType,
            "token": localStorage.getItem("token")
        }, config)
        if (data?.message?.status_code === 200) {
            getEvents()
        } else {
            toast.error("Something Went Wrong.")
        }
        handleCloseModel()
    };

    const handleDate = (data) => {
        const formatedDate = moment(data?.$d).format(
            "YYYY-MM-DD"
        );
        setStartDate(data);
        setPostingDate(formatedDate.toString())
    }

    const handleStartTime = (value) => {
        setStartTime(value)
        setEndTime(null)
        setEndTimeList(generateTimeList(value, "11:45pm", 30));
    }

    const handlEndTime = (value) => {
        setEndTime(value)
    }

    const handleRoomType = (value) => {
        setRoomType(value)
    }

    const handleCloseModel = () => {
        setEventModel(false)
        setModalVisible(false);
        setTimeBtn(true);
        setStartTime(null);
        setEndTime(null);
        setEndTimeList([]);
        setMeetingTopic(null);
        setStartDate(null)
    }

    const disabledDate = (current) => {
        // Disable dates before today's date
        return current && current < moment().startOf("day");
    };

    const handleEventClick = (arg) => {
        // Get the clicked event from the argument
        const clickedEvent = arg.event;

        // Open the modal and set the selected event
        setEventModel(true);
        setSelectedEvent(clickedEvent);
    };

    const handleDeleteEvent = async (removeDate, removeTopic) => {

        const {data} = await axios.post(`${BASE_URL}remove_event`, 
        {
            "date": moment(removeDate).format("DD-MM-YYYY"),
            "topic": removeTopic
        }
        ,config)
        // After deletion, close the modal and refresh events
        handleCloseModel();
        getEvents();
    };

    return (
        <>
            {
                access ?
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        initialView='timeGridWeek'
                        headerToolbar={{
                            left: "prev,next,today",
                            center: "title",
                            right: "timeGridDay,timeGridWeek,dayGridMonth"
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                    /> : <p>401 Unauthorize</p>
            }

            <Modal
                style={{ marginTop: "-80px" }}
                title={`New Event`}
                visible={isModalVisible}
                onCancel={handleCloseModel}
                onOk={handleOk}
            >
                <div>
                    <div>
                        <p style={{ fontWeight: 600 }}>Meeting Date & Time</p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >

                            <DatePicker
                                disabledDate={disabledDate}
                                className="date-picker custom-placement"
                                value={startDate}
                                onChange={(data) => { handleDate(data) }}
                            />
                            {showTimeBtn ? (
                                <Button onClick={() => setTimeBtn(false)}>Add Time</Button>
                            ) : (
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <Select
                                        placeholder="start time"
                                        options={startTimeList}
                                        value={startTime}
                                        onChange={(value) => {
                                            handleStartTime(value)
                                        }}
                                    />
                                    <Select
                                        placeholder="end time"
                                        options={endTimeList}
                                        style={{ width: "150px" }}
                                        value={endTime}
                                        onChange={(value) => {
                                            handlEndTime(value)
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {
                    showRoomTypeSelect && <><p style={{ fontWeight: 600 }}>Meeting Room</p>
                        <Select
                            placeholder="Select Room"
                            style={{
                                width: "100%",
                            }}
                            options={meetingRoomType}
                            value={roomType}
                            onChange={(value) =>
                                handleRoomType(value)
                            }
                        />
                    </>
                }
                <p style={{ fontWeight: 600 }}>Meeting topic</p>
                <Input
                    placeholder="Enter Meeting Topic"
                    value={meetingTopic}
                    onChange={(ev) =>
                        setMeetingTopic(ev.target.value)
                    }
                />
            </Modal>

            <Modal
                visible={evetModel}
                onCancel={() => {
                    handleCloseModel();
                    setSelectedEvent(null); // Reset selected event when closing the modal
                }}
                footer={[]} // Set an empty array to hide the OK and Cancel buttons
            >
                {selectedEvent ? (
                    <>
                        <h2>Event Details</h2>
                        <p><span style={{ fontWeight: 600 }}>Title:</span> {selectedEvent.title}</p>
                        <p><span style={{ fontWeight: 600 }}>Start Time:</span> {moment(selectedEvent.start).format("h:mm A")}</p>
                        <p><span style={{ fontWeight: 600 }}>End Time:</span> {moment(selectedEvent.end).format("h:mm A")}</p>
                        {
                            selectedEvent.title.includes(localStorageEmail) ? 
                            <Button type="primary" onClick={() => handleDeleteEvent(selectedEvent.start, selectedEvent.title)}>Delete Event</Button> : 
                            null
                        }
                    </>
                ) : (
                    null
                )}
            </Modal>

            <ToastContainer />
        </>
    )
}

export default CalendarView