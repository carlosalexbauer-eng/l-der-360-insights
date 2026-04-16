import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard Administrativo</h1>
    </div>
  );
};

export default AdminDashboard;
import { useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "Administrador" | "Gestor" | "Usuário";
  status: "Ativo" | "Inativo";
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Ana Souza",
    email: "ana@empresa.com",
    role: "Administrador",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Carlos Lima",
    email: "carlos@empresa.com",
    role: "Gestor",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Fernanda Rocha",
    email: "fernanda@empresa.com",
    role: "Usuário",
    status: "Inativo",
  },
  {
    id: 4,
    name: "Marcos Silva",
    email: "marcos@empresa.com",
    role: "Usuário",
    status: "Ativo",
  },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [search, users]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Ativo").length;
  const inactiveUsers = users.filter((u) => u.status === "Inativo").length;
  const admins = users.filter((u) => u.role === "Administrador").length;

  const handleDelete = (id: number) => {
    const confirmed = window.confirm("Deseja remover este usuário?");
    if (!confirmed) return;

    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Ativo" ? "Inativo" : "Ativo",
            }
          : user
      )
    );
  };

  const handleAddUser = () => {
    const name = window.prompt("Nome do novo usuário:");
    if (!name) return;

    const email = window.prompt("E-mail do novo usuário:");
    if (!email) return;

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role: "Usuário",
      status: "Ativo",
    };

    setUsers((prev) => [newUser, ...prev]);
  };

  const handleEditUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newName = window.prompt("Editar nome:", user.name);
    if (!newName) return;

    const newEmail = window.prompt("Editar e-mail:", user.email);
    if (!newEmail) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              name: newName,
              email: newEmail,
            }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Painel Administrativo
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Gerencie usuários, permissões e indicadores do sistema.
            </p>
          </div>

          <button
            onClick={handleAddUser}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            + Adicionar usuário
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total de usuários</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalUsers}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Usuários ativos</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {activeUsers}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Usuários inativos</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {inactiveUsers}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Administradores</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {admins}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Gestão de usuários
            </h3>

            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou perfil"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-slate-500 md:w-80"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">E-mail</th>
                  <th className="px-4 py-2">Perfil</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="rounded-xl bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{user.email}</td>
                      <td className="px-4 py-3 text-slate-700">{user.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.status === "Ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            {user.status === "Ativo" ? "Inativar" : "Ativar"}
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
