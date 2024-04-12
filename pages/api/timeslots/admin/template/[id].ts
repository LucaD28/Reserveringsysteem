// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import { Data, TimeSlot } from "../../../../../helpers/types/types";
import validateSession from "../../../../../helpers/commonfunctions/setsession";



export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }
    validateSession(req);
    const { id } = req.query;
    const default_capacity : number = req.body.default_capacity;


    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id format!" });
    }

    if (typeof default_capacity !== "number") {
        return res.status(400).json({ error: "Invalid default_capacity format!" });
    }


    try {
        const {data, error} = await supabase.from('timeslot_template').update({default_capacity: default_capacity}).eq('id', id)
        if(error){
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json({ error: null });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
