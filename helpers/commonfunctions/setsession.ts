import supabase from "../supabase";
import { NextApiRequest } from "next";

export default function validateSession(req : NextApiRequest){
    const token = req.headers.authorization?.split(' ')[1];
    const refresh_token = req.body.refresh_token;
    
    supabase.auth.setSession({
        access_token: token,
        refresh_token: refresh_token,
    });
}