// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../helpers/supabase";
import fetchTimeslots from "../../../../helpers/commonfunctions/fetchtimeslots";
import { Data, TimeSlot } from "../../../../helpers/types/types";
import cleanreservations from "../../../../helpers/commonfunctions/cleanreservations";



export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { date } = req.query;

    if (typeof date !== "string") {
        return res.status(400).json({ error: "Invalid date format!" });
    }

    try {
        await cleanreservations();
        const timeslotsWithCapacity : TimeSlot[] = await fetchTimeslots(date);
        res.status(200).json({ timeslots: timeslotsWithCapacity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
