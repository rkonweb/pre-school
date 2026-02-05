import { getCMSPagesAction, deleteCMSPageAction } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export const dynamic = 'force-dynamic';

export default async function CMSPagesIndex() {
    let pages: Awaited<ReturnType<typeof getCMSPagesAction>> = [];
    let error: string | null = null;

    try {
        pages = await getCMSPagesAction();
    } catch (e) {
        console.error("[CMS Pages] Failed to load pages:", e);
        error = "Failed to load pages. Database connection error.";
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Pages</h1>
                <p className="text-zinc-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">
                        Manage static pages for your website.
                    </p>
                </div>
                <Link href="/admin/cms/pages/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Page
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Pages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No pages found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pages.map((page) => (
                                    <TableRow key={page.id}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell className="font-mono text-xs">{page.slug}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {page.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{format(new Date(page.updatedAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/${page.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon" title="View Live">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/cms/pages/${page.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {/* Delete button would go here, requires client component for interactivity */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
