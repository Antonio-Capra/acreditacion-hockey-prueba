import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "event-logos";
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

type CrestTarget = "local" | "opponent";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase credentials are required to upload crests");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

let bucketReady = false;
const ensureBucketExists = async () => {
  if (bucketReady) return;
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    throw error;
  }

  const exists = data?.some((bucket) => bucket.name === BUCKET_NAME);
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
    });

    if (createError && !createError.message?.toLowerCase().includes("already exists")) {
      throw createError;
    }
  }

  bucketReady = true;
};

const extensionFromMime = (mime: string) => {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return null;
  }
};

const sanitizeTarget = (value: string | null): CrestTarget => {
  return value === "opponent" ? "opponent" : "local";
};

const buildFilePath = (eventoId: string | null, target: CrestTarget, extension: string) => {
  const folder = eventoId ? `evento-${eventoId}` : "general";
  const filename = `${target}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  return `${folder}/${filename}`;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureBucketExists();
    const formData = await request.formData();
    const file = formData.get("file");
    const targetRaw = formData.get("target");
    const eventoIdRaw = formData.get("eventoId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "El archivo esta vacio" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado pesado (max 4MB)" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
    }

    const target = sanitizeTarget(typeof targetRaw === "string" ? targetRaw : null);
    const eventoId = typeof eventoIdRaw === "string" ? eventoIdRaw : null;

    const explicitExtension = file.name?.toLowerCase().split(".").pop();
    const extension = explicitExtension || extensionFromMime(file.type) || "png";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = buildFilePath(eventoId, target, extension);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload-crest] upload error", uploadError);
      return NextResponse.json({ error: "No se pudo subir el archivo" }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("[upload-crest] public URL missing", publicUrlData);
      return NextResponse.json({ error: "No se pudo obtener la URL publica" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("[upload-crest] unexpected error", error);
    return NextResponse.json({ error: "Error inesperado al subir el escudo" }, { status: 500 });
  }
}
