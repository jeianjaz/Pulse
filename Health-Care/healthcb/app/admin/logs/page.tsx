"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function LogsIndexPage() {
  useEffect(() => {
    redirect("/admin/logs/consultations");
  }, []);

  // This won't be shown as we redirect immediately
  return null;
}
