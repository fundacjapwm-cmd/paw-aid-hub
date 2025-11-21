import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, Phone, FileText, Inbox, Check, X, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Oczekujące Zgłoszenia
        </h1>
        <p className="text-lg text-muted-foreground">
          {leads?.length || 0} {leads?.length === 1 ? 'zgłoszenie czeka' : 'zgłoszeń czeka'} na Twoją decyzję
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="bg-white rounded-3xl p-12 shadow-card text-center max-w-md">
            <Inbox className="h-24 w-24 mx-auto mb-6 text-muted-foreground/40" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Wszystko na bieżąco!
            </h2>
            <p className="text-muted-foreground text-lg">
              Brak nowych zgłoszeń 🍩
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`bg-white rounded-3xl p-6 shadow-card hover:shadow-bubbly transition-all duration-300 border border-border/50 animate-fade-in ${
                processingId === lead.id ? "opacity-60 pointer-events-none scale-95" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground pr-2 leading-tight">
                  {lead.organization_name}
                </h3>
                <Badge variant="outline" className="shrink-0 rounded-full text-xs">
                  {formatDistanceToNow(new Date(lead.created_at), { 
                    addSuffix: true, 
                    locale: pl 
                  })}
                </Badge>
              </div>

              {/* Data Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                  <FileText className="h-5 w-5 text-primary/60 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">NIP</p>
                    <p className="font-semibold text-foreground truncate">{lead.nip}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                  <Mail className="h-5 w-5 text-primary/60 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Email</p>
                    <a 
                      href={`mailto:${lead.email}`}
                      className="font-semibold text-primary hover:underline truncate block"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                  <Phone className="h-5 w-5 text-primary/60 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Telefon</p>
                    <a 
                      href={`tel:${lead.phone}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Legal Status Section */}
              <div className="mb-6 p-4 bg-muted/20 rounded-2xl">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Status Prawny
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {lead.accepted_terms ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Regulamin zaakceptowany
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          Brak akceptacji regulaminu
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.marketing_consent ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Zgoda marketingowa
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Brak zgody marketingowej
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => rejectMutation.mutate(lead.id)}
                  disabled={processingId === lead.id}
                  variant="ghost"
                  className="rounded-2xl font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                  size="lg"
                >
                  <X className="h-5 w-5 mr-2" />
                  Odrzuć
                </Button>

                <Button
                  onClick={() => approveMutation.mutate(lead)}
                  disabled={processingId === lead.id}
                  className="rounded-2xl font-bold shadow-md hover:shadow-lg transition-shadow"
                  size="lg"
                >
                  {processingId === lead.id ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Trwa...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Akceptuj
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
