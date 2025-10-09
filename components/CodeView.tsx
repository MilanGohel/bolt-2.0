import { Message } from "@/context/MessagesContext";

export interface CodeViewProps{
    
}

export default function CodeView(){
    return (
        <div className="flex-1 p-4 overflow-y-auto dark:bg-zinc-800 bg-zinc-100 rounded-lg w-full">
            <div>
                Code view
            </div>
        </div>
    );
}