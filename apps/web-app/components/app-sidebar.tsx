'use client';

import { Plane, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { handleLogout } from '@/app/(main-product)/home/actions';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { t } = useTranslation('common');
  const pathname = usePathname();

  console.log('Current Path:', pathname);

  const menuItems = [
    {
      title: t('navigation.trips'),
      url: '/home/trips',
      icon: Plane,
    },
  ];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/home'>
                <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <User className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Joshua Hoban</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='p-2'>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title} className='justify-center'>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={handleLogout}>
              <SidebarMenuButton type='submit' tooltip={t('navigation.logout')}>
                <LogOut />
                <span>{t('navigation.logout')}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
