"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { dataAPI } from "@/lib/api";
import PersonForm from "@/components/PersonForm";

export default function EditPersonPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      dataAPI.getPerson(id).then(setData);
    }
  }, [id]);

  if (!data) return <div className="p-8">Loading...</div>;

  return <PersonForm initialData={data} />;
}
