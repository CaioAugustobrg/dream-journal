import { NextRequest, NextResponse } from 'next/server';
import { updateDreamSchema } from '@/lib/validation';
import { getDream as getDreamFromStore, updateDream as updateDreamInStore } from '@/lib/store';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const dream = await getDreamFromStore(id);
    if (!dream) {
      return NextResponse.json({ message: 'Dream not found' }, { status: 404 });
    }
    return NextResponse.json(dream);
  } catch (error) {
    console.error('Failed to fetch dream', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateDreamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const updated = await updateDreamInStore(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ message: 'Dream not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update dream', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
