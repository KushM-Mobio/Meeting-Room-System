import frappe
from frappe import _
from datetime import datetime, timedelta
from frappe.exceptions import DoesNotExistError
import requests
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
AUTH_TOKEN = os.getenv("AUTH_TOKEN")
SECRET_KEY = os.getenv("SECRET_KEY")
ROLE = os.getenv('ROLE')
CLICKUP_AUTH_TOKEN = os.getenv("CLICKUP_AUTH_TOKEN")
CLICKUP_BASE_URL = os.getenv("CLICKUP_BASE_URL")
PASSWORD = os.getenv("PASSWORD")

#To check if document exists    
def is_exists(doctype, filters=None):
    return frappe.db.exists(doctype, filters)

def convert_time_to_24h_format(time_str):
    try:
        # Convert time string to datetime object
        time_obj = datetime.strptime(time_str, "%I:%M%p")

        # Format the datetime object as 24-hour format (HH:mm:ss)
        time_24h_str = time_obj.strftime("%H:%M:%S")

        hours, minutes, seconds = map(int, time_24h_str.split(":"))
        result = timedelta(hours=hours, minutes=minutes, seconds=seconds)

        return result
    except ValueError:
        # Handle invalid time strings
        return None

def create_jwt_token(secret_key, payload):
    # Set the expiration time for the token (optional)
    expiration_time = datetime.utcnow() + timedelta(hours=1)

    # Add expiration time to the payload
    payload['exp'] = expiration_time

    # Encode the payload and create the JWT token
    token = jwt.encode(payload, secret_key, algorithm='HS256')

    return token


@frappe.whitelist()
def get_meeting_room_type():
    try:
        room_types = frappe.get_all("meeting room type", pluck="name")
        print(f"room types - {room_types}")
        return {
            "status_code": 200,
            "data": room_types
        }
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }
    
@frappe.whitelist()
def get_meeting_room():
    try:

        # Get all meeting rooms along with their meeting_date
        meeting_rooms = frappe.get_all("meeting room", fields=["name", "meeting_date"])

        # Get the child table data for each meeting room
        for meeting_room in meeting_rooms:
            meeting_room_name = meeting_room['name']

            # Fetch the child table data for the current meeting room
            meeting_room_details = frappe.get_all("meeting room details",
                                                  filters={"parent": meeting_room_name},
                                                  fields=["meeting_room_type", "meeting_start_time", "meeting_end_time", "meeting_topic", "meeting_user"])

            # Add the child table data to the meeting room entry
            meeting_room['meeting_details'] = meeting_room_details

        return {
            "status_code": 200,
            "data": meeting_rooms
        }
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }
    
@frappe.whitelist()
def filtered_room():
    try:
        data = frappe.request.get_json()
        date = data["date"]
        start_time = convert_time_to_24h_format(data["start_time"])
        end_time = convert_time_to_24h_format(data["end_time"])
        all_meeting_room_type = get_meeting_room_type()["data"]
        booked_room_type = []

        # Get all meeting rooms along with their meeting_date
        filters= {"meeting_date": date}
        
        meeting_room = frappe.get_doc("meeting room", filters)
        meeting_room_details = meeting_room.meeting_details     

        for meetings in meeting_room_details:
            # Convert meeting_start_time and meeting_end_time to timedelta objects
            start_time_db = meetings.meeting_start_time
            end_time_db = meetings.meeting_end_time

            # print(type (start_time_db))
            if not ((start_time <= start_time_db and end_time <= start_time_db) or
                    (start_time >= end_time_db and end_time >= end_time_db)):
                booked_room_type.append(meetings.meeting_room_type)
        
        # final list
        result = [item for item in all_meeting_room_type if item not in booked_room_type]
        return {
            "status_code": 200,
             "room_type": result
        }
    except DoesNotExistError:
            # Handle the case when no meeting rooms are found for the specified date
            return {
                "message": f"No meeting rooms found for the {date}.",
                "status_code": 200,
                "room_type": all_meeting_room_type  # Or you can choose an appropriate default value.
            }
    
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }
    
@frappe.whitelist()
def create_new_meet():
    try:
        data = frappe.request.get_json()
        date = data["date"]
        meeting_topic = data["topic"]
        meeting_start_time = convert_time_to_24h_format(data["start_time"])
        meeting_end_time = convert_time_to_24h_format(data["end_time"])
        meeting_room_type = data["room_type"]
        jwt_token = data["token"]
        decoded_token = jwt.decode(jwt_token, SECRET_KEY, algorithms=["HS256"])
        email = decoded_token["email"]
        filters= {"meeting_date": date}
        meeting = frappe.get_all("meeting room", filters)
        if len(meeting) > 0:
            # Get the Meeting Room document by its name
            meeting_doc = frappe.get_doc("meeting room", meeting[0]["name"])
            # return meeting_doc
            meeting_doc.append("meeting_details", {
                "meeting_topic": meeting_topic,
                "meeting_start_time": meeting_start_time,
                "meeting_end_time": meeting_end_time,
                "meeting_room_type": meeting_room_type,
                "meeting_user": email
            })

            # Save the Meeting Room document to persist the changes
            meeting_doc.save()
        else:
            doc = frappe.new_doc("meeting room")
            meeting_date_obj = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%fZ')
            meeting_date_formatted = meeting_date_obj.strftime('%Y-%m-%d')
            doc.meeting_date = meeting_date_formatted
            doc.append("meeting_details", {
                "meeting_topic": meeting_topic,
                "meeting_start_time": meeting_start_time,
                "meeting_end_time": meeting_end_time,
                "meeting_room_type": meeting_room_type,
                "meeting_user": email
            })
            doc.insert()
            
        return {
                "status_code": 200,
                "new_meet": {
                    "meeting_topic": meeting_topic,
                    "meeting_start_time": meeting_start_time,
                    "meeting_end_time": meeting_end_time,
                    "meeting_room_type": meeting_room_type,
                    "meeting_date": date,
                    "meeting_user": email
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }

@frappe.whitelist()
def login():
    try:
        url = f'{BASE_URL}/login'
        data = frappe.request.get_json()
        body = {
            'usr': data["usr"],
            "pwd": data["pwd"]
        }
        headers = {
            "Authorization": AUTH_TOKEN,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        response = requests.post(url, json=body, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200:
            payload = {
                "message": "Logged In",
                "full_name": response_data["full_name"],
                "email": data["usr"]
            }

            # Create the JWT token
            jwt_token = create_jwt_token(SECRET_KEY, payload)
            return {
                "data": response_data,
                "token": jwt_token,
                "message": "Login successful",
                "status_code": 200,
            }
        elif response.status_code == 401:
            return {
                "data": None,
                "message": "Login failed",
                "status_code": 401
            }
        else:
            return {
                "data": None,
                "message": "Login failed",
                "status_code": 500
            }
        
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }
    
@frappe.whitelist()
def get_teams():
    try:
        # Endpoint to fetch teams data
        url = f"{CLICKUP_BASE_URL}/api/v2/team"
        headers = {
            "Authorization": CLICKUP_AUTH_TOKEN
        }

        # Make a GET request to fetch data from the API
        response = requests.get(url=url, headers=headers)
        data = response.json()

        # Iterate through teams and their members
        for team in data["teams"]:
            for user in team["members"]:
                username = user["user"]["username"]
                full_name = username.split()

                # Check if the user already exists in Frappe based on their email if it dose not exist it will create user
                if not is_exists("User", {"email": user['user']['email']}):
                    new_user = frappe.get_doc({
                        "doctype": "User",
                        "email": user["user"]["email"],
                        "first_name": full_name[0],
                        "last_name": full_name[1],
                        "clickup_id": user["user"]["id"],
                        "username": user["user"]["username"],
                        "new_password": full_name[0] + PASSWORD,
                        "roles": [{"role": ROLE}]  # Add the role here
                    })

                    # Insert the new user into the database and commit
                    new_user.insert()
                    frappe.db.commit()

        return {
            "status_code": 200,
            "data": response.json()
        }
    
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }
    
@frappe.whitelist()
def remove_event():
    try:
        data = frappe.request.get_json()
        date = data["date"]
        date_format = "%d-%m-%Y"
        date_obj = datetime.strptime(date, date_format).date()
        meeting_topic = data["topic"].split(" (")[0]
        filters= {"meeting_date": date_obj}
        meeting = frappe.get_all("meeting room", filters)
        if len(meeting) > 0:
            # Get the Meeting Room document by its name
            meeting_doc = frappe.get_doc("meeting room", meeting[0]["name"])
            print(meeting_doc)
            # Find the child table
            child_table = meeting_doc.get("meeting_details")
            print(child_table)

            rows_to_remove = []

            for row in child_table:
                if row.meeting_topic == meeting_topic:
                    rows_to_remove.append(row)

            for row in rows_to_remove:
                child_table.remove(row)

            meeting_doc.save()
            
            return {
                "status_code": 200,
                "data": "Meeting Deleted Successfully"
            }
        
        else:

            return {
                "status_code": 200,
                "data": "Meeting Not Found"
            }
        
    except Exception as e:
        print(f"Error: {e}")
        frappe.response['http_status_code'] = 500
        return {
            "status_code": 500,
            "message": "Internal Server Error"
        }