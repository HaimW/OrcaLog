"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EntryForm } from "@/components/entries/EntryForm";

export default function EditEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/entries/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setEntry(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p>...</p>;
  if (!entry) return <p>Not found</p>;

  return <EntryForm initial={entry} entryId={params.id} />;
}
