import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Smartphone, Tablet, Globe, Clock } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface LoginRecord {
  id: string;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

const DeviceIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case "Telefon":
      return <Smartphone className="h-4 w-4" />;
    case "Tablet":
      return <Tablet className="h-4 w-4" />;
    case "Komputer":
      return <Monitor className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

export const LoginHistory = () => {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historia logowań
          </CardTitle>
          <CardDescription>Ostatnie logowania na Twoje konto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historia logowań
          </CardTitle>
          <CardDescription>Ostatnie logowania na Twoje konto</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Brak zapisanych logowań
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historia logowań
        </CardTitle>
        <CardDescription>Ostatnie 20 logowań na Twoje konto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Urządzenie</TableHead>
                <TableHead>Przeglądarka</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Adres IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(record.created_at), "d MMM yyyy, HH:mm", { locale: pl })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DeviceIcon type={record.device_type} />
                      <span>{record.device_type || "Nieznane"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.browser || "Nieznana"}</TableCell>
                  <TableCell>{record.os || "Nieznany"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {record.ip_address || "Nieznany"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
