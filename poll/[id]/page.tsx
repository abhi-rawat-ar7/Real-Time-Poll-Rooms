"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPollData();

    // REAL-TIME SUBSCRIPTION: Listen for changes in the 'options' table
    const channel = supabase
      .channel("realtime-votes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "options", filter: `poll_id=eq.${id}` },
        () => fetchPollData() // Refresh data when a vote happens
      )
      .subscribe();

    // Check Fairness Control #1: LocalStorage
    const votedBefore = localStorage.getItem(`voted_${id}`);
    if (votedBefore) setHasVoted(true);

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function fetchPollData() {
    const { data: pollData } = await supabase.from("polls").select("*").eq("id", id).single();
    const { data: optionsData } = await supabase.from("options").select("*").eq("poll_id", id).order("id", { ascending: true });
    setPoll(pollData);
    setOptions(optionsData || []);
  }

  const handleVote = async (optionId: number) => {
    if (hasVoted) return;

    // Increment vote count in Supabase
    const { error } = await supabase.rpc("increment_vote", { row_id: optionId });

    if (!error) {
      setHasVoted(true);
      localStorage.setItem(`voted_${id}`, "true"); // Fairness Control #1
    }
  };

  if (!poll) return <div className="text-center mt-20">Loading Poll...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8 text-black">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
        
        <div className="space-y-4">
          {options.map((opt) => (
            <div key={opt.id} className="relative">
              <button
                disabled={hasVoted}
                onClick={() => handleVote(opt.id)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  hasVoted ? "cursor-default" : "hover:bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <span>{opt.text}</span>
                  <span className="font-bold">{opt.votes}</span>
                </div>
                {/* Visual Bar for results */}
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-100 rounded-lg transition-all duration-500" 
                  style={{ width: `${(opt.votes / Math.max(...options.map(o => o.votes), 1)) * 100}%`, opacity: 0.4 }}
                />
              </button>
            </div>
          ))}
        </div>

        {hasVoted && (
          <p className="mt-4 text-green-600 font-medium text-center italic">
            Thank you for voting! Results update in real-time.
          </p>
        )}
        
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm break-all">
          <p className="font-bold mb-1">Share this link:</p>
          <code className="text-blue-600">{typeof window !== 'undefined' ? window.location.href : ''}</code>
        </div>
      </div>
    </main>
  );
}