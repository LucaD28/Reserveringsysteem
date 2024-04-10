// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import { Data, TimeSlot } from "../../../../../helpers/types/types";



export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { id } = req.query;
    const default_capacity = req.body.default_capacity;
    const token = req.headers.authorization?.split(' ')[1];
    const refresh_token = req.body.refresh_token;
    
    supabase.auth.setSession({
        access_token: token,
        refresh_token: refresh_token,
    });

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id format!" });
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
