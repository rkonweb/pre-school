import { NextResponse } from 'next/server';
import { isSuperAdminAuthenticated } from '@/app/actions/admin-auth-actions';

export async function GET() {
    const isAuth = await isSuperAdminAuthenticated();
    return NextResponse.json({ authenticated: isAuth });
}
