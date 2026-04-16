import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && profile) {
    if (!profile.email_validado) {
      return <PendingScreen message="Valide seu e-mail para acessar o sistema. Verifique sua caixa de entrada." />;
    }
    if (!profile.aprovado_admin) {
      return <PendingScreen message="Aguardando liberação do administrador. Você será notificado quando seu acesso for aprovado." />;
    }
    if (!profile.ativo) {
      return <PendingScreen message="Sua conta está inativa. Entre em contato com o administrador." />;
    }
    return <Navigate to="/" replace />;
  }

  if (user && !profile) {
    return <PendingScreen message="Aguardando liberação do administrador. Você será notificado quando seu acesso for aprovado." />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-2">
            <BarChart3 className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Dashboard de Liderança</CardTitle>
          <CardDescription>Faça login para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Acessar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/cadastro" className="text-sm text-primary hover:underline">
              Solicitar cadastro
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PendingScreen({ message }: { message: string }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <CardTitle>Acesso Pendente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button variant="outline" onClick={signOut}>Sair</Button>
        </CardContent>
      </Card>
    </div>
  );
}
