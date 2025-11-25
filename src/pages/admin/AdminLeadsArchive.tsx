import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, Phone, FileText, Archive } from "lucide-react";
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
  status: string;
  created_at: string;
  processed_at: string | null;
}

const AdminLeadsArchive = () => {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["organization-leads-archive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_leads")
        .select("*")
        .in("status", ["approved", "rejected"])
        .order("processed_at", { ascending: false });

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
    <div className="md:container md:mx-auto md:px-8 py-8 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Archiwum Zgłoszeń
        </h1>
        <p className="text-lg text-muted-foreground">
          {leads?.length || 0} {leads?.length === 1 ? 'przetworzonych zgłoszeń' : 'przetworzonych zgłoszeń'}
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="bg-white rounded-3xl p-12 shadow-card text-center max-w-md">
            <Archive className="h-24 w-24 mx-auto mb-6 text-muted-foreground/40" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Puste archiwum
            </h2>
            <p className="text-muted-foreground text-lg">
              Nie ma jeszcze przetworzonych zgłoszeń
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`group p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 rounded-3xl shadow-card border border-border/50 bg-white ${
                lead.status === 'approved' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
              }`}
            >
              {/* 1. SEKCJA: DANE ORGANIZACJI */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">
                    {lead.organization_name}
                  </h3>
                  <Badge 
                    variant={lead.status === 'approved' ? 'default' : 'destructive'}
                    className="text-xs font-normal rounded-full"
                  >
                    {lead.status === 'approved' ? 'Zatwierdzone' : 'Odrzucone'}
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

                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Zgłoszone:</span> {format(new Date(lead.created_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
                  {lead.processed_at && (
                    <>
                      {' • '}
                      <span className="font-medium">Przetworzone:</span> {format(new Date(lead.processed_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
                    </>
                  )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeadsArchive;
