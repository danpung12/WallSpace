import { createRouteHandlerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { provider } = await req.json();

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const identityToUnlink = user.identities?.find(identity => identity.provider === provider);

  if (!identityToUnlink) {
    return NextResponse.json({ error: 'Identity not found for the given provider' }, { status: 404 });
  }

  // Unlinking requires the service_role key, which should be kept secret.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: unlinkError } = await supabaseAdmin.auth.admin.unlinkIdentity({
    identity_id: identityToUnlink.id, // 'id' from the identity object is the identity_id
    user_id: user.id
  });

  if (unlinkError) {
    console.error('Error unlinking identity:', unlinkError);
    return NextResponse.json({ error: `Failed to unlink identity: ${unlinkError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'Identity unlinked successfully' });
}