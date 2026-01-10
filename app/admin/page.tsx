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


if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#1e5799] to-[#7db9e8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }
if (!session) return <AdminLogin />;


return <AdminDashboard />;
}