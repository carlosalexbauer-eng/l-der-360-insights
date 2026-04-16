import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, GitBranch, Map, LayoutDashboard, Settings, LogOut, Grid3X3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import seniorLogo from '@/assets/senior-logo.svg';

const MotionButton = motion.create(Button);

/* Spring-based stagger animation for menu items (inspired by cinematic menu) */
const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.05 + i * 0.06,
      type: 'spring' as const,
      stiffness: 250,
      damping: 25,
    },
  }),
};

const springTransition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 30,
  mass: 0.8,
};

interface AnimatedMenuItemProps {
  index: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  menuItemClass: string;
}

function AnimatedMenuItem({ index, isActive, onClick, icon: Icon, label, collapsed, menuItemClass }: AnimatedMenuItemProps) {
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          onClick={onClick}
          className={menuItemClass}
        >
          <motion.span
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="inline-flex"
          >
            <Icon className="w-[18px] h-[18px]" />
          </motion.span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              {label}
            </motion.span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </motion.div>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [succOpen, setSuccOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const initials = profile?.nome
    ? profile.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const menuItemClass = (active: boolean) =>
    `text-xs transition-all duration-150 rounded-md cursor-pointer ${
      active
        ? 'bg-[hsl(168,65%,53%)]/15 text-white font-medium border-l-[3px] border-[hsl(168,65%,53%)] pl-2'
        : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
    }`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
          >
            <img src={seniorLogo} alt="Senior" className="h-6 w-auto" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={springTransition}
                className="min-w-0"
              >
                <p className="text-sm font-bold text-white truncate font-display">Leadership</p>
                <p className="text-[10px] text-sidebar-foreground">Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ ...springTransition, delay: 0.05 }}
              className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-white/5"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{profile?.nome || 'Usuário'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Collapsible open={succOpen} onOpenChange={setSuccOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-white/5 rounded-md transition-colors text-sidebar-foreground">
                <span className="flex items-center gap-1.5 flex-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  {!collapsed && 'Sucessão'}
                </span>
                {!collapsed && (
                  <motion.span
                    animate={{ rotate: succOpen ? 0 : -90 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AnimatedMenuItem
                    index={0}
                    isActive={isActive('/')}
                    onClick={() => navigate('/')}
                    icon={GitBranch}
                    label="Visão de Sucessão"
                    collapsed={collapsed}
                    menuItemClass={menuItemClass(isActive('/'))}
                  />
                  <AnimatedMenuItem
                    index={1}
                    isActive={isActive('/mapa-sucessao')}
                    onClick={() => navigate('/mapa-sucessao')}
                    icon={Map}
                    label="Mapa de Sucessão"
                    collapsed={collapsed}
                    menuItemClass={menuItemClass(isActive('/mapa-sucessao'))}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarSeparator className="border-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatedMenuItem
                index={2}
                isActive={isActive('/painel-lideranca')}
                onClick={() => navigate('/painel-lideranca')}
                icon={LayoutDashboard}
                label="Painel de Liderança"
                collapsed={collapsed}
                menuItemClass={menuItemClass(isActive('/painel-lideranca'))}
              />
              <AnimatedMenuItem
                index={3}
                isActive={isActive('/leadership-review')}
                onClick={() => navigate('/leadership-review')}
                icon={Grid3X3}
                label="Leadership Review (9-Box)"
                collapsed={collapsed}
                menuItemClass={menuItemClass(isActive('/leadership-review'))}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="border-sidebar-border" />

        {profile?.can_admin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <AnimatedMenuItem
                  index={4}
                  isActive={isActive('/admin')}
                  onClick={() => navigate('/admin')}
                  icon={Settings}
                  label="Administrador"
                  collapsed={collapsed}
                  menuItemClass={menuItemClass(isActive('/admin'))}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <MotionButton
          variant="ghost"
          size="sm"
          className={`w-full text-xs gap-2 text-sidebar-foreground hover:text-white hover:bg-white/5 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
          onClick={signOut}
          whileHover={{ x: collapsed ? 0 : 4 }}
          whileTap={{ scale: 0.95 }}
          transition={springTransition}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && 'Sair'}
        </MotionButton>
      </SidebarFooter>
    </Sidebar>
  );
}
