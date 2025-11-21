import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, Phone, Building2, Hash, Calendar } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils/slugify";

interface Lead {
  id: string;
  organization_name: string;
  nip: string;
  email: string;
  phone: string;
  accepted_terms: boolean;
  marketing_consent: boolean;
  status: string;
  created_at: string;
}

const AdminLeads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["organization-leads-new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_leads")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (lead: Lead) => {
      setProcessingId(lead.id);

      // Step 1: Create Organization
      const slug = slugify(lead.organization_name);
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{
          name: lead.organization_name,
          nip: lead.nip,
          contact_email: lead.email,
          contact_phone: lead.phone,
          slug: slug,
          active: true
        }])
        .select()
        .single();

      if (orgError) throw new Error(`Błąd tworzenia organizacji: ${orgError.message}`);

      // Step 2: Send Invitation
      const { error: inviteError } = await supabase.functions.invoke('invite-organization', {
        body: {
          email: lead.email,
          organizationId: orgData.id,
          organizationName: lead.organization_name
        }
      });

      if (inviteError) throw new Error(`Błąd wysyłania zaproszenia: ${inviteError.message}`);

      // Step 3: Update Lead Status
      const { error: updateError } = await supabase
        .from("organization_leads")
        .update({ status: 'approved' })
        .eq("id", lead.id);

      if (updateError) throw new Error(`Błąd aktualizacji zgłoszenia: ${updateError.message}`);

      return orgData;
    },
    onSuccess: (orgData, lead) => {
      toast({
        title: "Organizacja zatwierdzona!",
        description: `Utworzono konto dla ${lead.organization_name} i wysłano zaproszenie.`,
      });
      queryClient.invalidateQueries({ queryKey: ["organization-leads-new"] });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (leadId: string) => {
      setProcessingId(leadId);
      const { error } = await supabase
        .from("organization_leads")
        .update({ status: 'rejected' })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Zgłoszenie odrzucone",
        description: "Status zgłoszenia został zmieniony na odrzucony.",
      });
      queryClient.invalidateQueries({ queryKey: ["organization-leads-new"] });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
      setProcessingId(null);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Nowe Zgłoszenia Organizacji
        </h1>
        <p className="text-muted-foreground">
          {leads?.length || 0} zgłoszeń oczekuje na zatwierdzenie
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-0">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Brak nowych zgłoszeń</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={`rounded-3xl shadow-card border-0 transition-all duration-500 ${
                processingId === lead.id ? "opacity-50 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {lead.organization_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(lead.created_at), "dd MMMM yyyy, HH:mm", { locale: pl })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">NIP</p>
                      <p className="font-semibold">{lead.nip}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a 
                        href={`mailto:${lead.email}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {lead.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <a 
                        href={`tel:${lead.phone}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">Zgody</p>
                      <div className="flex gap-2">
                        <Badge variant={lead.accepted_terms ? "default" : "destructive"} className="gap-1">
                          {lead.accepted_terms ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          Regulamin
                        </Badge>
                        <Badge variant={lead.marketing_consent ? "default" : "secondary"} className="gap-1">
                          {lead.marketing_consent ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          Marketing
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => approveMutation.mutate(lead)}
                    disabled={processingId === lead.id}
                    className="flex-1 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {processingId === lead.id ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Utwórz Konto i Zaproś
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => rejectMutation.mutate(lead.id)}
                    disabled={processingId === lead.id}
                    variant="destructive"
                    className="rounded-xl font-bold"
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Odrzuć
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
