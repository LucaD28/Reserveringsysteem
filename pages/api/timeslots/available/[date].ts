// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../helpers/supabase";

type TimeSlot = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    remaining_capacity?: number;
}

type Data = {
    timeslots?: TimeSlot[];
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    if(req.method !== "GET") {
        return res.status(405).json({error: "Method not allowed!"})
    }
    const { date } = req.query
    if (typeof date !== "string") {
        return res.status(400).json({error: "Invalid date format!"})
    }
    // Gets all timeslots with the given date where there is more than 0 max capacity
    const { data: timeslots, error } = await supabase.rpc('fetch_timeslots', { date_param: date });

    if (error) {
        return res.status(500).json({error: `An error occurred while fetching timeslots! ${error.message}`})
    }
    const {data: reservationData, error: reservationError} = await supabase.from('reservation').select('*').eq('date', date);
    if (reservationError) {
        return res.status(500).json({error: `An error occurred while fetching reservations! ${reservationError.message}`})
    }
    
    // Count reservations per timeslot
    const reservationsCount : {[key: string] : number} = reservationData.reduce((acc, reservation) => {
        const timeslotId = reservation.timeslot_override || reservation.timeslot_template;
        acc[timeslotId] = (acc[timeslotId] || 0) + 1;
        return acc;
    }, {});

    // Add remaining_capacity to the timeslots and filter the timeslots with no remaining capacity
    const timeslotsWithCapacity : TimeSlot[] = timeslots.map((timeslot : TimeSlot) => {
        const booked = reservationsCount[timeslot.id] || 0;
        const remaining_capacity = timeslot.capacity - booked;
        return { ...timeslot, remaining_capacity };
    }).filter((timeslot: TimeSlot) => timeslot.remaining_capacity > 0);

    res.status(200).json({ timeslots: timeslotsWithCapacity });
}
