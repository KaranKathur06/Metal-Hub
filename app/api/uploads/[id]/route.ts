/**
 * Metal Hub — Upload Detail API Route
 *
 * GET    /api/uploads/[id]/signed-url    → Generate signed URL
 * DELETE /api/uploads/[id]               → Delete upload
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Get upload record
  const { data: upload } = await auth.supabase
    .from('uploads')
    .select('*')
    .eq('id', params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!upload) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Upload not found' } },
      { status: 404 },
    );
  }

  // Access check: owner or admin
  if (upload.user_id !== auth.user.id && !['admin', 'super_admin', 'moderator'].includes(auth.role)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    );
  }

  // Generate signed URL (1 hour expiry)
  const { data: signedUrlData, error: signedError } = await auth.supabase.storage
    .from(upload.bucket)
    .createSignedUrl(upload.storage_path, 3600);

  if (signedError || !signedUrlData) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate signed URL' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      signedUrl: signedUrlData.signedUrl,
      expiresIn: 3600,
      upload,
    },
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Get upload record
  const { data: upload } = await auth.supabase
    .from('uploads')
    .select('*')
    .eq('id', params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!upload) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Upload not found' } },
      { status: 404 },
    );
  }

  // Access check: owner or admin
  if (upload.user_id !== auth.user.id && !['admin', 'super_admin'].includes(auth.role)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only owner or admin can delete' } },
      { status: 403 },
    );
  }

  // Delete from storage
  await auth.supabase.storage.from(upload.bucket).remove([upload.storage_path]);

  // Also delete thumbnail if exists
  if (upload.thumbnail_path) {
    await auth.supabase.storage.from(upload.bucket).remove([upload.thumbnail_path]);
  }

  // Soft delete tracking record
  await auth.supabase
    .from('uploads')
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', params.id);

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'upload_deleted',
    resource: 'uploads',
    resourceId: params.id,
    details: { bucket: upload.bucket, path: upload.storage_path },
    request,
  });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
