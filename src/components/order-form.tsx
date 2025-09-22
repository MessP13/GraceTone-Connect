"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(5),
  serviceType: z.enum(["creation","recreation","instrumental","production"]),
  description: z.string().min(10).max(500),
  style: z.string().min(1),
  rhythm: z.string().min(1),
  objective: z.enum(["personal","church","commercial"]),
});

export function OrderForm() {
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      description: "",
      style: "",
      rhythm: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.artistName || "",
        contact: userProfile.email || "",
        style: userProfile.preferredS
