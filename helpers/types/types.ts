// types.ts
export type TimeSlot = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    remaining_capacity?: number;
    reservations?: ReservationShort[];
}

export type Data = {
    timeslots?: TimeSlot[];
    error?: string;
}

export type TimeSlotType = 'timeslot_template' | 'timeslot_override';

export type Reservation = {
    id: string;
    timeslot_template?: string;
    timeslot_override?: string;
    email: string;
    name: string;
    status: string;
    date: string;
}

export type ReservationShort = {
    id: string;
    name: string;
    email: string;
}