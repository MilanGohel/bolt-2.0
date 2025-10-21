import { StreamingMessageParser } from "@/lib/runtime/message-parser";

const messageParser = new StreamingMessageParser({
    callbacks: {
        onArtifactOpen: (data) => {
            console.log('Artifact open', data);
            
        }
    }
})