import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Loader2, ArrowLeft, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { UserManagement } from '@/components/admin/UserManagement';
import { DataUpload } from '@/components/admin/DataUpload';

export default function Admin() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !profile.can_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Administrador</h1>
              <p className="text-xs text-muted-foreground">Gestão de Usuários e Dados</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-muted/60 mb-4">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Gestão de Usuários
            </TabsTrigger>
            {profile.can_upload && (
              <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Atualizar Base de Dados
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          {profile.can_upload && (
            <TabsContent value="data">
              <DataUpload />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
