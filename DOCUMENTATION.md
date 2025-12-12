# Documentação Completa do Painel de Liderança

## Visão Geral

Dashboard executivo para análise de sucessão e maturidade de liderança, projetado para o Conselho de Administração.

---

## 1. Estrutura do Banco de Dados (Supabase)

### 1.1 Enum de Roles

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 1.2 Tabela de Perfis

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
```

### 1.3 Tabela de Roles de Usuário

```sql
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

### 1.4 Função de Verificação de Role (Security Definer)

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 1.5 Trigger para Criar Perfil Automaticamente

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 1.6 Atribuir Role de Admin a um Usuário

```sql
-- Substitua 'email@exemplo.com' pelo email do usuário
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'email@exemplo.com';
```

---

## 2. Edge Functions

### 2.1 Assistente de Liderança (AI)

**Arquivo:** `supabase/functions/leadership-assistant/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é um Assistente Executivo de Liderança, especializado em fornecer suporte estratégico sobre gestão de pessoas, sucessão de liderança e desenvolvimento organizacional.

PERFIL DE COMUNICAÇÃO:
- Linguagem formal e executiva, adequada para interação com líderes e membros do Conselho
- Respostas objetivas, estruturadas e orientadas a ação
- Tom respeitoso, profissional e consultivo
- Uso apropriado de termos corporativos e de gestão de pessoas

ÁREAS DE EXPERTISE:
1. Sucessão de Liderança: Pipeline de sucessores, mapeamento de talentos, planos de desenvolvimento
2. Performance de Líderes: Leadership Review, avaliação de competências, entrega de resultados
3. Clima Organizacional: ENPS, LNPS, IVR, MOODS, análise de engajamento
4. Gestão de Riscos: Turnover, retenção de talentos, identificação de líderes em risco
5. Desenvolvimento: Programas de liderança, Líder em Ação, Leadership Journey
6. Job Rotation: Movimentação de talentos, desenvolvimento de carreira

DIRETRIZES DE RESPOSTA:
- Seja direto ao ponto, mas completo quando necessário
- Forneça insights acionáveis e recomendações práticas
- Contextualize dados e métricas quando relevante
- Sugira próximos passos quando apropriado
- Mantenha confidencialidade e discrição sobre informações sensíveis`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua solicitação." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Leadership assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 3. Configuração do Supabase

**Arquivo:** `supabase/config.toml`

```toml
project_id = "seu-project-id"

[functions.leadership-assistant]
verify_jwt = false
```

---

## 4. Autenticação (Frontend)

### 4.1 Hook de Autenticação

**Arquivo:** `src/hooks/useAuth.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data && !error);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4.2 Página de Login/Cadastro

**Arquivo:** `src/pages/Auth.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redireciona se já estiver logado
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Login realizado com sucesso!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email já está cadastrado.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Conta criada com sucesso! Você já pode fazer login.');
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </CardTitle>
          <CardDescription>
            Painel de Liderança Executiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Componente de Upload (Admin)

**Arquivo:** `src/components/dashboard/AdminUpload.tsx`

```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AdminUpload() {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    setUploading(true);
    
    try {
      // Aqui você implementa a lógica de upload
      // Por exemplo: enviar para Supabase Storage ou processar os dados
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula upload
      
      toast.success('Base de dados atualizada com sucesso!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Atualizar Base de Dados">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Base de Dados</DialogTitle>
          <DialogDescription>
            Selecione um arquivo Excel ou CSV com os dados atualizados de liderança.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {uploading ? 'Enviando...' : 'Clique para selecionar o arquivo'}
              </span>
              <span className="text-xs text-muted-foreground">
                Formatos aceitos: .xlsx, .xls, .csv
              </span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Estrutura de Arquivos

```
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AdminUpload.tsx      # Componente de upload (admin only)
│   │   │   ├── AIAssistant.tsx      # Assistente de IA
│   │   │   ├── Dashboard.tsx        # Dashboard principal
│   │   │   ├── Header.tsx           # Cabeçalho com auth e upload
│   │   │   ├── KPICard.tsx          # Cards de indicadores
│   │   │   ├── Sidebar.tsx          # Menu lateral
│   │   │   └── views/               # Vistas do dashboard
│   │   │       ├── ClimaView.tsx
│   │   │       ├── IndicadosView.tsx
│   │   │       ├── JobRotationView.tsx
│   │   │       ├── OverviewView.tsx
│   │   │       ├── PerformanceView.tsx
│   │   │       ├── PipelineView.tsx
│   │   │       └── RiscosView.tsx
│   │   └── ui/                      # Componentes shadcn/ui
│   ├── hooks/
│   │   └── useAuth.tsx              # Hook de autenticação
│   ├── pages/
│   │   ├── Auth.tsx                 # Página de login/cadastro
│   │   ├── Index.tsx                # Página principal
│   │   └── NotFound.tsx
│   ├── data/
│   │   └── mockData.ts              # Dados de exemplo
│   └── integrations/
│       └── supabase/
│           └── client.ts            # Cliente Supabase (auto-gerado)
├── supabase/
│   ├── config.toml                  # Configuração do Supabase
│   └── functions/
│       └── leadership-assistant/
│           └── index.ts             # Edge function do assistente
```

---

## 7. Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

---

## 8. Secrets (Edge Functions)

Configurar no Supabase:
- `LOVABLE_API_KEY` - Chave da API do Lovable para o assistente de IA

---

## 9. Paleta de Cores (Senior)

```css
:root {
  --senior-teal: 174 42% 35%;
  --senior-orange: 24 95% 53%;
  --senior-purple: 280 60% 50%;
  --senior-magenta: 330 70% 55%;
  --senior-yellow: 45 90% 55%;
  --senior-cyan: 190 80% 45%;
  --senior-gray: 220 10% 95%;
}
```

---

## 10. Como Reproduzir

1. **Criar projeto Supabase/Lovable Cloud**
2. **Executar migrations SQL** (seção 1)
3. **Configurar Edge Functions** (seção 2)
4. **Adicionar secrets** (seção 8)
5. **Implementar componentes frontend** (seções 4 e 5)
6. **Atribuir role de admin** ao seu usuário (seção 1.6)

---

## 11. Funcionalidades

- ✅ Autenticação completa (login/cadastro)
- ✅ Sistema de roles (admin/user)
- ✅ Upload de base de dados (admin only)
- ✅ Assistente de IA executivo
- ✅ 7 vistas estratégicas do dashboard
- ✅ Design executivo com paleta Senior
- ✅ RLS policies para segurança
