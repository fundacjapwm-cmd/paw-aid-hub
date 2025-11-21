import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, Phone, FileText, Inbox, Check, X } from "lucide-react";
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
        <div className="flex flex-col space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`group p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 rounded-3xl shadow-card hover:shadow-bubbly transition-all border border-border/50 bg-white ${
                processingId === lead.id ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* 1. SEKCJA: DANE ORGANIZACJI */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">
                    {lead.organization_name}
                  </h3>
                  <Badge variant="outline" className="text-xs font-normal rounded-full">
                    {formatDistanceToNow(new Date(lead.created_at), { 
                      addSuffix: true, 
                      locale: pl 
                    })}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {lead.nip}
                  </span>
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {lead.email}
                  </a>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {lead.phone}
                  </span>
                </div>
              </div>

              {/* 2. SEKCJA: STATUS PRAWNY */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {lead.accepted_terms && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Regulamin
                  </div>
                )}
                {lead.marketing_consent && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Marketing
                  </div>
                )}
                {!lead.accepted_terms && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    <XCircle className="h-3.5 w-3.5" />
                    Brak regulaminu
                  </div>
                )}
              </div>

              {/* 3. SEKCJA: AKCJE */}
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={() => rejectMutation.mutate(lead.id)}
                  disabled={processingId === lead.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Odrzuć
                </Button>
                
                <Button 
                  size="default" 
                  className="shadow-md hover:shadow-lg rounded-xl px-6"
                  onClick={() => approveMutation.mutate(lead)}
                  disabled={processingId === lead.id}
                >
                  {processingId === lead.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Trwa...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Zatwierdź
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
