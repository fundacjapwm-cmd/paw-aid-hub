import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Lead {
  id: string;
  organization_name: string;
  nip: string;
  email: string;
  phone: string;
  accepted_terms: boolean;
  marketing_consent: boolean;
  created_at: string;
}

const AdminLeads = () => {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["organization-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Zgłoszenia Organizacji</CardTitle>
          <CardDescription>
            Lista wszystkich zgłoszeń organizacji z formularza kontaktowego
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data zgłoszenia</TableHead>
                  <TableHead>Nazwa organizacji</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-center">Regulamin</TableHead>
                  <TableHead className="text-center">Marketing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!leads || leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Brak zgłoszeń
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {format(new Date(lead.created_at), "dd MMM yyyy, HH:mm", { locale: pl })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {lead.organization_name}
                      </TableCell>
                      <TableCell>{lead.nip}</TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${lead.email}`}
                          className="text-primary hover:underline"
                        >
                          {lead.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`tel:${lead.phone}`}
                          className="text-primary hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        {lead.accepted_terms ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Tak
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Nie
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {lead.marketing_consent ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Tak
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Nie
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeads;
