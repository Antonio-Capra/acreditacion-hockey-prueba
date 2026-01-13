"use client";


import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";
import AdminLogin from "@/components/auth/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";


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
        <LoadingSpinner message="Cargando..." />
      </div>
    );
  }
if (!session) return <AdminLogin />;


return <AdminDashboard />;
}