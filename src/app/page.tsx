"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Toaster } from "../components/ui/toaster";
import { Separator } from "../components/ui/separator";

type AiResponseSuccess = {
  model: "qwen2:0.5b";
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
};

export default function Home() {
  const isMac = useRef(typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform));
  const [text, setText] = useState("");
  const [aiResponse, setAiResponse] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendKeydown = (e: KeyboardEvent) => {
    if ((e.key === "Enter" && e.metaKey) || (e.key === "Enter" && e.ctrlKey)) {
      e.preventDefault();
      doRequest(text);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSendKeydown);
    return () => {
      window.removeEventListener("keydown", handleSendKeydown);
    };
  }, [text]);

  const doRequest = (text: string) => {
    setLoading(true);
    fetch("http://95.174.95.83:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: text, model: "qwen2:0.5b", stream: false })
    })
      .then((res) => {
        if (!res.ok) {
          toast({
            title: "Error",
            description: res.statusText,
            variant: "destructive"
          });
        }
        res.json().then((data: AiResponseSuccess) => {
          setText("");
          setAiResponse((prev) => [...prev, data.response]);
        });
      })
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container 2xl p-4 mx-auto flex flex-col items-center gap-4">
      <Toaster />
      <Textarea placeholder="Ask something" value={text} onChange={(e) => setText(e.target.value)} />
      <Button disabled={loading} onClick={() => doRequest(text)}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send
      </Button>
      <div className="container flex gap-4 flex-col items-center">
        <p className="text-sm text-muted-foreground">
          To send a message, press
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
            <span className="text-xs">{isMac.current ? "⌘" : "Ctrl"}</span>Enter
          </kbd>
        </p>
      </div>
      <Separator />
      {aiResponse.map((response, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {response}
        </p>
      ))}
    </div>
  );
}
