import { AudioDetails } from '../utils/types'

export default {
	async fetch(request, env): Promise<Response> {
		if (request.method === "POST") {
			try {
				const body: AudioDetails = await request.json();
				const { audioData } = body;

				// @ts-ignore
				const transcriptionResponse = await env.AI.run("@cf/openai/whisper", { audio: audioData });
				const transcript = (transcriptionResponse as { text: string }).text || "Unable to transcribe audio.";

				// Summarize the transcription.
				const summarizationPrompt = `
				Here is a transcription of an audio recording:
				"${transcript}"

				Please summarize the main points concisely.
				`;

				const summarizationResponse = await env.AI.run("@cf/facebook/bart-large-cnn", {
					input_text: summarizationPrompt,
				})
				const summary = summarizationResponse || "Unable to summarize the audio.";

				return new Response(JSON.stringify({ transcript, summary }), {
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: "Failed to process request", details: (error as Error).message }), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		return new Response("Send a POST request with audio data!", {
			status: 400,
		});
	},
} satisfies ExportedHandler<Env>;
