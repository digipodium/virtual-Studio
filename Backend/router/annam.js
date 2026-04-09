export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.avatarId || !body.voiceId) {
      return Response.json(
        { success: false, error: "avatarId and voiceId are required" },
        { status: 400 }
      );
    }

    console.log("Session token request:", body);

    // ✅ For testing, return dummy token
    // In production, call actual Anam AI API
    const dummyToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return Response.json({
      success: true,
      sessionToken: dummyToken,
      expiresIn: 3600,
    });

  } catch (error) {
    console.error("Session token error:", error);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}