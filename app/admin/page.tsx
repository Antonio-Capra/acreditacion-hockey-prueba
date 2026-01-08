"use client";


import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";
import AdminLogin from "../../components/AdminLogin";
import AdminDashboard from "../../components/AdminDashboard";


export default function AdminPage() {
const [loading, setLoading] = useState<boolean>(true);
const [session, setSession] = useState<Session | null>(null);



useEffect(() => {
const getSession = async () => {
const {
data: { session },
} = await supabase.auth.getSession();
setSession(session);
setLoading(false);
};
getSession();


const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
setSession(sess);
});


return () => {
listener.subscription.unsubscribe();
};
}, []);


if (loading) return <div className="p-6">Cargando…</div>;
if (!session) return <AdminLogin />;


return <AdminDashboard />;
}