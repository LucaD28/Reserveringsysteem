import supabase from "../supabase";
import { NextApiRequest } from "next";

export default async function cleanreservations() : Promise<{error: string}>{
    const currentTime : string = new Date().toISOString();
    const tenMinutesAgo : string = new Date(new Date().getTime() - 15 * 60000).toISOString();
    const { error } = await supabase.from('reservation').delete().eq('status', 'Reserved').lte('created_at', tenMinutesAgo);
    if(error){
        return {'error': error.message}
    }
    return {'error': null}
}