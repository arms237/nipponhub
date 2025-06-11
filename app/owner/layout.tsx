'use client'

import { FaUsers, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import ProtectedOwnerRoute from '../_utils/ProtectedOwnerRoute';
import SidebarDashboard from '@/components/layout/SidebarDashboard';

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedOwnerRoute>
            <div className="flex">
                <SidebarDashboard />
                {children}
            </div>
        </ProtectedOwnerRoute>
    );
} 