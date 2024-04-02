import { NextApiResponse } from "next";
import supabase from "../supabase";
import { TimeSlot } from "../types/types";

// Function to fetch timeslots, calculate remaining capacity, and filter timeslots
export default async function fetchTimeslots(date: string): Promise<TimeSlot[]> {
    // Gets all timeslots with the given date where there is more than 0 max capacity
    const { data: timeslots, error } = await supabase.rpc('fetch_timeslots', { date_param: date });

    if (error) {
        throw new Error(`An error occurred while fetching timeslots! ${error.message}`);
    }

    const { data: reservationData, error: reservationError } = await supabase.from('reservation').select('*').eq('date', date);

    if (reservationError) {
        throw new Error(`An error occurred while fetching reservations! ${reservationError.message}`);
    }

    // Count reservations per timeslot
    const reservationsCount: { [key: string]: number } = reservationData.reduce((acc, reservation) => {
        const timeslotId = reservation.timeslot_override || reservation.timeslot_template;
        acc[timeslotId] = (acc[timeslotId] || 0) + 1;
        return acc;
    }, {});

    // Add remaining_capacity to the timeslots and filter the timeslots with no remaining capacity
    const timeslotsWithCapacity: TimeSlot[] = timeslots.map((timeslot: TimeSlot) => {
        const booked = reservationsCount[timeslot.id] || 0;
        const remaining_capacity = timeslot.capacity - booked;
        return { ...timeslot, remaining_capacity };
    }).filter((timeslot: TimeSlot) => timeslot.remaining_capacity > 0);

    return timeslotsWithCapacity;
}