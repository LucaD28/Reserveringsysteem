This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started FOR DEVELOPERS

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

**API ENDPOINTS**

**ADMIN**

  *DELETE /timeslots/admin/cancel/[id]*
 
  Description: Cancels a reservation made by a user.
 
  URL Parameters: "id" // Required. The reservation id.

  Request Body:
  {  
    "refresh_token": string, // Required. The Admin's refresh token.  
  }  
 
  Response:
  - Success (200 OK):
    {  
      "error" : null // No error.  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given id is not in a proper UUID format.
  - Error (404 Not Found): The given reservation id could not be found.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *PUT /timeslots/admin/edit/duration*
 
  Description: Updates the duration of timeslots in the database.
 
  URL Parameters: NONE

  Request Body:
  {  
    "refresh_token": string, // Required. The Admin's refresh token.  
    "duration": number, // Required. The new timeslot duration.  
  }  
 
  Response:
  - Success (200 OK):
    {  
      "error" : null // No error.  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given duration is not of the required number type.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *POST /timeslots/admin/override/[id]*
 
  Description: Overrides a specific timeslot's capacity with a new capacity.
 
  URL Parameters: "id" // Required. The id of the timeslot_template you want to override.

  Request Body:
  {  
    "refresh_token": string, // Required. The Admin's refresh token.  
    "adjusted_capacity": number, // Required. The new timeslot duration.  
  }  
 
  Response:
  - Success (200 OK):
    {  
      "error" : null // No error.  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given id is not of the required UUID type OR The given adjusted_capacity is not of the required number type.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *POST /timeslots/admin/overview/[date]*
 
  Description: Gives an overview of all the timeslots on a specific date including reservations that have been made on each timeslot.
 
  URL Parameters: "date" // Required. The date of the timeslots you want to see, must be formatted like: "2024-04-01" for April 1st 2024

  Request Body:
  {
    "refresh_token": string, // Required. The Admin's refresh token.
  }
 
  Response:
  - Success (200 OK):
    {  
      "timeslots" : [  
                {  
            "id": "84562aea-32a6-4c3a-b960-dd4d5f53d55b", // id of the timeslot  
            "date": "2024-04-11", // date of the timeslot  
            "start_time": "23:00:00", // start time of the timeslot  
            "end_time": "23:15:00", // end time of the timeslot  
            "capacity": 0, // capacity of the timeslot  
            "reservations": null, // reservations for the timeslot  
            "template_id": "84562aea-32a6-4c3a-b960-dd4d5f53d55b" // template id that the timeslot references  
        },  
        {  
            "id": "fe423d1b-7b6f-4562-953b-c70cf0d558a7", // id of the timeslot  
            "date": "2024-04-11", // date of the timeslot  
            "start_time": "00:00:00", // start time of the timeslot  
            "end_time": "00:15:00", // end time of the timeslot  
            "capacity": 1, // capacity of the timeslot  
            "reservations": [  
                {  
                    "id": "b57e2e80-8688-4384-a1c6-dc7d671c7274", // id of the reservation  
                    "name": "Luca", // name of the person who made a reservation  
                    "email": "luca@gmail.com" // email of the person who made a reservation  
                }  
            ],  
            "template_id": "84bf6049-cd56-4dd3-8f51-767e3faa2fea" // template id that the timeslot references  
        },  
      ]  
  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given date is not properly formatted.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *PUT /timeslots/admin/template/[id]*
 
  Description: Change the default capacity of a timeslot template (a repeating timeslot).
 
  URL Parameters: "id" // Required. The id of the timeslot_template you want to adjust.

  Request Body:
  {  
    "refresh_token": string, // Required. The Admin's refresh token.  
    "default_capacity": number, // Required. The new timeslot duration.  
  }  
 
  Response:
  - Success (200 OK):  
    {  
      "error" : null // No error.  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given id is not of the required UUID type OR The given default_capacity is not of the required number type.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

**USERS**

  *GET /timeslots/available/[date]*
 
  Description: Gives an overview of all timeslots with capacity left over on a specific date.
 
  URL Parameters: "date" // Required. The date of the timeslots you want to see, must be formatted like: "2024-04-01" for April 1st 2024

  Request Body: NONE
 
  Response:
  - Success (200 OK):  
    {  
    "timeslots": [  
        {  
            "id": "fe423d1b-7b6f-4562-953b-c70cf0d558a7", // id of the timeslot  
            "date": "2024-04-11", // date of the timeslot  
            "start_time": "00:00:00", // start time of the timeslot  
            "end_time": "00:15:00", // end time of the timeslot  
            "capacity": 1, // capacity of the timeslot
            "type": "timeslot_override", // type of the timeslot, either timeslot_override or timeslot_template  
            "remaining_capacity": 1 // the remaining capacity of the timeslot  
        }  
      ]  
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given date is not of the required format.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *DELETE /timeslots/cancel/[id]*
 
  Description: Cancel a reservation made by you.
 
  URL Parameters: "id" // Required. The id of the reservation you want to cancel.

  Request Body: 
  {  
    "key": string // Required. The key of your reservation.  
  }  
 
  Response:
  - Success (200 OK):  
    {  
      "error" : null // No error.   
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given id is not of the required UUID format OR the given key is not of the required UUID format.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------

  *DELETE /timeslots/claim/[id]*
 
  Description: Claim a specific timeslot / Make a reservation.
 
  URL Parameters: "id" // Required. The id of the timeslot you want to claim.

  Request Body: 
  {  
    "date": string, // Required. The date of the reservation you want to make, must be formatted like 2024-04-01 for April 1st 2024.  
    "type": string, // Required. The type of the timeslot you're claiming either timeslot_template or timeslot_override.  
    "email": string, // Required. The email of the person making the reservation.  
    "name": string, // Required. The name of the person making the reservation.  
  }  
 
  Response:
  - Success (200 OK):  
    {  
      "error" : null // No error.   
    }  
 
  - Error (405 Method Not Allowed): The provided request method is not valid.
  - Error (400 Bad Request): The given id is not of the required UUID format OR the given key is not of the required UUID format.
  - Error (500 Internal Server Error): Something went wrong while processing the request.

-------------------------------------------------------------------------------------------