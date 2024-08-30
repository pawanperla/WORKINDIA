# Dining Place Booking System

## Overview

This Django application is designed to manage dining place bookings. It includes functionalities for user registration, login, dining place management, and booking. The project uses Django's REST framework for API endpoints and includes encryption for stored notes.

## Features

- User account registration and login
- Create and manage dining places
- Check availability of dining places
- Make bookings for dining places
- Search for dining places by name

## Requirements

- Python 3.10+
- Django 5.0+
- Django REST framework
- `phonenumber_field` library
- `Poetry` for dependency management

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Reuben-Stephen-John/WorkIndia-API-Challenge.git
```

### 2. Install Dependencies

```bash
poetry install
```

### 3. Apply Migrations

```bash
poetry run python manage.py migrate
```

### 4. Create Superuser (For Admin Panel)

```bash
poetry run python manage.py createsuperuser
```

### 5. Run the Development Server

```bash
poetry run python manage.py runserver
```

## API Endpoints

### 1. Register a User

- **POST** `/api/signup/`

  **Request Data:**

  ```json
  {
    "username": "example_user",
    "password": "example_password",
    "email": "user@example.com"
  }
  ```

  **Response Data:**

  ```json
  {
    "status": "Account successfully created",
    "status_code": 200,
    "user_id": "123445"
  }
  ```

### 2. Login User

- **POST** `/api/login/`

  **Request Data:**

  ```json
  {
    "username": "example_user",
    "password": "example_password"
  }
  ```

  **Successful Response Data:**

  ```json
  {
    "status": "Login successful",
    "status_code": 200,
    "user_id": "12345",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  }
  ```

  **Failure Response Data:**

  ```json
  {
    "status": "Incorrect username/password provided. Please retry",
    "status_code": 401
  }
  ```

### 3. Add a New Dining Place

- **POST** `/api/dining-place/create/`

  **Request Data:**

  ```json
  {
    "name": "Gatsby",
    "address": "HSR Layout",
    "phone_no": "9999999999",
    "website": "http://workindia.in/",
    "operational_hours": {
      "open_time": "08:00:00",
      "close_time": "23:00:00"
    },
    "booked_slots": []
  }
  ```

  **Response Data:**

  ```json
  {
    "message": "Gatsby added successfully",
    "place_id": "12345",
    "status_code": 200
  }
  ```

### 4. Search Dining Places by Name

- **GET** `/api/dining-place/`

  **Params:**

  - `name` (str): The keyword to search for in dining place names.

  **Response Data:**

  ```json
  [
    {
      "place_id": "12345",
      "name": "Gatsby",
      "address": "HSR Layout",
      "phone_no": "+9999999999",
      "website": "http://workindia.in/",
      "operational_hours": {
        "open_time": "08:00:00",
        "close_time": "23:00:00"
      }
    }
  ]
  ```

### 5. Get Dining Place Availability

- **GET** `/api/dining-place/availability/`

  **Params:**

  - `place_id` (str): The ID of the dining place.
  - `start_time` (datetime): The start time of the requested slot.
  - `end_time` (datetime): The end time of the requested slot.

  **Response Data:**

  **For available slots:**

  ```json
  {
    "place_id": "12345",
    "name": "Gatsby",
    "phone_no": "+9999999999",
    "available": true,
    "next_available_slot": null
  }
  ```

  **For already booked slots:**

  ```json
  {
    "place_id": "12345",
    "name": "Gatsby",
    "phone_no": "+9999999999",
    "available": false,
    "next_available_slot": "2023-01-01T17:00:00Z"
  }
  ```

### 6. Make a Booking

- **POST** `/api/dining-place/book/`

  **Headers:**

  - `Authorization: Bearer {token}`

  **Request Data:**

  ```json
  {
    "place_id": "12345",
    "start_time": "2023-01-02T12:00:00Z",
    "end_time": "2023-01-02T13:00:00Z"
  }
  ```

  **Response Data:**

  **For successful booking:**

  ```json
  {
    "status": "Slot booked successfully",
    "status_code": 200,
    "booking_id": "54321"
  }
  ```

  **For already booked slots:**

  ```json
  {
    "status": "Slot is not available at this moment, please try some other place",
    "status_code": 400
  }
  ```
