"use client"

import React, { useState } from 'react'
import { Plus, Building2, Bed, Users, Pencil, Trash2, X } from 'lucide-react'
import { createHostelAction, createHostelRoomAction, updateHostelAction, updateHostelRoomAction, deleteHostelAction, deleteHostelRoomAction } from '@/app/actions/hostel-actions'
import { toast } from 'sonner'

export default function HostelSettingsClient({ slug, initialHostels }: { slug: string, initialHostels: any[] }) {
    const [hostels, setHostels] = useState(initialHostels)
    const [isCreatingHostel, setIsCreatingHostel] = useState(false)
    const [isCreatingRoom, setIsCreatingRoom] = useState<string | null>(null) // hostelId
    const [editingHostel, setEditingHostel] = useState<any>(null)
    const [editingRoom, setEditingRoom] = useState<any>(null)

    // New Hostel Form State
    const [newHostel, setNewHostel] = useState({ name: '', capacity: 100, gender: 'COED', managerName: '' })

    // New Room Form State
    const [newRoom, setNewRoom] = useState({ roomNumber: '', capacity: 2, roomType: 'NON_AC', baseCost: 5000, amenities: '' })

    const handleCreateHostel = async () => {
        if (!newHostel.name) return toast.error("Hostel name is required")
        const res = await createHostelAction(slug, newHostel)
        if (res.success) {
            toast.success("Hostel created!")
            setIsCreatingHostel(false)
            setNewHostel({ name: '', capacity: 100, gender: 'COED', managerName: '' })
            window.location.reload() // In a real app we'd mutate SWR or re-fetch gracefully
        } else {
            toast.error(res.error)
        }
    }

    const handleCreateRoom = async (hostelId: string) => {
        if (!newRoom.roomNumber) return toast.error("Room number required")
        const amenitiesList = newRoom.amenities.split(',').map(s => s.trim()).filter(Boolean)

        const res = await createHostelRoomAction(slug, {
            ...newRoom,
            amenities: amenitiesList,
            hostelId
        })

        if (res.success) {
            toast.success("Room added!")
            setIsCreatingRoom(null)
            setNewRoom({ roomNumber: '', capacity: 2, roomType: 'NON_AC', baseCost: 5000, amenities: '' })
            window.location.reload()
        } else {
            toast.error(res.error)
        }
    }

    const handleUpdateHostel = async () => {
        if (!editingHostel.name) return toast.error("Hostel name is required")
        const res = await updateHostelAction(slug, editingHostel.id, {
            name: editingHostel.name,
            gender: editingHostel.gender,
            capacity: editingHostel.capacity,
            managerName: editingHostel.managerName
        })
        if (res.success) {
            toast.success("Hostel updated!")
            setEditingHostel(null)
            window.location.reload()
        } else {
            toast.error(res.error)
        }
    }

    const handleDeleteHostel = async (id: string) => {
        if (!confirm("Are you sure? This will delete all rooms and allocations in this building.")) return
        const res = await deleteHostelAction(slug, id)
        if (res.success) {
            toast.success("Hostel deleted")
            window.location.reload()
        } else {
            toast.error(res.error)
        }
    }

    const handleUpdateRoom = async () => {
        if (!editingRoom.roomNumber) return toast.error("Room number required")
        const amenitiesList = typeof editingRoom.amenities === 'string'
            ? editingRoom.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
            : editingRoom.amenities

        const res = await updateHostelRoomAction(slug, editingRoom.id, {
            roomNumber: editingRoom.roomNumber,
            roomType: editingRoom.roomType,
            capacity: editingRoom.capacity,
            baseCost: editingRoom.baseCost,
            amenities: amenitiesList
        })

        if (res.success) {
            toast.success("Room updated!")
            setEditingRoom(null)
            window.location.reload()
        } else {
            toast.error(res.error)
        }
    }

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Delete this room?")) return
        const res = await deleteHostelRoomAction(slug, id)
        if (res.success) {
            toast.success("Room deleted")
            window.location.reload()
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCreatingHostel(true)}
                        className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Building
                    </button>
                </div>
            </div>

            {isCreatingHostel && (
                <div className="bg-white p-6 rounded-2xl border border-brand/20 shadow-sm space-y-4">
                    <h3 className="font-bold text-zinc-900">New Hostel Building</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Hostel Name (e.g. Ganga Block)" value={newHostel.name} onChange={e => setNewHostel({ ...newHostel, name: e.target.value })} className="border p-3 rounded-xl text-sm" />
                        <select value={newHostel.gender} onChange={e => setNewHostel({ ...newHostel, gender: e.target.value })} className="border p-3 rounded-xl text-sm">
                            <option value="COED">Co-Ed</option>
                            <option value="BOYS">Boys Only</option>
                            <option value="GIRLS">Girls Only</option>
                        </select>
                        <input type="number" placeholder="Total Capacity" value={newHostel.capacity || ''} onChange={e => setNewHostel({ ...newHostel, capacity: parseInt(e.target.value) || 0 })} className="border p-3 rounded-xl text-sm" />
                        <input placeholder="Warden/Manager Name" value={newHostel.managerName} onChange={e => setNewHostel({ ...newHostel, managerName: e.target.value })} className="border p-3 rounded-xl text-sm" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreatingHostel(false)} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900">Cancel</button>
                        <button onClick={handleCreateHostel} className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold">Save Building</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {hostels.map((hostel) => (
                    <div key={hostel.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900">{hostel.name}</h3>
                                    <p className="text-xs text-zinc-500 font-medium">{hostel.gender} • Warden: {hostel.managerName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingHostel(hostel)}
                                    className="p-2 text-zinc-400 hover:text-brand transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteHostel(hostel.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="w-px h-4 bg-zinc-200 mx-2" />
                                <button
                                    onClick={() => setIsCreatingRoom(hostel.id)}
                                    className="text-brand text-sm font-bold hover:bg-brand/10 px-4 py-2 rounded-xl transition-colors"
                                >
                                    + Add Room
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {editingHostel?.id === hostel.id && (
                                <div className="bg-brand/5 p-6 rounded-2xl border border-brand/20 mb-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-zinc-900">Edit Building: {hostel.name}</h3>
                                        <button onClick={() => setEditingHostel(null)}><X className="h-4 w-4 text-zinc-400" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Building Name</label>
                                            <input value={editingHostel.name} onChange={e => setEditingHostel({ ...editingHostel, name: e.target.value })} className="w-full border p-2 rounded-xl text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Gender Preference</label>
                                            <select value={editingHostel.gender} onChange={e => setEditingHostel({ ...editingHostel, gender: e.target.value })} className="w-full border p-2 rounded-xl text-sm">
                                                <option value="COED">Co-Ed</option>
                                                <option value="BOYS">Boys Only</option>
                                                <option value="GIRLS">Girls Only</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Total Capacity</label>
                                            <input type="number" value={editingHostel.capacity} onChange={e => setEditingHostel({ ...editingHostel, capacity: parseInt(e.target.value) || 0 })} className="w-full border p-2 rounded-xl text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Warden Name</label>
                                            <input value={editingHostel.managerName || ''} onChange={e => setEditingHostel({ ...editingHostel, managerName: e.target.value })} className="w-full border p-2 rounded-xl text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button onClick={() => setEditingHostel(null)} className="px-4 py-2 text-sm font-medium text-zinc-500">Cancel</button>
                                        <button onClick={handleUpdateHostel} className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm">Update Building</button>
                                    </div>
                                </div>
                            )}
                            {isCreatingRoom === hostel.id && (
                                <div className="bg-brand/5 p-4 rounded-xl border border-brand/20 mb-6 space-y-4">
                                    <h4 className="font-bold text-sm text-brand">Configure New Room</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <input placeholder="Room 101" value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })} className="border p-2 rounded-lg text-sm" />
                                        <select value={newRoom.roomType} onChange={e => setNewRoom({ ...newRoom, roomType: e.target.value })} className="border p-2 rounded-lg text-sm bg-white">
                                            <option value="NON_AC">Non-AC</option>
                                            <option value="AC">AC</option>
                                            <option value="DELUXE">Deluxe</option>
                                        </select>
                                        <input type="number" placeholder="Beds" value={newRoom.capacity || ''} onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })} className="border p-2 rounded-lg text-sm" />
                                        <input type="number" placeholder="Fee/Month" value={newRoom.baseCost || ''} onChange={e => setNewRoom({ ...newRoom, baseCost: parseInt(e.target.value) || 0 })} className="border p-2 rounded-lg text-sm" />
                                        <input placeholder="Amenities (comma csv)" value={newRoom.amenities} onChange={e => setNewRoom({ ...newRoom, amenities: e.target.value })} className="border p-2 rounded-lg text-sm" />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsCreatingRoom(null)} className="px-3 py-1.5 text-xs font-bold text-zinc-500">Cancel</button>
                                        <button onClick={() => handleCreateRoom(hostel.id)} className="bg-brand text-white px-3 py-1.5 rounded-lg text-xs font-bold">Save Room</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {hostel.rooms.map((room: any) => (
                                    <div key={room.id} className="group relative border border-zinc-200 p-4 rounded-xl hover:border-brand/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                                                    <Bed className="h-4 w-4 text-zinc-400" />
                                                    Room {room.roomNumber}
                                                </h4>
                                                <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                    {room.roomType.replace('_', '-')}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-brand font-black text-sm">${room.baseCost}<span className="text-[10px] text-zinc-400">/mo</span></div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingRoom({ ...room, amenities: JSON.parse(room.amenities || '[]').join(', ') })} className="p-1 hover:text-brand"><Pencil size={12} /></button>
                                                    <button onClick={() => handleDeleteRoom(room.id)} className="p-1 hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        {editingRoom?.id === room.id && (
                                            <div className="absolute inset-0 bg-white z-10 p-4 border border-brand/20 rounded-xl space-y-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="font-bold text-xs">Edit Room {room.roomNumber}</h5>
                                                    <button onClick={() => setEditingRoom(null)}><X className="h-3 w-3" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input placeholder="Room #" value={editingRoom.roomNumber} onChange={e => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })} className="border p-1.5 rounded text-[11px]" />
                                                    <select value={editingRoom.roomType} onChange={e => setEditingRoom({ ...editingRoom, roomType: e.target.value })} className="border p-1.5 rounded text-[11px]">
                                                        <option value="NON_AC">Non-AC</option>
                                                        <option value="AC">AC</option>
                                                        <option value="DELUXE">Deluxe</option>
                                                    </select>
                                                    <input type="number" value={editingRoom.baseCost} onChange={e => setEditingRoom({ ...editingRoom, baseCost: parseInt(e.target.value) || 0 })} className="border p-1.5 rounded text-[11px]" />
                                                    <input type="number" value={editingRoom.capacity} onChange={e => setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) || 0 })} className="border p-1.5 rounded text-[11px]" />
                                                </div>
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button onClick={() => setEditingRoom(null)} className="text-[10px] font-bold text-zinc-400">Cancel</button>
                                                    <button onClick={handleUpdateRoom} className="bg-brand text-white px-3 py-1 rounded text-[10px] font-bold">Update</button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-4 p-2 bg-zinc-50 rounded-lg">
                                            <div className="flex items-center gap-1 text-xs font-medium text-zinc-600">
                                                <Users className="h-3 w-3" />
                                                {room.allocations?.length || 0} / {room.capacity} Occupied
                                            </div>
                                            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, ((room.allocations?.length || 0) / room.capacity) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {hostel.rooms.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-zinc-400 text-sm font-medium">
                                        No rooms configured for this hostel yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {hostels.length === 0 && !isCreatingHostel && (
                    <div className="py-12 bg-white rounded-2xl border border-zinc-200 border-dashed text-center">
                        <Building2 className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <h3 className="text-zinc-900 font-bold">No Hostels Found</h3>
                        <p className="text-zinc-500 text-sm mt-1">Create your first hostel building to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
