"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // Starts with 2 empty options
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addOption = () => setOptions([...options, ""]);
  
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Insert the Poll Question
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert([{ question }])
      .select()
      .single();

    if (pollError) {
      alert("Error creating poll");
      setLoading(false);
      return;
    }

    // 2. Insert the Options linked to that Poll ID
    const optionsToInsert = options
      .filter((opt) => opt.trim() !== "")
      .map((opt) => ({ poll_id: poll.id, text: opt, votes: 0 }));

    const { error: optError } = await supabase.from("options").insert(optionsToInsert);

    if (optError) {
      alert("Error adding options");
      setLoading(false);
    } else {
      // 3. Success! Redirect to the new poll page
      router.push(`/poll/${poll.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Create a Real-Time Poll</h1>
        
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
              required
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="What's your favorite programming language?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {options.map((opt, i) => (
              <input
                key={i}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            + Add another option
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </div>
    </main>
  );
}