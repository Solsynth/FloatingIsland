export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const name = query.name as string;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing template name. Usage: /api/emails/debug?name=TemplateName&prop1=value1&...",
    });
  }

  // Remove 'name' from query, rest are props
  const { name: _name, ...props } = query;

  try {
    const html = await renderEmailComponent(name, props as Record<string, unknown>, {
      pretty: true,
    });

    // If renderEmailComponent returns an object with html, extract it
    const htmlString = typeof html === "string" ? html : html.html;

    // Return raw HTML for direct browser viewing
    setHeader(event, "Content-Type", "text/html; charset=utf-8");
    return htmlString;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to render: ${error.message || "Unknown error"}`,
    });
  }
});
