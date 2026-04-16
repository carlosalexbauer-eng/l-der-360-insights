import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Shield, UserPlus, KeyRound, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ROLE_LABELS: Record<string, string> = {
  master: 'Master',
  admin: 'Admin',
  bp: 'BP',
  viewer: 'Viewer',
};

const STATUS_LABELS: Record<string, string> = {
  aguardando_aprovacao: 'Aguardando',
  ativo: 'Ativo',
  inativo: 'Inativo',
  rejeitado: 'Rejeitado',
};

const STATUS_COLORS: Record<string, string> = {
  aguardando_aprovacao: 'bg-yellow-100 text-yellow-800',
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-gray-100 text-gray-800',
  rejeitado: 'bg-red-100 text-red-800',
};

export function UserManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Create user form
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [newDiretoria, setNewDiretoria] = useState('');

  // Reset password form
  const [resetPassword, setResetPassword] = useState('');

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as unknown as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (userId: string, updates: Record<string, unknown>) => {
    const { error } = await supabase
      .from('users')
      .update(updates as any)
      .eq('id', userId);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Usuário atualizado.' });
      fetchUsers();
    }
  };

  const approveUser = (u: UserProfile) => {
    updateUser(u.id, {
      aprovado_admin: true,
      ativo: true,
      status: 'ativo',
      approved_at: new Date().toISOString(),
      approved_by: profile?.id,
    });
  };

  const rejectUser = (u: UserProfile) => {
    updateUser(u.id, { aprovado_admin: false, ativo: false, status: 'rejeitado' });
  };

  const toggleActive = (u: UserProfile) => {
    updateUser(u.id, {
      ativo: !u.ativo,
      status: u.ativo ? 'inativo' : 'ativo',
    });
  };

  const changeRole = (u: UserProfile, newRole: string) => {
    const isMaster = newRole === 'master';
    updateUser(u.id, {
      role: newRole,
      can_upload: isMaster,
      can_manage_users: isMaster || newRole === 'admin',
      can_admin: isMaster || newRole === 'admin',
    });
  };

  const handleCreateUser = async () => {
    if (!newNome || !newEmail || !newPassword) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Erro', description: 'Senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          email: newEmail,
          password: newPassword,
          nome: newNome,
          role: newRole,
          diretoria: newDiretoria || null,
        },
      });
      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || 'Erro ao criar usuário');
      }
      toast({ title: 'Sucesso', description: `Usuário ${newNome} criado com sucesso.` });
      setShowCreateDialog(false);
      setNewNome(''); setNewEmail(''); setNewPassword(''); setNewRole('viewer'); setNewDiretoria('');
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !resetPassword) return;
    if (resetPassword.length < 6) {
      toast({ title: 'Erro', description: 'Senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    setResetting(true);
    try {
      const res = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reset_password',
          user_auth_id: selectedUser.auth_id,
          new_password: resetPassword,
        },
      });
      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || 'Erro ao redefinir senha');
      }
      toast({ title: 'Sucesso', description: `Senha de ${selectedUser.nome} redefinida.` });
      setShowResetDialog(false);
      setResetPassword('');
      setSelectedUser(null);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setResetting(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'delete_user',
          user_auth_id: userToDelete.auth_id,
        },
      });
      if (res.error || res.data?.error) {
        throw new Error(res.data?.error || res.error?.message || 'Erro ao excluir usuário');
      }
      toast({ title: 'Sucesso', description: `Usuário ${userToDelete.nome} excluído com sucesso.` });
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setDeleting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Gestão de Usuários
            </span>
            <Button size="sm" className="gap-1.5" onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-3.5 h-3.5" />
              Criar Usuário
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Diretoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>
                    {profile?.role === 'master' ? (
                      <Select value={u.role} onValueChange={v => changeRole(u, v)}>
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="bp">BP</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-xs">{ROLE_LABELS[u.role]}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{u.diretoria || '—'}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status]}`}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.status === 'aguardando_aprovacao' && (
                        <>
                          <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => approveUser(u)}>
                            <CheckCircle className="w-3 h-3" /> Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => rejectUser(u)}>
                            <XCircle className="w-3 h-3" /> Rejeitar
                          </Button>
                        </>
                      )}
                      {u.status !== 'aguardando_aprovacao' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleActive(u)}>
                          {u.ativo ? 'Inativar' : 'Ativar'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => { setSelectedUser(u); setShowResetDialog(true); }}
                      >
                        <KeyRound className="w-3 h-3" /> Senha
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs gap-1"
                        onClick={() => setUserToDelete(u)}
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Criar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={newNome} onChange={e => setNewNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha *</Label>
              <Input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bp">BP</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diretoria">Diretoria</Label>
              <Input id="diretoria" value={newDiretoria} onChange={e => setNewDiretoria(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={creating} className="gap-1.5">
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Redefinir Senha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Redefinir senha de: <strong>{selectedUser?.nome}</strong>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="newPwd">Nova Senha *</Label>
              <Input
                id="newPwd"
                type="password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowResetDialog(false); setResetPassword(''); }}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={resetting} className="gap-1.5">
              {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              Redefinir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => { if (!open) setUserToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Excluir Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong> ({userToDelete?.email})? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
