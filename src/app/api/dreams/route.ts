import { NextRequest, NextResponse } from 'next/server';
import { createDreamSchema, queryDreamSchema } from '@/lib/validation';
import { listDreams, createDream } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = {
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    qTitle: searchParams.get('qTitle') ?? undefined,
    qContent: searchParams.get('qContent') ?? undefined,
  };

  const parsed = queryDreamSchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const dreams = await listDreams(parsed.data);
    return NextResponse.json(dreams);
  } catch (error) {
    console.error('Failed to list dreams', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createDreamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const dream = await createDream(parsed.data);
    return NextResponse.json(dream, { status: 201 });
  } catch (error) {
    console.error('Failed to create dream', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
