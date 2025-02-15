'use client';

import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient"; // Import Supabase client
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [formData, setFormData] = useState({
    reporter: "",
    reason: "",
    amount: "",
    date: "",
    ticket_number: "",
    user_email: "",
    additional_info: "",
    file_url: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  interface FormData {
    reporter: string;
    reason: string;
    amount: number;
    date: string;
    ticket_number: string;
    user_email: string;
    additional_info: string;
    file_url: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);

    let fileUrl = "";
    if (pdfFile) {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { data, error } = await supabase.storage
        .from("expenses_files") // Upewnij się, że masz bucket "expenses_files" w Supabase
        .upload(fileName, pdfFile);

      if (error) {
        console.error("Błąd przesyłania pliku:", error);
        setLoading(false);
        return;
      }
      fileUrl = data.path;
    }

    const newExpense: FormData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: formData.date || new Date().toISOString().split("T")[0], // Ustaw aktualną datę, jeśli puste
      file_url: fileUrl,
    };

    const { error } = await supabase.from("expenses").insert([newExpense]);

    if (error) {
      console.error("Error saving to database", error);
    } else {
      console.log("The expense has been successfully recorded.");
      setFormData({
        reporter: "",
        reason: "",
        amount: "",
        date: "",
        ticket_number: "",
        user_email: "",
        additional_info: "",
        file_url: "",
      });
      setPdfFile(null);
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl sm:text-4xl font-bold text-center sm:text-left">
          Narzędzie do kontroli budżetu
        </h1>
        <div className="flex flex-col gap-4 items-center sm:items-start mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="Osoba zgłaszająca"
              value={formData.reporter}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="reason"
              placeholder="Powód wydania kuponu"
              value={formData.reason}
              onChange={handleChange}
              required
            />
            <Input
              type="number"
              name="amount"
              placeholder="Kwota kuponu"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              name="date"
              placeholder="Data"
              value={formData.date}
              onChange={handleChange}
            />
            <Input
              type="text"
              name="ticket_number"
              placeholder="Numer zgłoszenia"
              value={formData.ticket_number}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="user_email"
              placeholder="Mail użytkownika"
              value={formData.user_email}
              onChange={handleChange}
              required
            />
            <Textarea
              name="additional_info"
              placeholder="Dodatkowe informacje"
              value={formData.additional_info}
              onChange={handleChange}
            />
            <Input
              type="file"
              name="pdfFile"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Przetwarzanie..." : "Zgłoś kupon"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
