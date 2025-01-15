import { AudioDetails } from '../utils/types'

const corsifyHeaders(headers, json = true) {
        const modifiedHeaders = new Headers(headers);
	modifiedHeaders.set("Access-Control-Allow-Origin", "*"); // Allow all origins
	modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
	modifiedHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
	if(json) modifiedHeaders.set("Content-Type", "application/json");
	return modifiedHeaders;
}

export default {
	async fetch(request, env): Promise<Response> {

		if (request.method === "OPTIONS") {
			return new Response(null, {
			    status: 204,
			    headers: corsifyHeaders({}, false),
			});
		  }
		if (request.method === "POST") {
			try {
				const body: AudioDetails = await request.json();
				const { audioData } = body;

				// @ts-ignore
				const transcriptionResponse = await env.AI.run("@cf/openai/whisper", { audio: audioData });
				const transcript = (transcriptionResponse as { text: string }).text || "Unable to transcribe audio.";

				const summarizationPrompt = `
				Here is a transcription of an audio recording:
				"${transcript}"

				Please summarize the main points concisely.
				`;

				const summarizationResponse = await env.AI.run("@cf/facebook/bart-large-cnn", {
					input_text: summarizationPrompt,
				})
				const summary = summarizationResponse || "Unable to summarize the audio.";

				return new Response(JSON.stringify({ summary }), {
					headers: corsifyHeaders(response.headers),
				  });
			} catch (error) {
				return new Response(JSON.stringify({ error: "Failed to process request", details: (error as Error).message }), {
					status: 500,
					headers: {
					  ...corsHeaders, // Add CORS headers for error responses
					  "Content-Type": "application/json",
					},
				});
			}
		}

		return new Response("Send a POST request with audio data!", {
			status: 400,
			headers: {
			  ...corsHeaders, // Add CORS headers for default response
			},
		});
	},
} satisfies ExportedHandler<Env>;
