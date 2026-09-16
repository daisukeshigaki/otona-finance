export async function onRequest(context) {
  if (!context.env.COMMUNITY) {
    return Response.json({ error: '現在受付を一時停止しています。時間をおいてお試しください。' }, { status: 503 });
  }
  // The private Worker is reachable only through this service binding.
  return context.env.COMMUNITY.fetch(context.request);
}
