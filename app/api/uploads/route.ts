/**
 * Metal Hub — File Upload API Route
 *
 * POST /api/uploads    → Upload a file to Supabase Storage
 *
 * Handles: validation, upload to temp bucket, tracking record creation.
 * Files are uploaded to the user's folder: {bucket}/{user_id}/{entity_type}/{filename}
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { RATE_LIMITS } from '@/lib/auth/rate-limiter';

// ── Upload rules per bucket ──
const UPLOAD_RULES: Record<string, { maxSize: number; allowedTypes: string[]; maxFiles: number }> = {
  'product-images': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10,
  },
  'product-videos': {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm'],
    maxFiles: 2,
  },
  'user-avatars': {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 1,
  },
  'company-logos': {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFiles: 1,
  },
  'certifications': {
    maxSize: 15 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFiles: 5,
  },
  'verification-docs': {
    maxSize: 15 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFiles: 5,
  },
  'banners': {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20,
  },
};

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: ['storage.upload'],
    rateLimit: RATE_LIMITS.FILE_UPLOAD,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // ── Parse multipart form data ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Expected multipart form data' } },
      { status: 400 },
    );
  }

  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) || 'product-images';
  const entityType = (formData.get('entity_type') as string) || null;
  const entityId = (formData.get('entity_id') as string) || null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
      { status: 400 },
    );
  }

  // ── Validate against bucket rules ──
  const rules = UPLOAD_RULES[bucket];
  if (!rules) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `Invalid bucket: ${bucket}` } },
      { status: 400 },
    );
  }

  if (file.size > rules.maxSize) {
    const maxMB = Math.round(rules.maxSize / 1024 / 1024);
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `File too large. Maximum: ${maxMB}MB` } },
      { status: 400 },
    );
  }

  if (!rules.allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: `File type '${file.type}' not allowed for this bucket` } },
      { status: 400 },
    );
  }

  // ── Check existing file count for this entity ──
  if (entityType && entityId) {
    const { count } = await auth.supabase
      .from('uploads')
      .select('id', { count: 'exact' })
      .eq('user_id', auth.user.id)
      .eq('bucket', bucket)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('deleted_at', null);

    if ((count || 0) >= rules.maxFiles) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Maximum ${rules.maxFiles} files allowed` } },
        { status: 400 },
      );
    }
  }

  // ── Build storage path ──
  const ext = file.name.split('.').pop() || 'bin';
  const timestamp = Date.now();
  const safeName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = entityType
    ? `${auth.user.id}/${entityType}/${entityId || 'draft'}/${safeName}`
    : `${auth.user.id}/${safeName}`;

  // ── Upload to Supabase Storage ──
  const fileBuffer = await file.arrayBuffer();
  const { error: uploadError } = await auth.supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('[Upload] Storage error:', uploadError.message);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Upload failed: ' + uploadError.message } },
      { status: 500 },
    );
  }

  // ── Get public URL (for public buckets) ──
  const { data: urlData } = auth.supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  // ── Create tracking record ──
  const { data: upload, error: dbError } = await auth.supabase
    .from('uploads')
    .insert({
      user_id: auth.user.id,
      bucket,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      file_size_bytes: file.size,
      entity_type: entityType,
      entity_id: entityId,
      status: 'staged',
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (dbError) {
    // Rollback: delete the uploaded file
    await auth.supabase.storage.from(bucket).remove([storagePath]);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to track upload' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: upload.id,
      bucket,
      storagePath,
      publicUrl: urlData?.publicUrl || null,
      originalFilename: file.name,
      mimeType: file.type,
      fileSize: file.size,
    },
  }, { status: 201 });
}
