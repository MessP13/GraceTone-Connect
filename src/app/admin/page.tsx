"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, Profile } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleVariantMap: { [key: string]: "default" | "secondary" | "outline" } = {
  admin: "default",
  staff: "secondary",
  client: "outline",
};

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (userProfile?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: Profile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ ...doc.data() } as Profile);
        });
        setUsers(usersData);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  const handleRoleChange = async (uid: string, role: 'client' | 'staff' | 'admin') => {
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, { role });
      toast({
        title: "Função Atualizada",
        description: "A função do usuário foi alterada com sucesso.",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a função do usuário.",
        variant: "destructive",
      });
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return null; 
  }

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Painel de Administração
        </h1>
        <p className="mt-3 text-muted-foreground">
          Gerencie os usuários e suas permissões.
        </p>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função Atual</TableHead>
              <TableHead className="text-right">Alterar Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleVariantMap[user.role] || 'outline'}>{user.role}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value: 'client' | 'staff' | 'admin') => handleRoleChange(user.uid, value)}
                    disabled={user.email === 'gracetonestudios@gmail.com'}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Alterar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
