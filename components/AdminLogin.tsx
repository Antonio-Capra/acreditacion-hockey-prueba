"use client";


import { useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminLogin() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);


const login = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
setLoading(true);
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) setError(error.message);
setLoading(false);
};


return (
<main className="min-h-dvh w-full flex items-center justify-center px-4 py-10">
<form onSubmit={login} className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
<h1 className="text-xl font-semibold">Ingreso administrador</h1>
<div>
<label className="block text-sm mb-1">Correo</label>
<input className="w-full rounded-xl border px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
</div>
<div>
<label className="block text-sm mb-1">Contraseña</label>
<input className="w-full rounded-xl border px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
</div>
{error && <p className="text-sm text-red-600">{error}</p>}
<button disabled={loading} className="w-full rounded-xl bg-black text-white px-4 py-2">{loading?"Ingresando…":"Ingresar"}</button>
</form>
</main>
);
}