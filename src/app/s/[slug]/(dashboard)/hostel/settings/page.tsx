import React from 'react'
import { getHostelsAction } from '@/app/actions/hostel-actions'
import HostelSettingsClient from './HostelSettingsClient'

export default async function HostelSettingsPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const response = await getHostelsAction(slug)
    const hostels = response.success ? response.data : []

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Hostel Configurations</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Manage buildings, blocks, and room definitions.</p>
                </div>
            </div>

            <HostelSettingsClient slug={slug} initialHostels={hostels} />
        </div>
    )
}
